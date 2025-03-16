import axios from 'axios';
import { getApiSettings } from './storageService';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 系统默认API配置
const SYSTEM_API_CONFIG = {
  key: 'system_key',
  endpoint: 'system_end_point',
  models: {
    'qwen-turbo': { responseTime: 2000, features: { poetry: false, haiku: false } },
    'qwen-plus': { responseTime: 4000, features: { poetry: true, haiku: true } },
    'qwen-max': { responseTime: 6000, features: { poetry: true, haiku: true } },
    'deepseek-r1': { responseTime: 30000, features: { poetry: true, haiku: true } },
    'deepseek-v3': { responseTime: 20000, features: { poetry: true, haiku: true } }
  }
};

/**
 * 生成心灵纸条内容
 * @param {Object} params 生成参数
 * @returns {Promise<Object>} 包含生成内容的对象
 */
export async function generateNote(params) {
  try {
    const settings = await getApiSettings();
    const headers = {};
    
    // 处理API设置
    if (settings) {
      if (settings.useCustomAPI) {
        // 使用自定义API
        headers['x-custom-api-key'] = settings.apiKey;
        headers['x-custom-api-url'] = settings.apiUrl;
        headers['x-custom-api-model'] = settings.model;
        headers['x-use-custom-api'] = 'true';
        
        console.log('发送自定义API请求:', {
          useCustomAPI: true,
          model: settings.model,
          url: settings.apiUrl
        });
      } else {
        // 使用系统默认API
        headers['x-custom-api-key'] = SYSTEM_API_CONFIG.key;
        headers['x-custom-api-url'] = SYSTEM_API_CONFIG.endpoint;
        headers['x-custom-api-model'] = settings.model || 'qwen-turbo';
        headers['x-use-custom-api'] = 'false';
        
        // 检查当前模型是否支持请求的功能
        const modelConfig = SYSTEM_API_CONFIG.models[settings.model || 'qwen-turbo'];
        if (modelConfig && params.type) {
          // 如果请求的是诗歌或俳句，但当前模型不支持，则返回错误
          if ((params.type === 'poetry' || params.type === 'haiku') && 
              !modelConfig.features[params.type]) {
            throw new Error(`当前模型 ${settings.model} 不支持${params.type === 'poetry' ? '诗歌' : '俳句'}创作，请升级到Plus或Max模型`);
          }
        }
        
        console.log('发送系统API请求:', {
          useCustomAPI: false,
          model: settings.model || 'qwen-turbo'
        });
      }
    } else {
      // 没有设置，使用系统默认API和默认模型
      headers['x-custom-api-key'] = SYSTEM_API_CONFIG.key;
      headers['x-custom-api-url'] = SYSTEM_API_CONFIG.endpoint;
      headers['x-custom-api-model'] = 'qwen-turbo';
      headers['x-use-custom-api'] = 'false';
      
      console.log('使用默认系统API设置');
    }

    const response = await axios.post(`${API_BASE_URL}/note/generate`, params, { headers });
    return response.data;
  } catch (error) {
    console.error('生成笔记失败:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message || '内容生成失败，请稍后再试');
  }
}

/**
 * 测试API连接
 * @param {Object} settings API设置
 * @returns {Promise<Object>} 测试结果
 */
export async function testApiConnection(settings) {
  try {
    console.log('测试API连接:', {
      model: settings.model,
      url: settings.apiUrl
    });

    const response = await axios.post(`${API_BASE_URL}/note/test-connection`, {
      apiKey: settings.apiKey,
      apiUrl: settings.apiUrl,
      model: settings.model
    });
    
    return {
      success: true,
      message: response.data.message || 'API连接测试成功！',
      model: response.data.model || settings.model
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || '连接测试失败：服务器错误');
  }
}

/**
 * 获取API状态
 * @returns {Promise<Object>} API状态信息
 */
export async function getApiStatus() {
  try {
    const settings = await getApiSettings();
    const headers = {};
    
    if (settings) {
      if (settings.useCustomAPI) {
        headers['x-custom-api-key'] = settings.apiKey;
        headers['x-custom-api-url'] = settings.apiUrl;
        headers['x-custom-api-model'] = settings.model;
        headers['x-use-custom-api'] = 'true';
      } else {
        // 使用系统默认API
        headers['x-custom-api-key'] = SYSTEM_API_CONFIG.key;
        headers['x-custom-api-url'] = SYSTEM_API_CONFIG.endpoint;
        headers['x-custom-api-model'] = settings.model || 'qwen-turbo';
        headers['x-use-custom-api'] = 'false';
      }
    } else {
      // 没有设置，使用系统默认API
      headers['x-custom-api-key'] = SYSTEM_API_CONFIG.key;
      headers['x-custom-api-url'] = SYSTEM_API_CONFIG.endpoint;
      headers['x-custom-api-model'] = 'qwen-turbo';
      headers['x-use-custom-api'] = 'false';
    }

    const response = await axios.get(`${API_BASE_URL}/note/status`, { headers });
    return response.data;
  } catch (error) {
    console.error('获取API状态失败:', error);
    return { status: 'error', message: '无法连接到API服务' };
  }
}

/**
 * 获取估计的API响应时间
 * @param {string} model 模型名称（可选）
 * @returns {Promise<number>} 估计响应时间(毫秒)
 */
export async function getEstimatedResponseTime(model = '') {
  try {
    const settings = await getApiSettings();
    
    // 如果使用系统默认API，直接返回预设的响应时间
    if (!settings || !settings.useCustomAPI) {
      const modelName = model || (settings ? settings.model : 'qwen-turbo') || 'qwen-turbo';
      const modelConfig = SYSTEM_API_CONFIG.models[modelName];
      
      if (modelConfig) {
        console.log(`使用系统预设响应时间: ${modelConfig.responseTime}ms (${modelName})`);
        return modelConfig.responseTime;
      }
      
      // 如果没有找到模型配置，使用默认值
      return 3000;
    }
    
    // 使用自定义API，从服务器获取估计时间
    const headers = {
      'x-custom-api-key': settings.apiKey,
      'x-custom-api-url': settings.apiUrl,
      'x-custom-api-model': settings.model,
      'x-use-custom-api': 'true'
    };
    
    console.log('获取响应时间估计:', {
      useCustomAPI: true,
      model: settings.model
    });

    const response = await axios.get(`${API_BASE_URL}/note/estimated-time`, {
      headers,
      params: { model }
    });
    return response.data.estimatedTime;
  } catch (error) {
    console.warn('获取估计响应时间失败，使用默认值:', error);
    return 3000;
  }
}

/**
 * 检查当前模型是否支持特定功能
 * @param {string} feature 功能名称 (如 'poetry', 'haiku')
 * @returns {Promise<boolean>} 是否支持该功能
 */
export async function isFeatureSupported(feature) {
  try {
    const settings = await getApiSettings();
    
    // 如果使用系统默认API，检查模型是否支持该功能
    if (!settings || !settings.useCustomAPI) {
      const modelName = settings ? settings.model : 'qwen-turbo';
      const modelConfig = SYSTEM_API_CONFIG.models[modelName];
      
      if (modelConfig && modelConfig.features) {
        return !!modelConfig.features[feature];
      }
      
      // 默认情况下，假设自定义API支持所有功能
      return true;
    }
    
    // 对于自定义API，假设支持所有功能
    return true;
  } catch (error) {
    console.warn('检查功能支持失败:', error);
    return true; // 默认允许，避免阻止用户使用功能
  }
}

/**
 * 为兼容性提供generateNoteContent函数
 * @deprecated 使用 generateNote 代替
 * @param {Object} params 生成参数
 * @returns {Promise<string>} 生成的内容
 */
export async function generateNoteContent(params) {
  console.warn('generateNoteContent 函数已废弃，请使用 generateNote 代替');
  try {
    const result = await generateNote(params);
    return result.data.content;
  } catch (error) {
    throw error;
  }
}