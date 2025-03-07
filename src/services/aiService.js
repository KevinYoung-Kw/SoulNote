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
    
    // 调用API
    const response = await axios.get(`http://127.0.0.1:5000/api/astro/${zodiacIndex}?convert=true`);
    
    if (response.data) {
      // 解析返回的运势数据
      const items = response.data.items || [];
      const fortuneData = {
        title: response.data.title || `今日${zodiacMap[Object.keys(zodiacMap)[zodiacIndex]]}运势`,
        overall: { rating: '', content: '' },
        love: { rating: '', content: '' },
        career: { rating: '', content: '' },
        wealth: { rating: '', content: '' }
      };
      
      // 解析运势评分和内容
      for (let i = 0; i < items.length; i += 2) {
        if (items[i].includes('整體') || items[i].includes('整体')) {
          fortuneData.overall.rating = items[i].replace(/.*整[體体]運勢/, '').trim();
          fortuneData.overall.content = items[i + 1] || '';
        } else if (items[i].includes('愛情') || items[i].includes('爱情')) {
          fortuneData.love.rating = items[i].replace(/.*愛?情運勢/, '').trim();
          fortuneData.love.content = items[i + 1] || '';
        } else if (items[i].includes('事業') || items[i].includes('事业')) {
          fortuneData.career.rating = items[i].replace(/.*事[業业]運勢/, '').trim();
          fortuneData.career.content = items[i + 1] || '';
        } else if (items[i].includes('財運') || items[i].includes('财运')) {
          fortuneData.wealth.rating = items[i].replace(/.*財?運運勢/, '').trim();
          fortuneData.wealth.content = items[i + 1] || '';
        }
      }
      
      // 返回指定方面的运势或整体运势
      return {
        all: fortuneData,
        selected: aspect === 'overall' ? fortuneData.overall : 
                  aspect === 'love' ? fortuneData.love :
                  aspect === 'career' ? fortuneData.career : 
                  aspect === 'wealth' ? fortuneData.wealth : fortuneData.overall
      };
    }
    
    throw new Error('运势数据解析失败');
  } catch (error) {
    console.error('获取星座运势失败:', error);
    // 返回默认运势，避免整个流程中断
    return {
      all: {
        title: `今日${zodiacMap[Object.keys(zodiacMap)[typeof zodiacParam === 'string' ? 0 : zodiacParam]]}运势`,
        overall: { rating: '★★★☆☆', content: '今日运势一般，保持平常心。' },
        love: { rating: '★★★☆☆', content: '感情上需要多一些理解和包容。' },
        career: { rating: '★★★☆☆', content: '工作中可能会遇到一些挑战，但总体平稳。' },
        wealth: { rating: '★★★☆☆', content: '财务状况稳定，避免不必要的支出。' }
      },
      selected: { rating: '★★★☆☆', content: '今日运势一般，保持平常心。' }
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
    const prompt = await buildPrompt(params);
    const startTime = Date.now();
    
    // 系统提示词 - 确保是字符串而不是对象
    const systemPrompt = params.savageMode ? getSavageModeSystemPrompt() : 
      "你是一位理解不同性格特质的好友。在回应时，你会以下面方式体现对方的性格特点：对于不同星座，你理解他们核心特质；对于MBTI类型，你会考虑其思考和决策方式。你不会直接提到或标明他们的性格类型，而是自然地将这些特质融入你的回应中。你的语气亲切随性，像长期了解对方的朋友，用语口语化而非正式。请将你的思考过程放在<think></think>标签内，最终的纸条内容放在<content></content>标签内。";

    // 调用API
    const response = await axios.post(`${API_URL}/chat/completions`, {
      model: API_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt  // 确保是字符串
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,  // 增加token数量以容纳更详细的思考过程
      temperature: 1.5,
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
    
    // 解析并返回内容，只保留<content>标签中的内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const fullContent = response.data.choices[0].message.content.trim();
      
      // 提取<content>标签中的内容
      const contentMatch = fullContent.match(/<content>([\s\S]*?)<\/content>/i);
      if (contentMatch && contentMatch[1]) {
        return contentMatch[1].trim();
      } else {
        // 如果没找到<content>标签，返回完整内容，但过滤掉<think>标签部分
        const filteredContent = fullContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        return filteredContent;
      }
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

你的回应需要：
1. 以"十年混迹百度贴吧"的语气，调侃、讽刺对方的性格弱点
2.适当使用低俗粗鄙的语言，巧妙地抓住对方性格的软肋
3. 回应应当让人"破防"，让对方感到既尴尬又好笑
4. 不要直接指出对方的星座或MBTI类型
5. 如果情景合适，可以直接使用一些互联网梗，例如“米孝子”“典”“难绷”“急”

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
  
  // 如果启用了运势功能，获取并添加运势信息
  if (params.enableFortune && params.fortuneAspect) {
    try {
      const fortune = await getZodiacFortune(params.zodiac, params.fortuneAspect);
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      
      basePrompt += `
  
  ## 今日${zodiacChinese}${fortuneType}运势：
  - 评分：${fortune.selected.rating}
  - 详情：${fortune.selected.content}`;
    } catch (error) {
      console.error('获取运势失败，继续执行不含运势的提示词:', error);
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
  2. 语气：混迹十年贴吧老哥式的调侃讽刺，巧妙揭露对方性格弱点
  3. 核心目标：让对方"破防"，既感到尴尬又忍不住认同
  4. 限制：不直接提及星座或MBTI类型
  5. 形式：直接输出内容，不带引号或标题
  6. 风格建议：可以使用一些犀利的emoji，如🤡🤣。也可以直接用一些短平快的梗、字和词刺激对方，譬如"典、孝、麻、崩、急..."`;
    
    // 如果启用了运势功能，添加运势相关的调侃指导
    if (params.enableFortune && params.fortuneAspect) {
      basePrompt += `
  7. 运势利用：巧妙利用今日运势来讽刺对方，但不要直接引用原文`;
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
  7. 运势利用：巧妙融入今日${fortuneType}运势的关键建议，不要直接引用原文，而是化为个性化的关怀`;
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
  
  3. 个性化关怀构思：
     - 如何自然地表达对他们当前处境的理解？`;
    
    // 如果启用了运势功能，添加运势相关的关怀构思步骤
    if (params.enableFortune && params.fortuneAspect) {
      basePrompt += `
     - 如何将今日运势中的建议或提醒转化为贴心的关怀？`;
    }
    
    basePrompt += `
     - 如何提供符合他们性格的支持或建议？
     - 有什么只有了解他们的人才会注意到的细节可以提及？
  
  4. 具体场景联想（发散思考）：`;
    
    // 如果启用了运势功能，添加运势相关的场景例子
    if (params.enableFortune && params.fortuneAspect) {
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      basePrompt += `
     - 例如：如果是"🌧️"+早上+${fortuneType}运势不佳，可以体贴地说:
       "${fortuneType === '财运' ? 
         '雨天记得带伞，别为省那几块钱淋湿自己。今天财务上可能有些小波动，量力而行就好。' : 
         fortuneType === '事业' ? 
         '这雨天出门，别忘了带伞。今天工作可能会遇到些小挑战，记得放慢节奏，别给自己太大压力。' : 
         fortuneType === '爱情' ? 
         '雨天别急着出门，等一等没准就停了。感情的事也一样，急不来，今天先关注下自己吧。' :
         '这雨天记得带伞出门。今天可能会遇到些小挫折，但别担心，这只是暂时的阴雨天。'}"
     - 或者如果是"☀️"+下午+${fortuneType}运势较好，可以说:
       "${fortuneType === '财运' ? 
         '阳光正好，适合出门走走。今天似乎有些意外之财的机会，留心身边的小惊喜。' :
         fortuneType === '事业' ?
         '阳光这么好，工作也会顺利些。今天可能有个好机会，保持开放的心态去迎接吧。' :
         fortuneType === '爱情' ?
         '阳光正好，心情也一定不错吧。今天特别适合约朋友出去走走，说不定会有意外的惊喜遇见呢。' :
         '这样的好天气，适合出门走走。今天整体运势不错，带着好心情去面对一切吧。'}"`;
    } else {
      basePrompt += `
     - 例如：如果是"🌧️"+早上，可能正在通勤路上被淋湿，那么可以体贴地说:
       "这雨来得突然，你肯定又顾着思考忘了带伞。记得到了地方擦干头发，别着凉了。"
     - 或者如果是"☀️"+下午，可能在享受阳光或工作疲惫，那么可以说:
       "阳光正好，知道你这会儿可能在找个窗边发会儿呆。趁机休息一下，你需要这样的时刻。"`;
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
