/**
 * 环境变量服务 - 统一管理应用程序环境变量
 * 使用vite.config.js中定义的全局常量，这些常量在构建时会被直接替换为实际值
 */

// 确定当前环境
const ENV = {
  // 生产环境标志 - 使用全局常量
  PROD: typeof __IS_PROD__ !== 'undefined' ? __IS_PROD__ : false,
  // 开发环境标志
  DEV: typeof __IS_DEV__ !== 'undefined' ? __IS_DEV__ : true,
  // API基础URL
  API_BASE_URL: typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : '/api',
  // API密钥
  API_KEY: typeof __API_KEY__ !== 'undefined' ? __API_KEY__ : 'default_dev_key',
  // 调试模式
  DEBUG_MODE: typeof __DEBUG_MODE__ !== 'undefined' ? __DEBUG_MODE__ : false
};

// 如果通过URL参数强制启用调试模式
if (typeof window !== 'undefined') {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      ENV.DEBUG_MODE = urlParams.get('debug') === 'true';
    }
  } catch (e) {
    // 忽略错误，确保页面不会因为URL参数解析错误而崩溃
    console.error('Failed to parse URL parameters:', e);
  }
}

// 开发环境下打印环境信息
if (!ENV.PROD) {
  console.log('Environment:', ENV);
}

export default ENV; 