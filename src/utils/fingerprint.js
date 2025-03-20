/**
 * fingerprint.js - 浏览器指纹识别工具
 * 用于在不登录的情况下识别用户，基于FingerprintJS实现
 * 增加IP地址识别作为补充，提高用户识别准确率
 */

// FingerprintJS的延迟加载实现
let fpPromise = null;
let cachedIpAddress = null;

/**
 * 获取FingerprintJS实例
 * 使用懒加载方式以减少初始加载时间
 */
export async function getFingerprintJS() {
  if (fpPromise) return fpPromise;
  
  try {
    // 动态导入FingerprintJS
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    fpPromise = FingerprintJS.default.load();
    return fpPromise;
  } catch (error) {
    console.error('加载FingerprintJS失败:', error);
    throw error;
  }
}

/**
 * 获取用户IP地址
 * 通过第三方API服务获取
 * @returns {Promise<string>} 用户IP地址
 */
export async function getIpAddress() {
  // 如果已缓存IP地址，直接返回
  if (cachedIpAddress) return cachedIpAddress;
  
  try {
    // 使用可靠的IP获取服务
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    cachedIpAddress = data.ip;
    return cachedIpAddress;
  } catch (error) {
    console.error('获取IP地址失败:', error);
    // 尝试备用服务
    try {
      const backupResponse = await fetch('https://api.db-ip.com/v2/free/self');
      const backupData = await backupResponse.json();
      cachedIpAddress = backupData.ipAddress;
      return cachedIpAddress;
    } catch (backupError) {
      console.error('备用IP获取服务也失败:', backupError);
      return null;
    }
  }
}

/**
 * 获取增强版设备指纹ID
 * 结合设备指纹和IP地址，提高识别准确性
 * @returns {Promise<{visitorId: string, ipAddress: string, combinedId: string}>} 增强版指纹信息
 */
export async function getEnhancedVisitorId() {
  try {
    // 并行获取设备指纹和IP地址
    const [fp, ipAddress] = await Promise.all([
      getFingerprintJS().then(fp => fp.get()),
      getIpAddress()
    ]);
    
    const visitorId = fp.visitorId;
    
    // 组合指纹和IP创建增强版ID
    // 如果IP获取失败，仍然使用原始指纹
    const combinedId = ipAddress 
      ? `${visitorId.substring(0, 8)}_${ipAddress.replace(/\./g, '_')}`
      : visitorId;
    
    return {
      visitorId,
      ipAddress,
      combinedId
    };
  } catch (error) {
    console.error('获取增强版设备指纹失败:', error);
    // 降级方案：使用随机ID
    const fallbackId = 'anonymous_' + Math.random().toString(36).substring(2, 15);
    return {
      visitorId: fallbackId,
      ipAddress: null,
      combinedId: fallbackId
    };
  }
}

/**
 * 获取设备指纹ID
 * @returns {Promise<string>} 设备指纹ID
 * @deprecated 使用 getEnhancedVisitorId 代替
 */
export async function getVisitorId() {
  try {
    const fp = await getFingerprintJS();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('获取设备指纹失败:', error);
    // 降级方案：使用随机ID
    return 'anonymous_' + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * 获取设备和浏览器信息
 * 用于数据分析和统计
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: window.screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
  };
} 