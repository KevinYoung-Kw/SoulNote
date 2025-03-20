/**
 * db.js - SQLite数据库连接和初始化
 * 替代MongoDB的轻量级数据库解决方案
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const dbPath = path.join(dataDir, 'soulnote.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('DATABASE', '连接SQLite数据库失败', { error: err.message });
    return;
  }
  logger.info('DATABASE', 'SQLite数据库连接成功', { path: dbPath });
});

// 启用外键约束
db.run('PRAGMA foreign_keys = ON');

// 创建表和索引
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 创建事件表
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          eventType TEXT NOT NULL,
          userId TEXT NOT NULL,
          timestamp INTEGER DEFAULT (strftime('%s', 'now') * 1000),
          ipAddress TEXT,
          userAgent TEXT,
          screenWidth INTEGER,
          screenHeight INTEGER,
          language TEXT,
          inviteCode TEXT,
          data TEXT,
          createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
        )
      `, (err) => {
        if (err) reject(err);
      });
      
      // 创建索引
      db.run('CREATE INDEX IF NOT EXISTS idx_events_eventType ON events(eventType)');
      db.run('CREATE INDEX IF NOT EXISTS idx_events_userId ON events(userId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)');
      db.run('CREATE INDEX IF NOT EXISTS idx_events_inviteCode ON events(inviteCode)');
      db.run('CREATE INDEX IF NOT EXISTS idx_events_compound ON events(eventType, timestamp)');
      
      // 创建邀请码表
      db.run(`
        CREATE TABLE IF NOT EXISTS invite_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          maxUses INTEGER NOT NULL DEFAULT 100,
          usedCount INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
          lastUsed INTEGER
        )
      `, (err) => {
        if (err) reject(err);
      });
      
      db.run('CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)');
      
      // 创建已使用邀请码的IP地址表
      db.run(`
        CREATE TABLE IF NOT EXISTS invite_code_ips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codeId INTEGER NOT NULL,
          ipAddress TEXT NOT NULL,
          usedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
          FOREIGN KEY (codeId) REFERENCES invite_codes(id) ON DELETE CASCADE,
          UNIQUE(codeId, ipAddress)
        )
      `, (err) => {
        if (err) reject(err);
      });
      
      db.run('CREATE INDEX IF NOT EXISTS idx_invite_code_ips_codeId ON invite_code_ips(codeId)', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

// 初始化数据库
initDatabase().then(() => {
  logger.info('DATABASE', 'SQLite数据库表和索引已初始化');
}).catch(err => {
  logger.error('DATABASE', 'SQLite数据库初始化失败', { error: err.message });
});

// 事件模型 - 添加事件
function addEvent(event) {
  return new Promise((resolve, reject) => {
    // 序列化data对象为JSON字符串
    const dataJson = event.data ? JSON.stringify(event.data) : '{}';
    
    const stmt = db.prepare(`
      INSERT INTO events 
      (eventType, userId, ipAddress, userAgent, screenWidth, screenHeight, language, inviteCode, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      event.eventType,
      event.userId,
      event.ipAddress || null,
      event.userAgent || null,
      event.screenWidth || null,
      event.screenHeight || null,
      event.language || null,
      event.inviteCode || null,
      dataJson,
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      }
    );
    
    stmt.finalize();
  });
}

// 获取事件统计
function getEventStats(filters = {}) {
  return new Promise((resolve, reject) => {
    let whereClause = '1=1';
    const params = [];
    
    // 添加事件类型过滤
    if (filters.eventType) {
      whereClause += ' AND eventType = ?';
      params.push(filters.eventType);
    }
    
    // 添加时间范围过滤
    if (filters.startDate) {
      whereClause += ' AND timestamp >= ?';
      params.push(new Date(filters.startDate).getTime());
    }
    
    if (filters.endDate) {
      whereClause += ' AND timestamp <= ?';
      params.push(new Date(filters.endDate).getTime());
    }
    
    // 添加邀请码过滤
    if (filters.inviteCode) {
      whereClause += ' AND inviteCode = ?';
      params.push(filters.inviteCode);
    }
    
    // 获取总事件数
    db.get(`SELECT COUNT(*) as count FROM events WHERE ${whereClause}`, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ count: row.count });
    });
  });
}

// 获取唯一用户数
function getUniqueUserCount(filters = {}) {
  return new Promise((resolve, reject) => {
    let whereClause = '1=1';
    const params = [];
    
    // 添加事件类型过滤
    if (filters.eventType) {
      whereClause += ' AND eventType = ?';
      params.push(filters.eventType);
    }
    
    // 添加时间范围过滤
    if (filters.startDate) {
      whereClause += ' AND timestamp >= ?';
      params.push(new Date(filters.startDate).getTime());
    }
    
    if (filters.endDate) {
      whereClause += ' AND timestamp <= ?';
      params.push(new Date(filters.endDate).getTime());
    }
    
    // 添加邀请码过滤
    if (filters.inviteCode) {
      whereClause += ' AND inviteCode = ?';
      params.push(filters.inviteCode);
    }
    
    // 获取唯一用户数
    db.get(`SELECT COUNT(DISTINCT userId) as count FROM events WHERE ${whereClause}`, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
}

// 获取事件类型分布
function getEventTypeDistribution(filters = {}) {
  return new Promise((resolve, reject) => {
    let whereClause = '1=1';
    const params = [];
    
    // 添加时间范围过滤
    if (filters.startDate) {
      whereClause += ' AND timestamp >= ?';
      params.push(new Date(filters.startDate).getTime());
    }
    
    if (filters.endDate) {
      whereClause += ' AND timestamp <= ?';
      params.push(new Date(filters.endDate).getTime());
    }
    
    // 添加邀请码过滤
    if (filters.inviteCode) {
      whereClause += ' AND inviteCode = ?';
      params.push(filters.inviteCode);
    }
    
    // 获取事件类型分布
    db.all(`
      SELECT eventType as type, COUNT(*) as count 
      FROM events 
      WHERE ${whereClause} 
      GROUP BY eventType 
      ORDER BY count DESC
    `, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// 获取按时间分组的事件统计
function getTimeSeriesData(timeUnit = 'day', filters = {}) {
  return new Promise((resolve, reject) => {
    let whereClause = '1=1';
    const params = [];
    
    // 添加事件类型过滤
    if (filters.eventType) {
      whereClause += ' AND eventType = ?';
      params.push(filters.eventType);
    }
    
    // 添加时间范围过滤
    if (filters.startDate) {
      whereClause += ' AND timestamp >= ?';
      params.push(new Date(filters.startDate).getTime());
    }
    
    if (filters.endDate) {
      whereClause += ' AND timestamp <= ?';
      params.push(new Date(filters.endDate).getTime());
    }
    
    // 添加邀请码过滤
    if (filters.inviteCode) {
      whereClause += ' AND inviteCode = ?';
      params.push(filters.inviteCode);
    }
    
    // 根据时间单位确定分组格式
    let timeFormat;
    switch (timeUnit) {
      case 'hour':
        timeFormat = "strftime('%Y-%m-%d %H:00', datetime(timestamp/1000, 'unixepoch'))";
        break;
      case 'day':
        timeFormat = "strftime('%Y-%m-%d', datetime(timestamp/1000, 'unixepoch'))";
        break;
      case 'week':
        timeFormat = "strftime('%Y-%W', datetime(timestamp/1000, 'unixepoch'))";
        break;
      case 'month':
        timeFormat = "strftime('%Y-%m', datetime(timestamp/1000, 'unixepoch'))";
        break;
      default:
        timeFormat = "strftime('%Y-%m-%d', datetime(timestamp/1000, 'unixepoch'))";
    }
    
    // 获取时间序列数据
    db.all(`
      SELECT ${timeFormat} as date, COUNT(*) as count 
      FROM events 
      WHERE ${whereClause} 
      GROUP BY date 
      ORDER BY date ASC
    `, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// 邀请码模型 - 添加邀请码
function addInviteCode(code) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO invite_codes (code, maxUses)
      VALUES (?, ?)
    `);
    
    stmt.run(code.code, code.maxUses || 100, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID });
    });
    
    stmt.finalize();
  });
}

// 获取邀请码
function getInviteCode(code) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM invite_codes WHERE code = ?', [code], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

// 更新邀请码使用情况
function useInviteCode(code, ipAddress) {
  return new Promise((resolve, reject) => {
    // 使用事务确保数据一致性
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // 获取邀请码ID和当前使用次数
      db.get('SELECT * FROM invite_codes WHERE code = ?', [code], (err, codeInfo) => {
        if (err) {
          db.run('ROLLBACK');
          reject(err);
          return;
        }
        
        if (!codeInfo) {
          db.run('ROLLBACK');
          reject(new Error('邀请码不存在'));
          return;
        }
        
        // 更新邀请码使用次数和最后使用时间
        const now = Date.now();
        db.run(
          'UPDATE invite_codes SET usedCount = usedCount + 1, lastUsed = ? WHERE code = ?',
          [now, code],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            // 记录IP地址使用情况
            db.run(
              'INSERT OR IGNORE INTO invite_code_ips (codeId, ipAddress) VALUES (?, ?)',
              [codeInfo.id, ipAddress],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  resolve({ success: true, codeInfo });
                });
              }
            );
          }
        );
      });
    });
  });
}

// 获取所有邀请码
function getAllInviteCodes() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT ic.*, 
             (SELECT COUNT(DISTINCT ipAddress) FROM invite_code_ips WHERE codeId = ic.id) as uniqueIPs
      FROM invite_codes ic
      ORDER BY ic.createdAt DESC
    `, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// 删除邀请码
function deleteInviteCode(code) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM invite_codes WHERE code = ?', [code], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ success: this.changes > 0 });
    });
  });
}

// 获取参数分布
function getParamDistribution(paramType, filters = {}) {
  return new Promise((resolve, reject) => {
    let whereClause = "eventType = 'param_select'";
    const params = [];
    
    // 添加时间范围过滤
    if (filters.startDate) {
      whereClause += ' AND timestamp >= ?';
      params.push(new Date(filters.startDate).getTime());
    }
    
    if (filters.endDate) {
      whereClause += ' AND timestamp <= ?';
      params.push(new Date(filters.endDate).getTime());
    }
    
    // 添加邀请码过滤
    if (filters.inviteCode) {
      whereClause += ' AND inviteCode = ?';
      params.push(filters.inviteCode);
    }
    
    // 在查询参数中添加paramType
    params.push(paramType);
    
    // 获取参数分布
    db.all(`
      SELECT json_extract(data, '$.paramValue') as value, COUNT(*) as count 
      FROM events 
      WHERE ${whereClause} AND json_extract(data, '$.paramType') = ?
      GROUP BY value 
      ORDER BY count DESC
    `, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// 检查数据库连接是否正常
function isConnected() {
  try {
    // 简单的查询测试连接
    db.get('SELECT 1 as test', (err, row) => {
      if (err) return false;
      return row && row.test === 1;
    });
    
    return true;
  } catch (error) {
    logger.error('DATABASE', '连接检查失败', { error: error.message });
    return false;
  }
}

// 暴露数据库接口
module.exports = {
  // 原始数据库对象，用于高级操作
  db,
  
  // 连接检查
  isConnected,
  
  // 事件相关
  addEvent,
  getEventStats,
  getUniqueUserCount,
  getEventTypeDistribution,
  getTimeSeriesData,
  getParamDistribution,
  
  // 邀请码相关
  addInviteCode,
  getInviteCode,
  useInviteCode,
  getAllInviteCodes,
  deleteInviteCode
}; 