import axios from 'axios';
import { getApiSettings } from './storageService';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 生成心灵纸条内容
 * @param {Object} params 生成参数
 * @returns {Promise<Object>} 包含生成内容的对象
 */
export async function generateNote(params) {
  try {
    const settings = await getApiSettings();
    const headers = {};
    
    // 如果使用自定义API，添加设置到请求头
    if (settings?.useCustomAPI) {
      headers['x-custom-api-key'] = settings.apiKey;
      headers['x-custom-api-url'] = settings.apiUrl;
      headers['x-custom-api-model'] = settings.model;
      headers['x-use-custom-api'] = 'true';
      
      console.log('发送自定义API请求:', {
        useCustomAPI: true,
        model: settings.model,
        url: settings.apiUrl
      });
    }

    const response = await axios.post(`${API_BASE_URL}/note/generate`, params, { headers });
    return response.data;
  } catch (error) {
    console.error('生成笔记失败:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || '内容生成失败，请稍后再试');
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
    
    if (settings?.useCustomAPI) {
      headers['x-custom-api-key'] = settings.apiKey;
      headers['x-custom-api-url'] = settings.apiUrl;
      headers['x-custom-api-model'] = settings.model;
      headers['x-use-custom-api'] = 'true';
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
    const headers = {};
    
    if (settings?.useCustomAPI) {
      headers['x-custom-api-key'] = settings.apiKey;
      headers['x-custom-api-url'] = settings.apiUrl;
      headers['x-custom-api-model'] = settings.model;
      headers['x-use-custom-api'] = 'true';
      
      console.log('获取响应时间估计:', {
        useCustomAPI: true,
        model: settings.model
      });
    }

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