// 导出所有模块功能，使引入更简单

// 工具函数
export * from './apiService.js';
export * from './constants.js';
export * from './fortuneUtils.js';
export * from './personalityUtils.js';
export * from './themeUtils.js';
export * from './timeUtils.js';

// 核心服务函数
import { buildPrompt } from './promptBuilder.js';
import { callAiApi, debugLog, getEstimatedResponseTime } from './apiService.js';
import { generateThemeLocalContent } from './themeUtils.js';

/**
 * 使用AI模型生成心灵纸条内容
 * @param {Object} params 生成参数
 * @returns {Promise<string>} 生成的内容
 */
export async function generateNoteContent(params) {
  try {
    // 准备API请求参数
    const prompt = await buildPrompt(params, debugLog);
    
    // 在调试模式下输出提示词
    debugLog('prompt', prompt);
    
    // 调用API
    return await callAiApi(prompt, params.savageMode);
  } catch (error) {
    console.error('生成内容失败:', error);
    // 失败时使用本地生成方法
    return generateLocalContent(params);
  }
}

/**
 * 备用方案：本地生成内容（API不可用时）
 * @param {Object} params 生成参数
 * @returns {string} 生成的内容
 */
export function generateLocalContent(params) {
  // 根据是否有主题参数使用主题生成或默认生成
  if (params.theme) {
    return generateThemeLocalContent(params.theme, params.savageMode, params);
  }
  
  // 以下是默认的本地生成方法（保持兼容）
  const { timeContext } = getTimeContext();
  
  // 处理表情输入 - 支持多个表情
  let moodInput = '';
  if (params.moods && params.moods.length > 0) {
    moodInput = params.moods.join('');
  } else if (params.mood) {
    // 兼容旧版单个表情
    moodInput = params.mood;
  } else {
    moodInput = '平静';
  }

  // 生成一个简单的响应
  if (params.savageMode) {
    return `看这表情"${moodInput}"，又在搞什么鬼？${timeContext.period}就该好好休息，别瞎折腾了。`;
  } else {
    return `${timeContext.period}好，看到你的"${moodInput}"，想提醒你照顾好自己，一切都会好起来的。`;
  }
}
