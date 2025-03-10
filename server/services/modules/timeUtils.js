/**
 * 时间工具模块 - 提供时间相关的辅助功能
 */

// 由于lunar-javascript库可能使用ESM格式，尝试以兼容方式导入
let Lunar, Solar, HolidayUtil;
try {
  const lunarJS = require('lunar-javascript');
  // 检查是否成功导入
  if (lunarJS && lunarJS.Lunar) {
    Lunar = lunarJS.Lunar;
    Solar = lunarJS.Solar;
    HolidayUtil = lunarJS.HolidayUtil;
  } else {
    console.warn('lunar-javascript导入不完整，将使用简化的时间处理');
  }
} catch (error) {
  console.warn('无法导入lunar-javascript，将使用简化的时间处理:', error.message);
}

/**
 * 获取当前时段及相关建议
 * @param {boolean} savageMode 是否为毒舌模式
 * @returns {Object} 时段描述和建议
 */
function getTimeContext(savageMode = false) {
  const now = new Date();
  const hour = now.getHours();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(hour).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedTime = `${year}-${month}-${date} ${hours}:${minutes}`;
  
  // 基本的日期信息
  const dayOfWeek = now.getDay();
  let lunarDate = '未知';
  let animal = '未知';
  let festivals = [];
  let isHoliday = false;
  let holidayName = '';
  let lunar = null;
  let lunarFestivals = [];
  let holiday = null;
  
  // 尝试获取农历信息
  try {
    if (Solar && Lunar && HolidayUtil) {
      const solar = Solar.fromDate(now);
      lunar = solar.getLunar(); 
      
      // 农历日期
      lunarDate = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
      animal = lunar.getYearShengXiao();
      
      // 获取节日信息
      const solarFestivals = solar.getFestivals();
      if (solarFestivals.length > 0) {
        festivals.push(...solarFestivals);
      }
      
      lunarFestivals = lunar.getFestivals();
      if (lunarFestivals.length > 0) {
        festivals.push(...lunarFestivals);
      }
      
      // 判断是否为法定假日
      holiday = HolidayUtil.getHoliday(solar.getYear(), solar.getMonth(), solar.getDay());
      isHoliday = holiday !== null;
      holidayName = holiday ? holiday.getName() : '';
    }
  } catch (error) {
    console.warn('获取农历信息失败:', error.message);
  }
  
  // 判断周末
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6) && !isHoliday;
  
  // 工作日/休息日状态
  let dayType = '';
  if (isHoliday) {
    dayType = `法定假日${holidayName ? '(' + holidayName + ')' : ''}`;
  } else if (isWeekend) {
    dayType = '周末';
  } else {
    dayType = '工作日';
  }
  
  // 定义不同时间段的上下文
  let timeContext = {
    period: '',
    suggestions: [],
    activities: [],
    concerns: [],
    // 添加更丰富的时间信息
    dateInfo: {
      lunarDate,
      animal,
      festivals: festivals.length > 0 ? festivals : ['无特殊节日'],
      weekDay: ['日', '一', '二', '三', '四', '五', '六'][dayOfWeek],
      dayType,
      // astro在lunar-javascript不可用时可能缺失
      astro: Solar && Lunar ? Solar.fromDate(now).getXingZuo() : '未知'
    }
  };
  
  // 根据时间划分时段并设置相应上下文
  if (hour >= 5 && hour < 9) {
    timeContext.period = '清晨';
    
    if (savageMode) {
      // 毒舌模式时间上下文
      timeContext.suggestions = ['勉强从床上爬起来', '装作精神焕发的样子', '假装自己是个早起的人'];
      timeContext.activities = ['挣扎着睁开眼', '对着镜子掩饰黑眼圈', '喝咖啡假装自己清醒'];
      timeContext.concerns = ['迟到还找借口', '又在做白日梦', '熬夜后的后悔时刻'];
      
      // 节假日特定内容
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`假期还起这么早，真是个假期废物`);
        timeContext.concerns.push(`节日焦虑症又犯了吧，假期也不会放过自己`);
      }
    } else {
      // 正常模式时间上下文
      const baseSuggestions = ['吃顿丰盛的早餐', '享受一天中最清新的时光', '早起是个好习惯'];
      const baseActivities = ['晨跑', '冥想', '规划今天'];
      const baseConcerns = ['不要匆忙赶路', '给自己足够准备时间', '照顾好自己的胃'];
      
      // 根据日期类型调整建议
      if (isHoliday) {
        baseSuggestions.push('享受假日的悠闲早晨', `${holidayName}假期愉快`);
        baseActivities.push('准备节日活动', '与家人共度时光');
        baseConcerns.push('别错过节日特别活动');
      } else if (isWeekend) {
        baseSuggestions.push('周末早晨可以稍微放松一下', '规划一个愉快的周末');
        baseActivities.push('周末休闲活动', '补充睡眠');
      } else {
        baseSuggestions.push('为一天的工作做好准备', '早起赢得效率');
        baseConcerns.push('避免早高峰拥堵');
      }
      
      // 农历节日特定内容
      if (lunarFestivals.length > 0) {
        baseSuggestions.push(`今天是${lunarFestivals.join('/')}，记得传统习俗`);
        baseActivities.push('参与传统节日活动');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 9 && hour < 12) {
    timeContext.period = '上午';
    
    if (savageMode) {
      timeContext.suggestions = ['装作在工作的样子', '对着电脑发呆', '用开会逃避责任'];
      timeContext.activities = ['摸鱼', '刷社交媒体', '走神'];
      timeContext.concerns = ['被老板抓包', '工作进度落后', '午饭前的无限等待'];
      
      // 节假日特定内容
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`难得假期还想着工作，真是没救了`);
        timeContext.concerns.push(`假期焦虑症又犯了是吧`);
      } else if (isWeekend) {
        timeContext.suggestions.push(`周末上午还在想工作，真是个工作狂魔`);
      }
    } else {
      const baseSuggestions = ['专注工作', '处理最重要的任务', '喝杯咖啡或茶提神'];
      const baseActivities = ['高效工作', '头脑风暴', '重要会议'];
      const baseConcerns = ['记得给眼睛休息', '保持水分', '别被琐事分散注意力'];
      
      if (isHoliday) {
        baseSuggestions.push(`享受${holidayName}假期`, '放下工作压力');
        baseActivities.push('节日活动', '休闲娱乐');
        baseConcerns.push('不要让工作影响假期心情');
      } else if (isWeekend) {
        baseSuggestions.push('周末上午可以悠闲一些', '做些平时没时间做的事');
        baseActivities.push('休闲娱乐', '购物', '户外活动');
      }
      
      // 农历特定内容
      if (lunar.getDayInChinese() === '初一') {
        baseSuggestions.push('农历月初，适合规划新目标');
      } else if (lunar.getDayInChinese() === '十五') {
        baseSuggestions.push('农历月中，检视月初计划进展');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 12 && hour < 14) {
    timeContext.period = '中午';
    
    if (savageMode) {
      timeContext.suggestions = ['装作很忙不想午休的样子', '吃完午饭就开始犯困', '又点了外卖是吧'];
      timeContext.activities = ['打瞌睡', '偷偷躲起来午休', '对着手机发呆'];
      timeContext.concerns = ['下午的会议又要迟到', '吃太多导致下午昏昏欲睡', '午饭又吃垃圾食品'];
      
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`${holidayName}假期午餐又要吃到撑？节制点吧`);
        timeContext.concerns.push('假期吃太多又要长肉了');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末还不多睡会，中午就开始折腾');
        timeContext.concerns.push('周末午餐又要吃泡面？真有创意');
      }
    } else {
      const baseSuggestions = ['享用营养午餐', '适当午休', '放松一下紧张的神经'];
      const baseActivities = ['短暂午睡', '轻松用餐', '舒展身体'];
      const baseConcerns = ['避免过量进食', '注意饮食均衡', '午休不宜过长'];
      
      if (isHoliday) {
        baseSuggestions.push(`${holidayName}假期午餐可以稍微丰盛些`, '与亲友共进午餐');
        baseActivities.push('节日特色美食', '轻松交谈');
      } else if (isWeekend) {
        baseSuggestions.push('周末午餐可以慢慢享用', '准备些可口的饭菜');
        baseActivities.push('尝试新食谱', '与家人共进午餐');
      } else {
        baseSuggestions.push('工作日午餐要营养均衡', '午休能提高下午效率');
        baseConcerns.push('避免午餐过饱影响下午工作');
      }
      
      // 农历特定内容
      if (festivals.length > 0) {
        baseSuggestions.push(`${festivals.join('/')}，可以享用应景食物`);
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 14 && hour < 18) {
    timeContext.period = '下午';
    
    if (savageMode) {
      timeContext.suggestions = ['假装很忙的样子', '又开始犯困了是不是', '盯着时钟等下班'];
      timeContext.activities = ['喝咖啡提神', '装作专心工作', '在会议上走神'];
      timeContext.concerns = ['下午效率低到可怜', '又在摸鱼刷手机', '日复一日的碌碌无为'];
      
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`${holidayName}假期下午还不出去玩，窝在家里刷手机？`);
        timeContext.concerns.push('假期过半已经开始焦虑了吧');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末下午还不出门，又要荒废一天');
        timeContext.concerns.push('周末又在沙发上瘫着，活该没精彩生活');
      }
    } else {
      const baseSuggestions = ['保持适度饮水', '调整下午工作节奏', '适当休息提升效率'];
      const baseActivities = ['处理常规任务', '短暂小憩', '计划收尾工作'];
      const baseConcerns = ['避免久坐不动', '保持工作专注', '适当运动舒缓身心'];
      
      if (isHoliday) {
        baseSuggestions.push(`充分享受${holidayName}假期下午时光`, '安排些轻松活动');
        baseActivities.push('户外活动', '假期社交', '休闲购物');
        baseConcerns.push('注意防晒', '避免活动过度');
      } else if (isWeekend) {
        baseSuggestions.push('周末下午适合外出走走', '做些平时没时间做的事');
        baseActivities.push('探访亲友', '户外休闲', '看场电影');
      } else {
        baseSuggestions.push('下午是完成日常任务的好时机', '为明天做些准备');
        baseConcerns.push('避免下午疲劳影响效率');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 18 && hour < 21) {
    timeContext.period = '傍晚';
    
    if (savageMode) {
      timeContext.suggestions = ['又要加班吗，真拼命', '回家路上堵车的痛苦即将开始', '晚饭又要将就了是吧'];
      timeContext.activities = ['拖着疲惫的身体回家', '点外卖', '对着手机发呆'];
      timeContext.concerns = ['一整天的疲惫都在此刻爆发', '回家还要面对一堆家务', '明天还要重复今天的无聊'];
      
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`${holidayName}傍晚还在想工作？假期综合征患者`);
        timeContext.concerns.push('假期余额不足的焦虑又来了');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末傍晚还没安排约会？孤独终老实锤了');
        timeContext.concerns.push('明天就要上班，周末综合征提前到来');
      }
    } else {
      const baseSuggestions = ['享受宁静的傍晚时光', '安排轻松的晚餐', '放松一天的疲劳'];
      const baseActivities = ['散步消食', '轻松娱乐', '与家人共度时光'];
      const baseConcerns = ['避免晚餐过重', '保持良好心情', '为睡眠做准备'];
      
      if (isHoliday) {
        baseSuggestions.push(`${holidayName}节日傍晚享受团聚时光`, '参与节日活动');
        baseActivities.push('节日晚宴', '观赏节日灯光', '欣赏节目表演');
        baseConcerns.push('注意节日安全');
      } else if (isWeekend) {
        baseSuggestions.push('周末傍晚可以安排社交活动', '享受休闲时光');
        baseActivities.push('赴约会友', '家庭聚餐', '文化娱乐');
      } else {
        baseSuggestions.push('工作日傍晚放松心情', '做好工作与生活的转换');
        baseActivities.push('健身锻炼', '准备健康晚餐', '整理一天的收获');
      }
      
      // 季节与月相关内容
      const month = now.getMonth() + 1;
      if (month >= 3 && month <= 5) {
        baseSuggestions.push('春季傍晚天气宜人，适合户外活动');
      } else if (month >= 6 && month <= 8) {
        baseSuggestions.push('夏季傍晚凉爽下来，适合户外散步');
      } else if (month >= 9 && month <= 11) {
        baseSuggestions.push('秋季傍晚风景怡人，适合赏景拍照');
      } else {
        baseSuggestions.push('冬季傍晚注意保暖，享受温馨室内时光');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 21 && hour < 24) {
    timeContext.period = '晚上';
    
    if (savageMode) {
      timeContext.suggestions = ['又要熬夜看剧是吧', '明天起床又要赖床了', '装模作样的写个总结'];
      timeContext.activities = ['无效率地刷手机', '拖延睡觉时间', '忙着做明天要后悔的事'];
      timeContext.concerns = ['睡眠不足导致的黑眼圈', '熬夜带来的皮肤问题', '半夜饿了又忍不住吃夜宵'];
      
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`${holidayName}晚上熬夜，明天假期就浪费在补觉上了`);
        timeContext.concerns.push('假期综合征最后的狂欢');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末晚上还不早点睡，周一又要顶着熊猫眼上班');
        timeContext.concerns.push('周末晚上的焦虑已经提前到来');
      }
    } else {
      const baseSuggestions = ['为一天画上完美句号', '做好睡前准备', '回顾今日收获'];
      const baseActivities = ['阅读放松', '听舒缓音乐', '整理思绪'];
      const baseConcerns = ['避免使用电子产品影响睡眠', '保持规律作息', '创造良好睡眠环境'];
      
      if (isHoliday) {
        baseSuggestions.push(`${holidayName}晚上享受节日氛围`, '与亲友共度美好时光');
        baseActivities.push('观赏节日表演', '参与节日活动', '分享节日祝福');
      } else if (isWeekend) {
        baseSuggestions.push('周末晚上可以稍晚休息', '为新的一周做好准备');
        baseActivities.push('整理下周计划', '准备明日所需物品');
      } else {
        baseSuggestions.push('工作日晚上早点休息', '保证充足睡眠');
        baseConcerns.push('避免过度劳累影响第二天状态');
      }
      
      // 月相相关
      if (lunar.getDayInChinese() === '十五' || lunar.getDayInChinese() === '十六') {
        baseSuggestions.push('今晚月色正好，适合赏月');
        baseActivities.push('月下漫步', '观星赏月');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else {
    timeContext.period = '深夜';
    
    if (savageMode) {
      timeContext.suggestions = ['熬夜冠军非你莫属', '又在后悔为什么不早点睡', '明早又要赖床迟到了'];
      timeContext.activities = ['无意义刷手机', '盯着天花板数羊', '给明天的黑眼圈打下基础'];
      timeContext.concerns = ['猝死预警', '熬夜脱发正在进行时', '生物钟已经彻底混乱'];
      
      if (isHoliday || isWeekend) {
        timeContext.suggestions.push('假期熬夜，精力透支，真有你的');
        timeContext.concerns.push('作息混乱的后果自己承担吧');
      }
    } else {
      const baseSuggestions = ['尽快入睡休息', '调整呼吸放松身心', '为明天储备能量'];
      const baseActivities = ['冥想放松', '轻柔音乐助眠', '安静阅读'];
      const baseConcerns = ['避免强光刺激', '保持安静环境', '注意睡眠质量'];
      
      if (isHoliday) {
        baseSuggestions.push('即使是假期也要注意休息', '调整作息更健康');
      } else if (isWeekend) {
        baseSuggestions.push('周末也要保持规律作息', '良好睡眠质量更重要');
      } else {
        baseSuggestions.push('工作日深夜应尽快休息', '保证明天的工作状态');
        baseConcerns.push('避免长期熬夜对健康的影响');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  }
  
  return {
    formattedTime,
    timeContext
  };
}

/**
 * 根据节气获取季节性活动建议
 * @param {string} term 节气名称
 * @returns {string} 季节性活动建议
 */
function getSeasonalActivities(term) {
  const termActivities = {
    '立春': '感受春天的气息，可以踏青',
    '雨水': '雨季将至，记得携带雨具',
    '惊蛰': '春雷始鸣，万物复苏',
    '春分': '昼夜平分，适合户外活动',
    '清明': '祭祖扫墓，踏青郊游',
    '谷雨': '雨量增多，春耕开始',
    '立夏': '夏季开始，防暑降温',
    '小满': '夏熟作物籽粒开始饱满',
    '芒种': '农忙时节，播种移苗',
    '夏至': '一年中昼最长，注意防暑',
    '小暑': '热浪来袭，注意防晒',
    '大暑': '一年中最热，注意避暑',
    '立秋': '秋季开始，天气转凉',
    '处暑': '暑气渐消，秋高气爽',
    '白露': '夜晚露水增多，天气转凉',
    '秋分': '昼夜平分，秋季中点',
    '寒露': '气温骤降，注意保暖',
    '霜降': '开始结霜，冬天临近',
    '立冬': '冬季开始，注意保暖',
    '小雪': '开始降雪，天气寒冷',
    '大雪': '雪量增大，严寒将至',
    '冬至': '一年中昼最短，注意保暖',
    '小寒': '寒冷加剧，注意防寒',
    '大寒': '一年中最冷，注意保暖'
  };
  
  return termActivities[term] || '适应季节变化';
}

module.exports = {
  getTimeContext,
  getSeasonalActivities
};
