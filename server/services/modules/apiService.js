const axios = require('axios');
const { ESTIMATED_RESPONSE_TIMES } = require('./constants.js');
const logger = require('../../utils/logger'); // 使用增强的logger

/**
 * 后端API服务
 */

// 从环境变量获取默认API配置
const DEFAULT_API_URL = process.env.VITE_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_API_KEY = process.env.VITE_API_KEY || '';
const DEFAULT_API_MODEL = process.env.VITE_API_MODEL || 'qwen-max';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

// 响应时间历史记录，用于动态调整
const responseTimeHistory = {};

/**
 * 获取系统提示词
 * @param {boolean} savageMode 是否为毒舌模式
 * @returns {string} 系统提示词
 */
function getSystemPrompt(savageMode) {
  return savageMode ? 
  `你是一位精通人性弱点、尖酸刻薄的冷幽默大师，擅长用手术刀般精准的语言直击一个人的内心，尽可能说出对方最不能接受的话。

    你的回应需要：
    1. 对于不同星座，你理解他们核心特质；
    2. 对于MBTI类型，你会考虑其思考和决策方式。
    3. 你不会直接提到或标明他们的星座、mbti、性格类型，而是自然地将这些特质融入你的回应中，抓住对方最隐秘的性格软肋。
    4. 通过行为模式分析，抓住对方最隐秘的性格软肋，嘲讽、讥讽、嘲弄对方的弱点。 
    5. 保持语言锐度但拒绝低俗，使其无法反驳却又隐隐认同

请将你的思考过程放在<think></think>标签内，最终的纸条内容放在<content></content>标签内。` : 
    `你是一位理解不同性格特质的好友。在回应时，你会以下面方式体现对方的性格特点：

    你的回应需要：
    1. 对于不同星座，你理解他们核心特质；
    2. 对于MBTI类型，你会考虑其思考和决策方式。
    3. 你不会直接提到或标明他们的星座、mbti、性格类型，而是自然地将这些特质融入你的回应中。
    4. 你的语气亲切随性，像长期了解对方的朋友，用语口语化而非正式。

将你的思考过程放在<think></think>标签内，最终的纸条内容放在<content></content>标签内。`;
}

/**
 * 记录模型响应时间
 * @param {string} model 模型名称
 * @param {number} time 响应时间(毫秒)
 */
function recordResponseTime(model, time) {
  if (!responseTimeHistory[model]) {
    responseTimeHistory[model] = [];
  }
  
  // 保留最近10次记录
  if (responseTimeHistory[model].length >= 10) {
    responseTimeHistory[model].shift();
  }
  
  responseTimeHistory[model].push(time);
  logger.debug('PERFORMANCE', `记录模型响应时间: ${model}, ${time}ms`);
}

/**
 * 获取估计的API响应时间
 * @param {string} model - AI模型名称
 * @returns {number} - 估计的响应时间(毫秒)
 */
function getEstimatedResponseTime(model) {
  // 如果有历史记录，计算平均值
  if (responseTimeHistory[model] && responseTimeHistory[model].length > 0) {
    const sum = responseTimeHistory[model].reduce((a, b) => a + b, 0);
    const average = Math.round(sum / responseTimeHistory[model].length);
    logger.debug('PERFORMANCE', `估计${model}响应时间`, { 
      average, 
      samples: responseTimeHistory[model].length
    });
    return average;
  }
  
  // 根据不同模型返回不同的估计响应时间
  const defaultTime = ESTIMATED_RESPONSE_TIMES[model] || ESTIMATED_RESPONSE_TIMES.default;
  logger.debug('PERFORMANCE', `使用默认响应时间估计: ${model}, ${defaultTime}ms`);
  return defaultTime;
}

// 修改内容处理逻辑
function processModelResponse(fullContent) {
  if (!fullContent) {
    logger.warn('MODEL_CONTENT', '生成内容为空，返回默认提示');
    return '【生成失败】抱歉，当前服务繁忙，生成失败。这是默认的示例内容：\n\n点击下方"生成心语"按钮，开始您的心灵之旅...';
  }
  
  // 1. 首先尝试提取<content>标签中的内容
  const contentMatch = fullContent.match(/<content>([\s\S]*?)<\/content>/i);
  if (contentMatch && contentMatch[1] && contentMatch[1].trim().length > 0) {
    const content = contentMatch[1].trim();
    // 检查是否是默认内容
    if (content.includes('点击下方"生成心语"按钮，开始您的心灵之旅')) {
      logger.warn('MODEL_CONTENT', '检测到默认内容');
      return '【生成失败】抱歉，当前服务繁忙，生成失败。这是默认的示例内容：\n\n' + content;
    }
    return content;
  }
  
  // 2. 如果没有<content>标签，则移除<think>标签内容后返回
  let processedContent = fullContent;
  
  // 移除所有<think>标签及其内容
  processedContent = processedContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  
  // 检查处理后的内容是否为默认内容
  if (processedContent.includes('点击下方"生成心语"按钮，开始您的心灵之旅')) {
    logger.warn('MODEL_CONTENT', '检测到默认内容');
    return '【生成失败】抱歉，当前服务繁忙，生成失败。这是默认的示例内容：\n\n' + processedContent;
  }
  
  // 如果剩余内容太短，返回带提示的默认内容
  if (processedContent.length < 5) {
    logger.warn('MODEL_CONTENT', '处理后的内容过短', {
      original_length: fullContent.length,
      processed_length: processedContent.length,
      content: processedContent
    });
    return '【生成失败】抱歉，当前服务繁忙，生成失败。这是默认的示例内容：\n\n点击下方"生成心语"按钮，开始您的心灵之旅...';
  }
  
  return processedContent;
}

