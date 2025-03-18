import { getUserPreferences, saveUserPreferences } from './storageService';
import axios from 'axios';
import { APP_VERSION } from '../config/version';

// 获取API基础URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

/**
 * 社群服务 - 管理用户社群相关功能
 */
export const communityService = {
  /**
   * 获取社群配置
   * @returns {Promise<Object>} 社群配置信息
   */
  async getConfig() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/note/config`);
      return response.data.config || {};
    } catch (error) {
      console.error('获取社群配置失败:', error);
      // 返回默认配置
      return {
        community: {
          enable: true,
          qrcode: '/assets/community-qr.png',
          title: '星语心笺社群',
          description: '加入社群获取最新动态',
          showAfterGenerations: 3,
          showForNewUsers: true
        }
      };
    }
  },

  /**
   * 检查是否应该显示社群提示
   * @returns {Promise<Object>} 显示状态及相关信息
   */
  async shouldShowPrompt() {
    // 获取用户偏好和社群配置
    const [userPrefs, appConfig] = await Promise.all([
      getUserPreferences(),
      this.getConfig()
    ]);
    
    // 如果社群功能未启用，直接返回false
    if (!appConfig.community || !appConfig.community.enable) {
      return { show: false };
    }
    
    // 获取当前版本号
    const currentVersion = APP_VERSION;
    
    // 如果用户选择了不再提醒，且版本号一致（即当前版本已选择不再提醒），则尊重其选择
    if (userPrefs?.neverRemindCommunity && userPrefs?.lastSeenVersion === currentVersion) {
      return { show: false };
    }
    
    // 如果设置了下次提醒时间，检查是否已到时间
    if (userPrefs?.communityRemindAt) {
      const nextRemindTime = new Date(userPrefs.communityRemindAt);
      if (nextRemindTime > new Date()) {
        return { show: false };
      }
    }
    
    // 获取随机提示信息
    const prompts = appConfig.community.prompts || [];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    // 检查是否是首次登录 - 更具体地检查首次登录
    // 确保对于新用户，即使他们的 isFirstLogin 设置为 false 但没有设置 neverRemindCommunity 和 communityRemindAt，也视为首次登录
    if (userPrefs?.isFirstLogin || 
        (userPrefs && !userPrefs.communityShownBefore)) {
      
      // 标记已非首次登录（但保留版本号不变，由checkUpdatePrompt处理）
      await saveUserPreferences({
        ...userPrefs,
        isFirstLogin: false,
        communityShownBefore: true, // 添加新标记表示社群弹窗已显示过
        lastSeenVersion: currentVersion // 记录当前版本号
      });
      
      // 首次登录用户显示社群二维码
      return {
        show: true,
        reason: 'first_login',
        title: '欢迎使用星语心笺',
        message: '感谢您选择星语心笺！加入我们的社群，获取使用指南和最新功能通知。',
        qrcodeUrl: appConfig.community.qrcode,
        activeTab: 'community'  // 首次登录默认显示社群tab
      };
    }
    
    // 检查生成次数是否达到阈值
    const generateCount = userPrefs?.generateCount || 0;
    const userIsNew = !userPrefs || generateCount < 2;
    
    if (userIsNew && appConfig.community.showForNewUsers) {
      // 对于新用户，显示欢迎加入消息
      return {
        show: true,
        reason: 'new_user',
        title: appConfig.community.title,
        message: '欢迎使用星语心笺！加入社群获取使用指南和最新功能通知～',
        qrcodeUrl: appConfig.community.qrcode,
        activeTab: 'community'  // 新用户默认显示社群tab
      };
    } else if (generateCount >= (appConfig.community.showAfterGenerations || 3)) {
      // 达到生成次数阈值
      return {
        show: true,
        reason: 'generation_threshold',
        title: appConfig.community.title,
        message: randomPrompt || '喜欢这个应用？加入社群一起交流～',
        qrcodeUrl: appConfig.community.qrcode,
        activeTab: 'community'  // 根据生成次数显示的弹窗默认显示社群tab
      };
    }
    
    // 默认不显示
    return { show: false };
  },
  
// 修改recordGeneration函数

  async recordGeneration() {
    try {
      const userPrefs = await getUserPreferences();
      const generateCount = (userPrefs?.generateCount || 0) + 1;
      
      // 保存本地记录
      await saveUserPreferences({
        ...userPrefs,
        generateCount
      });
      
      // 向后端报告生成事件
      try {
        await axios.post(`${API_BASE_URL}/api/record-generation`);
      } catch (error) {
        console.error('记录生成事件到服务器失败:', error);
        // 失败时不阻止用户操作，静默失败
      }
      
      return generateCount;
    } catch (error) {
      console.error('记录生成次数失败:', error);
      return 0;
    }
  },
  
  /**
   * 检查是否应在更新后提示
   * @param {string} currentVersion 当前版本
   * @returns {Promise<Object>} 显示状态及相关信息
   */
  async checkUpdatePrompt(currentVersion) {
    const userPrefs = await getUserPreferences();
    const appConfig = await this.getConfig();
    
    // 初始化版本信息 - 避免用户在注册时就直接设置了lastSeenVersion
    // 如果是首次登录的用户或没有设置neverRemindCommunity，强制显示弹窗
    let forceShow = false;
    
    // 获取上一次版本信息
    let lastVersion = userPrefs?.lastSeenVersion || '0.0.0';
    
    // 确认是否应该强制显示弹窗
    // 如果是首次登录或从未显示过弹窗，则强制显示
    if (userPrefs?.isFirstLogin === true || 
        (userPrefs && !userPrefs.communityShownBefore)) {
      forceShow = true;
    }

    // 版本比较函数
    const isNewerVersion = (current, last) => {
      if (!last || last === '0.0.0') return true;
      
      const currentParts = current.split('.').map(Number);
      const lastParts = last.split('.').map(Number);
      
      for (let i = 0; i < 3; i++) {
        if (currentParts[i] > lastParts[i]) return true;
        if (currentParts[i] < lastParts[i]) return false;
      }
      
      return false; // 版本相同
    };
    
    // 检查版本是否更新或是否需要强制显示
    if (isNewerVersion(currentVersion, lastVersion) || forceShow) {
      // 保存当前版本
      await saveUserPreferences({
        ...userPrefs,
        lastSeenVersion: currentVersion,
        isFirstLogin: false, // 确保非首次登录标记被设置
        communityShownBefore: true, // 添加记录表示社群弹窗已显示过
        neverRemindCommunity: false // 重要修改：新版本时重置"不再提醒"标记
      });
      
      // 如果不是首次登录（有上一个版本记录）则显示更新提示
      // 否则显示欢迎提示
      if (lastVersion !== '0.0.0' && !forceShow && appConfig.community?.showAfterUpdate) {
        // 版本更新弹窗
        return {
          show: true,
          reason: 'version_update',
          title: '星语心笺已更新',
          message: `版本${currentVersion}已发布，查看更新内容了解新功能！`,
          qrcodeUrl: appConfig.community?.qrcode,
          activeTab: 'updates'  // 版本更新默认显示更新日志tab
        };
      } else {
        // 首次使用弹窗
        return {
          show: true,
          reason: 'first_login',
          title: '欢迎使用星语心笺',
          message: '感谢您选择星语心笺！加入我们的社群，获取使用指南和最新功能通知。',
          qrcodeUrl: appConfig.community?.qrcode,
          activeTab: 'community'  // 首次登录默认显示社群tab
        };
      }
    }
    
    return { show: false };
  }
};