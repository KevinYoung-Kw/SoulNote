const rateLimit = require('express-rate-limit');

/**
 * 请求速率限制中间件
 * 用于限制AI生成请求的频率，防止滥用
 */
const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2分钟时间窗口
  max: 5, // 每个IP在时间窗口内最多允许5个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: '请求过于频繁，请稍后再试'
  }
});

module.exports = rateLimiter;
