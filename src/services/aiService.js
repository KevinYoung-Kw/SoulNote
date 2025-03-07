import axios from 'axios';

// 从环境变量获取API配置
const API_URL = import.meta.env.VITE_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_MODEL = import.meta.env.VITE_API_MODEL || 'qwen-max';
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

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
 * 调试日志输出
 * @param {string} type 日志类型
 * @param {any} content 日志内容
 */
function debugLog(type, content) {
  if (!DEBUG_MODE) return;
  
  const styles = {
    prompt: 'background: #3498db; color: white; padding: 2px 4px; border-radius: 3px;',
    response: 'background: #2ecc71; color: white; padding: 2px 4px; border-radius: 3px;',
    error: 'background: #e74c3c; color: white; padding: 2px 4px; border-radius: 3px;'
  };
  
  console.group(`%cAI Service Debug [${type.toUpperCase()}]`, styles[type] || '');
  
  if (typeof content === 'object') {
    console.dir(content);
  } else {
    console.log(content);
  }
  
  console.groupEnd();
}

/**
 * 获取星座特质描述
 * @param {string} zodiac 星座名称
 * @returns {string} 星座特质描述
 */
function getZodiacTraits(zodiac) {
  const traits = {
    'aries': '正向特质：充沛活力、勇敢无畏、领导能力强、直率坦诚、乐于挑战、创新精神；负向特质：急躁冲动、自我中心、缺乏耐心、好斗好胜、粗心大意、容易放弃',
    
    'taurus': '正向特质：可靠稳重、耐心专注、务实高效、审美细腻、忠诚坚定、享受生活；负向特质：固执己见、抗拒变化、占有欲强、行动迟缓、物质主义、记仇不忘',
    
    'gemini': '正向特质：思维敏捷、好奇心强、沟通能力佳、适应力强、学习迅速、创意丰富；负向特质：情绪多变、注意力分散、优柔寡断、表里不一、肤浅片面、缺乏定性',
    
    'cancer': '正向特质：富有同情心、保护欲强、记忆力好、情感丰富、直觉敏锐、珍视传统；负向特质：情绪化强、过度敏感、依赖性高、控制欲强、记仇耿耿、情绪多变',
    
    'leo': '正向特质：阳光自信、慷慨大方、领导魅力、创造力强、忠诚勇敢、温暖热情；负向特质：自我中心、好面子爱虚荣、权威独断、不接受批评、骄傲自大、铺张浪费',
    
    'virgo': '正向特质：分析能力强、注重细节、实际可靠、追求完美、勤劳踏实、理性逻辑；负向特质：过度挑剔、焦虑忧心、完美主义、过于自我批评、吹毛求疵、难以满足',
    
    'libra': '正向特质：追求和谐、公平正义、外交手腕佳、审美优雅、善解人意、平易近人；负向特质：犹豫不决、过度依赖他人、避免冲突、表面和平、难以坚持立场、过度理想化',
    
    'scorpio': '正向特质：洞察力强、意志坚定、忠诚专一、执着追求、直觉敏锐、深度思考；负向特质：多疑猜忌、极端固执、报复心强、情绪偏执、控制欲强、难以释怀',
    
    'sagittarius': '正向特质：乐观开朗、思想自由、诚实直言、热爱冒险、幽默风趣、博学多才；负向特质：缺乏耐心、言语无状、缺乏责任感、善变轻浮、过度理想化、承诺难守',
    
    'capricorn': '正向特质：自律严谨、责任心强、耐心坚韧、条理分明、稳重可靠、目标明确；负向特质：悲观保守、过于严肃、工作狂倾向、情感压抑、过度自我苛责、功利现实',
    
    'aquarius': '正向特质：创新前卫、思想独立、人道主义、理性客观、才智过人、团队合作；负向特质：叛逆特立独行、情感疏离、过度理想化、难以捉摸、固执己见、不切实际',
    
    'pisces': '正向特质：富有同理心、艺术感性、直觉敏锐、无私奉献、想象力丰富、心地善良；负向特质：沉溺幻想、缺乏自律、优柔寡断、易受影响、逃避现实、边界感模糊'
  };
  
  return traits[zodiac] || '独特而复杂的性格特点，既有显著优势，也有需要平衡的方面';
}

