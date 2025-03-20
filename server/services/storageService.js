/**
 * storageService.js - 存储服务
 * 提供访问用户会话存储和Cookie的功能
 */

const logger = require('../utils/logger');

/**
 * 从请求中获取存储的邀请码
 * 邀请码可以存储在Cookie或会话中
 * 
 * @param {Object} req - Express请求对象
 * @returns {String|null} 邀请码或null
 */
exports.getStoredInviteCode = async (req) => {
  try {
    // 从cookie中获取邀请码
    if (req.cookies && req.cookies.inviteCode) {
      return req.cookies.inviteCode;
    }
    
    // 从会话中获取邀请码
    if (req.session && req.session.inviteCode) {
      return req.session.inviteCode;
    }
    
    return null;
  } catch (error) {
    logger.error('获取存储的邀请码失败:', error);
    return null;
  }
};

/**
 * 存储邀请码到Cookie和会话
 * 
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {String} inviteCode - 要存储的邀请码
 */
exports.storeInviteCode = (req, res, inviteCode) => {
  try {
    // 存储到cookie，30天过期
    const cookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
      httpOnly: true,
      sameSite: 'strict'
    };
    
    res.cookie('inviteCode', inviteCode, cookieOptions);
    
    // 存储到会话
    if (req.session) {
      req.session.inviteCode = inviteCode;
    }
  } catch (error) {
    logger.error('存储邀请码失败:', error);
  }
}; 