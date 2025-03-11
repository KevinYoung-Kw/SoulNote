from flask import Flask, request, abort, Blueprint, jsonify
from bs4 import BeautifulSoup
import requests
import os
import json
from datetime import datetime, timedelta
import logging
import random
import time
from datetime import datetime, timedelta
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

# Import OpenCC for Chinese conversion
try:
    from opencc import OpenCC
    OPENCC_AVAILABLE = True
except ImportError:
    OPENCC_AVAILABLE = False
    logging.warning("OpenCC not available. Chinese conversion will not work.")

# 配置请求会话，添加自动重试和超时设置
def create_robust_session():
    """创建一个具有重试功能的请求会话"""
    session = requests.Session()
    
    # 配置重试策略，对所有请求方法启用重试
    retry_strategy = Retry(
        total=3,  # 总共重试3次
        backoff_factor=0.5,  # 退避因子
        status_forcelist=[429, 500, 502, 503, 504],  # 触发重试的HTTP状态码
        allowed_methods=["GET"]  # 允许GET方法重试
    )
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    return session

session = create_robust_session()


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Cache storage
CACHE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_FILE = os.path.join(CACHE_DIR, "astro_cache.json")
cache = {}
scheduler = None

# Initialize Chinese converter
t2s_converter = None
if OPENCC_AVAILABLE:
    try:
        t2s_converter = OpenCC('t2s')  # Traditional to Simplified
        logger.info("Traditional to Simplified Chinese converter loaded")
    except Exception as e:
        logger.error(f"Error initializing OpenCC: {e}")
        OPENCC_AVAILABLE = False

def convert_to_simplified(text):
    """Convert traditional Chinese text to simplified Chinese"""
    if OPENCC_AVAILABLE and t2s_converter:
        return t2s_converter.convert(text)
    return text  # Return original if conversion not available

def load_cache():
    """Load cache from file if exists"""
    global cache
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                cache = json.load(f)
            logger.info("Cache loaded successfully")
    except Exception as e:
        logger.error(f"Error loading cache: {e}")
        cache = {}

def save_cache():
    """Save cache to file"""
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        logger.info("Cache saved successfully")
    except Exception as e:
        logger.error(f"Error saving cache: {e}")

