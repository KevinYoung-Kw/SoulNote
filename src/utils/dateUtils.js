/**
 * 日期工具类
 * 提供日期相关的辅助函数
 */

// 从window对象获取lunar-javascript库
let Lunar, Solar, HolidayUtil;
try {
  // 尝试从全局对象获取
  const LunarJS = window.LunarJS || {};
  Lunar = LunarJS.Lunar;
  Solar = LunarJS.Solar;
  HolidayUtil = LunarJS.HolidayUtil;
  
  if (!Lunar || !Solar) {
    console.warn('LunarJS库未正确加载或初始化');
  }
} catch (error) {
  console.warn('获取LunarJS库失败:', error);
}

// 缓存日期信息，减少API请求
let dateInfoCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 缓存有效期1小时

/**
 * 获取当前日期信息
 * @returns {Promise<Object>} 日期信息对象
 */
export async function getCurrentDateInfo() {
  const now = new Date();
  const currentTime = now.getTime();
  
  // 如果缓存有效，直接返回缓存的数据
  if (dateInfoCache && (currentTime - lastFetchTime < CACHE_DURATION)) {
    return dateInfoCache;
  }
  
  try {
    // 尝试从API获取日期信息
    const response = await fetch('/api/dateInfo');
    if (response.ok) {
      const data = await response.json();
      
      // 更新缓存
      dateInfoCache = data;
      lastFetchTime = currentTime;
      
      return data;
    } else {
      throw new Error('获取日期信息失败');
    }
  } catch (error) {
    console.warn('从API获取日期信息失败，使用本地日期信息', error);
    
    // API获取失败，使用lunar-javascript计算农历信息
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = now.getDay();
    
    // 通过lunar-javascript库获取农历信息
    let lunarDate = '';
    let solarTerm = '';
    let animal = '';
    
    try {
      const solar = Solar.fromDate(now);
      const lunar = solar.getLunar();
      
      // 农历日期
      lunarDate = `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
      animal = lunar.getYearShengXiao();
      
      // 节气信息
      const jieqi = lunar.getJieQi();
      if (jieqi) {
        solarTerm = jieqi;
      }
    } catch (lunarError) {
      console.error('获取农历信息失败:', lunarError);
      lunarDate = '农历日期';
      solarTerm = '';
    }
    
    const dateInfo = {
      date: now.toISOString(),
      year,
      month,
      day,
      weekday,
      lunarDate,
      solarTerm,
      animal,
      weekDay: ['日', '一', '二', '三', '四', '五', '六'][weekday],
      success: true
    };
    
    // 更新缓存
    dateInfoCache = dateInfo;
    lastFetchTime = currentTime;
    
    return dateInfo;
  }
}

/**
 * 获取月份名称
 * @param {number} month - 月份（1-12）
 * @param {string} [format='en'] - 格式：'en'英文，'zh'中文
 * @returns {string} 月份名称
 */
export function getMonthName(month, format = 'en') {
  if (format === 'zh') {
    return ['一月', '二月', '三月', '四月', '五月', '六月', 
            '七月', '八月', '九月', '十月', '十一月', '十二月'][month - 1];
  }
  
  return ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
          'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'][month - 1];
}

/**
 * 获取星期名称
 * @param {number} weekday - 星期（0-6，0表示星期日）
 * @param {string} [format='zh'] - 格式：'zh'中文，'en'英文
 * @returns {string} 星期名称
 */
export function getWeekdayName(weekday, format = 'zh') {
  if (format === 'en') {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday];
  }
  
  return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][weekday];
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串，如 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // 补零函数
  const pad = (num) => (num < 10 ? `0${num}` : num);
  
  // 替换格式字符串
  return format
    .replace('YYYY', year)
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds));
} 