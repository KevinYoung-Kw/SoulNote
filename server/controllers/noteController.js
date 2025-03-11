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

  /**
   * 获取应用配置信息
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getAppConfig(req, res) {
    try {
      // 获取当前应用版本和社群相关配置
      const appConfig = {
        version: process.env.APP_VERSION || '1.0.0',
        community: {
          enable: true, // 控制是否启用社群功能
          qrcode: process.env.COMMUNITY_QRCODE_URL || '/assets/community-qr.png',
          title: '星语心笺反馈群',
          description: '分享您的使用体验、提出产品建议、获取最新功能更新',
          showAfterGenerations: 3, // 减少触发次数以获取更多反馈
          showForNewUsers: true,
          showAfterUpdate: true,
          prompts: [
            '有任何使用建议？开发者期待您的反馈！',
            '您的意见对我们至关重要，加入反馈群直接交流',
            '想要更好的使用体验？加入群聊分享您的想法'
          ]
        }
      };
      
      logger.debug('APP_CONFIG', '返回应用配置', { version: appConfig.version });
      
      res.status(200).json({
        success: true,
        config: appConfig
      });
    } catch (error) {
      logger.error('APP_CONFIG_ERROR', '获取应用配置错误', {
        message: error.message,
        stack: process.env.DEBUG_MODE === 'true' ? error.stack : undefined
      });
      
      res.status(500).json({
        success: false,
        error: '获取配置信息失败'
      });
    }
  }

}



module.exports = new NoteController();