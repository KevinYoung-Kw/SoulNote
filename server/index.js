/**
 * SoulNote 轻量级后端服务
 * 提供邀请码验证和用户统计功能
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 检查管理员密钥配置
if (!process.env.ADMIN_KEY) {
  console.warn('警告: 管理员密钥(ADMIN_KEY)未设置，建议在.env文件中配置');
  // 设置一个默认的管理员密钥，仅用于开发环境
  process.env.ADMIN_KEY = 'admin-dev-key';
}

// 初始化 Express 应用
const app = express();
const port = process.env.PORT || 4000;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const INVITE_CODES_FILE = path.join(DATA_DIR, 'invite-codes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('数据目录已创建或已存在');
  } catch (error) {
    console.error('创建数据目录失败:', error);
  }
}

// 初始化数据文件
async function initDataFiles() {
  try {
    // 检查邀请码文件
    try {
      await fs.access(INVITE_CODES_FILE);
    } catch (error) {
      // 文件不存在，创建默认邀请码文件
      const defaultInviteCodes = {
        codes: [
          {
            code: 'SOULNOTE2023',  // 示例邀请码
            createdAt: new Date().toISOString(),
            maxUses: 100,           // 最大使用次数
            usedCount: 0,           // 当前使用次数
            usedIPs: []             // 已使用的IP列表
          }
        ]
      };
      await fs.writeFile(INVITE_CODES_FILE, JSON.stringify(defaultInviteCodes, null, 2));
      console.log('已创建默认邀请码文件');
    }

    // 检查用户文件
    try {
      await fs.access(USERS_FILE);
    } catch (error) {
      // 文件不存在，创建空用户文件
      await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
      console.log('已创建用户数据文件');
    }

    // 检查统计文件
    try {
      await fs.access(STATS_FILE);
    } catch (error) {
      // 文件不存在，创建默认统计文件
      const defaultStats = {
        totalVerifications: 0,
        totalUniqueUsers: 0,
        lastUpdated: new Date().toISOString()
      };
      await fs.writeFile(STATS_FILE, JSON.stringify(defaultStats, null, 2));
      console.log('已创建统计数据文件');
    }
  } catch (error) {
    console.error('初始化数据文件失败:', error);
  }
}

// 读取邀请码数据
async function getInviteCodes() {
  try {
    const data = await fs.readFile(INVITE_CODES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取邀请码文件失败:', error);
    return { codes: [] };
  }
}

// 保存邀请码数据
async function saveInviteCodes(inviteCodesData) {
  try {
    await fs.writeFile(INVITE_CODES_FILE, JSON.stringify(inviteCodesData, null, 2));
  } catch (error) {
    console.error('保存邀请码文件失败:', error);
  }
}

// 读取统计数据
async function getStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取统计文件失败:', error);
    return {
      totalVerifications: 0,
      totalUniqueUsers: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// 保存统计数据
async function saveStats(statsData) {
  try {
    statsData.lastUpdated = new Date().toISOString();
    await fs.writeFile(STATS_FILE, JSON.stringify(statsData, null, 2));
  } catch (error) {
    console.error('保存统计文件失败:', error);
  }
}

// 添加新用户
async function addUser(ip, inviteCode) {
  try {
    const userData = await fs.readFile(USERS_FILE, 'utf8').then(JSON.parse).catch(() => ({ users: [] }));
    
    // 检查IP是否已存在
    const existingUser = userData.users.find(user => user.ip === ip);
    
    if (existingUser) {
      // 更新现有用户
      existingUser.lastLogin = new Date().toISOString();
      existingUser.loginCount += 1;
      
      // 检查是否需要添加新的邀请码
      if (!existingUser.inviteCodes.includes(inviteCode)) {
        existingUser.inviteCodes.push(inviteCode);
      }
    } else {
      // 添加新用户
      userData.users.push({
        ip,
        inviteCodes: [inviteCode],
        firstSeen: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1
      });
      
      // 更新唯一用户统计
      const stats = await getStats();
      stats.totalUniqueUsers += 1;
      await saveStats(stats);
    }
    
    await fs.writeFile(USERS_FILE, JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error('添加用户失败:', error);
  }
}

// 生成用户趋势数据
function generateUserTrends(users) {
  // 如果没有用户数据，返回空数组
  if (!users || users.length === 0) {
    return [];
  }
  
  // 计算过去30天的使用趋势
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyUsers = {};
  const dailyLogins = {};
  
  // 初始化每一天的计数器
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyUsers[dateStr] = 0;
    dailyLogins[dateStr] = 0;
  }
  
  // 计算每天的新用户和登录次数
  users.forEach(user => {
    const firstSeenDate = new Date(user.firstSeen).toISOString().split('T')[0];
    const lastLoginDate = new Date(user.lastLogin).toISOString().split('T')[0];
    
    if (new Date(firstSeenDate) >= thirtyDaysAgo) {
      if (dailyUsers[firstSeenDate] !== undefined) {
        dailyUsers[firstSeenDate]++;
      }
    }
    
    if (new Date(lastLoginDate) >= thirtyDaysAgo) {
      if (dailyLogins[lastLoginDate] !== undefined) {
        dailyLogins[lastLoginDate]++;
      }
    }
  });
  
  // 格式化数据用于前端展示
  const result = Object.keys(dailyUsers).map(date => ({
    date,
    newUsers: dailyUsers[date],
    logins: dailyLogins[date]
  }));
  
  return result;
}

// CORS配置
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: function(origin, callback) {
    // 允许没有origin的请求（如Postman测试）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域请求'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// 中间件
app.use(express.json());

// 防止暴力破解的请求限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: '请求过于频繁，请稍后再试'
  }
});

// 更严格的限流，用于登录和敏感操作
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每个IP最多5次尝试
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: '尝试次数过多，请稍后再试'
  }
});

// 应用限流中间件
app.use('/api/', apiLimiter);
app.use('/api/generate-invite-code', loginLimiter);

// 路由：验证邀请码
app.post('/api/verify-invite-code', async (req, res) => {
  try {
    const { inviteCode, clientIP } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ 
        valid: false, 
        message: '请提供邀请码'
      });
    }
    
    // 获取请求IP
    const ip = clientIP || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // 读取邀请码数据
    const inviteCodesData = await getInviteCodes();
    
    // 查找匹配的邀请码
    const foundCode = inviteCodesData.codes.find(c => c.code === inviteCode.trim());
    
    if (!foundCode) {
      return res.status(200).json({ 
        valid: false, 
        message: '无效的邀请码'
      });
    }
    
    // 检查使用次数是否达到上限
    if (foundCode.maxUses && foundCode.usedCount >= foundCode.maxUses) {
      return res.status(200).json({ 
        valid: false, 
        message: '此邀请码已达到使用上限'
      });
    }
    
    // 邀请码有效，更新使用记录
    if (!foundCode.usedIPs.includes(ip)) {
      foundCode.usedIPs.push(ip);
    }
    foundCode.usedCount += 1;
    foundCode.lastUsed = new Date().toISOString();
    
    // 保存更新后的邀请码数据
    await saveInviteCodes(inviteCodesData);
    
    // 添加或更新用户记录
    await addUser(ip, inviteCode);
    
    // 更新统计数据
    const stats = await getStats();
    stats.totalVerifications += 1;
    await saveStats(stats);
    
    // 返回成功响应
    return res.status(200).json({ 
      valid: true, 
      message: '邀请码验证成功'
    });
  } catch (error) {
    console.error('验证邀请码时出错:', error);
    return res.status(500).json({ 
      valid: false, 
      message: '服务器内部错误'
    });
  }
});

// 路由：获取统计数据 (需要简单密码保护，仅限管理员访问)
app.get('/api/stats', async (req, res) => {
  try {
    const adminKey = req.query.key;
    
    // 简单的密码保护，实际生产环境应使用更安全的认证方式
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ 
        error: '未授权访问'
      });
    }
    
    const stats = await getStats();
    const inviteCodesData = await getInviteCodes();
    const userData = await fs.readFile(USERS_FILE, 'utf8').then(JSON.parse).catch(() => ({ users: [] }));
    
    // 计算每个邀请码的使用情况
    const codeStats = inviteCodesData.codes.map(code => ({
      code: code.code,
      usedCount: code.usedCount,
      maxUses: code.maxUses,
      uniqueIPs: code.usedIPs.length,
      lastUsed: code.lastUsed || 'Never',
      createdAt: code.createdAt
    }));
    
    // 生成用户趋势数据
    const userTrends = generateUserTrends(userData.users);
    
    return res.status(200).json({
      systemStats: stats,
      inviteCodeStats: codeStats,
      userCount: userData.users.length,
      userTrends
    });
  } catch (error) {
    console.error('获取统计数据时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

// 路由：生成新的邀请码 (需要管理员密钥)
app.post('/api/generate-invite-code', async (req, res) => {
  try {
    const { adminKey, maxUses, prefix } = req.body;
    
    // 验证管理员密钥
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: '未授权操作' });
    }
    
    // 生成随机代码
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const inviteCode = prefix ? `${prefix}${randomPart}` : `SN${randomPart}`;
    
    // 读取现有邀请码
    const inviteCodesData = await getInviteCodes();
    
    // 添加新邀请码
    inviteCodesData.codes.push({
      code: inviteCode,
      createdAt: new Date().toISOString(),
      maxUses: maxUses || 100,
      usedCount: 0,
      usedIPs: []
    });
    
    // 保存更新后的邀请码数据
    await saveInviteCodes(inviteCodesData);
    
    return res.status(201).json({ 
      success: true, 
      inviteCode,
      message: '邀请码生成成功'
    });
  } catch (error) {
    console.error('生成邀请码时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

// 路由：删除邀请码 (需要管理员密钥)
app.post('/api/delete-invite-code', async (req, res) => {
  try {
    const { adminKey, code } = req.body;
    
    // 验证管理员密钥
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: '未授权操作' });
    }
    
    if (!code) {
      return res.status(400).json({ error: '请提供要删除的邀请码' });
    }
    
    // 读取现有邀请码
    const inviteCodesData = await getInviteCodes();
    
    // 查找要删除的邀请码索引
    const codeIndex = inviteCodesData.codes.findIndex(c => c.code === code);
    
    if (codeIndex === -1) {
      return res.status(404).json({ error: '邀请码不存在' });
    }
    
    // 从数组中删除该邀请码
    inviteCodesData.codes.splice(codeIndex, 1);
    
    // 保存更新后的邀请码数据
    await saveInviteCodes(inviteCodesData);
    
    return res.status(200).json({ 
      success: true, 
      message: '邀请码删除成功'
    });
  } catch (error) {
    console.error('删除邀请码时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

// 路由：编辑邀请码 (需要管理员密钥)
app.post('/api/edit-invite-code', async (req, res) => {
  try {
    const { adminKey, code, newMaxUses } = req.body;
    
    // 验证管理员密钥
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: '未授权操作' });
    }
    
    if (!code) {
      return res.status(400).json({ error: '请提供要编辑的邀请码' });
    }
    
    if (newMaxUses === undefined || newMaxUses < 0) {
      return res.status(400).json({ error: '请提供有效的使用次数' });
    }
    
    // 读取现有邀请码
    const inviteCodesData = await getInviteCodes();
    
    // 查找要编辑的邀请码
    const inviteCode = inviteCodesData.codes.find(c => c.code === code);
    
    if (!inviteCode) {
      return res.status(404).json({ error: '邀请码不存在' });
    }
    
    // 更新邀请码信息
    inviteCode.maxUses = newMaxUses;
    inviteCode.updatedAt = new Date().toISOString();
    
    // 保存更新后的邀请码数据
    await saveInviteCodes(inviteCodesData);
    
    return res.status(200).json({ 
      success: true, 
      message: '邀请码更新成功',
      updatedCode: inviteCode
    });
  } catch (error) {
    console.error('编辑邀请码时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

// 启动服务器前初始化数据
(async function initialize() {
  await ensureDataDir();
  await initDataFiles();
  
  app.listen(port, () => {
    console.log(`SoulNote后端服务已启动，监听端口 ${port}`);
  });
})();
