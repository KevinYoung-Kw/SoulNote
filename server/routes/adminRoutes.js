/**
 * adminRoutes.js - 管理员API路由
 * 提供管理员控制面板功能，替代前端不安全的实现
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { requireAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');
const EventModel = require('../models/EventModel'); // 现在这个模块已经是SQLite兼容版本
const db = require('../db'); // 直接导入数据库接口

// 数据文件路径（从server/index.js文件复制过来）
const DATA_DIR = path.join(__dirname, '../data');
const INVITE_CODES_FILE = path.join(DATA_DIR, 'invite-codes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// 读取邀请码数据
async function getInviteCodes() {
  try {
    const data = await fs.readFile(INVITE_CODES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('INVITE_CODES', '读取邀请码文件失败', { error: error.message });
    return { codes: [] };
  }
}

// 保存邀请码数据
async function saveInviteCodes(inviteCodesData) {
  try {
    await fs.writeFile(INVITE_CODES_FILE, JSON.stringify(inviteCodesData, null, 2));
    return true;
  } catch (error) {
    logger.error('INVITE_CODES', '保存邀请码文件失败', { error: error.message });
    return false;
  }
}

// 读取统计数据
async function getStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('STATS', '读取统计文件失败', { error: error.message });
    return {
      totalVerifications: 0,
      totalUniqueUsers: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// 生成用户趋势数据
function generateUserTrends(users) {
  // 如果没有用户数据，返回空数组
  if (!users || users.length === 0) {
    return [];
  }
  
  // 计算过去30天的使用趋势
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyUsers = {};
  const dailyLogins = {};
  
  // 初始化每一天的计数器
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyUsers[dateStr] = 0;
    dailyLogins[dateStr] = 0;
  }
  
  // 计算每天的新用户和登录次数
  users.forEach(user => {
    const firstSeenDate = new Date(user.firstSeen).toISOString().split('T')[0];
    const lastLoginDate = new Date(user.lastLogin).toISOString().split('T')[0];
    
    if (new Date(firstSeenDate) >= thirtyDaysAgo) {
      if (dailyUsers[firstSeenDate] !== undefined) {
        dailyUsers[firstSeenDate]++;
      }
    }
    
    if (new Date(lastLoginDate) >= thirtyDaysAgo) {
      if (dailyLogins[lastLoginDate] !== undefined) {
        dailyLogins[lastLoginDate]++;
      }
    }
  });
  
  // 格式化数据用于前端展示
  const result = Object.keys(dailyUsers).map(date => ({
    date,
    newUsers: dailyUsers[date],
    logins: dailyLogins[date]
  }));
  
  return result;
}

// 获取管理面板基本统计数据
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const stats = await getStats();
    const inviteCodesData = await getInviteCodes();
    const userData = await fs.readFile(USERS_FILE, 'utf8').then(JSON.parse).catch(() => ({ users: [] }));
    
    // 计算每个邀请码的使用情况
    const codeStats = inviteCodesData.codes.map(code => ({
      code: code.code,
      usedCount: code.usedCount,
      maxUses: code.maxUses,
      uniqueIPs: code.usedIPs.length,
      lastUsed: code.lastUsed || 'Never',
      createdAt: code.createdAt
    }));
    
    // 生成用户趋势数据
    const userTrends = generateUserTrends(userData.users);
    
    // 从SQLite获取事件统计数据
    let eventStats = {};
    try {
      // 今日总事件数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 获取今日事件统计
      const todayResult = await db.getEventStats({
        startDate: today.toISOString()
      });
      const todayEvents = todayResult.count;
      
      // 昨日总事件数
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayResult = await db.getEventStats({
        startDate: yesterday.toISOString(),
        endDate: today.toISOString()
      });
      const yesterdayEvents = yesterdayResult.count;
      
      // 事件类型分布
      const eventTypeDistribution = await db.getEventTypeDistribution();
      
      eventStats = {
        todayEvents,
        yesterdayEvents,
        eventTypeDistribution: eventTypeDistribution.map(item => ({
          type: item.type,
          count: item.count
        }))
      };
    } catch (error) {
      logger.error('ADMIN', '获取事件统计失败', { error: error.message });
      eventStats = { error: '获取事件统计失败' };
    }
    
    return res.status(200).json({
      success: true,
      systemStats: {
        ...stats,
        totalUniqueUsers: userData.users.length
      },
      inviteCodeStats: codeStats,
      userCount: userData.users.length,
      userTrends,
      eventStats
    });
  } catch (error) {
    logger.error('ADMIN', '获取仪表盘数据失败', { error: error.message });
    return res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 生成新邀请码
router.post('/invite-code', requireAdmin, async (req, res) => {
  try {
    const { maxUses, prefix } = req.body;
    
    // 生成随机代码
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const inviteCode = prefix ? `${prefix}${randomPart}` : `SN${randomPart}`;
    
    // 读取现有邀请码
    const inviteCodesData = await getInviteCodes();
    
    // 添加新邀请码
    inviteCodesData.codes.push({
      code: inviteCode,
      createdAt: new Date().toISOString(),
      maxUses: maxUses || 100,
      usedCount: 0,
      usedIPs: []
    });
    
    // 保存更新后的邀请码数据
    await saveInviteCodes(inviteCodesData);
    
    return res.status(201).json({ 
      success: true, 
      inviteCode,
      message: '邀请码生成成功'
    });
  } catch (error) {
    logger.error('ADMIN', '生成邀请码失败', { error: error.message });
    return res.status(500).json({ 
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 编辑邀请码
router.put('/invite-code/:code', requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const { newMaxUses } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false,
        message: '请提供要编辑的邀请码'
      });
    }
    
    if (newMaxUses === undefined || newMaxUses < 0) {
      return res.status(400).json({ 
        success: false,
        message: '请提供有效的使用次数' 
      });
    }
    
    // 读取现有邀请码
    const inviteCodesData = await getInviteCodes();
    
    // 查找要编辑的邀请码
    const inviteCode = inviteCodesData.codes.find(c => c.code === code);
    
    if (!inviteCode) {
      return res.status(404).json({ 
        success: false,
        message: '邀请码不存在' 
      });
    }
    
    // 更新邀请码信息
    inviteCode.maxUses = newMaxUses;
    inviteCode.updatedAt = new Date().toISOString();
    
    // 保存更新后的邀请码数据
    await saveInviteCodes(inviteCodesData);
    
    return res.status(200).json({ 
      success: true, 
      message: '邀请码更新成功',
      updatedCode: inviteCode
    });
  } catch (error) {
    logger.error('ADMIN', '编辑邀请码失败', { error: error.message });
    return res.status(500).json({ 
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 删除邀请码
router.delete('/invite-code/:code', requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ 
        success: false,
        message: '请提供要删除的邀请码' 
      });
    }
    
    // 读取现有邀请码
    const inviteCodesData = await getInviteCodes();
    
    // 查找要删除的邀请码索引
    const codeIndex = inviteCodesData.codes.findIndex(c => c.code === code);
    
    if (codeIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: '邀请码不存在' 
      });
    }
    
    // 从数组中删除该邀请码
    inviteCodesData.codes.splice(codeIndex, 1);
    
    // 保存更新后的邀请码数据
    const saveResult = await saveInviteCodes(inviteCodesData);
    
    if (!saveResult) {
      return res.status(500).json({
        success: false,
        message: '保存失败，请稍后再试'
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: '邀请码删除成功'
    });
  } catch (error) {
    logger.error('ADMIN', '删除邀请码失败', { error: error.message });
    return res.status(500).json({ 
      success: false,
      message: '服务器内部错误',
      error: error.message  
    });
  }
});

// 获取事件分析数据
router.get('/event-analytics', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    
    // 解析日期范围
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // 验证SQLite连接
    if (!db.isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'SQLite未连接，无法获取事件分析'
      });
    }
    
    // 基于时间范围的查询条件
    const dateFilter = {
      timestamp: {
        $gte: start,
        $lte: end
      }
    };
    
    // 获取事件计数
    const totalEvents = await EventModel.countDocuments(dateFilter);
    
    // 获取唯一用户数
    const uniqueUsers = await EventModel.distinct('userId', dateFilter);
    
    // 获取事件类型分布
    const eventTypeDistribution = await EventModel.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // 根据groupBy参数返回时间序列数据
    let timeSeriesData = [];
    
    if (groupBy === 'day') {
      timeSeriesData = await EventModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { 
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: '$_id.day'
                  }
                }
              }
            },
            count: 1
          }
        }
      ]);
    } else if (groupBy === 'hour') {
      timeSeriesData = await EventModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { 
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' },
              hour: { $hour: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: '$_id.day',
                    hour: '$_id.hour'
                  }
                }
              }
            },
            count: 1
          }
        }
      ]);
    } else {
      // 默认按周分组
      timeSeriesData = await EventModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { 
              year: { $year: '$timestamp' },
              week: { $week: '$timestamp' }
            },
            count: { $sum: 1 },
            firstDay: { $min: '$timestamp' }
          }
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
        {
          $project: {
            _id: 0,
            date: { $dateToString: { format: '%Y-W%V', date: '$firstDay' } },
            count: 1
          }
        }
      ]);
    }
    
    return res.status(200).json({
      success: true,
      analytics: {
        totalEvents,
        uniqueUserCount: uniqueUsers.length,
        eventTypeDistribution: eventTypeDistribution.map(item => ({
          type: item._id,
          count: item.count,
          percentage: (item.count / totalEvents * 100).toFixed(2)
        })),
        timeSeriesData
      }
    });
  } catch (error) {
    logger.error('ADMIN', '获取事件分析失败', { error: error.message });
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

module.exports = router; 