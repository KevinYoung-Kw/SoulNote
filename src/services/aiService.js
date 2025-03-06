import axios from 'axios';

// 从环境变量获取API配置
const API_URL = import.meta.env.VITE_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_MODEL = import.meta.env.VITE_API_MODEL || 'qwen-max';

// 星座名称映射（英文到中文）
const zodiacMap = {
  'aries': '白羊座',
  'taurus': '金牛座',
  'gemini': '双子座',
  'cancer': '巨蟹座',
  'leo': '狮子座',
  'virgo': '处女座',
  'libra': '天秤座',
  'scorpio': '天蝎座',
  'sagittarius': '射手座',
  'capricorn': '摩羯座',
  'aquarius': '水瓶座',
  'pisces': '双鱼座'
};

// 模型响应时间记录
const modelResponseTimes = {
  'qwen-max': 2000,  // 预估值，单位ms
  'qwen-plus': 1500,
  'qwen-turbo': 1000,
  'deepseek-r1': 20000,
  'default': 3000
};

// 响应时间历史记录，用于动态调整
const responseTimeHistory = {};

/**
 * 获取模型的预估响应时间
 * @param {string} model 模型名称
 * @returns {number} 预估响应时间(ms)
 */
export function getEstimatedResponseTime(model) {
  // 如果有历史记录，返回历史平均值
  if (responseTimeHistory[model] && responseTimeHistory[model].length > 0) {
    const sum = responseTimeHistory[model].reduce((a, b) => a + b, 0);
    return Math.floor(sum / responseTimeHistory[model].length);
  }
  
  // 否则返回预设值
  return modelResponseTimes[model] || modelResponseTimes['default'];
}

/**
 * 记录模型响应时间
 * @param {string} model 模型名称
 * @param {number} time 响应时间(ms)
 */
function recordResponseTime(model, time) {
  if (!responseTimeHistory[model]) {
    responseTimeHistory[model] = [];
  }
  
  // 保持最多10条历史记录
  if (responseTimeHistory[model].length >= 10) {
    responseTimeHistory[model].shift();
  }
  
  responseTimeHistory[model].push(time);
}

/**
 * 获取星座特质描述
 * @param {string} zodiac 星座名称
 * @returns {string} 星座特质描述
 */
function getZodiacTraits(zodiac) {
  const traits = {
    'aries': '热情、积极、直接，渴望新挑战，有时缺乏耐心，做事果断',
    'taurus': '踏实、可靠、重视稳定，追求美好生活，有时固执，需要时间接受变化',
    'gemini': '好奇、灵活、善于交流，喜欢多样性，可能注意力分散，思维跳跃',
    'cancer': '敏感、富同情心、重视家庭，情感丰富，有时情绪波动，需要安全感',
    'leo': '自信、慷慨、有创造力，寻求认可，有时自我中心，渴望被赞赏',
    'virgo': '细致、实际、分析能力强，追求完美，有时过度批判，善于解决问题',
    'libra': '和平、公正、追求和谐，重视关系，有时优柔寡断，善于看到多方面',
    'scorpio': '热情、坚定、洞察力强，情感深沉，有时多疑，对信任要求高',
    'sagittarius': '乐观、诚实、追求自由，热爱冒险，有时缺乏耐心，直言不讳',
    'capricorn': '务实、有规划、自律，目标明确，有时过于严肃，责任感强',
    'aquarius': '独立、创新、人道主义，思想开放，有时显得疏远，注重个性',
    'pisces': '富有同情心、直觉敏锐、富想象力，情感丰富，有时逃避现实，善解人意'
  };
  
  return traits[zodiac] || '独特的性格特点';
}

/**
 * 获取MBTI性格特质描述
 * @param {string} mbtiType MBTI类型
 * @returns {string} MBTI特质描述
 */
