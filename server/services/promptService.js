/**
 * 提示词服务 - 处理AI提示词和响应的核心服务
 */
const { callAiApi } = require('./esm-bridge.js');
const constants = require('./modules/constants.js');
const { buildPrompt } = require('./modules/promptBuilder.js');
const { generateThemeLocalContent } = require('./modules/themeUtils.js');
const { getTimeContext } = require('./modules/timeUtils.js');
const logger = require('../utils/logger'); // 引入增强的logger

// 从.env文件获取配置
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';
const API_MODEL = process.env.API_MODEL || 'qwen-max';

/**
 * 日志记录函数
 * @param {string} type 日志类型
 * @param {*} content 日志内容
 */
function debugLog(type, content) {
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
    if (typeof content === 'object') {
      console.log(`[${timestamp}] [${type.toUpperCase()}]`, JSON.stringify(content, null, 2));
    } else {
      console.log(`[${timestamp}] [${type.toUpperCase()}] ${content}`);
    }
  }
}

/**
 * 基于用户情绪生成对应的提示词
 * @param {string|string[]} moods 用户情绪
 * @returns {string} 情绪描述提示词
 */
function generateMoodPrompt(moods) {
  if (!moods) return '平静的状态';
  
  // 如果是数组，则组合情绪词
  if (Array.isArray(moods)) {
    if (moods.length === 0) return '平静的状态';
    if (moods.length === 1) return `${moods[0]}的状态`;
    if (moods.length === 2) return `${moods[0]}和${moods[1]}的混合状态`;
    return `${moods.slice(0, -1).join('、')}以及${moods[moods.length - 1]}的复杂情绪状态`;
  }
  
  // 单个情绪词
  return `${moods}的状态`;
}

/**
 * 使用本地模拟生成内容（适用于API不可用的情况）
 * @param {Object} data 用户输入数据
 * @returns {Object} 生成的内容
 */
function generateLocalContent(data) {
  const { savageMode = false, mood = '平静', topic = '生活', theme = 'chat' } = data;
  
  // 记录本地生成请求
  logger.debug('LOCAL_GENERATION', '使用本地内容生成', { 
    savageMode, 
    mood, 
    topic,
    theme
  });
  
  // 获取时间上下文
  const { timeContext } = getTimeContext();
  let timeContextStr = '今天';
  
  // 处理表情输入 - 支持多个表情
  let moodInput = '';
  if (data.moods && data.moods.length > 0) {
    moodInput = data.moods.join('');
  } else if (data.mood) {
    moodInput = data.mood;
  } else {
    moodInput = '平静';
  }

  // 尝试使用主题特定的本地生成
  const themeContent = generateThemeLocalContent(data.theme, data.savageMode, data);
  if (themeContent) {
    logger.debug('LOCAL_GENERATION', `生成了${data.theme}主题内容`, { content_length: themeContent.length });
    return themeContent;
  }
  
  // 生成一个简单的响应
  let content;
  if (savageMode) {
    content = `看这表情"${moodInput}"，又在搞什么鬼？${timeContext.period}就该好好休息，别瞎折腾了。`;
  } else {
    content = `${timeContext.period}好，看到你的"${moodInput}"，想提醒你照顾好自己，一切都会好起来的。`;
  }
  
  logger.debug('LOCAL_GENERATION', '生成了基础内容', { 
    content,
    mode: savageMode ? '毒舌' : '温暖',
    period: timeContext.period
  });
  
  return content;
}

/**
 * 模拟调用AI API生成内容（当真实API不可用时的备用方案）
 * @param {string} prompt 提示词
 * @param {boolean} savageMode 是否为毒舌模式
 * @returns {Promise<string>} 生成的内容
 */
async function mockCallAiApi(prompt, savageMode) {
  // 记录模拟API调用
  logger.debug('MOCK_API', '模拟AI API调用', {
    prompt_length: prompt.length,
    savageMode,
    timestamp: new Date().toISOString()
  });
  
  // 模拟API调用延迟
  const delay = 1000 + Math.random() * 2000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // 提取关键信息来生成相关内容
  const moodMatch = prompt.match(/处于(.*?)的状态/);
  const topicMatch = prompt.match(/思考关于"(.*?)"的问题/);
  
  const mood = moodMatch ? moodMatch[1] : '平静';
  const topic = topicMatch ? topicMatch[1] : '生活';
  
  const content = generateLocalContent({ 
    mood, 
    topic, 
    savageMode,
    theme: prompt.includes('诗歌') ? 'poetry' : 
           prompt.includes('箴言') ? 'aphorism' :
           prompt.includes('俳句') ? 'haiku' : 'chat'
  });
  
  logger.debug('MOCK_API', '模拟API调用完成', {
    delay: `${delay.toFixed(0)}ms`,
    extracted_mood: mood,
    extracted_topic: topic,
    content_length: content.length
  });
  
  return content;
}

