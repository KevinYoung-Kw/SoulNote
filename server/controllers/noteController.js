const aiService = require('../services/aiService.js');
const logger = require('../utils/logger'); // 引入增强的logger

/**
 * 笔记生成控制器 - 处理笔记生成相关请求
 */
class NoteController {
  constructor() {
    // 绑定方法到实例，解决this指向问题
    this.generateNote = this.generateNote.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.getEstimatedTime = this.getEstimatedTime.bind(this);
  }

  /**
   * 生成心灵纸条
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async generateNote(req, res) {
    try {
      logger.info('API_REQUEST', '收到生成笔记请求', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type']
      });
      
      // 记录请求正文内容，但需要屏蔽敏感字段
      const sanitizedBody = { ...req.body };
      logger.debug('REQUEST_BODY', '请求正文', sanitizedBody);
      
      const result = await aiService.generateNote(req.body);
      
      logger.info('API_RESPONSE', '生成笔记成功', {
        responseTime: result.metadata?.generationTime || 'N/A',
        contentLength: result.content?.length || 0,
        model: result.metadata?.model || 'unknown'
      });
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('API_ERROR', '生成笔记错误', {
        message: error.message,
        stack: process.env.DEBUG_MODE === 'true' ? error.stack : undefined,
        params: {
          theme: req.body.theme,
          savageMode: req.body.savageMode,
          hasMoods: Array.isArray(req.body.moods)
        }
      });
      
      res.status(500).json({
        success: false,
        error: error.message || '内容生成失败'
      });
    }
  }
  
  /**
   * 获取API状态
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  getStatus(req, res) {
    try {
      logger.debug('API_STATUS', '获取API状态请求');
      
      const status = aiService.getStatus();
      
      logger.debug('API_STATUS', '返回API状态', status);
      
      res.status(200).json(status);
    } catch (error) {
      logger.error('API_STATUS_ERROR', '获取状态错误', {
        message: error.message,
        stack: process.env.DEBUG_MODE === 'true' ? error.stack : undefined
      });
      
      res.status(500).json({
        success: false,
        error: '服务器内部错误'
      });
    }
  }

  /**
   * 获取估计的响应时间
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getEstimatedTime(req, res) {
    try {
      const model = req.query.model || '';
      
      logger.debug('ESTIMATED_TIME', '获取估计响应时间', { model });
      
      const estimatedTime = await aiService.getEstimatedTime(model);
      
      logger.debug('ESTIMATED_TIME', '返回估计响应时间', { 
        model: model || 'default', 
        estimatedTime 
      });
      
      res.status(200).json({
        success: true,
        estimatedTime
      });
    } catch (error) {
      logger.error('ESTIMATED_TIME_ERROR', '获取估计响应时间错误', {
        message: error.message,
        model: req.query.model,
        stack: process.env.DEBUG_MODE === 'true' ? error.stack : undefined
      });
      
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
        estimatedTime: 3000 // 默认值
      });
    }
  }
}

module.exports = new NoteController();