/**
 * auth.js - 身份验证中间件
 * 提供管理员权限验证和访问控制功能
 */

/**
 * 验证管理员密钥是否正确
 * @param {string} key - 提供的管理员密钥
 * @returns {boolean} 密钥是否有效
 */
exports.validateAdminKey = (key) => {
  if (!key) return false;
  return key === process.env.ADMIN_KEY;
};

/**
 * 管理员权限验证中间件
 * 验证请求是否包含有效的管理员密钥
 */
exports.requireAdmin = (req, res, next) => {
  const adminKey = req.query.key || req.body.adminKey;
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: '未授权访问，需要管理员权限'
    });
  }
  
  // 验证通过，继续执行
  next();
};

/**
 * 为API添加管理员密钥
 * 用于便于转发管理员密钥到下一个API调用
 */
exports.appendAdminKey = (url, key) => {
  if (!key) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}key=${key}`;
}; 