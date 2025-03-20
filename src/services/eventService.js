/**
 * eventService.js - 用户行为埋点与数据统计服务
 * 负责收集用户行为数据并发送到后端接口
 */

import axios from 'axios';
import { getFingerprintJS } from '../utils/fingerprint'; // 假设已有指纹识别工具

// API基础URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
// 是否为开发环境
const isDev = import.meta.env.MODE === 'development';
// 是否启用调试模式（在开发环境下不发送实际请求）
const DEBUG_MODE = isDev && !import.meta.env.VITE_FORCE_TRACKING;

// 定义埋点事件类型
export const EVENT_TYPES = {
  // 页面访问事件
  PAGE_VIEW: 'page_view',
  
  // 纸条相关事件
  NOTE_GENERATE: 'note_generate',
  NOTE_SAVE: 'note_save',
  NOTE_EXPORT: 'note_export',
  NOTE_SHARE: 'note_share',
  
  // 参数选择事件
  PARAM_SELECT: 'param_select',
  
  // 按钮点击事件
  BUTTON_CLICK: 'button_click',
  
  // 功能使用事件
  FEATURE_USE: 'feature_use',
};

// 事件埋点服务对象
const eventService = {
  // 用户指纹ID (异步获取)
  _fingerprintId: null,
  
  // 初始化用户指纹
  async init() {
    try {
      if (!this._fingerprintId) {
        const fp = await getFingerprintJS();
        const result = await fp.get();
        this._fingerprintId = result.visitorId;
        console.log('用户指纹初始化成功');
      }
    } catch (error) {
      console.error('用户指纹初始化失败:', error);
      // 降级使用随机ID
      this._fingerprintId = 'anonymous_' + Math.random().toString(36).substring(2, 15);
    }
  },
  
  // 获取用户指纹ID
  async getUserId() {
    if (!this._fingerprintId) {
      await this.init();
    }
    return this._fingerprintId;
  },
  
  // 跟踪事件的核心方法
  async trackEvent(eventType, eventData = {}) {
    try {
      const userId = await this.getUserId();
      
      // 构建事件数据
      const eventPayload = {
        eventType,
        userId,
        timestamp: new Date().toISOString(),
        data: eventData,
        userAgent: navigator.userAgent,
        // 可以添加其他通用数据
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        language: navigator.language,
      };
      
      // 如果处于调试模式，则只在控制台输出不发送请求
      if (DEBUG_MODE) {
        console.log(`[埋点模拟] ${eventType}:`, eventPayload);
        return true;
      }
      
      // 将事件数据发送到后端
      await axios.post(`${API_BASE_URL}/api/track`, eventPayload);
      
      if (isDev) {
        console.log(`[埋点] ${eventType}:`, eventData);
      }
      
      return true;
    } catch (error) {
      console.error(`[埋点] ${eventType} 失败:`, error);
      
      // 在开发环境显示更多错误信息
      if (isDev) {
        console.error('详细错误:', error);
      }
      
      // 在调试模式下，即使发生错误也返回成功
      return DEBUG_MODE;
    }
  },
  
  // 记录页面访问
  trackPageView(pageName, pageParams = {}) {
    return this.trackEvent(EVENT_TYPES.PAGE_VIEW, {
      pageName,
      path: window.location.pathname,
      ...pageParams
    });
  },
  
  // 记录纸条生成事件
  trackNoteGenerate(noteParams) {
    return this.trackEvent(EVENT_TYPES.NOTE_GENERATE, noteParams);
  },
  
  // 记录纸条保存事件
  trackNoteSave(noteId, noteContent) {
    return this.trackEvent(EVENT_TYPES.NOTE_SAVE, {
      noteId,
      contentLength: noteContent ? noteContent.length : 0
    });
  },
  
  // 记录纸条导出事件
  trackNoteExport(noteId, exportFormat) {
    return this.trackEvent(EVENT_TYPES.NOTE_EXPORT, {
      noteId,
      exportFormat
    });
  },
  
  // 记录纸条分享事件
  trackNoteShare(noteId, shareMethod) {
    return this.trackEvent(EVENT_TYPES.NOTE_SHARE, {
      noteId,
      shareMethod
    });
  },
  
  // 记录参数选择事件
  trackParamSelect(paramType, paramValue, isRandom = false) {
    return this.trackEvent(EVENT_TYPES.PARAM_SELECT, {
      paramType,
      paramValue,
      isRandom
    });
  },
  
  // 记录按钮点击事件
  trackButtonClick(buttonId, buttonText, pageContext) {
    return this.trackEvent(EVENT_TYPES.BUTTON_CLICK, {
      buttonId,
      buttonText,
      pageContext
    });
  },
  
  // 记录功能使用事件
  trackFeatureUse(featureName, featureParams = {}) {
    return this.trackEvent(EVENT_TYPES.FEATURE_USE, {
      featureName,
      ...featureParams
    });
  }
};

export default eventService; 