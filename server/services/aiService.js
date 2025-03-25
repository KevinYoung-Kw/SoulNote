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
    
    // 系统API配置
    this.systemConfig = {
      apiKey: process.env.SYSTEM_API_KEY || this.defaultConfig.apiKey,
      apiUrl: process.env.SYSTEM_API_URL || this.defaultConfig.apiUrl,
      models: {
        'qwen-turbo': { responseTime: 2000, features: { poetry: false, haiku: false } },
        'qwen-plus': { responseTime: 4000, features: { poetry: true, haiku: true } },
        'qwen-max': { responseTime: 6000, features: { poetry: true, haiku: true } }
      }
    };
    
    logger.info('AI_SERVICE', '初始化默认配置', {
      url: this.defaultConfig.apiUrl,
      model: this.defaultConfig.model,
      key_available: !!this.defaultConfig.apiKey,
      system_key_available: !!this.systemConfig.apiKey
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

    // 使用自定义API
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
    
    // 使用系统API
    if (headers['x-use-custom-api'] === 'false' && 
        headers['x-custom-api-key'] === 'system_key' && 
        headers['x-custom-api-url'] === 'system_end_point') {
      
      const model = headers['x-custom-api-model'] || 'qwen-turbo';
      
      const systemApiConfig = {
        apiKey: this.systemConfig.apiKey,
        apiUrl: this.systemConfig.apiUrl,
        model: model,
        isSystemApi: true,
        modelConfig: this.systemConfig.models[model] || {}
      };
      
      logger.info('AI_SERVICE', '使用系统API配置', {
        url: systemApiConfig.apiUrl,
        model: systemApiConfig.model,
        key_available: !!systemApiConfig.apiKey,
        features: systemApiConfig.modelConfig.features
      });
      
      return systemApiConfig;
    }

    // 使用默认配置
    logger.info('AI_SERVICE', '使用默认配置', {
      url: this.defaultConfig.apiUrl,
      model: this.defaultConfig.model,
      key_available: !!this.defaultConfig.apiKey
    });

    return this.defaultConfig;
  }

  /**
   * 验证内容是否有效
   * @param {string} content 生成的内容
   * @returns {boolean} 内容是否有效
   */
  validateContent(content) {
    if (!content) return false;
    
    // 移除<think>标签内容后检查剩余内容是否有效
    const processedContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    
    // 检查是否是默认内容（包含提示语）
    if (processedContent.startsWith('【生成失败】')) {
      logger.warn('AI_SERVICE', '内容生成失败，使用默认内容', {
        content_length: processedContent.length,
        is_default: true
      });
      return true; // 允许使用带提示的默认内容
    }
    
    // 只要有实际内容即可
    return processedContent.length > 0;
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
      
      // 检查系统API模型功能限制
      if (apiConfig.isSystemApi && apiConfig.modelConfig && apiConfig.modelConfig.features) {
        // 检查诗歌和俳句功能
        if (data.type === 'poetry' && !apiConfig.modelConfig.features.poetry) {
          throw new Error(`当前模型 ${apiConfig.model} 不支持诗歌创作，请升级到Plus或Max模型`);
        }
        
        if (data.type === 'haiku' && !apiConfig.modelConfig.features.haiku) {
          throw new Error(`当前模型 ${apiConfig.model} 不支持俳句创作，请升级到Plus或Max模型`);
        }
      }
      
      logger.info('AI_SERVICE', '开始生成笔记内容', {
        theme: data.theme,
        type: data.type,
        savageMode: data.savageMode,
        moodCount: Array.isArray(data.moods) ? data.moods.length : 0,
        useCustomApi: headers['x-use-custom-api'] === 'true',
        useSystemApi: apiConfig.isSystemApi === true,
        selectedModel: apiConfig.model
      });
      
      // 使用promptService处理请求
      const result = await promptService.generateNote(data, apiConfig);
      
      // 验证内容是否有效
      if (!this.validateContent(result.content)) {
        logger.warn('AI_SERVICE', '生成内容无效', {
          model: result.metadata.model,
          contentLength: result.content.length,
          hasThinkTag: result.content.includes('<think>'),
          rawContent: result.content.substring(0, 100) + '...'
        });
        
        // 返回带提示的默认内容
        result.content = '【生成失败】抱歉，当前服务繁忙，生成失败。这是默认的示例内容：\n\n点击下方"生成心语"按钮，开始您的心灵之旅...';
        result.metadata.isDefaultContent = true;
      }
      
      logger.info('AI_SERVICE', '笔记内容生成完成', {
        model: result.metadata.model,
        processingTime: result.metadata.generationTime,
        contentLength: result.content.length,
        isDefaultContent: result.metadata.isDefaultContent || false
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
      // 处理系统API测试
      if (settings.apiKey === 'system_key' && settings.apiUrl === 'system_end_point') {
        const model = settings.model || 'qwen-turbo';
        const modelConfig = this.systemConfig.models[model];
        
        logger.info('AI_SERVICE', '测试系统API连接', {
          model: model,
          features: modelConfig ? modelConfig.features : {}
        });
        
        return {
          success: true,
          message: '系统API连接测试成功！',
          model: model
        };
      }
      
      // 测试自定义API连接
      logger.info('AI_SERVICE', '测试自定义API连接', {
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
      
      // 如果是系统API，直接返回状态
      if (apiConfig.isSystemApi) {
        return {
          status: 'ok',
          message: '系统API服务正常',
          model: apiConfig.model,
          features: apiConfig.modelConfig.features || {}
        };
      }
      
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
      
      // 如果是系统API，直接返回预设的响应时间
      if (apiConfig.isSystemApi) {
        const modelName = model || apiConfig.model;
        const modelConfig = this.systemConfig.models[modelName];
        
        if (modelConfig && modelConfig.responseTime) {
          logger.debug('AI_SERVICE', '使用系统预设响应时间', { 
            model: modelName,
            time: modelConfig.responseTime
          });
          
          return { estimatedTime: modelConfig.responseTime };
        }
      }
      
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
  
  /**
   * 检查模型是否支持特定功能
   * @param {string} model 模型名称
   * @param {string} feature 功能名称
   * @returns {boolean} 是否支持
   */
  isFeatureSupported(model, feature) {
    // 检查系统模型功能支持
    if (this.systemConfig.models[model] && 
        this.systemConfig.models[model].features) {
      return !!this.systemConfig.models[model].features[feature];
    }
    
    // 默认情况下，假设支持所有功能
    return true;
  }
}

module.exports = new AiService();