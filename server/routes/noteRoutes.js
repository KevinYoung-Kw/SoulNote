const express = require('express');
const { rateLimiter } = require('../middleware/rateLimiter.js');
const logger = require('../utils/logger');
const aiService = require('../services/aiService');

const router = express.Router();

// 请求日志中间件
const requestLogger = (req, res, next) => {
  logger.debug('ROUTE', `笔记API: ${req.method} ${req.originalUrl}`);
  next();
};

// 为所有路由添加日志记录
router.use(requestLogger);

/**
 * @route POST /api/note/generate
 * @desc 生成心灵纸条内容
 * @access Public (with rate limiting)
 */
router.post('/generate', rateLimiter(5, 120), async (req, res) => {
  try {
    const result = await aiService.generateNote(req.body, req.headers);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/note/test-connection
 * @desc 测试API连接
 * @access Public
 */
router.post('/test-connection', async (req, res) => {
  try {
    const result = await aiService.testConnection(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/note/status
 * @desc 获取API状态
 * @access Public
 */
router.get('/status', async (req, res) => {
  try {
    const status = await aiService.getStatus(req.headers);
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/note/estimated-time
 * @desc 获取估计响应时间
 * @access Public
 */
router.get('/estimated-time', async (req, res) => {
  try {
    const time = await aiService.getEstimatedTime(req.query.model, req.headers);
    res.json({ estimatedTime: time });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/note/config
 * @desc 获取应用配置
 * @access Public
 */
router.get('/config', async (req, res) => {
  try {
    // 返回基本配置
    res.json({
      success: true,
      config: {
        // 可以在这里添加其他配置
        apiEnabled: true,
        features: {
          customApi: true,
          savageMode: true
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;