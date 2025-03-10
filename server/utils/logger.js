/**
 * 日志工具 - 提供统一的日志记录功能
 */
class Logger {
  constructor() {
    this.debugMode = process.env.DEBUG_MODE === 'true';
    
    // 日志颜色配置
    this.colors = {
      INFO: '\x1b[36m%s\x1b[0m',    // 青色
      WARN: '\x1b[33m%s\x1b[0m',     // 黄色
      ERROR: '\x1b[31m%s\x1b[0m',    // 红色
      DEBUG: '\x1b[35m%s\x1b[0m',    // 紫色
      MODEL_INPUT: '\x1b[32m%s\x1b[0m',  // 绿色
      MODEL_OUTPUT: '\x1b[34m%s\x1b[0m', // 蓝色
      API: '\x1b[90m%s\x1b[0m',      // 灰色
      SYSTEM: '\x1b[37m%s\x1b[0m'    // 白色
    };
    
    // 设置日志级别，由低到高：DEBUG < MODEL_INPUT/MODEL_OUTPUT < INFO < WARN < ERROR
    this.levels = {
      DEBUG: 0,
      MODEL_INPUT: 0, // 将MODEL_INPUT级别改为与DEBUG相同，确保在调试模式下显示
      MODEL_OUTPUT: 0, // 将MODEL_OUTPUT级别改为与DEBUG相同，确保在调试模式下显示
      INFO: 2,
      WARN: 3,
      ERROR: 4,
      API: 2,
      SYSTEM: 2
    };
    
    // 当前日志级别，默认为INFO，可通过环境变量设置
    // 使用DEBUG作为默认级别，确保模型输入输出都能显示
    this.currentLevel = process.env.LOG_LEVEL ? 
      this.levels[process.env.LOG_LEVEL.toUpperCase()] || 0 : 0;
  }
  
  /**
   * 记录信息日志
   * @param {string} type 日志类型
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  info(type, message, data) {
    if (this.levels.INFO >= this.currentLevel) {
      this._log('INFO', type, message, data);
    }
  }
  
  /**
   * 记录警告日志
   * @param {string} type 日志类型
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  warn(type, message, data) {
    if (this.levels.WARN >= this.currentLevel) {
      this._log('WARN', type, message, data);
    }
  }
  
  /**
   * 记录错误日志
   * @param {string} type 日志类型
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  error(type, message, data) {
    if (this.levels.ERROR >= this.currentLevel) {
      this._log('ERROR', type, message, data);
    }
  }
  
  /**
   * 记录调试日志(仅在调试模式下)
   * @param {string} type 日志类型
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  debug(type, message, data) {
    if (this.debugMode && this.levels.DEBUG >= this.currentLevel) {
      this._log('DEBUG', type, message, data);
    }
  }
  
  /**
   * 记录模型输入日志
   * @param {string} model 模型名称
   * @param {Object} prompt 提示词内容
   * @param {Object} options 模型选项参数
   */
  modelInput(model, prompt, options = {}) {
    // 移除调试模式检查，确保模型输入始终记录
    if (this.levels.MODEL_INPUT >= this.currentLevel) {
      this._log('MODEL_INPUT', model, '模型输入', {
        prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
        options
      });
    }
  }
  
  /**
   * 记录模型输出日志
   * @param {string} model 模型名称
   * @param {Object} output 输出内容
   * @param {number} responseTime 响应时间(毫秒)
   */
  modelOutput(model, output, responseTime = null) {
    // 移除调试模式检查，确保模型输出始终记录
    if (this.levels.MODEL_OUTPUT >= this.currentLevel) {
      const logData = {
        output: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
        responseTime: responseTime ? `${responseTime}ms` : undefined
      };
      
      this._log('MODEL_OUTPUT', model, '模型输出', logData);
    }
  }
  
  /**
   * 记录API相关日志
   * @param {string} endpoint API端点
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  api(endpoint, message, data) {
    if (this.levels.API >= this.currentLevel) {
      this._log('API', endpoint, message, data);
    }
  }
  
  /**
   * 记录系统级别日志
   * @param {string} component 系统组件
   * @param {string} message 日志信息
   * @param {Object} data 附加数据
   */
  system(component, message, data) {
    if (this.levels.SYSTEM >= this.currentLevel) {
      this._log('SYSTEM', component, message, data);
    }
  }
  
  /**
   * 内部日志记录方法
   * @private
   */
  _log(level, type, message, data) {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      type,
      message
    };
    
    if (data) {
      logObject.data = data;
    }
    