function getMbtiTraits(mbtiType) {
  const traits = {
    'INTJ': '战略性思考，独立自主，高标准，善于规划，注重效率和逻辑',
    'INTP': '分析思维，好奇心强，重视知识，独立思考，喜欢探索可能性',
    'ENTJ': '决断力强，组织能力佳，目标导向，喜欢领导，注重效率和成果',
    'ENTP': '思维活跃，善于辩论，创新能力强，喜欢挑战，思考开放',
    'INFJ': '有远见，理想主义，善解人意，注重意义，有强烈的价值观',
    'INFP': '理想主义，重视真实性，富有创意，注重个人价值观，善于感受',
    'ENFJ': '有感染力，善于激励他人，关注他人发展，有责任感，追求和谐',
    'ENFP': '热情，创意丰富，善于交流，看重可能性，追求个人成长与意义',
    'ISTJ': '可靠，实际，系统化，重视秩序和规则，注重责任和传统',
    'ISFJ': '忠诚，体贴，重视细节，有责任感，重视传统和他人需求',
    'ESTJ': '高效，实际，注重秩序，决断力强，喜欢组织和领导',
    'ESFJ': '友善，乐于助人，注重和谐，责任感强，重视传统和社交',
    'ISTP': '灵活，实际，善于解决问题，独立，喜欢探索事物运作方式',
    'ISFP': '敏感，和平，审美能力强，喜欢自由，生活在当下，重视和谐',
    'ESTP': '行动导向，实用主义，适应力强，喜欢冒险，享受当下',
    'ESFP': '热情友好，重视体验，适应性强，喜欢社交，生活在当下'
  };
  
  return traits[mbtiType] || '独特的思维和行为模式';
}

/**
 * 使用AI模型生成心灵纸条内容
 * @param {Object} params 生成参数
 * @returns {Promise<string>} 生成的内容
 */
