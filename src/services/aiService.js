import axios from 'axios';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 生成心灵纸条内容
 * @param {Object} params 生成参数
 * @returns {Promise<Object>} 包含生成内容的对象
 */
export async function generateNote(params) {
  try {
    const response = await axios.post(`${API_BASE_URL}/note/generate`, params);
    return response.data;
  } catch (error) {
    console.error('生成笔记失败:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || '内容生成失败，请稍后再试');
  }
}

/**
 * 获取API状态
 * @returns {Promise<Object>} API状态信息
 */
export async function getApiStatus() {
  try {
    const response = await axios.get(`${API_BASE_URL}/note/status`);
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
    // 尝试从API获取响应时间估计
    const response = await axios.get(`${API_BASE_URL}/note/estimated-time`, {
      params: { model }
    });
    return response.data.estimatedTime;
  } catch (error) {
    console.warn('获取估计响应时间失败，使用默认值:', error);
    // 如果API调用失败，返回默认值
    return 3000; // 默认3秒
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