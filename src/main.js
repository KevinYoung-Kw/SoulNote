import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css';
import './styles/dark-mode.css'; // 添加暗黑模式专用样式
import './styles/savage-mode.css'; // 添加毒舌模式专用样式
import logger from './utils/logger';
import { preloadAllImagesProgressively, getPreloadStatus } from './services/imagePreloader'; // 导入优化的图片预加载服务
import { checkStorageHealth, initStorage, getUserPreferences } from './services/storageService'; // 导入存储健康检查

// 初始化应用
const app = createApp(App);

// 从环境变量中读取调试模式设置
const isEnvDebug = import.meta.env.VITE_DEBUG_MODE == 'true';

// 设置日志记录器的调试模式
logger.setDebugMode(isEnvDebug);

// 使用新的渐进式预加载方法
preloadAllImagesProgressively()
  .then((results) => {
    // 预加载完成，不需要单独加载引导SVG，因为已经包含在渐进式加载中
    const loadedCount = results.length;
    const status = getPreloadStatus();
    logger.info('IMAGES', `图片预加载完成: ${loadedCount} 张图片已加载`, status);
  })
  .catch((error) => {
    // 即使预加载失败，也不应阻止应用启动
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
    logger.error('APP', '全局错误', { error: err.message, info, stack: err.stack });
    console.error('应用错误:', err);
};

// 添加未捕获的 Promise 错误处理
window.addEventListener('unhandledrejection', event => {
    logger.error('PROMISE', `Unhandled Promise Rejection: ${event.reason}`);
    console.error('Unhandled Promise Rejection:', event.reason);
});

// 在挂载之前检查并应用保存的样式模式
async function initStyles() {
  try {
    // 检查是否已经有保存的偏好设置
    const savedPrefs = await getUserPreferences();
    
    // 检查并应用暗黑模式
    if (savedPrefs && savedPrefs.theme == 'dark') {
      document.body.classList.add('dark-mode');
    }
    
    // 检查并应用毒舌模式
    if (savedPrefs && savedPrefs.savageMode == true) {
      // 将毒舌模式状态保存在localStorage中，用于快速恢复
      localStorage.setItem('soulnote_savage_mode', 'true');
      document.body.classList.add('savage-mode');
    }
  } catch (error) {
    logger.error('STYLES', '初始化样式失败', error);
  }
}

// 添加路由后置拦截器，确保在路由变化时快速应用毒舌模式样式
router.afterEach(() => {
  // 在每次路由变化后检查是否需要应用毒舌模式样式
  const isSavageMode = localStorage.getItem('soulnote_savage_mode') == 'true';
  if (isSavageMode) {
    // 确保立即应用样式，防止闪烁
    document.body.classList.add('savage-mode');
  } else {
    document.body.classList.remove('savage-mode');
  }
});

// 初始化样式然后挂载应用
initStyles().then(() => {
  app.use(router);
  app.mount('#app');
});

// 添加全局事件监听器，用于同步更新毒舌模式状态
document.addEventListener('preferences-updated', (event) => {
  if (event.detail && typeof event.detail.savageMode !== 'undefined') {
    // 更新localStorage中的毒舌模式状态
    if (event.detail.savageMode) {
      localStorage.setItem('soulnote_savage_mode', 'true');
    } else {
      localStorage.removeItem('soulnote_savage_mode');
    }
  }
});

// 为Vue应用提供全局日志访问
app.config.globalProperties.$logger = logger;

// 添加一个全局函数，用于更改调试模式（开发者可以在控制台使用）
window.toggleDebug = (enabled) => {
    logger.setDebugMode(typeof enabled == 'boolean' ? enabled : !logger.isDebugMode());
    console.log(`调试模式已${logger.isDebugMode() ? '启用' : '禁用'}`);
    return logger.isDebugMode();
};
