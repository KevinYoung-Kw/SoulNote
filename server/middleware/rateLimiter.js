/**
 * rateLimiter.js - 速率限制中间件
 * 提供防止API滥用的访问频率限制功能
 */

// 存储IP访问记录的缓存
// 格式: { [ip+route]: { count: 0, resetTime: timestamp } }
const ipRequestCache = {};

/**
 * 清理过期的IP记录
 * 定期清理过期的IP访问记录，释放内存
 */
const cleanupExpiredRecords = () => {
  const now = Date.now();
  Object.keys(ipRequestCache).forEach(key => {
    if (ipRequestCache[key].resetTime < now) {
      delete ipRequestCache[key];
    }
  });
};

// 每小时清理一次过期记录
setInterval(cleanupExpiredRecords, 60 * 60 * 1000);

/**
 * 创建速率限制中间件
 * @param {number} maxRequests - 在时间窗口内允许的最大请求数
 * @param {number} windowSec - 时间窗口大小，单位为秒
 * @returns {Function} Express中间件函数
 */
exports.rateLimiter = (maxRequests, windowSec) => {
  return (req, res, next) => {
    // 获取客户端IP
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.connection.socket.remoteAddress;
    
    // 创建唯一键以区分不同IP对不同路由的访问
    const key = `${ip}-${req.originalUrl}`;
    const now = Date.now();
    
    // 如果是新的IP或者已过期，重置计数器
    if (!ipRequestCache[key] || ipRequestCache[key].resetTime < now) {
      ipRequestCache[key] = {
        count: 1,
        resetTime: now + (windowSec * 1000)
      };
      return next();
    }
    
    // 增加计数器
    ipRequestCache[key].count += 1;
    
    // 如果超过限制，返回429状态码
    if (ipRequestCache[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((ipRequestCache[key].resetTime - now) / 1000)
      });
    }
    
    // 未超过限制，继续处理请求
    next();
  };
};
