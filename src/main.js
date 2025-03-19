import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css';
import './styles/dark-mode.css'; // 添加暗黑模式专用样式
import './styles/savage-mode.css'; // 添加毒舌模式专用样式
import logger from './utils/logger';
import { preloadCriticalImages } from './services/imagePreloader'; // 导入图片预加载服务
import { checkStorageHealth, initStorage } from './services/storageService'; // 导入存储健康检查

// 初始化应用
const app = createApp(App);

// 从环境变量中读取调试模式设置
const isEnvDebug = import.meta.env.VITE_DEBUG_MODE === 'true';

// 设置日志记录器的调试模式
logger.setDebugMode(isEnvDebug);

// 预加载关键图片
preloadCriticalImages()
  .then((results) => {
    const loadedCount = results.filter(r => r.status === 'fulfilled').length;
    logger.info('IMAGES', `预加载完成: ${loadedCount}/${results.length} 张图片已加载`);
  })
  .catch((error) => {
    logger.warn('IMAGES', `图片预加载出错: ${error.message}`);
  });

// 初始化存储并检查健康状态
initStorage().then(initialized => {
  if (initialized) {
    logger.info('STORAGE', '存储初始化成功');
  } else {
    logger.warn('STORAGE', '存储初始化失败');
  }
  
  return checkStorageHealth();
}).then(health => {
  const isIndexedDBAvailable = health.indexedDB.available && health.indexedDB.writable;
  const isLocalStorageAvailable = health.localStorage.available && health.localStorage.writable;
  logger.info('STORAGE', `存储状态：IndexedDB=${isIndexedDBAvailable ? '可用' : '不可用'}, localStorage=${isLocalStorageAvailable ? '可用' : '不可用'}`);
  
  if (!isIndexedDBAvailable && !isLocalStorageAvailable) {
    logger.error('STORAGE', '所有存储机制均不可用，应用可能无法正常工作');
    alert('警告：存储不可用，应用可能无法保存数据。请确保您的浏览器允许本站点使用存储功能。');
  }
}).catch(error => {
  logger.error('STORAGE', '存储健康检查失败:', error);
});

if (isEnvDebug) {
    logger.info('SYSTEM', '调试模式已启用，环境变量VITE_DEBUG_MODE=' + import.meta.env.VITE_DEBUG_MODE);
} else {
    // 即使在非调试模式下，这条不会显示，因为info级别日志不会输出
    logger.info('SYSTEM', '调试模式已禁用');
    
    // 这条会显示，因为是错误日志
    console.log('Debug mode disabled');
}

// 添加全局错误处理
app.config.errorHandler = (err, vm, info) => {
    logger.error('VUE', `Error: ${err.toString()}\nInfo: ${info}`);
    console.error('Vue Error:', err);
};

// 添加未捕获的 Promise 错误处理
window.addEventListener('unhandledrejection', event => {
    logger.error('PROMISE', `Unhandled Promise Rejection: ${event.reason}`);
    console.error('Unhandled Promise Rejection:', event.reason);
});


app.use(router);
app.mount('#app');

// 为Vue应用提供全局日志访问
app.config.globalProperties.$logger = logger;

// 添加一个全局函数，用于更改调试模式（开发者可以在控制台使用）
window.toggleDebug = (enabled) => {
    logger.setDebugMode(typeof enabled === 'boolean' ? enabled : !logger.isDebugMode());
    console.log(`调试模式已${logger.isDebugMode() ? '启用' : '禁用'}`);
    return logger.isDebugMode();
};