/**
 * 调用AI API生成内容
 * @param {string} prompt 提示词
 * @param {boolean} savageMode 是否为毒舌模式
 * @param {Object} apiConfig API配置
 * @returns {Promise<string>} 生成的内容
 */
async function callAiApi(prompt, savageMode = false, apiConfig = {}) {
  const startTime = Date.now();
  const systemPrompt = getSystemPrompt(savageMode);
  
  // 使用传入的配置，如果没有则使用默认值
  const API_URL = apiConfig.endpoint || DEFAULT_API_URL;
  const API_KEY = apiConfig.apiKey || DEFAULT_API_KEY;
  const API_MODEL = apiConfig.model || DEFAULT_API_MODEL;
  
  logger.debug('API', `生成系统提示词: ${savageMode ? '毒舌模式' : '普通模式'}`);
  
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
    max_tokens: 2500,
    temperature: 1.5,
    stream: false
  };
  
  // 记录模型输入
  logger.modelInput(API_MODEL, {
    system: systemPrompt,
    user: prompt
  }, {
    max_tokens: 2500,
    temperature: 1.5,
    model: API_MODEL,
    config: apiConfig // 记录完整的API配置
  });
  
  // 记录API配置
  logger.api('CONFIG', 'API请求配置', {
    url: API_URL,
    model: API_MODEL,
    key_available: !!API_KEY,
    key_prefix: API_KEY ? `${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 3)}` : 'missing',
    using_custom_config: !!apiConfig.apiKey
  });

  try {
    // 检查API密钥是否存在
    if (!API_KEY) {
      const error = new Error('API密钥未设置');
      logger.error('API', '缺少API密钥', { error: error.message });
      throw error;
    }
    
    // 调用API前记录
    logger.api('REQUEST', `开始调用${API_MODEL}模型`, {
      endpoint: `${API_URL}/chat/completions`,
      payload_size: JSON.stringify(requestData).length,
      timestamp: new Date().toISOString(),
      using_custom_config: !!apiConfig.apiKey
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
    
    logger.api('RESPONSE', `${API_MODEL}响应成功`, {
      time: `${responseTime}ms`,
      status: response.status,
      headers: response.headers,
      using_custom_config: !!apiConfig.apiKey
    });
    
    // 记录模型完整输出
    logger.modelOutput(API_MODEL, response.data, responseTime);
    
    // 解析并返回内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const fullContent = response.data.choices[0].message.content.trim();
      
      // 记录原始输出用于调试
      logger.debug('MODEL_RAW_OUTPUT', '模型原始输出', {
        content: fullContent,
        length: fullContent.length,
        has_think_tag: fullContent.includes('<think>'),
        has_content_tag: fullContent.includes('<content>')
      });
      
      // 提取<think>标签中的内容用于日志记录
      const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/i);
      if (thinkMatch && thinkMatch[1]) {
        logger.debug('MODEL_THINKING', '模型思考过程', {
          thinking: thinkMatch[1].trim(),
          model: API_MODEL
        });
      }
      
      // 处理内容并返回
      const processedContent = processModelResponse(fullContent);
      
      logger.info('MODEL_CONTENT', '处理后的内容', {
        content: processedContent,
        length: processedContent.length,
        original_length: fullContent.length,
        model: API_MODEL
      });
      
      return processedContent;
    } else {
      logger.error('MODEL_PARSING', '无效的API响应结构', {
        has_data: !!response.data,
        has_choices: !!(response.data && response.data.choices),
        choices_length: (response.data && response.data.choices) ? response.data.choices.length : 0,
        model: API_MODEL
      });
      throw new Error('API响应中未包含生成内容');
    }
  } catch (error) {
    const errorTime = Date.now() - startTime;
    
    // 记录详细错误信息
    logger.error('API_ERROR', '调用AI API失败', {
      model: API_MODEL,
      url: API_URL,
      errorTime: `${errorTime}ms`,
      message: error.message,
      code: error.code,
      response_status: error.response ? error.response.status : undefined,
      response_data: error.response ? error.response.data : undefined,
      stack: DEBUG_MODE ? error.stack : undefined,
      using_custom_config: !!apiConfig.apiKey
    });
    
    throw error;
  }
}

module.exports = {
  getEstimatedResponseTime,
  callAiApi
};