# 智能的缓存失效检测
def is_cache_valid(num):
    """检查缓存是否仍然有效（同一天）并添加智能退化机制"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 检查缓存是否存在且包含日期
    if str(num) not in cache or 'date' not in cache[str(num)]:
        return False
    
    # 如果是今天的数据，缓存有效
    if cache[str(num)]['date'] == today:
        return True
        
    # 智能退化：如果是昨天的数据且当前时间是凌晨（0-6点），也认为缓存有效
    # 这是为了避免在凌晨时段频繁请求源站
    cache_date = datetime.strptime(cache[str(num)]['date'], "%Y-%m-%d")
    if (datetime.now() - cache_date).days <= 1:
        current_hour = datetime.now().hour
        if 0 <= current_hour < 2:
            logger.info(f"凌晨时段(当前{current_hour}点)，继续使用昨天的星座{num}数据")
            return True
    
    return False

# 修改 fetch_astro_data 函数
def fetch_astro_data(num, force_update=False):
    """获取星座数据，增加了智能重试和随机延迟"""
    # 如果数据在缓存中且有效，除非强制更新，否则返回缓存数据
    if not force_update and is_cache_valid(num):
        logger.debug(f"使用有效的缓存数据，星座编号: {num}")
        return cache[str(num)]
        
    try:
        # 添加随机延迟，避免频繁请求被限制
        time.sleep(random.uniform(0.5, 2.0))
        
        # 使用会话发起请求，并设置更合理的超时值
        r = session.get(
            f'http://astro.click108.com.tw/daily_{num}.php?iAstro={num}', 
            timeout=(5, 25)  # 连接超时5秒，读取超时25秒
        )
        r.raise_for_status()
        
        # 解析HTML
        soup = BeautifulSoup(r.text, 'html.parser')
        astro = soup.select("div.TODAY_CONTENT > h3")
        
        # 检查页面是否包含预期的元素
        if not astro:
            logger.warning(f"星座{num}返回的页面结构异常，可能是网站改版")
            raise ValueError("页面结构异常")
            
        astro = astro[0]
        items = soup.select("div.TODAY_CONTENT > p")
        
        # 格式化数据 - 存储原始HTML响应和结构化数据
        result = {
            "title": astro.text,
            "items": [item.text for item in items],
            "html": astro.text + "<br>" + "<br>".join([item.text + "<br>" for item in items]),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "timestamp": datetime.now().isoformat()
        }
        
        # 更新缓存
        cache[str(num)] = result
        return result
    except Exception as e:
        logger.error(f"获取星座数据失败: {e}")
        raise

def fetch_all_astro_data():
    """Fetch data for all 12 astrology signs"""
    logger.info("Scheduled job: Fetching data for all astrology signs")
    updated = False
    failed_signs = []
    
    for num in range(12):  # 0-11 for the 12 signs
        try:
            # Check if current data is different from cached data
            if needs_update(num):
                logger.info(f"Updating data for astrology sign {num}")
                fetch_astro_data(num, force_update=True)
                updated = True
            else:
                logger.info(f"No updates needed for astrology sign {num}")
        except Exception as e:
            logger.error(f"Error updating astrology sign {num}: {e}")
            failed_signs.append(num)
    
    # Save cache if any updates were made
    if updated:
        logger.info("Updates found, saving cache")
        save_cache()
    else:
        logger.info("No updates found for any astrology sign")
        
    # Return failed signs for retry
    return failed_signs

def retry_failed_signs(signs):
    """Retry fetching data for failed astrology signs"""
    if not signs:
        return
    
    logger.info(f"Retrying update for signs: {signs}")
    updated = False
    
    for num in signs:
        try:
            logger.info(f"Retrying update for astrology sign {num}")
            fetch_astro_data(num, force_update=True)
            updated = True
        except Exception as e:
            logger.error(f"Error during retry for astrology sign {num}: {e}")
    
    if updated:
        logger.info("Updates found during retry, saving cache")
        save_cache()

def needs_update(num):
    """Check if the astrology data needs to be updated"""
    try:
        # If not in cache or not valid for today, definitely needs update
        if str(num) not in cache or not is_cache_valid(num):
            return True
            
        # Fetch current data without saving to cache
        # Add timeout to prevent hanging requests
        r = requests.get(
            f'http://astro.click108.com.tw/daily_{num}.php?iAstro={num}', 
            timeout=30
        )
        r.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(r.text, 'html.parser')
        items = soup.select("div.TODAY_CONTENT > p")
        current_items = [item.text for item in items]
        
        # Compare with cached items
        if str(num) in cache and 'items' in cache[str(num)]:
            cached_items = cache[str(num)]['items']
            # Check if content has changed
            if cached_items != current_items:
                logger.info(f"Content changed for astrology {num}")
                return True
                
        return False
    except Exception as e:
        logger.error(f"Error checking for updates for astrology {num}: {e}")
        # In case of error, assume update is needed
        return True

# 定时器设置，优化定时更新策略
def setup_scheduler():
    """设置定时更新任务，考虑更多场景的调度策略"""
    global scheduler
    
    if scheduler:
        scheduler.shutdown()
        
    scheduler = BackgroundScheduler()
    
    # 每天四个时间点更新，避开凌晨高负载期
    scheduler.add_job(
        check_and_schedule_updates, 
        CronTrigger(hour='2,6,12,16', minute='0')
    )
    
    # 应用启动后，延迟2分钟再执行第一次更新(避免启动高峰)
    scheduler.add_job(
        check_and_schedule_updates, 
        'date', 
        run_date=datetime.now() + timedelta(minutes=2)
    )
    
    scheduler.start()
    logger.info("调度器已启动，设置了定时更新任务")

# 更智能的重试机制
def check_and_schedule_updates():
    """检查更新并安排重试，添加智能退避策略"""
    logger.info("运行更新检查")
    
    # 尝试更新所有星座
    failed_signs = fetch_all_astro_data()
    
    # 如果有失败的星座，安排重试
    if failed_signs:
        logger.info(f"为失败的星座安排重试: {failed_signs}")
        
        # 提前结束条件：最大重试次数，或者随着时间推移增加延长重试间隔
        retry_times = 0
        max_retries = 5  # 最大重试5次，避免无限循环
        
        def retry_with_count():
            nonlocal retry_times, failed_signs
            retry_times += 1
            
            # 如果大部分星座都失败了，可能是源站问题，增加指数退避
            if len(failed_signs) > 6:
                # 根据失败次数动态调整重试间隔
                backoff_minutes = 5 * (2 ** (min(retry_times - 1, 3)))
                logger.info(f"检测到大量星座获取失败，第{retry_times}次重试将在{backoff_minutes}分钟后执行")
                
                # 移除当前作业，创建新的延迟更长的作业
                if job_id in scheduler.get_jobs():
                    scheduler.remove_job(job_id)
                
                if retry_times < max_retries:
                    scheduler.add_job(
                        retry_with_count,
                        'date',
                        run_date=datetime.now() + timedelta(minutes=backoff_minutes),
                        id=f"{job_id}_backoff_{retry_times}"
                    )
                return
            
            logger.info(f"重试尝试 {retry_times}/{max_retries}")
            
            # 尝试更新失败的星座，使用修改过的函数，一次只重试一个星座
            if failed_signs:
                # 随机选择一个失败的星座重试，避免同时重试所有
                sign_to_retry = random.choice(failed_signs)
                success = retry_single_sign(sign_to_retry)
                if success:
                    failed_signs.remove(sign_to_retry)
                    logger.info(f"星座{sign_to_retry}重试成功，剩余{len(failed_signs)}个失败的星座")
                
            # 如果所有星座更新成功或达到最大重试次数，删除作业
            if not failed_signs or retry_times >= max_retries:
                logger.info(f"在{retry_times}次尝试后删除重试作业")
                # 记录最终失败的星座，以便后续处理
                if failed_signs:
                    logger.warning(f"以下星座重试后仍然失败: {failed_signs}")
                if job_id in scheduler.get_jobs():
                    scheduler.remove_job(job_id)
        
        # 创建初始重试作业，使用递增间隔
        job_id = f'retry_job_{int(time.time())}'
        scheduler.add_job(
            retry_with_count,
            IntervalTrigger(minutes=2),  # 开始是每2分钟重试一次
            id=job_id
        )

# 添加智能单星座重试策略
def retry_single_sign(num):
    """重试更新单个星座，成功返回True"""
    try:
        logger.info(f"重试更新星座{num}")
        
        # 随机延迟1-3秒，减轻对源站的压力
        time.sleep(random.uniform(1, 3))
        
        fetch_astro_data(num, force_update=True)
        save_cache()  # 每次成功更新后保存缓存
        return True
    except Exception as e:
        logger.error(f"星座{num}重试失败: {e}")
        return False
    
# 添加生成默认运势数据的功能，当无法获取时使用
def generate_default_fortune(zodiac_num):
    """为指定星座生成默认的运势数据"""
    zodiac_names = ["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", 
                   "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"]
    
    if 0 <= zodiac_num <= 11:
        zodiac_name = zodiac_names[zodiac_num]
    else:
        zodiac_name = "未知星座"
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    return {
        "title": f"今日{zodiac_name}運勢",
        "items": [
            "整體運勢★★★☆☆：",
            "今日運勢平穩，建議專注日常事務，避免做出重大決定。保持良好心態，適合思考和規劃未來。",
            "愛情運勢★★★☆☆：",
            "感情方面需要多一些耐心和溝通，理解是維繫關係的重要因素。",
            "事業運勢★★★☆☆：",
            "工作上可能遇到一些挑戰，但只要保持冷靜和專注，都能順利解決。",
            "財運運勢★★★☆☆：",
            "財務狀況穩定，避免衝動消費，適合做長遠理財規劃。"
        ],
        "html": f"今日{zodiac_name}運勢<br>整體運勢★★★☆☆：<br>今日運勢平穩，建議專注日常事務，避免做出重大決定。保持良好心態，適合思考和規劃未來。<br>愛情運勢★★★☆☆：<br>感情方面需要多一些耐心和溝通，理解是維繫關係的重要因素。<br>事業運勢★★★☆☆：<br>工作上可能遇到一些挑戰，但只要保持冷靜和專注，都能順利解決。<br>財運運勢★★★☆☆：<br>財務狀況穩定，避免衝動消費，適合做長遠理財規劃。<br>",
        "date": today,
        "timestamp": datetime.now().isoformat(),
        "is_default": True  # 标记为默认生成的数据
    }

# Create Flask app
app = Flask(__name__)

# 修改API端点处理逻辑，确保始终返回数据
@app.route("/astro_api", methods=['GET'])
def astro_api():
    if request.method == 'GET':
        try:
            num = int(request.values['num'])
        except (KeyError, ValueError):
            abort(400, "缺少或无效的'num'参数")
            
    if (num > 11) or (num < 0):
        abort(400, "无效的星座编号(必须是0-11)")
    
    # 检查是否需要转换为简体中文
    convert_to_simple = request.args.get('convert', '').lower() in ['1', 'true', 'yes', 'y']
    
    # 检查缓存
    if is_cache_valid(num):
        logger.info(f"从缓存提供星座{num}的数据")
        resp_data = cache[str(num)]["html"]
    else:
        logger.info(f"获取星座{num}的最新数据")
        try:
            data = fetch_astro_data(num)
            # 缓存在fetch_astro_data内部更新
            save_cache()
            resp_data = data["html"]
        except Exception as e:
            logger.error(f"获取星座{num}数据失败: {e}")
            
            # 如果获取失败且缓存中存在该星座数据(即使不是今天的)，则使用缓存数据
            if str(num) in cache:
                logger.warning(f"由于获取失败，使用过期缓存数据，星座{num}")
                resp_data = cache[str(num)]["html"]
            else:
                # 如果连缓存都没有，生成默认数据
                logger.warning(f"没有可用缓存，使用生成的默认数据，星座{num}")
                default_data = generate_default_fortune(num)
                cache[str(num)] = default_data
                save_cache()
                resp_data = default_data["html"]
    
    # 如果需要，转换为简体中文
    if convert_to_simple:
        if OPENCC_AVAILABLE:
            resp_data = convert_to_simplified(resp_data)
        else:
            logger.warning("请求繁转简转换，但OpenCC不可用")
    
    return resp_data

# 新增API路由
api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route("/astro/<int:num>", methods=['GET'])
def astro_json_api(num):
    """API endpoint to get astrology data in JSON format"""
    try:
        if not (0 <= num <= 11):
            return jsonify({"error": "Invalid astrology number (must be 0-11)"}), 400
        
        # 检查是否需要转换为简体中文
        convert_to_simple = request.args.get('convert', '').lower() in ['1', 'true', 'yes', 'y']
        
        # Check cache first
        if is_cache_valid(num):
            logger.info(f"Serving cached data for astrology {num}")
            data = cache[str(num)]
        else:
            logger.info(f"Fetching fresh data for astrology {num}")
            try:
                data = fetch_astro_data(num)
                # Cache is updated within fetch_astro_data
                save_cache()
            except Exception as e:
                # 如果获取失败且缓存中存在该星座数据，则使用缓存数据
                if str(num) in cache:
                    logger.warning(f"Using outdated cache for astrology {num} due to fetch error: {e}")
                    data = cache[str(num)]
                else:
                    return jsonify({"error": "Failed to fetch astrology data"}), 500
        
        # 如果需要，转换为简体中文
        if convert_to_simple and OPENCC_AVAILABLE:
            response_data = {
                "title": convert_to_simplified(data["title"]),
                "items": [convert_to_simplified(item) for item in data["items"]],
                "date": data["date"],
                "simplified": True
            }
        else:
            response_data = {
                "title": data["title"],
                "items": data["items"],
                "date": data["date"],
                "simplified": False
            }
        
        # Return data in JSON format
        return jsonify(response_data)
            
    except Exception as e:
        logger.error(f"Error in API: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Add route to manually trigger update
@api_bp.route("/update", methods=['GET'])
def manual_update():
    """Endpoint to manually trigger astrology data update"""
    try:
        failed_signs = fetch_all_astro_data()
        return jsonify({
            "status": "success", 
            "message": "Data update triggered successfully",
            "failed_signs": failed_signs
        })
    except Exception as e:
        logger.error(f"Error triggering data update: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Register blueprint
app.register_blueprint(api_bp)

def create_app():
    """Application factory function for WSGI servers"""
    # Load cache when app starts
    load_cache()
    
    # Fetch all astrology data immediately
    logger.info("Application startup: Fetching all astrology data")
    try:
        fetch_all_astro_data()  # Synchronously fetch data at startup
    except Exception as e:
        logger.error(f"Error fetching astrology data at startup: {e}")
    
    # Set up the scheduler for future updates
    setup_scheduler()
    return app

if __name__ == "__main__":
    # Load cache at startup
    load_cache()
    
    # Fetch all astrology data immediately
    logger.info("Application startup: Fetching all astrology data")
    try:
        fetch_all_astro_data()  # Synchronously fetch data at startup
    except Exception as e:
        logger.error(f"Error fetching astrology data at startup: {e}")
    
    # Set up scheduler
    setup_scheduler()
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)