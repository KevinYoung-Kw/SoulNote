/**
 * eventRoutes.js - 事件API路由
 * 定义与事件跟踪和统计相关的API路由
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { rateLimiter } = require('../middleware/rateLimiter');

// 事件跟踪接口 - 接收前端埋点数据
// 使用速率限制中间件防止滥用
router.post('/track', rateLimiter(100, 60), eventController.trackEvent);

// 获取事件统计数据 (需要管理员权限)
router.get('/analytics/overview', eventController.getEventStats);

// 获取参数类型统计 (需要管理员权限)
router.get('/analytics/params', eventController.getParamStats);

// 获取每日统计数据 (需要管理员权限)
router.get('/analytics/daily', eventController.getDailyStats);

module.exports = router; 