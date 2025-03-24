/**
 * API路由配置
 */
const express = require('express');
const router = express.Router();

// 导入控制器
const dateInfoController = require('./dateInfo');

// 日期信息API
router.get('/dateInfo', dateInfoController.getCurrentDateInfo);

module.exports = router; 