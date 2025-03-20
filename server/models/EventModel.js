/**
 * EventModel.js - 事件数据模型
 * 用于存储用户行为埋点数据，支持高效的数据分析和统计
 * 已更新为SQLite兼容版本，替代原MongoDB实现
 */

const db = require('../db');
const logger = require('../utils/logger');

// 提供与原MongoDB模型兼容的接口
const EventModel = {
  /**
   * 创建并保存事件
   * @param {Object} eventData - 事件数据
   * @returns {Promise<Object>} 保存的事件
   */
  async create(eventData) {
    try {
      const result = await db.addEvent(eventData);
      return { id: result.id, ...eventData };
    } catch (error) {
      logger.error('EVENT_MODEL', '创建事件失败', { error: error.message });
      throw error;
    }
  },
  
  /**
   * 与MongoDB兼容的save方法
   * @param {Object} eventData - 事件数据
   * @returns {Promise<Object>} 保存的事件
   */
  async save() {
    return this.create(this);
  },
  
  /**
   * 查询事件数量
   * @param {Object} query - 查询条件
   * @returns {Promise<Number>} 事件数量
   */
  async countDocuments(query = {}) {
    try {
      const filters = {};
      
      // 转换MongoDB查询格式为SQLite查询
      if (query.eventType) {
        filters.eventType = query.eventType;
      }
      
      if (query.inviteCode) {
        filters.inviteCode = query.inviteCode;
      }
      
      if (query.timestamp && query.timestamp.$gte) {
        filters.startDate = new Date(query.timestamp.$gte).toISOString();
      }
      
      if (query.timestamp && query.timestamp.$lt) {
        filters.endDate = new Date(query.timestamp.$lt).toISOString();
      }
      
      const result = await db.getEventStats(filters);
      return result.count;
    } catch (error) {
      logger.error('EVENT_MODEL', '查询事件数量失败', { error: error.message });
      return 0;
    }
  },
  
  /**
   * 获取多条记录
   * @param {Object} query - 查询条件
   * @returns {Promise<Array>} 事件数组
   */
  async find(query = {}) {
    // 暂未实现完整查询功能，仅提供兼容接口
    logger.warn('EVENT_MODEL', 'find方法尚未完全实现');
    return [];
  },
  
  /**
   * 聚合查询
   * @param {Array} pipeline - 聚合管道
   * @returns {Promise<Array>} 聚合结果
   */
  async aggregate(pipeline = []) {
    try {
      // 简化实现 - 仅支持基本的分组聚合
      if (pipeline.length > 0 && pipeline[0].$match) {
        const match = pipeline[0].$match;
        const filters = {};
        
        // 转换MongoDB查询格式为SQLite查询
        if (match.eventType) {
          filters.eventType = match.eventType;
        }
        
        if (match.timestamp && match.timestamp.$gte) {
          filters.startDate = new Date(match.timestamp.$gte).toISOString();
        }
        
        if (match.timestamp && match.timestamp.$lte) {
          filters.endDate = new Date(match.timestamp.$lte).toISOString();
        }
        
        // 处理参数类型查询
        if (match['data.paramType']) {
          return db.getParamDistribution(match['data.paramType'], filters);
        }
        
        // 处理分组查询
        if (pipeline.some(stage => stage.$group)) {
          return db.getEventTypeDistribution(filters);
        }
      }
      
      logger.warn('EVENT_MODEL', '未支持的聚合查询', { pipeline });
      return [];
    } catch (error) {
      logger.error('EVENT_MODEL', '聚合查询失败', { error: error.message });
      return [];
    }
  },
  
  /**
   * 获取唯一值
   * @param {String} field - 字段名
   * @param {Object} query - 查询条件
   * @returns {Promise<Array>} 唯一值数组
   */
  async distinct(field, query = {}) {
    try {
      if (field === 'userId') {
        const filters = {};
        
        // 转换MongoDB查询格式为SQLite查询
        if (query.timestamp && query.timestamp.$gte) {
          filters.startDate = new Date(query.timestamp.$gte).toISOString();
        }
        
        if (query.timestamp && query.timestamp.$lte) {
          filters.endDate = new Date(query.timestamp.$lte).toISOString();
        }
        
        const count = await db.getUniqueUserCount(filters);
        // 返回假数据以与调用方兼容
        return Array(count).fill().map((_, i) => `user_${i}`);
      }
      
      logger.warn('EVENT_MODEL', '未支持的distinct查询', { field });
      return [];
    } catch (error) {
      logger.error('EVENT_MODEL', 'distinct查询失败', { error: error.message });
      return [];
    }
  }
};

// 添加静态方法，以与原mongoose模型兼容
EventModel.countByEventType = async function(options = {}) {
  try {
    const distribution = await db.getEventTypeDistribution(options);
    return distribution.map(item => ({ _id: item.type, count: item.count }));
  } catch (error) {
    logger.error('EVENT_MODEL', '按事件类型统计失败', { error: error.message });
    return [];
  }
};

EventModel.countByTimeUnit = async function(eventType, timeUnit = 'day', options = {}) {
  try {
    const filters = { ...options, eventType };
    const timeSeriesData = await db.getTimeSeriesData(timeUnit, filters);
    return timeSeriesData.map(item => ({ _id: item.date, count: item.count }));
  } catch (error) {
    logger.error('EVENT_MODEL', '按时间单位统计失败', { error: error.message });
    return [];
  }
};

EventModel.getParamDistribution = async function(paramType, options = {}) {
  try {
    const distribution = await db.getParamDistribution(paramType, options);
    return distribution.map(item => ({ _id: item.value, count: item.count }));
  } catch (error) {
    logger.error('EVENT_MODEL', '获取参数分布失败', { error: error.message });
    return [];
  }
};

EventModel.getUniqueUserCount = async function(options = {}) {
  try {
    return await db.getUniqueUserCount(options);
  } catch (error) {
    logger.error('EVENT_MODEL', '获取唯一用户数失败', { error: error.message });
    return 0;
  }
};

module.exports = EventModel; 