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
      timeContext.suggestions = ['勉强从床上爬起来', '装作精神焕发的样子', '假装自己是个早起的人', '又在做清晨5分钟冥想，然后迟到一小时', '喝杯黑咖啡掩盖你的黑眼圈'];
      timeContext.activities = ['挣扎着睁开眼', '对着镜子掩饰黑眼圈', '喝咖啡假装自己清醒', '刷牙时间玩手机', '写个朋友圈假装早起'];
      timeContext.concerns = ['迟到还找借口', '又在做白日梦', '熬夜后的后悔时刻', '起床气爆表', '明明可以再睡五分钟'];
      
      // 节假日特定内容
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`假期还起这么早，真是个假期废物`, '难得放假还那么自虐早起');
        timeContext.concerns.push(`节日焦虑症又犯了吧，假期也不会放过自己`, '怕浪费假期结果起早贪黑，活该累');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末不睡懒觉，起这么早是大脑有泡', '假装早起很自律，其实不过是睡不着');
        timeContext.concerns.push('周末早起装清醒，就你最能装', '又没睡好现在头疼了吧');
      }
    } else {
      // 正常模式时间上下文
      const baseSuggestions = ['吃顿丰盛的早餐', '享受一天中最清新的时光', '早起是个好习惯', '给自己煮一杯热牛奶', '准备一杯蜂蜜柠檬水'];
      const baseActivities = ['晨跑', '冥想', '规划今天', '给自己做一顿营养早餐', '晨间拉伸', '写日记', '照顾花草'];
      const baseConcerns = ['不要匆忙赶路', '给自己足够准备时间', '照顾好自己的胃', '不要空腹喝咖啡', '早餐要吃好'];
      
      // 根据日期类型调整建议
      if (isHoliday) {
        baseSuggestions.push('享受假日的悠闲早晨', `${holidayName}假期愉快`, '为自己准备一杯鲜榨果汁');
        baseActivities.push('准备节日活动', '与家人共度时光', '做一顿丰盛节日早餐', '整理家居环境', '为家人煮一壶花茶');
        baseConcerns.push('别错过节日特别活动', '保持节日好心情', '与亲友分享节日快乐');
      } else if (isWeekend) {
        baseSuggestions.push('周末早晨可以稍微放松一下', '规划一个愉快的周末', '煮一杯奶茶犒劳自己');
        baseActivities.push('周末休闲活动', '补充睡眠', '花时间做个精致早餐', '为家人准备爱心早点', '整理个人空间');
        baseConcerns.push('周末也要保持良好作息', '早餐别太油腻', '照顾好自己的身体');
      } else {
        baseSuggestions.push('为一天的工作做好准备', '早起赢得效率', '来杯热牛奶温暖身心', '为自己准备一顿营养早餐');
        baseConcerns.push('避免早高峰拥堵', '不要急匆匆赶路', '不要吃不健康的早餐');
        baseActivities.push('整理工作计划', '为家人准备早点', '听一段轻音乐', '收拾好个人物品');
      }
      
      // 农历节日特定内容
      if (lunarFestivals.length > 0) {
        baseSuggestions.push(`今天是${lunarFestivals.join('/')}，记得传统习俗`, '品尝节日传统食物');
        baseActivities.push('参与传统节日活动', '了解节日文化背景', '准备一些节日特色食物');
        baseConcerns.push('传承优良传统', '与家人共享节日氛围');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 9 && hour < 12) {
    timeContext.period = '上午';
    
    if (savageMode) {
      timeContext.suggestions = ['装作在工作的样子', '对着电脑发呆', '用开会逃避责任', '又迟到了还找什么借口', '第三杯咖啡下肚，装清醒的样子'];
      timeContext.activities = ['摸鱼', '刷社交媒体', '走神', '编造工作进度', '偷偷打个盹'];
      timeContext.concerns = ['被老板抓包', '工作进度落后', '午饭前的无限等待', '又在偷懒等下班', '明明能十分钟完成的工作拖一上午'];
      
      // 节假日特定内容
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`难得假期还想着工作，真是没救了`, '为什么不多睡会，急着起来干嘛');
        timeContext.concerns.push(`假期焦虑症又犯了是吧`, '假期上午不睡懒觉，人生还有什么意义');
      } else if (isWeekend) {
        timeContext.suggestions.push(`周末上午还在想工作，真是个工作狂魔`, '难得周末不睡懒觉，脑子有问题吧');
        timeContext.concerns.push('周末不睡懒觉，浪费假期天赋', '这么早起来干啥，显摆自律吗');
      }
    } else {
      const baseSuggestions = ['专注工作', '处理最重要的任务', '喝杯咖啡或茶提神', '为自己泡一杯花茶', '吃些坚果补充能量'];
      const baseActivities = ['高效工作', '头脑风暴', '重要会议', '整理工作计划', '做些创意思考', '准备一杯自己喜欢的饮品'];
      const baseConcerns = ['记得给眼睛休息', '保持水分', '别被琐事分散注意力', '注意坐姿', '每工作一小时小休片刻'];
      
      if (isHoliday) {
        baseSuggestions.push(`享受${holidayName}假期`, '放下工作压力', '来一杯精致的早茶');
        baseActivities.push('节日活动', '休闲娱乐', '准备一份美味早午餐', '拍摄美丽景色', '写一篇节日感想');
        baseConcerns.push('不要让工作影响假期心情', '保持愉快的心情', '与亲友分享快乐');
      } else if (isWeekend) {
        baseSuggestions.push('周末上午可以悠闲一些', '做些平时没时间做的事', '享受一顿丰盛早餐');
        baseActivities.push('休闲娱乐', '购物', '户外活动', '整理个人空间', '为植物浇水');
        baseConcerns.push('不必给自己太多压力', '慢节奏享受生活', '照顾好自己的胃');
      } else {
        baseSuggestions.push('上午是高效工作的黄金时段', '合理安排任务顺序', '准备一杯提神的饮品');
        baseActivities.push('处理重要邮件', '规划今日工作', '与团队简短会议', '给植物喷水', '准备一些健康零食');
        baseConcerns.push('避免会议过多占用时间', '设置专注时间段', '注意用眼卫生');
      }
      
      // 农历特定内容
      if (lunar && lunar.getJieQi()) {
        const jieQi = lunar.getJieQi();
        baseSuggestions.push(`今天是${jieQi}，${getSeasonalActivities(jieQi)}`);
        baseActivities.push('感受节气变化');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 12 && hour < 14) {
    timeContext.period = '中午';
    
    if (savageMode) {
      timeContext.suggestions = ['装作很忙不想午休的样子', '吃完午饭就开始犯困', '又点了外卖是吧', '一天的工作还没做完，急着吃饭？', '午饭吃得这么多，下午困意十足'];
      timeContext.activities = ['打瞌睡', '偷偷躲起来午休', '对着手机发呆', '装模作样吃沙拉减肥', '边吃饭边刷剧效率高手'];
      timeContext.concerns = ['下午的会议又要迟到', '吃太多导致下午昏昏欲睡', '午饭又吃垃圾食品', '消化不良是日常', '吃完饭就困，猪都比你精神'];
      
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`${holidayName}假期午餐又要吃到撑？节制点吧`, '假期午餐吃大餐，钱包瘦身计划');
        timeContext.concerns.push('假期吃太多又要长肉了', '又在为午饭消耗假期时光');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末还不多睡会，中午就开始折腾', '做什么午餐这么讲究，平时将就惯了');
        timeContext.concerns.push('周末午餐又要吃泡面？真有创意', '吃完又躺尸，猪生日常');
      }
    } else {
      const baseSuggestions = ['享用营养午餐', '适当午休', '放松一下紧张的神经', '给自己冲一杯花茶', '来份水果补充维生素'];
      const baseActivities = ['短暂午睡', '轻松用餐', '舒展身体', '准备一份可口午餐', '享用一顿营养均衡的饭菜', '听些轻音乐'];
      const baseConcerns = ['避免过量进食', '注意饮食均衡', '午休不宜过长', '选择易消化的食物', '注意保护胃部健康'];
      
      if (isHoliday) {
        baseSuggestions.push(`${holidayName}假期午餐可以稍微丰盛些`, '与亲友共进午餐', '尝试做一道新菜犒劳自己');
        baseActivities.push('节日特色美食', '轻松交谈', '分享美食照片', '用特别餐具提升用餐体验');
        baseConcerns.push('控制节日食品热量', '保持饮食多样化', '留出活动空间');
      } else if (isWeekend) {
        baseSuggestions.push('周末午餐可以慢慢享用', '准备些可口的饭菜', '尝试一家新餐厅');
        baseActivities.push('尝试新食谱', '与家人共进午餐', '制作一道拿手菜', '摆盘精美增加食欲');
        baseConcerns.push('避免暴饮暴食', '饭后短暂休息', '周末也要规律饮食');
      } else {
        baseSuggestions.push('工作日午餐要营养均衡', '午休能提高下午效率', '准备一份爱心便当');
        baseConcerns.push('避免午餐过饱影响下午工作', '避免高糖食物导致下午困倦', '注意用餐姿势');
        baseActivities.push('午餐后漫步十分钟', '整理工作台面', '准备下午所需物品');
      }
      
      // 农历特定内容
      if (festivals.length > 0) {
        baseSuggestions.push(`${festivals.join('/')}，可以享用应景食物`, '品尝节日特色美食');
        baseActivities.push('记录节日餐点', '与亲友分享节日食物照片');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else if (hour >= 14 && hour < 18) {
    timeContext.period = '下午';
    
    if (savageMode) {
      timeContext.suggestions = ['假装很忙的样子', '又开始犯困了是不是', '盯着时钟等下班', '下午三点困意来袭，继续装清醒', '来杯咖啡掩盖你的疲倦'];
      timeContext.activities = ['喝咖啡提神', '装作专心工作', '在会议上走神', '偷偷刷手机', '画个淡妆掩盖黑眼圈'];
      timeContext.concerns = ['下午效率低到可怜', '又在摸鱼刷手机', '日复一日的碌碌无为', '咖啡喝多了晚上又要失眠', '用零食麻痹自己'];
      
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`${holidayName}假期下午还不出去玩，窝在家里刷手机？`, '下午睡个懒觉，晚上又要睡不着了');
        timeContext.concerns.push('假期过半已经开始焦虑了吧', '假期宅在家里又要虚度光阴');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末下午还不出门，又要荒废一天', '窝在沙发上吃零食，难怪越来越胖');
        timeContext.concerns.push('周末又在沙发上瘫着，活该没精彩生活', '为明天上班焦虑已经开始了是吧');
      }
    } else {
      const baseSuggestions = ['保持适度饮水', '调整下午工作节奏', '适当休息提升效率', '给自己泡一杯花茶', '下午补充一些水果'];
      const baseActivities = ['处理常规任务', '短暂小憩', '计划收尾工作', '做些伸展运动', '打理个人空间', '给自己煮一杯咖啡'];
      const baseConcerns = ['避免久坐不动', '保持工作专注', '适当运动舒缓身心', '注意下午情绪波动', '避免摄入过多糖分'];
      
      if (isHoliday) {
        baseSuggestions.push(`充分享受${holidayName}假期下午时光`, '安排些轻松活动', '来杯手工果茶犒劳自己');
        baseActivities.push('户外活动', '假期社交', '休闲购物', '烘焙一些小点心', '拍照记录美好时光');
        baseConcerns.push('注意防晒', '避免活动过度', '保持愉快心情');
      } else if (isWeekend) {
        baseSuggestions.push('周末下午适合外出走走', '做些平时没时间做的事', '来杯特调咖啡享受悠闲');
        baseActivities.push('探访亲友', '户外休闲', '看场电影', '逛逛花市或书店', '准备一份精致点心');
        baseConcerns.push('适量享用甜点', '记得给植物浇水', '整理一下生活空间');
      } else {
        baseSuggestions.push('下午是完成日常任务的好时机', '为明天做些准备', '犒劳自己一杯好茶或咖啡');
        baseConcerns.push('避免下午疲劳影响效率', '合理安排高低强度任务', '注意坐姿避免颈椎疲劳');
        baseActivities.push('做三分钟眼部按摩', '五分钟伸展运动', '整理工作空间');
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
      timeContext.suggestions = ['又要熬夜看剧是吧', '明天起床又要赖床了', '装模作样的写个总结', '喝杯热牛奶装养生？还不是熬夜', '洗个澡还要刷手机是吧'];
      timeContext.activities = ['无效率地刷手机', '拖延睡觉时间', '忙着做明天要后悔的事', '边吃零食边看剧', '对着镜子假装做护肤'];
      timeContext.concerns = ['睡眠不足导致的黑眼圈', '熬夜带来的皮肤问题', '半夜饿了又忍不住吃夜宵', '又在自欺欺人地喝牛奶', '明明困得要命还要熬夜'];
      
      if (isHoliday || festivals.length > 0) {
        timeContext.suggestions.push(`${holidayName}晚上熬夜，明天假期就浪费在补觉上了`, '假期晚上吃垃圾食品，积攒的肥肉好好享受吧');
        timeContext.concerns.push('假期综合征最后的狂欢', '晚上嘴刁得很，明天胃痛怪谁');
      } else if (isWeekend) {
        timeContext.suggestions.push('周末晚上还不早点睡，周一又要顶着熊猫眼上班', '忙着做面膜，皮肤已经被你熬废了');
        timeContext.concerns.push('周末晚上的焦虑已经提前到来', '明天上班起不来可别怪闹钟');
      }
    } else {
      const baseSuggestions = ['为一天画上完美句号', '做好睡前准备', '回顾今日收获', '煮一杯香草牛奶犒劳自己', '为自己准备一本好书'];
      const baseActivities = ['阅读放松', '听舒缓音乐', '整理思绪', '写一写感恩日记', '给明天的自己做好准备', '泡个舒适的热水澡'];
      const baseConcerns = ['避免使用电子产品影响睡眠', '保持规律作息', '创造良好睡眠环境', '睡前一小时别吃太多食物', '选择温和的晚间护肤'];
      
      if (isHoliday) {
        baseSuggestions.push(`${holidayName}晚上享受节日氛围`, '与亲友共度美好时光', '为自己准备一杯热巧克力');
        baseActivities.push('观赏节日表演', '参与节日活动', '分享节日祝福', '烤些节日小点心', '拍摄节日美好瞬间');
        baseConcerns.push('节日零食适量享用', '保持愉快心情入睡');
      } else if (isWeekend) {
        baseSuggestions.push('周末晚上可以稍晚休息', '为新的一周做好准备', '来杯花草茶舒缓心情');
        baseActivities.push('整理下周计划', '准备明日所需物品', '做15分钟舒缓瑜伽', '与家人分享周末甜点', '准备一份美味早餐');
        baseConcerns.push('避免周末综合征影响情绪', '保持良好的睡眠环境');
      } else {
        baseSuggestions.push('工作日晚上早点休息', '保证充足睡眠', '来杯温热牛奶助眠', '写下明天的三个小目标');
        baseConcerns.push('避免过度劳累影响第二天状态', '如果有困扰的事情，记下来明天再解决');
        baseActivities.push('做15分钟伸展运动', '整理好明天的着装', '为自己泡一杯安神茶');
      }
      
      // 月相相关
      if (lunar.getDayInChinese() === '十五' || lunar.getDayInChinese() === '十六') {
        baseSuggestions.push('今晚月色正好，适合赏月', '煮一壶花茶，配着月光品尝');
        baseActivities.push('月下漫步', '观星赏月', '拍摄月亮照片', '写一首月亮小诗');
      }
      
      timeContext.suggestions = baseSuggestions;
      timeContext.activities = baseActivities;
      timeContext.concerns = baseConcerns;
    }
  } else {
    timeContext.period = '深夜';
    
    if (savageMode) {
      timeContext.suggestions = ['熬夜冠军非你莫属', '又在后悔为什么不早点睡', '明早又要赖床迟到了', '深夜饿了又想吃垃圾食品是吧', '又在装深夜有灵感的文艺青年'];
      timeContext.activities = ['无意义刷手机', '盯着天花板数羊', '给明天的黑眼圈打下基础', '偷偷摸摸找夜宵', '假装很忙的样子'];
      timeContext.concerns = ['猝死预警', '熬夜脱发正在进行时', '生物钟已经彻底混乱', '半夜吃东西又要长胖了', '明天起床又要后悔现在不睡觉'];
      
      if (isHoliday || isWeekend) {
        timeContext.suggestions.push('假期熬夜，精力透支，真有你的', '深夜来碗泡面，明天胃痛活该');
        timeContext.concerns.push('作息混乱的后果自己承担吧', '又在玩手机是吧，眼睛不要了');
      }
    } else {
      const baseSuggestions = ['尽快入睡休息', '调整呼吸放松身心', '为明天储备能量', '煮一杯温热牛奶助眠', '饿了的话可以吃点轻食宵夜'];
      const baseActivities = ['冥想放松', '轻柔音乐助眠', '安静阅读', '整理一天的心情', '写一写今日感想', '泡个热水澡放松身心'];
      const baseConcerns = ['避免强光刺激', '保持安静环境', '注意睡眠质量', '不要吃太油腻的宵夜', '热牛奶放蜂蜜更助眠'];
      
      if (isHoliday) {
        baseSuggestions.push('即使是假期也要注意休息', '调整作息更健康', '可以为自己准备一杯茶或热可可');
        baseActivities.push('记录假期美好瞬间', '为自己准备一份简单可口的宵夜');
      } else if (isWeekend) {
        baseSuggestions.push('周末也要保持规律作息', '良好睡眠质量更重要', '为自己煮杯牛奶犒劳一周辛苦');
        baseActivities.push('为自己做个面膜护理', '准备一份健康的宵夜');
      } else {
        baseSuggestions.push('工作日深夜应尽快休息', '保证明天的工作状态', '一杯热牛奶能帮助睡眠');
        baseConcerns.push('避免长期熬夜对健康的影响', '宵夜选择水果或酸奶更健康');
        baseActivities.push('给明天的自己准备一份小惊喜', '整理床铺创造舒适睡眠环境');
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
