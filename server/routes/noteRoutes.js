const express = require('express');
const noteController = require('../controllers/noteController.js');
const rateLimiter = require('../middleware/rateLimiter.js');
const logger = require('../utils/logger');

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
router.post('/generate', rateLimiter, noteController.generateNote);

/**
 * @route GET /api/note/status
 * @desc 获取API状态
 * @access Public
 */
router.get('/status', noteController.getStatus);

/**
 * @route GET /api/note/estimated-time
 * @desc 获取估计响应时间
 * @access Public
 */

router.get('/estimated-time', noteController.getEstimatedTime);

/**
 * @route GET /api/config
 * @desc 获取应用配置，包括社群信息
 * @access Public
 */
router.get('/config', noteController.getAppConfig);

module.exports = router;