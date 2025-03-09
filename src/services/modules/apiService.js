import axios from 'axios';

// 从环境变量获取API配置
const API_URL = import.meta.env.VITE_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_MODEL = import.meta.env.VITE_API_MODEL || 'qwen-max';
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// 响应时间历史记录，用于动态调整
const responseTimeHistory = {};

/**
 * 调试日志输出
 * @param {string} type 日志类型
 * @param {any} content 日志内容
 */
export function debugLog(type, content) {
  if (!DEBUG_MODE) return;
  
  const styles = {
    prompt: 'background: #3498db; color: white; padding: 2px 4px; border-radius: 3px;',
    response: 'background: #2ecc71; color: white; padding: 2px 4px; border-radius: 3px;',
    error: 'background: #e74c3c; color: white; padding: 2px 4px; border-radius: 3px;',
    fortune: 'background: #9b59b6; color: white; padding: 2px 4px; border-radius: 3px;'
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
 * 获取系统提示词
 * @param {boolean} savageMode 是否为毒舌模式
 * @returns {string} 系统提示词
 */
function getSystemPrompt(savageMode) {
  return savageMode ? 
    `你是混迹了十年贴吧的贴吧老哥，对别人既了解又毒舌，用挖苦出格来调侃他们的性格特点。

你的回应需要：
1. 以"十年混迹百度贴吧"的语气，调侃、讽刺对方的性格弱点
2.适当使用低俗粗鄙的语言，巧妙地抓住对方性格的软肋
3. 回应应当让人"破防"，让对方感到既尴尬又好笑
4. 不要直接指出对方的星座或MBTI类型
5. 如果情景合适，可以直接使用一些攻击性强的互联网梗，例如"典""难绷""急"

请将你的思考过程放在<think></think>标签内，最终的纸条内容放在<content></content>标签内。` : 
    `你是一位理解不同性格特质的好友。在回应时，你会以下面方式体现对方的性格特点：

你的回应需要：
1. 对于不同星座，你理解他们核心特质；
2. 对于MBTI类型，你会考虑其思考和决策方式。
3. 你不会直接提到或标明他们的性格类型，而是自然地将这些特质融入你的回应中。
4. 你的语气亲切随性，像长期了解对方的朋友，用语口语化而非正式。

将你的思考过程放在<think></think>标签内，最终的纸条内容放在<content></content>标签内。`;
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
  const modelResponseTimes = {
    'qwen-max': 2000,  // 预估值，单位ms
    'qwen-plus': 1500,
    'qwen-turbo': 1000,
    'deepseek-r1': 20000,
    'default': 3000
  };
  
  return modelResponseTimes[model] || modelResponseTimes['default'];
}

/**
 * 调用AI API生成内容
 * @param {string} prompt 提示词
 * @param {boolean} savageMode 是否为毒舌模式
 * @returns {Promise<string>} 生成的内容
 */
export async function callAiApi(prompt, savageMode = false) {
  const startTime = Date.now();
  const systemPrompt = getSystemPrompt(savageMode);
  
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
    max_tokens: 1500,
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

  try {
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
    console.error('调用AI API失败:', error.response?.data || error.message);
    throw error;
  }
}
