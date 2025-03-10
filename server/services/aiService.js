const promptService = require('./promptService');
const logger = require('../utils/logger');

/**
 * AI服务 - 集中处理AI相关操作的服务
 */
class AiService {
  /**
   * 生成笔记内容
   * @param {Object} data - 生成参数
   * @returns {Promise<Object>} - 生成结果
   */
  async generateNote(data) {
    try {
      // 记录AI请求
      logger.info('AI_SERVICE', '开始生成笔记内容', {
        theme: data.theme,
        savageMode: data.savageMode,
        moodCount: Array.isArray(data.moods) ? data.moods.length : 0
      });
      
      // 委托给promptService处理
      const result = await promptService.generateNote(data);
      
      logger.info('AI_SERVICE', '笔记内容生成完成', {
        model: result.metadata.model,
        processingTime: result.metadata.generationTime,
        contentLength: result.content.length
      });
      
      return result;
    } catch (error) {
      logger.error('AI_SERVICE', '生成笔记内容失败', {
        error: error.message,
        stack: process.env.DEBUG_MODE === 'true' ? error.stack : undefined
      });
      throw error; // 重新抛出异常以便控制器处理
    }
  }
  
  /**
   * 获取API服务状态
   * @returns {Object} - 服务状态信息
   */
  getStatus() {
    try {
      const status = promptService.getStatus();
      logger.debug('AI_SERVICE', '获取服务状态', status);
      return status;
    } catch (error) {
      logger.error('AI_SERVICE', '获取状态失败', { error: error.message });
      throw error;
    }
  }
  
  /**
   * 获取估计响应时间
   * @param {string} model - 模型名称
   * @returns {Promise<number>} - 估计响应时间(毫秒)
   */
  async getEstimatedTime(model) {
    try {
      const time = await promptService.getEstimatedTime(model);
      logger.debug('AI_SERVICE', '获取估计响应时间', { model, time });
      return time;
    } catch (error) {
      logger.error('AI_SERVICE', '获取响应时间失败', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AiService();