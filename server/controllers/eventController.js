/**
 * eventController.js - 事件控制器
 * 处理前端埋点相关的API请求
 */

const eventService = require('../services/eventService');
const logger = require('../utils/logger');

/**
 * 事件控制器
 */
const eventController = {
  /**
   * 记录事件
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async trackEvent(req, res) {
    try {
      const eventData = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const inviteCode = req.session?.inviteCode || req.cookies?.inviteCode;
      
      // 确保必要字段存在
      if (!eventData.eventType || !eventData.userId) {
        return res.status(400).json({
          success: false,
          message: '缺少必要字段: eventType 或 userId'
        });
      }
      
      // 添加IP地址
      eventData.ipAddress = ip;
      
      // 添加邀请码
      if (inviteCode) {
        eventData.inviteCode = inviteCode;
      }
      
      // 记录事件
      const result = await eventService.trackEvent(eventData);
      
      logger.debug('EVENT', '事件记录成功', { 
        eventType: eventData.eventType,
        userId: eventData.userId.substring(0, 8) + '...'
      });
      
      res.json({
        success: true,
        eventId: result.eventId,
        message: '事件记录成功'
      });
    } catch (error) {
      logger.error('EVENT', '事件记录失败', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: '事件记录失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
      });
    }
  },
  
  /**
   * 获取事件统计
   * 需要管理员权限
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getEventStats(req, res) {
    try {
      // 解析请求参数
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      // 获取事件统计
      const statsData = await eventService.getEventStats({
        startDate,
        endDate,
        groupBy
      });
      
      res.json({
        success: true,
        analytics: {
          totalEvents: statsData.totalEvents,
          uniqueUserCount: statsData.uniqueUserCount,
          eventTypeDistribution: statsData.eventTypeDistribution.map(item => ({
            type: item.type,
            count: item.count,
            percentage: Math.round((item.count / statsData.totalEvents) * 100)
          })),
          timeSeriesData: statsData.timeSeriesData.map(item => ({
            date: item.date,
            count: item.count
          }))
        }
      });
    } catch (error) {
      logger.error('EVENT', '获取事件统计失败', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: '获取事件统计失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
      });
    }
  },
  
  /**
   * 获取参数统计
   * 需要管理员权限
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getParamStats(req, res) {
    try {
      // 解析请求参数
      const { startDate, endDate } = req.query;
      
      // 获取参数统计
      const paramStats = await eventService.getParamStats({
        startDate,
        endDate
      });
      
      res.json({
        success: true,
        paramStats
      });
    } catch (error) {
      logger.error('EVENT', '获取参数统计失败', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: '获取参数统计失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
      });
    }
  },
  
  /**
   * 获取今日和昨日事件统计
   * 需要管理员权限
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getDailyStats(req, res) {
    try {
      const dailyStats = await eventService.getDailyStats();
      
      if (dailyStats.error) {
        return res.status(500).json({
          success: false,
          message: '获取每日统计失败',
          error: dailyStats.error
        });
      }
      
      res.json({
        success: true,
        dailyStats
      });
    } catch (error) {
      logger.error('EVENT', '获取每日统计失败', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: '获取每日统计失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
      });
    }
  }
};

module.exports = eventController; 