/**
 * eventService.js - 事件管理服务
 * 处理用户行为埋点数据的收集和分析
 */

const logger = require('../utils/logger');
const db = require('../db'); // 引入SQLite数据库模块

/**
 * 事件服务对象
 */
const eventService = {
  /**
   * 记录新事件
   * @param {Object} eventData - 事件数据对象
   * @returns {Promise<Object>} 创建的事件对象
   */
  async trackEvent(eventData) {
    try {
      logger.debug('EVENT', '记录新事件', { eventType: eventData.eventType });
      
      // 添加事件到SQLite数据库
      const result = db.addEvent(eventData);
      
      return { success: true, eventId: result.id };
    } catch (error) {
      logger.error('EVENT', '记录事件失败', { error: error.message, eventData });
      throw error;
    }
  },
  
  /**
   * 获取事件统计数据
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 统计数据
   */
  async getEventStats(options = {}) {
    try {
      logger.debug('EVENT', '获取事件统计', { options });
      
      // 获取总事件数
      const { count: totalEvents } = db.getEventStats(options);
      
      // 获取唯一用户数
      const uniqueUserCount = db.getUniqueUserCount(options);
      
      // 获取事件类型分布
      const eventTypeDistribution = db.getEventTypeDistribution(options);
      
      // 获取时间序列数据
      const timeSeriesData = db.getTimeSeriesData(options.groupBy || 'day', options);
      
      return {
        totalEvents,
        uniqueUserCount,
        eventTypeDistribution,
        timeSeriesData
      };
    } catch (error) {
      logger.error('EVENT', '获取事件统计失败', { error: error.message });
      throw error;
    }
  },
  
  /**
   * 获取按参数类型的统计数据
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 参数统计数据
   */
  async getParamStats(options = {}) {
    try {
      logger.debug('EVENT', '获取参数统计', { options });
      
      const paramTypes = ['zodiac', 'mbti', 'mood', 'bilingual', 'sarcasm'];
      const results = {};
      
      // 获取每种参数类型的分布
      for (const paramType of paramTypes) {
        results[paramType] = db.getParamDistribution(paramType, options);
      }
      
      return results;
    } catch (error) {
      logger.error('EVENT', '获取参数统计失败', { error: error.message });
      throw error;
    }
  },
  
  /**
   * 获取今日和昨日事件统计
   * @returns {Promise<Object>} 今日和昨日的事件统计
   */
  async getDailyStats() {
    try {
      // 今日开始时间
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 昨日开始时间
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 获取今日事件统计
      const { count: todayEvents } = db.getEventStats({
        startDate: today.toISOString()
      });
      
      // 获取昨日事件统计
      const { count: yesterdayEvents } = db.getEventStats({
        startDate: yesterday.toISOString(),
        endDate: today.toISOString()
      });
      
      return {
        todayEvents,
        yesterdayEvents
      };
    } catch (error) {
      logger.error('EVENT', '获取每日统计失败', { error: error.message });
      return { error: error.message };
    }
  },
  
  /**
   * 获取唯一用户数
   * @param {Object} options - 查询选项
   * @returns {Promise<Number>} 唯一用户数
   */
  async getUniqueUserCount(options = {}) {
    try {
      return db.getUniqueUserCount(options);
    } catch (error) {
      logger.error('EVENT', '获取唯一用户数失败', { error: error.message });
      throw error;
    }
  },
  
  /**
   * 获取事件类型统计
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 事件类型统计数组
   */
  async getEventTypeStats(options = {}) {
    try {
      return db.getEventTypeDistribution(options);
    } catch (error) {
      logger.error('EVENT', '获取事件类型统计失败', { error: error.message });
      throw error;
    }
  },
  
  /**
   * 获取按邀请码分组的统计数据
   * @param {Array} inviteCodes - 邀请码列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 按邀请码分组的统计数据
   */
  async getInviteCodeStats(inviteCodes, options = {}) {
    try {
      const results = {};
      
      // 对每个邀请码进行统计
      for (const code of inviteCodes) {
        const codeOptions = {
          ...options,
          inviteCode: code
        };
        
        // 获取该邀请码的统计数据
        const uniqueUsers = db.getUniqueUserCount(codeOptions);
        const eventTypeCounts = db.getEventTypeDistribution(codeOptions);
        const { count: noteGenerateCount } = db.getEventStats({
          ...codeOptions,
          eventType: 'note_generate'
        });
        
        results[code] = {
          uniqueUserCount: uniqueUsers,
          eventTypeCounts,
          noteGenerateCount
        };
      }
      
      return results;
    } catch (error) {
      logger.error('EVENT', '获取邀请码统计数据失败', { error: error.message });
      throw error;
    }
  }
};

module.exports = eventService; 