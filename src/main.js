import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css';
import './styles/dark-mode.css'; // 添加暗黑模式专用样式
import logger from './utils/logger';

// 初始化应用
const app = createApp(App);

// 从环境变量中读取调试模式设置
const isEnvDebug = import.meta.env.VITE_DEBUG_MODE === 'true';

// 设置日志记录器的调试模式
logger.setDebugMode(isEnvDebug);

if (isEnvDebug) {
    logger.info('SYSTEM', '调试模式已启用，环境变量VITE_DEBUG_MODE=' + import.meta.env.VITE_DEBUG_MODE);
} else {
    // 即使在非调试模式下，这条不会显示，因为info级别日志不会输出
    logger.info('SYSTEM', '调试模式已禁用');
    
    // 这条会显示，因为是错误日志
    console.log('Debug mode disabled');
}

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