/**
 * 获取星座运势信息
 * @param {string} zodiac 星座索引(0-11)或英文名称
 * @param {string} aspect 运势方面(overall|love|career|wealth)
 * @returns {Promise<Object>} 星座运势信息
 */
async function getZodiacFortune(zodiacParam, aspect = 'overall') {
  try {
    // 如果传入的是星座英文名称，需要转换为索引
    let zodiacIndex = zodiacParam;
    if (typeof zodiacParam === 'string' && isNaN(zodiacParam)) {
      const zodiacNames = Object.keys(zodiacMap);
      zodiacIndex = zodiacNames.indexOf(zodiacParam.toLowerCase());
      if (zodiacIndex === -1) zodiacIndex = 0; // 默认为白羊座
    }
    
    // 确保索引在有效范围内(0-11)
    zodiacIndex = Math.max(0, Math.min(11, parseInt(zodiacIndex)));
    
    // 尝试从本地缓存读取数据
    let astroData;
    try {
      // 导入cached数据 - 在生产环境中要确保这个文件会被正确打包
      const cacheModule = await import('../../astro_api/astro_cache.json');
      astroData = cacheModule.default || cacheModule;
      
      debugLog('fortune', '从本地缓存加载星座运势数据');
    } catch (cacheError) {
      console.error('无法加载星座运势缓存:', cacheError);
      throw new Error('星座运势缓存不可用');
    }
    
    // 检查是否有对应星座的数据
    if (!astroData[zodiacIndex]) {
      throw new Error(`缓存中没有星座索引${zodiacIndex}的数据`);
    }
    
    // 检查数据是否是今天的
    const today = new Date().toISOString().split('T')[0];
    if (astroData[zodiacIndex].date !== today) {
      console.warn(`星座运势数据不是最新的. 缓存日期: ${astroData[zodiacIndex].date}, 今天: ${today}`);
      // 注意：在实际应用中可能需要更新缓存，但由于是前端应用，这里只发出警告
    }
    
    // 解析数据
    const items = astroData[zodiacIndex].items || [];
    const fortuneData = {
      title: astroData[zodiacIndex].title || `今日${zodiacMap[Object.keys(zodiacMap)[zodiacIndex]]}运势`,
      overall: { rating: '★★★☆☆', content: '今日运势一般，保持平常心。' },
      love: { rating: '★★★☆☆', content: '感情上需要多一些理解和包容。' },
      career: { rating: '★★★☆☆', content: '工作中可能会遇到一些挑战，但总体平稳。' },
      wealth: { rating: '★★★☆☆', content: '财务状况稳定，避免不必要的支出。' }
    };
    
    // 调试输出完整数据
    debugLog('fortune', { items: items });
    
    // 改进的运势解析逻辑
    let currentCategory = null;
    
    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i].trim();
      
      // 跳过空行
      if (!currentItem) continue;
      
      // 检查是否是运势类别行
      if (currentItem.includes('整體運勢') || currentItem.includes('整体运势')) {
        currentCategory = 'overall';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.overall.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.overall.content = contentMatch[1].trim();
        }
      } 
      else if (currentItem.includes('愛情運勢') || currentItem.includes('爱情运势')) {
        currentCategory = 'love';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.love.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.love.content = contentMatch[1].trim();
        }
      } 
      else if (currentItem.includes('事業運勢') || currentItem.includes('事业运势')) {
        currentCategory = 'career';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.career.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.career.content = contentMatch[1].trim();
        }
      } 
      else if (currentItem.includes('財運運勢') || currentItem.includes('财运运势')) {
        currentCategory = 'wealth';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.wealth.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.wealth.content = contentMatch[1].trim();
        }
      } 
      else if (currentCategory) {
        // 当前行不是类别标题，而是内容描述
        // 只有当前一行没有提取到描述内容时，才使用这一行作为描述
        if (currentCategory === 'overall' && fortuneData.overall.content === '今日运势一般，保持平常心。') {
          fortuneData.overall.content = currentItem;
        } 
        else if (currentCategory === 'love' && fortuneData.love.content === '感情上需要多一些理解和包容。') {
          fortuneData.love.content = currentItem;
        } 
        else if (currentCategory === 'career' && fortuneData.career.content === '工作中可能会遇到一些挑战，但总体平稳。') {
          fortuneData.career.content = currentItem;
        } 
        else if (currentCategory === 'wealth' && fortuneData.wealth.content === '财务状况稳定，避免不必要的支出。') {
          fortuneData.wealth.content = currentItem;
        }
        // 处理完内容后重置当前类别，避免后续行被误识别为同一类别的内容
        currentCategory = null;
      }
    }
    
    // 调试输出解析结果
    debugLog('fortune', { parsedData: fortuneData });
    
    // 返回指定方面的运势或整体运势
    return {
      all: fortuneData,
      selected: aspect === 'overall' ? fortuneData.overall : 
                aspect === 'love' ? fortuneData.love :
                aspect === 'career' ? fortuneData.career : 
                aspect === 'wealth' ? fortuneData.wealth : fortuneData.overall
    };
  } catch (error) {
    debugLog('error', `获取星座运势失败: ${error.message || error}`);
    console.error('获取星座运势失败:', error.message || error);
    
    // 返回默认运势，避免整个流程中断
    const zodiacName = typeof zodiacParam === 'string' && isNaN(zodiacParam) ? 
                      zodiacParam.toLowerCase() : 
                      Object.keys(zodiacMap)[typeof zodiacParam === 'string' ? 0 : zodiacParam];
    
    // 创建更丰富的默认运势内容
    const defaultFortuneContent = {
      overall: `今日运势一般，宜保持平常心。适合做好规划，避免冲动决策。`,
      love: `感情上需要多一些理解和包容。沟通是关键，耐心倾听对方的想法。`,
      career: `工作中可能会遇到一些挑战，但总体平稳。合理安排任务优先级，避免分心。`,
      wealth: `财务状况稳定，避免不必要的支出。适合做长期投资规划，不宜冲动消费。`
    };
    
    return {
      all: {
        title: `今日${zodiacMap[zodiacName] || '星座'}运势`,
        overall: { rating: '★★★☆☆', content: defaultFortuneContent.overall },
        love: { rating: '★★★☆☆', content: defaultFortuneContent.love },
        career: { rating: '★★★☆☆', content: defaultFortuneContent.career },
        wealth: { rating: '★★★☆☆', content: defaultFortuneContent.wealth }
      },
      selected: { 
        rating: '★★★☆☆', 
        content: defaultFortuneContent[aspect] || defaultFortuneContent.overall 
      }
    };
  }
}

