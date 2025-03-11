import { getUserPreferences, saveUserPreferences } from './storageService';
import axios from 'axios';

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
    
    // 如果用户选择了永不提醒，尊重其选择
    if (userPrefs?.neverRemindCommunity) {
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
        qrcodeUrl: appConfig.community.qrcode
      };
    } else if (generateCount >= (appConfig.community.showAfterGenerations || 3)) {
      // 达到生成次数阈值
      return {
        show: true,
        reason: 'generation_threshold',
        title: appConfig.community.title,
        message: randomPrompt || '喜欢这个应用？加入社群一起交流～',
        qrcodeUrl: appConfig.community.qrcode
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
    
    // 如果从未记录版本或版本不同，提示更新
    const lastVersion = userPrefs?.lastSeenVersion || '0.0.0';
    
    if (lastVersion !== currentVersion && appConfig.community?.showAfterUpdate) {
      // 保存当前版本
      await saveUserPreferences({
        ...userPrefs,
        lastSeenVersion: currentVersion
      });
      
      return {
        show: true,
        reason: 'version_update',
        title: '星语心笺已更新',
        message: `版本${currentVersion}已发布，加入社群了解更新内容和使用技巧！`,
        qrcodeUrl: appConfig.community?.qrcode
      };
    }
    
    return { show: false };
  }
};