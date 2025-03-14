const promptService = require('./promptService');
const logger = require('../utils/logger');
const axios = require('axios');
require('dotenv').config();

/**
 * AI服务 - 集中处理AI相关操作的服务
 */
class AiService {
  constructor() {
    // 默认API配置
    this.defaultConfig = {
      apiKey: process.env.VITE_API_KEY,
      apiUrl: process.env.VITE_API_URL,
      model: process.env.VITE_API_MODEL || 'qwen-max'
    };
    
    logger.info('AI_SERVICE', '初始化默认配置', {
      url: this.defaultConfig.apiUrl,
      model: this.defaultConfig.model,
      key_available: !!this.defaultConfig.apiKey
    });
  }

  /**
   * 获取API配置
   * @param {Object} headers 请求头
   * @returns {Object} API配置
   */
  getApiConfig(headers = {}) {
    logger.info('AI_SERVICE', '收到请求头', {
      headers: {
        'x-use-custom-api': headers['x-use-custom-api'],
        'x-custom-api-model': headers['x-custom-api-model'],
        'x-custom-api-url': headers['x-custom-api-url'],
        'x-custom-api-key-exists': !!headers['x-custom-api-key']
      }
    });

    if (headers['x-use-custom-api'] === 'true') {
      const customConfig = {
        apiKey: headers['x-custom-api-key'],
        apiUrl: headers['x-custom-api-url'],
        model: headers['x-custom-api-model']
      };

      logger.info('AI_SERVICE', '使用自定义配置', {
        url: customConfig.apiUrl,
        model: customConfig.model,
        key_available: !!customConfig.apiKey
      });

      return customConfig;
    }

    logger.info('AI_SERVICE', '使用默认配置', {
      url: this.defaultConfig.apiUrl,
      model: this.defaultConfig.model,
      key_available: !!this.defaultConfig.apiKey
    });

    return this.defaultConfig;
  }

  /**
   * 生成笔记内容
   * @param {Object} data 生成参数
   * @param {Object} headers 请求头
   * @returns {Promise<Object>} 生成结果
   */
  async generateNote(data, headers = {}) {
    try {
      const apiConfig = this.getApiConfig(headers);
      
      logger.info('AI_SERVICE', '开始生成笔记内容', {
        theme: data.theme,
        savageMode: data.savageMode,
        moodCount: Array.isArray(data.moods) ? data.moods.length : 0,
        useCustomApi: headers['x-use-custom-api'] === 'true',
        selectedModel: apiConfig.model
      });
      
      // 使用promptService处理请求
      const result = await promptService.generateNote(data, apiConfig);
      
      logger.info('AI_SERVICE', '笔记内容生成完成', {
        model: result.metadata.model,
        processingTime: result.metadata.generationTime,
        contentLength: result.content.length
      });
      
      return result;
    } catch (error) {
      logger.error('AI_SERVICE', '生成笔记内容失败', {
        error: error.message,
        stack: process.env.DEBUG_MODE === 'true' ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * 测试API连接
   * @param {Object} settings API设置
   * @returns {Promise<Object>} 测试结果
   */
  async testConnection(settings) {
    try {
      logger.info('AI_SERVICE', '测试API连接', {
        apiUrl: settings.apiUrl,
        model: settings.model
      });

      const response = await axios.post(`${settings.apiUrl}/chat/completions`, {
        model: settings.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      }, {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info('AI_SERVICE', 'API连接测试成功', {
        model: response.data.model || settings.model
      });

      return {
        success: true,
        message: 'API连接测试成功！',
        model: response.data.model || settings.model
      };
    } catch (error) {
      logger.error('AI_SERVICE', 'API连接测试失败', {
        error: error.message,
        response: error.response?.data
      });
      
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  /**
   * 获取API服务状态
   * @param {Object} headers 请求头
   * @returns {Promise<Object>} 服务状态信息
   */
  async getStatus(headers = {}) {
    try {
      const apiConfig = this.getApiConfig(headers);
      const status = await promptService.getStatus(apiConfig);
      logger.debug('AI_SERVICE', '获取服务状态', status);
      return status;
    } catch (error) {
      logger.error('AI_SERVICE', '获取状态失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 获取估计响应时间
   * @param {string} model 模型名称
   * @param {Object} headers 请求头
   * @returns {Promise<number>} 估计响应时间(毫秒)
   */
  async getEstimatedTime(model, headers = {}) {
    try {
      const apiConfig = this.getApiConfig(headers);
      const time = await promptService.getEstimatedTime(model || apiConfig.model);
      logger.debug('AI_SERVICE', '获取估计响应时间', { 
        requestedModel: model,
        configModel: apiConfig.model,
        time 
      });
      return time;
    } catch (error) {
      logger.error('AI_SERVICE', '获取响应时间失败', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AiService();