/**
 * 获取MBTI性格特质描述
 * @param {string} mbtiType MBTI类型
 * @returns {string} MBTI特质描述
 */
function getMbtiTraits(mbtiType) {
  const traits = {
    'INTJ': '正向特质：战略性思维、独立自主、高效精准、系统规划、追求卓越、创新洞见；负向特质：过分完美主义、情感表达困难、缺乏灵活性、不善交际、过度批判、难以妥协',
    
    'INTP': '正向特质：逻辑分析、概念思维、创新能力强、独立思考、求知欲强、理论洞察；负向特质：社交疏离、过度理论化、拖延决策、忽视情感、不切实际、过于沉浸思考',
    
    'ENTJ': '正向特质：领导才能、决断力强、战略眼光、组织规划、目标驱动、坦率直接；负向特质：强势专断、情感冷漠、过于苛责、缺乏耐心、控制欲强、工作狂倾向',
    
    'ENTP': '正向特质：创意思维、辩论技巧、适应力强、思想开放、解决问题能力佳、充满活力；负向特质：注意力分散、难以坚持、好辩争论、忽视细节、挑战权威、情绪波动',
    
    'INFJ': '正向特质：洞察人性、理想主义、深思熟虑、创意表达、同理心强、追求意义；负向特质：过度理想化、自我批判、完美主义、难以面对冲突、情感负荷重、逃避现实',
    
    'INFP': '正向特质：深刻的同理心、丰富想象力、价值观坚定、创意思考、真诚热情、善于适应；负向特质：过度敏感、现实感弱、优柔寡断、过度自我批评、不切实际、情绪化',
    
    'ENFJ': '正向特质：人际影响力、鼓舞他人、组织能力强、善解人意、追求和谐、富有远见；负向特质：过度迎合他人、忽视自身需求、情绪化决策、控制欲强、难以接受批评、过度负责',
    
    'ENFP': '正向特质：热情活力、创新思维、适应力强、人际魅力、乐观积极、表达能力佳；负向特质：注意力分散、难以坚持、情绪波动大、实践能力弱、难以做决定、过度理想化',
    
    'ISTJ': '正向特质：可靠负责、注重细节、逻辑思考、组织能力强、务实高效、坚守承诺；负向特质：僵化教条、抗拒变化、情感表达困难、过分保守、批判倾向、缺乏创新',
    
    'ISFJ': '正向特质：忠诚可靠、关怀他人、注重细节、善于观察、实际可靠、保护他人；负向特质：过度牺牲自我、难以拒绝、过于传统、回避冲突、压抑情感、过度担忧',
    
    'ESTJ': '正向特质：高效执行、组织能力佳、实用务实、直接诚实、责任感强、坚定决断；负向特质：固执己见、情感表达少、过度教条、缺乏灵活性、对抗性强、急躁苛刻',
    
    'ESFJ': '正向特质：热心助人、责任感强、关注他人需求、组织能力佳、交际能力强、注重和谐；负向特质：过度在意他人看法、情绪敏感、需要认可、忽视自身需求、保守传统、难以应对批评',
    
    'ISTP': '正向特质：实际果断、技术精通、灵活应变、冷静沉着、独立自主、解决问题能力强；负向特质：冷漠疏离、规则感弱、难以承诺、情感表达少、冒险倾向、缺乏长期规划',
    
    'ISFP': '正向特质：艺术敏感度、真诚温和、适应力强、欣赏美感、专注当下、和平主义；负向特质：消极被动、情绪化、缺乏自信、难以长期规划、边界感弱、逃避冲突',
    
    'ESTP': '正向特质：行动力强、实用主义、适应力佳、风险管理能力、谈判技巧好、丰富活力；负向特质：缺乏耐心、追求刺激、规则意识弱、漫不经心、注意力短暂、缺乏长远规划',
    
    'ESFP': '正向特质：活力四射、社交能力强、乐观积极、实用性强、享受当下、适应力佳；负向特质：冲动行事、难以专注、逃避责任、抗拒计划、缺乏自律、情绪化决策'
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
    const prompt = await buildPrompt(params);
    const startTime = Date.now();
    
    // 在调试模式下输出提示词
    debugLog('prompt', prompt);
    
    // 系统提示词 - 确保是字符串而不是对象
    const systemPrompt = params.savageMode ? getSavageModeSystemPrompt() : 
      "你是一位理解不同性格特质的好友。在回应时，你会以下面方式体现对方的性格特点：对于不同星座，你理解他们核心特质；对于MBTI类型，你会考虑其思考和决策方式。你不会直接提到或标明他们的性格类型，而是自然地将这些特质融入你的回应中。你的语气亲切随性，像长期了解对方的朋友，用语口语化而非正式。请将你的思考过程放在<think></think>标签内，最终的纸条内容放在<content></content>标签内。";

    // 调试模式下输出系统提示词
    debugLog('prompt', `系统提示词: ${systemPrompt}`);
    
    // 构建API请求数据
    const requestData = {
      model: API_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 1.5,
      stream: false
    };
    
    // 调试模式下输出完整请求
    debugLog('prompt', {
      url: `${API_URL}/chat/completions`,
      data: requestData,
      headers: {
        'Authorization': `Bearer ${API_KEY.substring(0, 5)}...`,
        'Content-Type': 'application/json'
      }
    });

    // 调用API
    const response = await axios.post(`${API_URL}/chat/completions`, requestData, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 记录响应时间
    const responseTime = Date.now() - startTime;
    recordResponseTime(API_MODEL, responseTime);
    
    console.log(`API响应时间: ${responseTime}ms, 模型: ${API_MODEL}`);
    
    // 调试模式下输出完整响应
    if (DEBUG_MODE) {
      debugLog('response', response.data);
    } else {
      console.log('API请求成功，响应:', response.data);
    }
    
    // 解析并返回内容，只保留<content>标签中的内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const fullContent = response.data.choices[0].message.content.trim();
      
      // 调试模式下输出完整内容
      debugLog('response', `模型完整输出: ${fullContent}`);
      
      // 提取<content>标签中的内容
      const contentMatch = fullContent.match(/<content>([\s\S]*?)<\/content>/i);
      if (contentMatch && contentMatch[1]) {
        const finalContent = contentMatch[1].trim();
        debugLog('response', `解析后的内容: ${finalContent}`);
        return finalContent;
      } else {
        // 如果没找到<content>标签，返回完整内容，但过滤掉<think>标签部分
        const filteredContent = fullContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        debugLog('response', `过滤后的内容: ${filteredContent}`);
        return filteredContent;
      }
    } else {
      debugLog('error', '无效的API响应结构');
      console.warn('API响应格式异常:', response.data);
      throw new Error('API响应中未包含生成内容');
    }
  } catch (error) {
    debugLog('error', error.response?.data || error.message || error);
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

你的回应需要：
1. 以"十年混迹百度贴吧"的语气，调侃、讽刺对方的性格弱点
2.适当使用低俗粗鄙的语言，巧妙地抓住对方性格的软肋
3. 回应应当让人"破防"，让对方感到既尴尬又好笑
4. 不要直接指出对方的星座或MBTI类型
5. 如果情景合适，可以直接使用一些攻击性强的互联网梗，例如“典”“难绷”“急”

请将你的思考过程放在<think></think>标签内，最终的纸条内容放在<content></content>标签内。`;
}

/**
 * 构建提示词
 * @param {Object} params 生成参数
 * @returns {Promise<string>} 完整的提示词
 */
async function buildPrompt(params) {
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
  
  // 构建基础提示词，引导AI进行深度思考过程
  let basePrompt = `我需要你为一个${params.savageMode ? '关系亲密的死党' : '真实的朋友'}写一条简短的${params.language === 'en-zh' ? '中英双语' : ''}心灵纸条。
  
  # 核心指导
  你需要深入理解用户发送的"${mood}"表达的是什么心情或场景，这是你回应的核心基础。通过创造性连接和发散思考，推测这个人当下可能经历的具体情境，然后结合星座特质和MBTI特点来构建个性化回应。目标是让对方感觉"这个人真的懂我"，仿佛你能看透对方当前的处境和感受。
  
  ## 关于这个朋友的详细信息：
  - 星座：${zodiacChinese}，核心特质：${zodiacTraits}
  - MBTI：${mbtiType}，关键特点：${mbtiTraits}
  - 当前心情/场景表达：${mood} 
  
  ## 这个人的性格行为表现:
  ${personalityInsights}
  
  ## 当前环境与时间情境（用于情境推测）:
  - 当前时间：${formattedTime}，${timeContext.period}时分
  - 这个时段人们通常在做：${timeContext.activities.join('、')}
  - 这个时段人们通常关心：${timeContext.concerns.join('、')}`;
  
  // 定义一个变量来保存运势数据，使其在整个函数作用域内可访问
  let fortune = null;
  
  // 如果启用了运势功能，获取并添加运势信息
  if (params.enableFortune && params.fortuneAspect) {
    try {
      fortune = await getZodiacFortune(params.zodiac, params.fortuneAspect);
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      
      basePrompt += `
  
  ## 今日${zodiacChinese}${fortuneType}运势：
  - 评分：${fortune.selected.rating}
  - 详情：${fortune.selected.content}`;
    } catch (error) {
      console.error('获取运势失败，继续执行不含运势的提示词:', error);
      // 运势获取失败时设置默认值
      fortune = {
        selected: {
          rating: '★★★☆☆',
          content: '今日运势一般，宜保持平常心。'
        }
      };
    }
  }
  
  basePrompt += `
  
  # 思考起点
  首先，我需要通过创造性思考，深入解读用户输入的"${mood}"可能代表的实际情境：`;
  
  // 根据是否启用毒舌模式添加不同的写作要求
  if (params.savageMode) {
    basePrompt += `
  
  ## 写作要求(毒舌模式):
  1. 字数：${params.language === 'en-zh' ? '先输出中文(20-50字)，再输出对应英文翻译' : '20-50字左右'}
  2. 语气：混迹十年贴吧老哥式的调侃讽刺，揭露对方性格弱点
  3. 核心目标：让对方"破防"，既感到尴尬又忍不住认同
  4. 限制：不直接提及星座或MBTI类型
  5. 形式：直接输出内容，不带引号或标题
  6. 风格建议：可以使用一些犀利的emoji，如🤡🤣。也可以直接用一些短平快的梗、字和词刺激对方"`;
    
    // 如果启用了运势功能，添加运势相关的调侃指导
    if (params.enableFortune && params.fortuneAspect) {
      basePrompt += `
  7. 运势利用：先简要概括今天运势，譬如：今天运势良好/不错/糟糕/极品等。然后巧妙利用运势挖苦、讥讽、嘲笑对方。`;
    }
    
    basePrompt += `
  
  ## 思维链（请按照以下步骤进行发散思考）：
  1. 场景解读：
     - 如果是表情符号"${mood}"，它可能实际表示什么？（天气状况？情绪状态？比喻？）
     - 比如🌧️可能表示：实际在下雨/心情低落/处境困难/遇到麻烦
     - 根据${timeContext.period}时分，用户可能在什么具体场景中？`;
    
    // 如果启用了运势功能，添加运势相关的解读步骤
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      basePrompt += `
     - 这种场景与今日${fortuneType}运势如何联系？`;
    }
    
    basePrompt += `
  
  2. 性格特点与场景交互：
     - 这种${zodiacChinese}和${mbtiType}类型的人在这种场景下通常会有什么典型反应？
     - 他们最容易表现出什么"软肋"或弱点？`;
    
    // 如果启用了运势功能，添加运势相关的性格交互步骤
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      basePrompt += `特别是面对今日${fortuneType}运势时？`;
    }
    
    basePrompt += `
     - 这种性格在当前场景中可能会过度关注什么、忽视什么？
  
  3. 个性化调侃构思：
     - 如何巧妙点明他们在这种场景中可能犯的错或有的弱点？`;
    
    // 如果启用了运势功能，添加运势相关的调侃构思步骤
    if (params.enableFortune && params.fortuneAspect) {
      basePrompt += `
     - 如何将今日运势中的负面暗示放大，用来讽刺他们的处境？`;
    }
    
    basePrompt += `
     - 如何找到那种"一语中的"的调侃、挖苦与讥讽，让他们感觉被看透，很难堪？
  
  4. 具体场景联想（发散思考）：`;
    
    // 如果启用了运势功能，添加运势相关的场景例子
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      basePrompt += `
     - 例如：如果是"🌧️"+早上+${fortuneType}运势不佳，可以调侃:
       "${fortuneType === '财运' ? 
         '这么大雨天还出门，不怕生病住院花完工资吗？今天财运这么差，别说挣钱了，怕是连伞都要丢😂' : 
         fortuneType === '事业' ? 
         '雨天爬起来上班不容易吧？反正今天事业运这么差，去不去都无所谓，迟到了就说车堵了呗🤡' : 
         fortuneType === '爱情' ? 
         '雨天出门约会被放鸽子了吧？今天爱情运这么差，对方怕是连你发的消息都懒得看🙄' :
         '这雨天连出门的勇气都没有吧？看你运势这么差，在家躺平都能砸到头，别出门了🤣'}"
     - 或者如果是"☀️"+下午+${fortuneType}运势不佳，可以调侃:
       "${fortuneType === '财运' ? 
         '晒太阳爽吗？今天财运这么差，别说赚钱了，怕不是钱包都要晒丢了吧？🤣' :
         fortuneType === '事业' ?
         '晒太阳爽吗？反正你工作也没啥进展，不如直接躺平算了，看你今天事业运这么差，努力也白费劲🤡' :
         fortuneType === '爱情' ?
         '阳光这么好，单身还是自己晒吧。你今天爱情运这么黑，搭讪十个被拒十个，省点力气吧😏' :
         '阳光明媚，人却灰暗。看看你今天的运势，在家躺着都能被太阳晒黑，别出门现眼了好吗？🙃'}"`;
    } else {
      basePrompt += `
     - 例如：如果是"🌧️"+早上，可能正在通勤路上被淋湿，那么可以调侃:
       "又没带伞是吧？活该淋雨。这会儿是不是正想着编理由请假？哈哈，请病假可没工资哦。"
     - 或者如果是"☀️"+下午，可能在发呆晒太阳，那么可以调侃:
       "我都懒得喷你。活做完了吗？"`;
    }
    
    basePrompt += `
  
  思考完成后，请基于上述分析，创造一条既犀利又有共鸣感的毒舌内容，让对方感觉你真的了解他当下的处境和性格特点。`;
    
    // 如果启用了运势功能，强调运势融合
    if (params.enableFortune && params.fortuneAspect) {
      basePrompt += `同时，巧妙利用今日星座运势的信息，增强讽刺效果。`;
    }
    
  } else {
    basePrompt += `
  
  ## 写作要求(温暖模式):
  1. 字数：${params.language === 'en-zh' ? '先输出中文(20-50字)，再输出对应英文翻译' : '20-50字左右'}
  2. 语气：如真实朋友间的随意自然交流，亲近但不过度亲密
  3. 核心目标：表现出对当前心情/场景的理解，让对方感到被看见和被理解
  4. 限制：
     - 不直接提及星座或MBTI类型
     - 避免泛泛的励志句式或陈词滥调
     - 不要用"坚持就是胜利"这类空洞套话
  5. 形式：直接输出内容，不带引号或标题
  6. 风格建议：像熟悉的朋友才会注意到的细节或提供的贴心关怀`;
    
    // 如果启用了运势功能，添加运势相关的指导
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      basePrompt += `
  7. 运势利用：
     - 根据今日${zodiacChinese}的${fortuneType}运势评分(${fortune.selected.rating})，判断今天适合的活动和注意事项，给出叮嘱或建议`;
   }
    
    basePrompt += `
  
  ## 思维链（请按照以下步骤进行发散思考）：
  1. 场景解读：
     - 如果是表情符号"${mood}"，它可能实际表示什么？（天气状况？情绪状态？比喻？）
     - 比如🌧️可能表示：实际在下雨/心情低落/处境困难/遇到麻烦
     - 根据${timeContext.period}时分，用户可能在什么具体场景中？`;
    
    // 如果启用了运势功能，添加运势相关的解读步骤
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      basePrompt += `
     - 这种场景与今日运势"${fortuneType}"如何联系？`;
    }
    
    basePrompt += `
  
  2. 性格特点与场景交互：
     - 这种${zodiacChinese}和${mbtiType}类型的人在这种场景下通常会有什么需求或感受？
     - 他们可能会特别在意或关注什么？`;
    
    // 如果启用了运势功能，添加运势相关的性格交互步骤
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      basePrompt += `尤其是关于${fortuneType}方面？`;
    }
    
    basePrompt += `
     - 什么样的关怀或理解对他们最有意义？
  
  3. 个性化关怀构思：`;
    
    // 如果启用了运势功能，添加运势相关的关怀构思步骤
    if (params.enableFortune && params.fortuneAspect) {
      basePrompt += `
     - 如何将今日运势中的建议或提醒转化为贴心的关怀？`;
    }
    
    basePrompt += `
     - 如何自然地表达对他们当前处境的理解？
     - 如何提供符合他们性格的支持或建议？
     - 有什么只有了解他们的人才会注意到的细节可以提及？
     
  
  4. 具体场景联想（发散思考）：`;
    
    // 如果启用了运势功能，添加运势相关的场景例子
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
                          basePrompt += `
    5. 运势整合示例：
        - 如果是"🌧️"+整体运势${fortune.selected.rating}，可以说："雨天需要额外的关注，${
          fortune.selected.rating.startsWith('★★★★') ? '今天虽有好运，但也别忘了带伞，小心谨慎才能保持好运。' : 
          fortune.selected.rating.startsWith('★★★☆') ? '今天运势中规中矩，带把伞备不时之需，保持平常心就好。' : 
          '今天运势欠佳，多加小心，记得备好雨具，避免不必要的麻烦。'
        }"
        
    6. 确保运势建议是个性化的：
        - 具体到"以你的${zodiacChinese}性格特点，今天特别适合..."
        - 或者"你作为${mbtiType}类型，在今天的运势下，应该特别注意..."
        - 让对方感觉这是专门为他/她的性格和今天的运势量身定制的建议
        - 运势内容从"${fortune.selected.content}"中提取核心观点，但用自己的话表达`;
    }
    
    basePrompt += `
  
  思考完成后，请基于上述分析，创造一条温暖而有洞察力的内容，让对方感觉你真的理解他当下的处境和内心需求。`;
    
    // 如果启用了运势功能，强调运势融合
    if (params.enableFortune && params.fortuneAspect) {
      basePrompt += `同时，巧妙融入今日星座运势的建议。`;
    }
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