/**
 * 提示词服务类
 */
class PromptService {
  /**
   * 生成心灵纸条内容
   * @param {Object} data 请求数据
   * @param {Object} apiConfig API配置
   * @returns {Promise<Object>} 包含生成内容的对象
   */
  async generateNote(data, apiConfig) {
    try {
      // 记录生成请求
      logger.info('GENERATION', '收到生成纸条请求', {
        theme: data.theme || 'chat',
        savageMode: !!data.savageMode,
        moods: data.moods || [data.mood || '平静'],
        mbti: data.mbti,
        zodiac: data.zodiac,
        enableFortune: data.enableFortune,
        fortuneAspect: data.fortuneAspect,
        model: apiConfig.model // 记录使用的模型
      });
      
      // 构建提示词
      const startTime = Date.now();
      const prompt = await buildPrompt(data);
      const promptBuildTime = Date.now() - startTime;
      
      logger.debug('PROMPT', '提示词构建完成', { 
        build_time: `${promptBuildTime}ms`,
        prompt_length: prompt.length
      });
      
      let content;
      
      // 尝试使用真实API调用
      try {
        logger.info('API_CALL', '正在调用AI API生成内容', {
          model: apiConfig.model,
          prompt_length: prompt.length,
          timestamp: new Date().toISOString()
        });
        
        const apiStartTime = Date.now();
        content = await callAiApi(prompt, data.savageMode, apiConfig);
        const apiResponseTime = Date.now() - apiStartTime;
        
        logger.info('API_CALL', 'AI API调用成功', {
          response_time: `${apiResponseTime}ms`,
          content_length: content.length,
          model: apiConfig.model
        });
      } catch (apiError) {
        logger.warn('API_ERROR', `API调用失败，使用备选方案: ${apiError.message}`, {
          error_code: apiError.code,
          statusCode: apiError.response?.status,
          error_type: apiError.name,
          model: apiConfig.model
        });
        
        content = await mockCallAiApi(prompt, data.savageMode);
      }
      
      // 记录生成完成
      const totalTime = Date.now() - startTime;
      logger.info('GENERATION', '纸条生成完成', {
        total_time: `${totalTime}ms`,
        content_length: content.length,
        theme: data.theme || 'chat',
        savageMode: !!data.savageMode,
        model: apiConfig.model
      });
      
      // 返回生成结果
      return {
        content,
        timestamp: new Date().toISOString(),
        metadata: {
          model: apiConfig.model,
          theme: data.theme || 'chat',
          mood: data.mood || (data.moods ? data.moods.join(',') : '平静'),
          savageMode: !!data.savageMode,
          generationTime: totalTime
        }
      };
    } catch (error) {
      // 记录错误
      logger.error('GENERATION_ERROR', '生成纸条错误', {
        error: error.message,
        stack: DEBUG_MODE ? error.stack : undefined,
        model: apiConfig.model
      });
      
      // 尝试使用本地备用方案
      const backupContent = generateLocalContent(data);
      
      return {
        content: backupContent,
        timestamp: new Date().toISOString(),
        metadata: {
          model: 'local-fallback',
          theme: data.theme || 'chat',
          mood: data.mood || (data.moods ? data.moods.join(',') : '平静'),
          savageMode: !!data.savageMode,
          error: error.message
        }
      };
    }
  }
  
  /**
   * 获取API服务状态
   * @param {Object} apiConfig API配置
   * @returns {Object} 服务状态信息
   */
  getStatus(apiConfig) {
    return {
      status: 'ok',
      model: apiConfig.model,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 获取估计响应时间
   * @param {string} model 模型名称
   * @param {Object} apiConfig API配置
   * @returns {Promise<number>} 估计响应时间(毫秒)
   */
  async getEstimatedTime(model, apiConfig) {
    // 根据不同模型返回不同的估计时间
    const baseTime = 2000;
    const modelTime = {
      'gpt-4': 5000,
      'gpt-4-turbo': 4000,
      'gpt-3.5-turbo': 2000,
      'qwen-turbo': 2000,
      'qwen-plus': 3000,
      'qwen-max': 4000,
      'chatglm-turbo': 2000,
      'chatglm-pro': 3000,
      'spark-desk': 3000
    };

    return modelTime[model || apiConfig.model] || baseTime;
  }
}

module.exports = new PromptService();