    // 控制台输出格式化
    const logPrefix = `[${timestamp}] [${level}] [${type}]`;
    if (this.colors[level]) {
      console.log(this.colors[level], logPrefix, message);
    } else {
      console.log(logPrefix, message);
    }
    
    // 特殊处理MODEL_INPUT和MODEL_OUTPUT数据格式
    if (level === 'MODEL_INPUT') {
      if (data && data.prompt) {
        console.log('--- 模型输入开始 ---');
        if (typeof data.prompt === 'string') {
          console.log(data.prompt);
        } else if (typeof data.prompt === 'object') {
          // 如果是对象（如包含system和user消息的结构），漂亮地打印
          if (data.prompt.system) {
            console.log('System: ' + data.prompt.system);
          }
          if (data.prompt.user) {
            console.log('User: ' + data.prompt.user);
          }
        }
        console.log('--- 模型输入结束 ---');
        
        // 打印选项信息
        if (data.options) {
          console.log('选项:', data.options);
        }
      }
    } else if (level === 'MODEL_OUTPUT') {
      if (data && data.output) {
        console.log('--- 模型输出开始 ---');
        
        // 对输出内容进行美化处理
        let formattedOutput;
        try {
          // 尝试解析JSON字符串
          const outputObj = JSON.parse(data.output);
          formattedOutput = JSON.stringify(outputObj, null, 2);
          console.log(formattedOutput);
        } catch (e) {
          // 如果不是JSON或解析失败，直接输出
          console.log(data.output);
        }
        
        console.log('--- 模型输出结束 ---');
        
        if (data.responseTime) {
          console.log('响应时间:', data.responseTime);
        }
      }
    } else if (data) {
      // 对于敏感数据，可以在此处理，比如屏蔽API密钥等
      const safeData = this._sanitizeData(data);
      console.log(safeData);
    }
  }
  
  /**
   * 处理敏感数据，避免记录安全信息
   * @private
   */
  _sanitizeData(data) {
    if (!data) return data;
    
    // 创建数据的深拷贝，避免修改原始对象
    let sanitized = JSON.parse(JSON.stringify(data));
    
    // 如果是对象，递归处理敏感字段
    if (typeof sanitized === 'object' && sanitized !== null) {
      // 处理特定敏感字段
      if (sanitized.Authorization || sanitized.authorization) {
        sanitized.Authorization = sanitized.Authorization ? '[REDACTED]' : undefined;
        sanitized.authorization = sanitized.authorization ? '[REDACTED]' : undefined;
      }
      
      if (sanitized.password) {
        sanitized.password = '[REDACTED]';
      }
      
      // 处理嵌套对象内的API密钥
      if (sanitized.headers) {
        if (sanitized.headers.Authorization || sanitized.headers.authorization) {
          sanitized.headers.Authorization = sanitized.headers.Authorization ? '[REDACTED]' : undefined;
          sanitized.headers.authorization = sanitized.headers.authorization ? '[REDACTED]' : undefined;
        }
      }
      
      // 屏蔽API密钥信息
      if (sanitized.api_key || sanitized.apiKey) {
        sanitized.api_key = sanitized.api_key ? '[REDACTED]' : undefined;
        sanitized.apiKey = sanitized.apiKey ? '[REDACTED]' : undefined;
      }
      
      // 处理请求头中可能包含的token
      if (sanitized.headers) {
        const tokenKeys = ['x-api-key', 'api-key', 'token', 'access-token', 'bearer'];
        for (const key of Object.keys(sanitized.headers)) {
          if (tokenKeys.includes(key.toLowerCase())) {
            sanitized.headers[key] = '[REDACTED]';
          }
        }
      }
    }
    
    return sanitized;
  }
  
  /**
   * 设置日志级别
   * @param {string} level 日志级别 (DEBUG|INFO|WARN|ERROR)
   */
  setLevel(level) {
    const normalizedLevel = level.toUpperCase();
    if (this.levels[normalizedLevel] !== undefined) {
      this.currentLevel = this.levels[normalizedLevel];
      this.system('LOGGER', `日志级别已设置为: ${normalizedLevel}`);
    } else {
      this.warn('LOGGER', `无效的日志级别: ${level}，使用默认级别: INFO`);
      this.currentLevel = this.levels.INFO;
    }
  }
  
  /**
   * 设置调试模式
   * @param {boolean} enabled 是否启用调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.system('LOGGER', `调试模式已${enabled ? '启用' : '禁用'}`);
  }
  
  /**
   * 获取当前调试模式状态
   * @returns {boolean} 调试模式是否启用
   */
  isDebugMode() {
    return this.debugMode;
  }
}

// 导出单例
module.exports = new Logger();
