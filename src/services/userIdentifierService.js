/**
 * UserIdentifierService
 * 
 * 提供用户标识符生成和管理功能，用于无感分用户存储数据
 * 使用以下多个因素生成唯一标识符：
 * 1. 浏览器指纹（如果可用）
 * 2. 随机生成的ID (存储在localStorage中)
 * 3. 设备信息
 */

// 尝试导入FingerprintJS，如果不可用则使用降级方案
let FingerprintJS;
try {
  // 优先检查FingerprintJS是否在全局范围内可用
  if (typeof window !== 'undefined' && window.FingerprintJS) {
    FingerprintJS = window.FingerprintJS;
  } else {
    // 尝试动态导入，避免阻塞
    const dynamicImport = async () => {
      try {
        return await import('@fingerprintjs/fingerprintjs');
      } catch (e) {
        // 失败时静默处理，不打印警告
        return null;
      }
    };
    
    // 设置为null，generateUserId会处理降级逻辑
    FingerprintJS = null;
    
    // 在后台尝试加载
    dynamicImport().then(module => {
      if (module) {
        FingerprintJS = module.default;
      }
    });
  }
} catch (e) {
  // 静默失败，不显示警告
  FingerprintJS = null;
}

// 存储密钥
const USER_ID_KEY = 'soul-note-user-id';
const STORAGE_PREFIX = 'soul-note-user-';

// 初始化 FingerprintJS
let fpPromise = null;

/**
 * 初始化浏览器指纹
 */
function initFingerprint() {
  if (!fpPromise && FingerprintJS) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

/**
 * 获取或创建用户ID
 * 优先从localStorage获取，无则创建新ID
 */
async function getOrCreateUserId() {
  // 检查localStorage中是否有已存储的ID
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // 如果没有，创建新的用户ID
    userId = await generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * 生成用户ID
 * 结合浏览器指纹（如果可用）和随机数生成唯一标识符
 */
async function generateUserId() {
  try {
    let fingerprint = '';
    
    // 如果FingerprintJS可用，则获取浏览器指纹
    if (FingerprintJS) {
      const fp = await initFingerprint();
      const result = await fp.get();
      fingerprint = result.visitorId + '-';
    }
    
    // 生成随机数
    const randomPart = Math.random().toString(36).substring(2, 15);
    
    // 获取当前时间戳
    const timestamp = Date.now().toString(36);
    
    // 收集额外的浏览器信息（简单版本）
    const browserInfo = getSimpleBrowserInfo();
    
    // 组合生成用户ID
    return `${fingerprint}${randomPart}-${timestamp}-${browserInfo}`;
  } catch (error) {
    console.error('生成用户ID失败:', error);
    
    // 降级方案: 仅使用随机数和时间戳
    const fallbackId = `fallback-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;
    return fallbackId;
  }
}

/**
 * 获取简单的浏览器信息
 * @returns {string} 简单的浏览器标识
 */
function getSimpleBrowserInfo() {
  const { userAgent } = navigator;
  let browserHash = 0;
  
  // 对userAgent进行简单hash
  for (let i = 0; i < userAgent.length; i++) {
    browserHash = ((browserHash << 5) - browserHash) + userAgent.charCodeAt(i);
    browserHash |= 0; // Convert to 32bit integer
  }
  
  return browserHash.toString(36);
}

/**
 * 获取用户特定的存储键名
 * @param {string} key 原始键名
 * @returns {Promise<string>} 用户专属键名
 */
async function getUserStorageKey(key) {
  const userId = await getOrCreateUserId();
  return `${STORAGE_PREFIX}${userId}-${key}`;
}

/**
 * 重置用户标识符
 * 删除当前用户ID并清除相关存储
 * @returns {Promise<boolean>} 是否重置成功
 */
async function resetUserId() {
  try {
    // 获取当前用户ID
    const currentUserId = localStorage.getItem(USER_ID_KEY);
    
    if (currentUserId) {
      // 清除所有以该用户ID为前缀的存储项
      const userPrefix = `${STORAGE_PREFIX}${currentUserId}`;
      
      // 遍历所有localStorage项
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(userPrefix)) {
          localStorage.removeItem(key);
        }
      }
    }
    
    // 删除用户ID本身
    localStorage.removeItem(USER_ID_KEY);
    
    return true;
  } catch (error) {
    console.error('重置用户ID失败:', error);
    return false;
  }
}

export default {
  getOrCreateUserId,
  getUserStorageKey,
  resetUserId  // 添加重置功能到导出
};