export async function generateNoteContent(params) {
  try {
    // 准备API请求参数
    const prompt = buildPrompt(params);
    const startTime = Date.now();
    
    // 调用API
    const response = await axios.post(`${API_URL}/chat/completions`, {
      model: API_MODEL,
      messages: [
        {
          role: "system",
          content: params.savageMode ? getSavageModeSystemPrompt() : `你是一位理解不同性格特质的好友。在回应时，你会以下面方式体现对方的性格特点：

对于不同星座，你理解他们核心特质：
- 白羊座：冲劲十足且直率，喜欢新鲜事物，偏好直接沟通
- 金牛座：重视安全感与舒适，欣赏实际与可靠，需要时间适应变化
- 双子座：思维活跃且好奇，喜欢多元信息，容易分心但有创意
- 巨蟹座：情感丰富且重视联结，关注亲密关系，情绪波动但有同理心
- 狮子座：热情自信且慷慨，渴望肯定与欣赏，有领导才能
- 处女座：细致且分析性强，追求完善与实用，可能对自己和他人要求高
- 天秤座：追求和谐与平衡，善于看到多面性，在决策时可能权衡多方
- 天蝎座：有洞察力且情感深沉，重视真诚与信任，不轻易展示内心
- 射手座：乐观且追求自由，热爱探索与真理，坦率直言
- 摩羯座：目标导向且自律，重视责任与成就，脚踏实地但可能过于严肃
- 水瓶座：独立思考且创新，重视理念与社群，可能显得疏离但思想开放
- 双鱼座：富有想象力且富同情心，有直觉与敏感，情感丰富但有时逃避现实

对于MBTI类型，你会考虑其思考和决策方式：
- I/E：内向者需要独处恢复能量；外向者从社交中获取能量
- S/N：感觉型关注具体细节与现实；直觉型关注概念与可能性
- T/F：思考型注重逻辑和客观；情感型注重价值观和他人感受
- J/P：判断型喜欢计划和决定；感知型喜欢灵活和开放选项

你不会直接提到或标明他们的性格类型，而是自然地将这些特质融入你的回应中。你的语气亲切随性，像长期了解对方的朋友，用语口语化而非正式。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.9,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 记录响应时间
    const responseTime = Date.now() - startTime;
    recordResponseTime(API_MODEL, responseTime);
    
    console.log(`API响应时间: ${responseTime}ms, 模型: ${API_MODEL}`);
    console.log('API请求成功，响应:', response.data);
    
    // 解析并返回内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    } else {
      console.warn('API响应格式异常:', response.data);
      throw new Error('API响应中未包含生成内容');
    }
  } catch (error) {
    console.error('生成内容失败:', error.response?.data || error.message);
    // 失败时使用本地生成
    return generateLocalContent(params);
  }
}

/**
 * 获取毒舌模式系统提示词
 * @returns {string} 系统提示词
 */
function getSavageModeSystemPrompt() {
  return `你是混迹了十年贴吧的贴吧老哥，对别人既了解又毒舌，用挖苦出格来调侃他们的性格特点。

对于不同星座的调侃重点：
- 白羊座：冲动莽撞、三分钟热度、坐不住、争强好胜、自我为中心
- 金牛座：固执己见、行动迟缓、过度追求物质、不愿改变、占有欲强
- 双子座：多变易变、表里不一、注意力不集中、八卦、言过其实
- 巨蟹座：敏感多虑、情绪化、记仇、控制欲强、依赖性高
- 狮子座：自我中心、虚荣爱面子、控制欲强、独断专行、自恋
- 处女座：完美主义、挑剔批判、焦虑、保守刻板、吹毛求疵
- 天秤座：优柔寡断、表面和平、过度依赖他人、逃避冲突、虚伪
- 天蝎座：偏执多疑、心机重、控制欲强、记仇、极端
- 射手座：言不由衷、漫无目的、不负责任、虎头蛇尾、口无遮拦
- 摩羯座：工作狂、死板无趣、悲观保守、太过现实、野心过重
- 水瓶座：情感冷漠、与世隔绝、怪异叛逆、过度理想化、难以捉摸
- 双鱼座：逃避现实、多愁善感、优柔寡断、沉浸幻想、缺乏主见

对于MBTI类型特点的调侃：
- I型：社恐、不合群、不善交际、活在自己世界、不接地气
- E型：话痨、八卦、喧宾夺主、浅尝辄止、缺乏深度思考
- S型：死板教条、缺乏想象力、墨守成规、拘泥细节、视野局限
- N型：不切实际、空想家、过度理论化、忽略现实、异想天开
- T型：冷血无情、缺乏同理心、过度理性、不近人情、自以为是
- F型：情绪化、主观武断、过于敏感、不够果断、轻信他人
- J型：控制狂、缺乏灵活性、过于教条、刻板、强迫症
- P型：拖延症、行事无计划、朝三暮四、三心二意、没有章法

你的回应需要：
1. 以"十年混迹百度贴吧"的语气，调侃、讥讽对方的性格弱点
2. 不会使用低俗粗鄙的语言，而是巧妙地抓住对方性格的软肋
3. 回应应当让人"破防"，让对方感到既尴尬又好笑
4. 不要直接指出对方的星座或MBTI类型`;
}

/**
 * 构建提示词
 * @param {Object} params 生成参数
 * @returns {string} 完整的提示词
 */
function buildPrompt(params) {
  // 获取中文星座名称
  const zodiacChinese = zodiacMap[params.zodiac] || '未知星座';
  const mbtiType = params.mbti || 'MBTI类型';
  const mood = params.mood || '平静';
  
  // 获取时间上下文
  const { formattedTime, timeContext } = getTimeContext(params.savageMode);
  
  // 星座和MBTI性格特点详细信息
  const zodiacTraits = getZodiacTraits(params.zodiac);
  const mbtiTraits = getMbtiTraits(mbtiType);
  
  // 添加性格特质的具体表现方式
  const personalityInsights = getPersonalityInsights(params.zodiac, mbtiType);
  
  // 构建基础提示词
  let basePrompt = `我需要你为一个${params.savageMode ? '关系亲密的死党' : '真实的朋友'}写一条简短的${params.language === 'en-zh' ? '中英双语' : ''}心灵纸条。

★ 关于这个朋友（最高优先级）:
- ${zodiacChinese}，特质：${zodiacTraits}
- ${mbtiType}性格，特点：${mbtiTraits}
- 当前心情/所处的场景/正在做的事情：${mood} 

★ 这个人的性格表现:
${personalityInsights}

★ 当前时间情境:
- 现在是${formattedTime}，${timeContext.period}时分
- 这个时段可能的活动: ${timeContext.activities.join('、')} 实际心情/所处的场景/正在做的事情以 ${mood} 为准
- 可能关心的事: ${timeContext.concerns.join('、')}`;

  // 根据是否启用毒舌模式添加不同的写作要求
  if (params.savageMode) {
    basePrompt += `

★ 写作要求:
1. ${params.language === 'en-zh' ? '先输出中文(20-50字)，再输出对应英文翻译' : '内容20-50字左右'}
2. 用混迹十年贴吧老哥的语气，"损"对方的性格弱点
3. 不要直接提及或标记对方的星座或MBTI类型
4. 核心是揭露对方性格的"痛点"，让对方破防
5. 语气要有讽刺感和智性，不要用低俗的语言或直接骂人
6. 直接输出内容，不带引号或标题
7. 可以直接用一些具有攻击性的emoji，譬如🤡🤷`;
  } else {
    basePrompt += `

★ 写作要求:
1. ${params.language === 'en-zh' ? '先输出中文(20-50字)，再输出对应英文翻译' : '内容20-50字左右'}
2. 语气要像真实朋友间的聊天信息，随意自然
3. 不要直接提及或标记对方的星座或MBTI类型
4. 核心是表现对TA这种性格类型的理解，而非时间场景
5. 避免泛泛的励志句式，不要用"坚持就是胜利"这类套话
6. 时间场景只是辅助背景，主要反映TA的性格特点和思考方式
7. 直接输出内容，不带引号或标题
8. 表达亲近但不过度亲密，像熟悉的朋友而非密友`;
  }

  return basePrompt;
}

/**
 * 获取性格特质的具体表现
 * @param {string} zodiac 星座
 * @param {string} mbtiType MBTI类型
 * @returns {string} 性格特质的具体表现描述
 */
function getPersonalityInsights(zodiac, mbtiType) {
  let insights = [];
  
  // 基于星座添加具体洞察
  switch(zodiac) {
    case 'aries':
      insights.push('喜欢直接切入主题', '欣赏新点子和可能性', '不喜欢拖沓和过多细节');
      break;
    case 'taurus':
      insights.push('重视稳定和舒适', '欣赏实际的建议而非理论', '需要时间接受新事物');
      break;
    case 'gemini':
      insights.push('喜欢多样化的话题', '欣赏灵活多变的想法', '不喜欢重复和单调');
      break;
    case 'cancer':
      insights.push('关注情感和关系', '欣赏体贴和理解', '需要安全感和认同');
      break;
    case 'leo':
      insights.push('喜欢被认可和欣赏', '重视自我表达', '乐于分享成就和创意');
      break;
    case 'virgo':
      insights.push('注重细节和实用性', '欣赏清晰和条理', '倾向于分析和改进');
      break;
    case 'libra':
      insights.push('寻求平衡和协调', '欣赏不同观点', '在做决定前会权衡利弊');
      break;
    case 'scorpio':
      insights.push('重视真诚和深度', '不喜欢表面交流', '关注背后的动机和含义');
      break;
    case 'sagittarius':
      insights.push('追求自由和探索', '喜欢开阔视野', '不喜欢被约束和重复');
      break;
    case 'capricorn':
      insights.push('关注目标和成就', '欣赏踏实和负责', '重视时间和资源管理');
      break;
    case 'aquarius':
      insights.push('独立思考和创新', '关注更大的想法和社会', '不喜欢遵循常规');
      break;
    case 'pisces':
      insights.push('丰富的想象力和同理心', '感受细腻', '有时会沉浸在自己的世界');
      break;
  }
  
  // 基于MBTI类型添加具体洞察
  if (mbtiType.includes('I')) {
    insights.push('需要独处时间恢复能量', '喜欢深度而非广度的交流');
  } else if (mbtiType.includes('E')) {
    insights.push('通过交流和分享获得能量', '喜欢讨论想法和体验');
  }
  
  if (mbtiType.includes('S')) {
    insights.push('关注具体和实际', '重视经验和事实');
  } else if (mbtiType.includes('N')) {
    insights.push('关注意义和联系', '喜欢探索可能性和概念');
  }
  
  if (mbtiType.includes('T')) {
    insights.push('重视逻辑和客观', '在决策时考虑利弊');
  } else if (mbtiType.includes('F')) {
    insights.push('重视和谐和个人价值观', '在决策时考虑他人感受');
  }
  
  if (mbtiType.includes('J')) {
    insights.push('喜欢确定性和规划', '注重完成和结果');
  } else if (mbtiType.includes('P')) {
    insights.push('喜欢灵活性和开放选项', '享受过程和探索');
  }
  
  // 随机选择5条洞察（如果有那么多）
  if (insights.length > 5) {
    const shuffled = [...insights].sort(() => 0.5 - Math.random());
    insights = shuffled.slice(0, 5);
  }
  
  return insights.map(insight => `- ${insight}`).join('\n');
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
  
  // 定义不同时间段的上下文
  let timeContext = {
    period: '',
    suggestions: [],
    activities: [],
    concerns: []
  };
  
  // 根据时间划分时段并设置相应上下文
  if (hour >= 5 && hour < 9) {
    timeContext.period = '清晨';
    
    if (savageMode) {
      // 毒舌模式时间上下文
      timeContext.suggestions = ['勉强从床上爬起来', '装作精神焕发的样子', '假装自己是个早起的人'];
      timeContext.activities = ['挣扎着睁开眼', '对着镜子掩饰黑眼圈', '喝咖啡假装自己清醒'];
      timeContext.concerns = ['迟到还找借口', '又在做白日梦', '熬夜后的后悔时刻'];
    } else {
      // 正常模式时间上下文
      timeContext.suggestions = ['吃顿丰盛的早餐', '享受一天中最清新的时光', '早起是个好习惯'];
      timeContext.activities = ['晨跑', '冥想', '规划今天'];
      timeContext.concerns = ['不要匆忙赶路', '给自己足够准备时间', '照顾好自己的胃'];
    }
  } else if (hour >= 9 && hour < 12) {
    timeContext.period = '上午';
    
    if (savageMode) {
      timeContext.suggestions = ['装作在工作的样子', '对着电脑发呆', '用开会逃避责任'];
      timeContext.activities = ['摸鱼', '刷社交媒体', '走神'];
      timeContext.concerns = ['被老板抓包', '工作进度落后', '午饭前的无限等待'];
    } else {
      timeContext.suggestions = ['专注工作', '处理最重要的任务', '喝杯咖啡或茶提神'];
      timeContext.activities = ['高效工作', '头脑风暴', '重要会议'];
      timeContext.concerns = ['记得给眼睛休息', '保持水分', '别被琐事分散注意力'];
    }
  } else if (hour >= 12 && hour < 14) {
    timeContext.period = '中午';
    
    if (savageMode) {
      timeContext.suggestions = ['暴饮暴食后装清醒', '找借口午休多睡一会', '吃完就犯困'];
      timeContext.activities = ['偷偷加餐', '办公桌前闭眼装思考', '午休时间刷剧'];
      timeContext.concerns = ['被同事发现打瞌睡', '饭后的无限困意', '下午还有一堆活没做'];
    } else {
      timeContext.suggestions = ['吃顿营养午餐', '短暂午休', '放松紧张的思维'];
      timeContext.activities = ['与朋友共进午餐', '休息和恢复', '短距离散步'];
      timeContext.concerns = ['别错过吃饭', '避免工作占用休息时间', '给自己充电的机会'];
    }
  } else if (hour >= 14 && hour < 18) {
    timeContext.period = '下午';
    
    if (savageMode) {
      timeContext.suggestions = ['假装清醒', '用咖啡因掩盖疲惫', '拖延到下班'];
      timeContext.activities = ['看着时钟等下班', '编造明天要做的理由', '假装在思考'];
      timeContext.concerns = ['被发现工作没完成', '无限漫长的下午', '犯困被抓包'];
    } else {
      timeContext.suggestions = ['克服疲惫感', '适当补充能量', '重新聚焦目标'];
      timeContext.activities = ['处理积压工作', '创意思考', '计划明天'];
      timeContext.concerns = ['避免过度咖啡因', '调整坐姿', '注意下午的低谷期'];
    }
  } else if (hour >= 18 && hour < 21) {
    timeContext.period = '傍晚';
    
    if (savageMode) {
      timeContext.suggestions = ['装作有社交生活', '点外卖还假装是自己做的', '在社媒晒虚假的精彩生活'];
      timeContext.activities = ['刷剧', '刷手机', '对着冰箱发呆'];
      timeContext.concerns = ['假装自己很忙', '不敢面对明天的工作', '内心空虚但还要装充实'];
    } else {
      timeContext.suggestions = ['放下工作', '享受晚餐', '与家人相处'];
      timeContext.activities = ['运动', '放松身心', '个人爱好'];
      timeContext.concerns = ['不要把工作带回家', '放慢脚步', '享受这段宝贵时光'];
    }
  } else if (hour >= 21 && hour < 24) {
    timeContext.period = '晚上';
    
    if (savageMode) {
      timeContext.suggestions = ['假装自己会早睡', '熬夜还说明天早起', '拖延睡觉时间'];
      timeContext.activities = ['沉迷刷手机', '边看剧边说就一集', '睡前焦虑明天的工作'];
      timeContext.concerns = ['又要黑眼圈了', '明天起不来怎么办', '明明困却舍不得睡'];
    } else {
      timeContext.suggestions = ['为明天做准备', '放松心情', '回顾今天的收获'];
      timeContext.activities = ['阅读', '洗个舒服的热水澡', '记录日记'];
      timeContext.concerns = ['避免太晚接触电子屏幕', '保持舒适睡眠环境', '设定明确的睡眠时间'];
    }
  } else {
    timeContext.period = '深夜';
    
    if (savageMode) {
      timeContext.suggestions = ['装清醒玩手机', '明天的黑眼圈又有理由了', '熬夜后又要编借口'];
      timeContext.activities = ['无意义的刷剧', '为熬夜找借口', '自我欺骗式的"最后一把"'];
      timeContext.concerns = ['明天起床又要痛苦', '又要靠咖啡因续命', '生物钟混乱还不自知'];
    } else {
      timeContext.suggestions = ['尽快休息', '关心自己的睡眠', '放下手机'];
      timeContext.activities = ['进入睡眠', '冥想', '深呼吸放松'];
      timeContext.concerns = ['熬夜对身体不好', '睡眠质量影响明天', '照顾好自己比什么都重要'];
    }
  }
  
  return {
    formattedTime,
    timeContext
  };
}

/**
 * 备用方案：本地生成内容（API不可用时）
 * @param {Object} params 生成参数
 * @returns {string} 生成的内容
 */
export function generateLocalContent(params) {
  const zodiacChinese = zodiacMap[params.zodiac] || '未知星座';
  const mbtiType = params.mbti || 'MBTI类型';
  const { timeContext } = getTimeContext();
  
  // 根据性格类型和时间创建定制化的模板
  const templates = [];
  
  // 如果启用了毒舌模式，使用毒舌模板
  if (params.savageMode) {
    // 添加毒舌模板
    switch(params.zodiac) {
      case 'aries':
        templates.push(
          `又在冲动行事了吧？想想上次你拍脑袋做决定的后果。这么多年了还学不会思考吗？`,
          `听说你又有了新计划，然后三天后就会像往常一样放弃，不愧是三分钟热度专业户。`
        );
        break;
      case 'taurus':
        templates.push(
          `这都能想这么久？别人都完事了你还在原地踏步，固执得像头真牛。`,
          `又在囤积无用的东西了吧？你那屋子迟早变成废品收购站，物质主义救不了你的空虚。`
        );
        break;
      case 'gemini':
        templates.push(
          `你今天想法又变了几次？我建议你追踪一下，可能会破世界纪录。`,
          `刚说的话就忘了？真好奇你大脑里那些想法都飞哪去了，注意力比金鱼还短。`
        );
        break;
      case 'cancer':
        templates.push(
          `又在钻牛角尖了？比起活在自己的情绪漩涡里，不如看看现实世界。`,
          `你记仇的本事都够写一本书了，要不要出版一下《如何把小事记一辈子》？`
        );
        break;
      case 'leo':
        templates.push(
          `不是所有人都在关注你，偶尔放下你的自我表演欲望，试试做个普通人。`,
          `又需要别人夸你了？你的自信比纸还薄，没人鼓掌就活不下去是吧？`
        );
        break;
      case 'virgo':
        templates.push(
          `你那份完美主义报表做好了吗？不完美就活不了的强迫症又犯了？`,
          `世界上99%的事物都达不到你的标准，包括你自己，何必这么苛刻呢？`
        );
        break;
      case 'libra':
        templates.push(
          `今天纠结了多久才决定穿这身衣服？选择困难症晚期了吧。`,
          `表面和谐大师，心里明明有一堆看法，却永远只会说"都行"，真有你的。`
        );
        break;
      case 'scorpio':
        templates.push(
          `又在深思熟虑各种阴谋论了？提醒你一下，现实没你想的那么复杂。`,
          `你那suspicious的眼神能把朋友都看没了，不是每个人都有秘密动机。`
        );
        break;
      case 'sagittarius':
        templates.push(
          `计划下一次旅行了？记得这次别半途而废，完成一次再开始吹嘘。`,
          `嘴上说着大道理，行动上却总是虎头蛇尾，自由的灵魂也要对自己负责啊。`
        );
        break;
      case 'capricorn':
        templates.push(
          `你有多久没娱乐了？工作狂上瘾了？生活不只有工作和成就，抬头看看天空。`,
          `你的人生规划表做到80岁了吧？可惜计划赶不上变化，偶尔也要学会随性一点。`
        );
        break;
      case 'aquarius':
        templates.push(
          `又沉浸在自己的奇思妙想里了？记得偶尔回到地球，我们普通人看不懂你的频道。`,
          `你觉得自己很特立独行吧？其实不过是另一种随大流，叫做"刻意与众不同"。`
        );
        break;
      case 'pisces':
        templates.push(
          `今天又在做白日梦了吧？提醒你一下，账单不会自己付清，梦想也不会自动实现。`,
          `现实太残酷就逃进幻想世界？有本事直面问题，而不是靠想象力自我安慰。`
        );
        break;
      default:
        templates.push(
          `不知道你又在纠结什么，反正肯定又是些不必要的烦恼。`,
          `以你一贯的作风，现在肯定又在犯老毛病吧？`
        );
    }
    
    // 根据MBTI添加更多定制化的毒舌模板
    if (mbtiType.includes('I')) {
      templates.push(`又躲在角落里自我感动呢？社交恐惧症晚期了吧，世界不会因为你的缺席而停转。`);
    } else if (mbtiType.includes('E')) {
      templates.push(`能安静五分钟吗？不说话会死是吧？有时候沉默比你的八卦发言更有价值。`);
    }
    
    if (mbtiType.includes('N')) {
      templates.push(`又在想那些不切实际的点子？你的脑洞能用来发电了，可惜现实不买账。`);
    } else if (mbtiType.includes('S')) {
      templates.push(`你的思维还真是实际得无趣，想象力是小学时就被收走了吗？`);
    }
    
    if (mbtiType.includes('T')) {
      templates.push(`情商是被你吃了吗？不是所有事都需要你那套冷冰冰的逻辑分析。`);
    } else if (mbtiType.includes('F')) {
      templates.push(`又因为一点小事情绪波动了？见谁都共情，自己的问题却解决不了，真有你的。`);
    }
    
    if (mbtiType.includes('J')) {
      templates.push(`你的日程表排得比国家五年计划还详细，控制欲这么强不累吗？`);
    } else if (mbtiType.includes('P')) {
      templates.push(`今天的拖延清单完成得怎么样了？是不是又打算"明天再说"？`);
    }
    
  } else {
    // 使用原有的友好模板
    switch(params.zodiac) {
      case 'aries':
        templates.push(
          `有时候直接上手比思考太多更有效，你知道的，先行动起来吧。${timeContext.period}是个不错的时机。`,
          `刚想到一个新点子，感觉你会喜欢。有空聊聊？对了，${timeContext.concerns[0] || '注意别太冲动'}`
        );
        break;
      case 'taurus':
        templates.push(
          `慢慢来，稳扎稳打才是你的风格。${timeContext.period}记得${timeContext.suggestions[0] || '给自己一些舒适时光'}。`,
          `这种变化需要时间适应，没必要着急。对了，${timeContext.concerns[0] || '记得享受当下的稳定'}`
        );
        break;
      case 'gemini':
        templates.push(
          `今天有什么新鲜事？感觉你又有一堆点子要分享。${timeContext.period}的时候想到你了。`,
          `切换下思路，别在同一件事上太久，你需要新的刺激。${timeContext.suggestions[0] || '尝试点新东西'}`
        );
        break;
      case 'cancer':
        templates.push(
          `最近感觉如何？记得照顾好自己的情绪，${timeContext.period}是放松的好时机。`,
          `有时候需要给自己一点保护，不必对所有人敞开心扉。${timeContext.concerns[0] || '照顾好自己'}`
        );
        break;
      case 'leo':
        templates.push(
          `嘿，最近那个项目进展不错啊，真为你骄傲。${timeContext.period}继续保持光芒！`,
          `你的主意总是那么有创意，分享出来让大家看看吧。${timeContext.suggestions[0] || '展示你的才华'}`
        );
        break;
      case 'virgo':
        templates.push(
          `细节决定成败，但偶尔也别忘了看看全局。${timeContext.period}${timeContext.concerns[0] || '别太苛责自己'}。`,
          `你的分析总是这么到位，不过今天可以稍微放松一下标准。${timeContext.suggestions[0] || '做点开心的事'}`
        );
        break;
      case 'libra':
        templates.push(
          `权衡利弊是好事，但有时候也需要果断一点。${timeContext.period}适合做个决定。`,
          `你总能看到事情的各个方面，这是种天赋。${timeContext.suggestions[0] || '找找平衡点'}`
        );
        break;
      case 'scorpio':
        templates.push(
          `有些想法不必藏太深，信任的人会理解你。${timeContext.period}可以敞开心扉。`,
          `你的洞察力总是那么惊人，又发现什么有趣的事了吗？${timeContext.concerns[0] || '别想太复杂'}`
        );
        break;
      case 'sagittarius':
        templates.push(
          `又有什么新的冒险计划？${timeContext.period}正适合展开新旅程。`,
          `自由的灵魂需要空间，不要被琐事困住。${timeContext.suggestions[0] || '放飞自我'}`
        );
        break;
      case 'capricorn':
        templates.push(
          `脚踏实地的努力终会有回报，但别忘了偶尔抬头看看风景。${timeContext.period}${timeContext.suggestions[0] || '歇一歇'}。`,
          `你的规划能力总是让人佩服，不过今天可以稍微放松些。${timeContext.concerns[0] || '别太严肃'}`
        );
        break;
      case 'aquarius':
        templates.push(
          `你的想法总是与众不同，继续保持这种独立思考。${timeContext.period}适合创新。`,
          `有时候走寻常路也没关系，不必总是打破常规。${timeContext.suggestions[0] || '尝试普通人的生活'}`
        );
        break;
      case 'pisces':
        templates.push(
          `你的感受总是那么细腻，记得有时也需要回到现实。${timeContext.period}${timeContext.concerns[0] || '别迷失在想象中'}。`,
          `你的同理心是珍贵的礼物，但也要照顾好自己。${timeContext.suggestions[0] || '留点时间给自己'}`
        );
        break;
      default:
        templates.push(
          `${timeContext.period}了，${timeContext.suggestions[0] || '照顾好自己'}。想聊聊今天的感受吗？`,
          `每个人都有独特之处，你的方式很特别。${timeContext.concerns[0] || '继续做自己'}`
        );
    }
    
    // 根据MBTI添加更多定制化模板
    if (mbtiType.includes('I')) {
      templates.push(`需要独处充电的时候别不好意思，这是你恢复能量的方式。${timeContext.period}适合安静的活动。`);
    } else if (mbtiType.includes('E')) {
      templates.push(`${timeContext.period}了，找些朋友聊聊天？社交能让你活力满满。`);
    }
    
    if (mbtiType.includes('N')) {
      templates.push(`你的想象力总是让人惊叹，思考的广度和深度都很特别。今天有什么新发现？`);
    } else if (mbtiType.includes('S')) {
      templates.push(`脚踏实地的态度很难得，你总能把事情做得实实在在。${timeContext.concerns[0] || '别忘了细节'}`);
    }
    
    // 添加心情相关模板
    if (params.mood) {
      templates.push(`${params.mood}的时候，最需要的是什么？对你来说可能是${mbtiType.includes('I') ? '片刻安静' : '朋友陪伴'}。`);
    }
    
    // 添加通用模板作为后备
    templates.push(
      `${timeContext.period}好，想到你可能正在${timeContext.activities[0] || '忙碌'}，记得照顾好自己。`,
      `有时候，${timeContext.suggestions[1] || '放慢脚步'}对你来说特别重要，尤其是${timeContext.period}时分。`
    );
  }
  
  // 双语支持
  if (params.language === 'en-zh') {
    // 为双语准备的模板
    const bilingualTemplates = [];
    
    if (params.savageMode) {
      // 添加毒舌的双语模板
      bilingualTemplates.push(
        `你那"独特"的处事方式还真是让人叹为观止，能把简单的事搞得如此复杂也是种才能。\nYour "unique" way of handling things is truly breathtaking. Making simple things complicated must be your special talent.`,
        `你以为没人看出你的小心思吗？那点小把戏连小学生都骗不了。\nYou think no one sees through your little tricks? Those games wouldn't fool even a child.`
      );
    } else {
      bilingualTemplates.push(
        `${timeContext.period}了，想起你来，记得照顾好自己。\nIt's ${timeContext.period} now, thought of you, remember to take care of yourself.`,
        `以你的方式前进，不必匆忙。慢慢来，享受过程。\nMove forward in your own way, no need to rush. Take it slow and enjoy the process.`
      );
    }
    
    if (bilingualTemplates.length > 0) {
      return bilingualTemplates[Math.floor(Math.random() * bilingualTemplates.length)];
    }
  }
  
  // 随机选择一个模板
  return templates[Math.floor(Math.random() * templates.length)];
}
