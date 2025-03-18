/**
 * 前端日志工具 - 提供统一的日志记录功能
 */
import ENV from './envService';

class Logger {
  constructor() {
    this.debugMode = this.checkDebugMode();
    
    // 监听localStorage变化
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'debug') {
          this.debugMode = event.newValue === 'true';
        }
      }, { passive: true });
    }
  }
  
  /**
   * 检查本地存储或者环境变量中是否启用了调试模式
   * @returns {boolean} 是否启用调试模式
   */
  checkDebugMode() {
    // 优先使用localStorage存储的值
    if (typeof localStorage !== 'undefined') {
      const localDebug = localStorage.getItem('debug');
      if (localDebug !== null) {
        return localDebug === 'true';
      }
    }
    
    // 其次使用环境变量
    return ENV.DEBUG_MODE;
  }
  
  /**
   * 记录信息日志
   * @param {string} type 日志类型
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  info(type, message, data) {
    if (this.debugMode) {
      this._log('INFO', type, message, data);
    }
  }
  
  /**
   * 记录警告日志
   * @param {string} type 日志类型
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  warn(type, message, data) {
    this._log('WARN', type, message, data);
  }
  
  /**
   * 记录错误日志
   * @param {string} type 日志类型
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  error(type, message, data) {
    this._log('ERROR', type, message, data);
  }
  
  /**
   * 内部日志记录方法
   * @private
   */
  _log(level, type, message, data) {
    // 对于非INFO级别的日志，或者处于调试模式时，才输出日志
    if (level !== 'INFO' || this.debugMode) {
      const timestamp = new Date().toISOString();
      
      // 创建带颜色的样式
      let style = 'color: white; padding: 2px 5px; border-radius: 3px;';
      let bgColor;
      
      switch (level) {
        case 'INFO':
          bgColor = 'background-color: #2196F3;'; // 蓝色
          break;
        case 'WARN':
          bgColor = 'background-color: #FF9800;'; // 橙色
          break;
        case 'ERROR':
          bgColor = 'background-color: #F44336;'; // 红色
          break;
        default:
          bgColor = 'background-color: #607D8B;'; // 灰色
      }
      
      // 控制台输出格式化
      console.log(
        `%c${level}%c [${timestamp.split('T')[1].split('.')[0]}] [${type}] ${message}`, 
        style + bgColor, 
        'color: inherit'
      );
      
      if (data) {
        console.log(data);
      }
    }
  }
  
  /**
   * 设置调试模式
   * @param {boolean} enabled 是否启用调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug', enabled.toString());
    }
  }
  
  /**
   * 获取当前调试模式状态
   * @returns {boolean} 调试模式是否启用
   */
  isDebugMode() {
    return this.debugMode;
  }
  
  /**
   * 强制重新检查调试状态
   * 在应用配置变化后调用此方法
   */
  refreshDebugMode() {
    this.debugMode = this.checkDebugMode();
    return this.debugMode;
  }
}

// 导出单例
export default new Logger();
