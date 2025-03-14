/**
 * ESM to CommonJS bridge
 * 
 * This file helps bridge the gap between ES Modules and CommonJS
 * by providing CommonJS-compatible wrappers for any ES module functionality.
 */

const apiServiceModule = require('./modules/apiService');

/**
 * 调用AI API生成内容
 * @param {string} prompt 提示词
 * @param {boolean} savageMode 是否为毒舌模式
 * @param {Object} apiConfig API配置
 * @returns {Promise<string>} 生成的内容
 */
async function callAiApi(prompt, savageMode = false, apiConfig = {}) {
  return apiServiceModule.callAiApi(prompt, savageMode, apiConfig);
}

/**
 * 获取估计的API响应时间
 * @param {string} model AI模型名称
 * @param {Object} apiConfig API配置
 * @returns {number} 估计的响应时间(毫秒)
 */
function getEstimatedResponseTime(model, apiConfig = {}) {
  return apiServiceModule.getEstimatedResponseTime(model, apiConfig);
}

module.exports = {
  callAiApi,
  getEstimatedResponseTime
};
