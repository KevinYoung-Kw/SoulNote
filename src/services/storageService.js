import userIdentifierService from './userIdentifierService';

// 存储键基础名称（无用户标识）
const BASE_KEYS = {
  PREFERENCES: 'preferences',
  NOTES: 'notes',
  ONBOARDING_COMPLETED: 'onboarding-completed',
  INVITE_CODE_VERIFIED: 'invite-code-verified',
  INVITE_CODE: 'invite-code',
  API_SETTINGS: 'api-settings'
};

// 数据库名称和版本
const DB_NAME = 'SoulNoteDB';
const DB_VERSION = 1;

/**
 * 打开 IndexedDB 数据库连接
 * @returns {Promise<IDBDatabase>} 数据库连接
 */
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('打开数据库失败:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建用户偏好存储
      if (!db.objectStoreNames.contains('preferences')) {
        const store = db.createObjectStore('preferences', { keyPath: 'userId' });
        store.createIndex('userId', 'userId', { unique: true });
      }
      
      // 创建笔记存储
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('userId', 'userId', { unique: false });
        notesStore.createIndex('savedAt', 'savedAt', { unique: false });
      }
      
      // 创建设置存储
      if (!db.objectStoreNames.contains('settings')) {
        const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
        settingsStore.createIndex('userId', 'userId', { unique: false });
      }
    };
  });
}

/**
 * 保存用户偏好设置
 * @param {Object} preferences 用户偏好对象
 * @returns {Promise<boolean>} 是否保存成功
 */
export async function saveUserPreferences(preferences) {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 清理数据，确保可以被 IndexedDB 存储
    const cleanPreferences = cleanDataForStorage(preferences);
    
    // 首先尝试保存到 IndexedDB
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      
      const request = store.put({
        userId,
        ...cleanPreferences,
        updatedAt: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('IndexedDB 存储错误:', event.target.error);
        reject(event.target.error);
      };
    });
    
    // 同时保存到 localStorage 作为备份
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.PREFERENCES);
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.warn('保存偏好设置到 localStorage 失败 (备份):', error);
    }
    
    return true;
  } catch (error) {
    console.error('保存偏好设置到 IndexedDB 失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.PREFERENCES);
      localStorage.setItem(storageKey, JSON.stringify(preferences));
      return true;
    } catch (fallbackError) {
      console.error('降级存储也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 清理数据以确保可以被 IndexedDB 存储
 * @param {Object} data 需要清理的数据
 * @returns {Object} 清理后的数据
 */
function cleanDataForStorage(data) {
  // 如果不是对象或为 null，直接返回
  if (data === null || typeof data !== 'object') {
    return data;
  }
  
  // 如果是日期对象，转换为 ISO 字符串
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // 如果是数组，递归清理每个元素
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForStorage(item));
  }
  
  // 处理普通对象
  const cleanedData = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      
      // 跳过函数、Symbol 和 undefined
      if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
        continue;
      }
      
      // 递归清理嵌套对象
      cleanedData[key] = cleanDataForStorage(value);
    }
  }
  
  return cleanedData;
}

/**
 * 获取用户偏好设置
 * @returns {Promise<Object|null>} 用户偏好对象
 */
export async function getUserPreferences() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先尝试从 IndexedDB 获取
    const db = await openDatabase();
    const result = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.get(userId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
    
    if (result) {
      // 删除内部使用的字段
      const { userId, updatedAt, ...preferences } = result;
      return preferences;
    }
  } catch (error) {
    console.warn('从 IndexedDB 获取偏好设置失败:', error);
  }
  
  // 如果 IndexedDB 失败或没有数据，尝试从 localStorage 获取
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.PREFERENCES);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      const preferences = JSON.parse(data);
      
      // 如果从 localStorage 获取成功，尝试同步到 IndexedDB
      try {
        await saveUserPreferences(preferences);
      } catch (syncError) {
        console.warn('同步偏好设置到 IndexedDB 失败:', syncError);
      }
      
      return preferences;
    }
    
    // 尝试从旧存储位置读取
    const oldData = localStorage.getItem(BASE_KEYS.PREFERENCES);
    if (oldData) {
      const parsedData = JSON.parse(oldData);
      // 如果成功从旧位置读取，则迁移到新位置
      await saveUserPreferences(parsedData);
      return parsedData;
    }
  } catch (error) {
    console.error('从 localStorage 获取偏好设置失败:', error);
  }
  
  return getDefaultPreferences();
}

/**
 * 获取默认偏好设置
 * @returns {Object} 默认偏好设置对象
 */
function getDefaultPreferences() {
  return {
    gender: null,
    age: null,
    relationship: null,
    zodiac: null,
    mbti: null,
    nickname: '',
    language: 'zh',
    theme: 'light',
    fontSize: 24,
    background: 'paper-1',
    savageMode: false,
    lastSeenVersion: null,
    isFirstLogin: true,
    communityRemindAt: null,
    communityShownBefore: false,
    neverRemindCommunity: false
  };
}

/**
 * 保存生成的纸条
 * @param {Object} note 纸条对象
 * @returns {Promise<Object|null>} 保存后的纸条对象（包含元数据）
 */
export async function saveNote(note) {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 添加ID和保存时间戳
    const noteWithMeta = {
      ...note,
      id: note.id || Date.now().toString(),
      userId,
      savedAt: new Date().toISOString()
    };
    
    // 确保数据可以被序列化
    const cleanNote = cleanDataForStorage(noteWithMeta);
    
    // 首先尝试保存到 IndexedDB
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      
      const request = store.put(cleanNote);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
    
    // 同时更新 localStorage 中的笔记列表
    try {
      const savedNotes = await getSavedNotes();
      const existingIndex = savedNotes.findIndex(n => n.id === cleanNote.id);
      
      if (existingIndex >= 0) {
        savedNotes[existingIndex] = cleanNote;
      } else {
        savedNotes.unshift(cleanNote);
        
        // 最多保存50个纸条
        if (savedNotes.length > 50) {
          savedNotes.pop();
        }
      }
      
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
      localStorage.setItem(storageKey, JSON.stringify(savedNotes));
    } catch (error) {
      console.warn('更新 localStorage 中的笔记列表失败 (备份):', error);
    }
    
    return cleanNote;
  } catch (error) {
    console.error('保存纸条到 IndexedDB 失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      const savedNotes = await getSavedNotes();
      
      // 添加ID和保存时间戳
      const noteWithMeta = {
        ...note,
        id: note.id || Date.now().toString(),
        userId,
        savedAt: new Date().toISOString()
      };
      
      // 确保数据可以被序列化
      const cleanNote = cleanDataForStorage(noteWithMeta);
      
      const existingIndex = savedNotes.findIndex(n => n.id === cleanNote.id);
      
      if (existingIndex >= 0) {
        savedNotes[existingIndex] = cleanNote;
      } else {
        savedNotes.unshift(cleanNote);
        
        // 最多保存50个纸条
        if (savedNotes.length > 50) {
          savedNotes.pop();
        }
      }
      
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
      localStorage.setItem(storageKey, JSON.stringify(savedNotes));
      
      return cleanNote;
    } catch (fallbackError) {
      console.error('降级存储也失败:', fallbackError);
      return null;
    }
  }
}

/**
 * 获取保存的纸条列表
 * @returns {Promise<Array>} 纸条对象数组
 */
export async function getSavedNotes() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先尝试从 IndexedDB 获取
    const db = await openDatabase();
    const notes = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        // 按保存时间排序（最新的在前面）
        const sortedNotes = request.result.sort((a, b) => 
          new Date(b.savedAt) - new Date(a.savedAt)
        );
        resolve(sortedNotes);
      };
      
      request.onerror = (event) => reject(event.target.error);
    });
    
    if (notes && notes.length > 0) {
      // 同步到 localStorage 作为备份
      try {
        const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
        localStorage.setItem(storageKey, JSON.stringify(notes));
      } catch (error) {
        console.warn('同步笔记到 localStorage 失败 (备份):', error);
      }
      
      return notes;
    }
  } catch (error) {
    console.warn('从 IndexedDB 获取笔记失败:', error);
  }
  
  // 如果 IndexedDB 失败或没有数据，尝试从 localStorage 获取
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      const notes = JSON.parse(data);
      
      // 如果从 localStorage 获取成功，尝试同步到 IndexedDB
      try {
        const db = await openDatabase();
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        
        for (const note of notes) {
          // 确保每个笔记都有用户ID
          store.put({
            ...note,
            userId
          });
        }
      } catch (syncError) {
        console.warn('同步笔记到 IndexedDB 失败:', syncError);
      }
      
      return notes;
    }
    
    // 尝试从旧存储位置读取
    const oldData = localStorage.getItem(BASE_KEYS.NOTES);
    if (oldData) {
      const parsedData = JSON.parse(oldData);
      // 如果成功从旧位置读取，则迁移到新位置
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
      localStorage.setItem(storageKey, oldData);
      
      // 同时同步到 IndexedDB
      try {
        const db = await openDatabase();
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        
        for (const note of parsedData) {
          store.put({
            ...note,
            userId
          });
        }
      } catch (syncError) {
        console.warn('同步旧笔记到 IndexedDB 失败:', syncError);
      }
      
      return parsedData;
    }
  } catch (error) {
    console.error('从 localStorage 获取笔记失败:', error);
  }
  
  return [];
}

/**
 * 删除指定纸条
 * @param {string} noteId 纸条ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteNote(noteId) {
  try {
    // 首先从 IndexedDB 删除
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.delete(noteId);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
    
    // 同时更新 localStorage
    try {
      let savedNotes = await getSavedNotes();
      savedNotes = savedNotes.filter(note => note.id !== noteId);
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
      localStorage.setItem(storageKey, JSON.stringify(savedNotes));
    } catch (error) {
      console.warn('更新 localStorage 中的笔记列表失败 (备份):', error);
    }
    
    return true;
  } catch (error) {
    console.error('从 IndexedDB 删除笔记失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      let savedNotes = await getSavedNotes();
      savedNotes = savedNotes.filter(note => note.id !== noteId);
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
      localStorage.setItem(storageKey, JSON.stringify(savedNotes));
      return true;
    } catch (fallbackError) {
      console.error('降级删除也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 清空所有保存的纸条
 * @returns {Promise<boolean>} 是否清空成功
 */
export async function clearSavedNotes() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先从 IndexedDB 清空
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const index = store.index('userId');
      const request = index.openCursor(IDBKeyRange.only(userId));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = (event) => reject(event.target.error);
    });
    
    // 同时清空 localStorage
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('清空 localStorage 中的笔记失败 (备份):', error);
    }
    
    return true;
  } catch (error) {
    console.error('从 IndexedDB 清空笔记失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
      localStorage.removeItem(storageKey);
      return true;
    } catch (fallbackError) {
      console.error('降级清空也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 保存设置到 IndexedDB
 * @param {string} key 设置键
 * @param {any} value 设置值
 * @param {string} userId 用户ID
 * @returns {Promise<boolean>} 是否保存成功
 */
async function saveSettingToIDB(key, value, userId) {
  try {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      const request = store.put({
        key: `${userId}-${key}`,
        userId,
        value,
        updatedAt: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
    
    return true;
  } catch (error) {
    console.error(`保存设置 ${key} 到 IndexedDB 失败:`, error);
    return false;
  }
}

/**
 * 从 IndexedDB 获取设置
 * @param {string} key 设置键
 * @param {string} userId 用户ID
 * @returns {Promise<any>} 设置值
 */
async function getSettingFromIDB(key, userId) {
  try {
    const db = await openDatabase();
    const result = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(`${userId}-${key}`);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
    
    return result ? result.value : null;
  } catch (error) {
    console.warn(`从 IndexedDB 获取设置 ${key} 失败:`, error);
    return null;
  }
}

/**
 * 获取引导完成状态
 * @returns {Promise<boolean>} 是否已完成引导
 */
export async function getOnboardingCompleted() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先从 IndexedDB 获取
    const completed = await getSettingFromIDB(BASE_KEYS.ONBOARDING_COMPLETED, userId);
    if (completed !== null) {
      return completed === true;
    }
  } catch (error) {
    console.warn('从 IndexedDB 获取引导状态失败:', error);
  }
  
  // 如果 IndexedDB 失败或没有数据，尝试从 localStorage 获取
  try {
    // 对于引导状态，我们首先检查全局设置（旧版）
    const globalSetting = localStorage.getItem('soul-note-onboarding-completed');
    if (globalSetting === 'true') {
      // 同步到 IndexedDB
      await saveSettingToIDB(BASE_KEYS.ONBOARDING_COMPLETED, true, userId);
      return true;
    }
    
    // 然后检查用户特定设置
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.ONBOARDING_COMPLETED);
    const completed = localStorage.getItem(storageKey) === 'true';
    
    // 同步到 IndexedDB
    await saveSettingToIDB(BASE_KEYS.ONBOARDING_COMPLETED, completed, userId);
    
    return completed;
  } catch (error) {
    console.error('获取引导状态失败:', error);
    // 如果出错，假设用户尚未完成引导
    return false;
  }
}

/**
 * 设置引导完成状态
 * @param {boolean} completed 是否完成
 * @returns {Promise<boolean>} 是否设置成功
 */
export async function setOnboardingCompleted(completed = true) {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先保存到 IndexedDB
    const savedToIDB = await saveSettingToIDB(BASE_KEYS.ONBOARDING_COMPLETED, completed, userId);
    
    // 同时保存到 localStorage
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.ONBOARDING_COMPLETED);
      localStorage.setItem(storageKey, completed ? 'true' : 'false');
      // 同时设置全局状态以兼容旧版
      localStorage.setItem('soul-note-onboarding-completed', completed ? 'true' : 'false');
    } catch (error) {
      console.warn('保存引导状态到 localStorage 失败 (备份):', error);
    }
    
    return savedToIDB;
  } catch (error) {
    console.error('保存引导状态到 IndexedDB 失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.ONBOARDING_COMPLETED);
      localStorage.setItem(storageKey, completed ? 'true' : 'false');
      // 同时设置全局状态以兼容旧版
      localStorage.setItem('soul-note-onboarding-completed', completed ? 'true' : 'false');
      return true;
    } catch (fallbackError) {
      console.error('降级存储也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 获取邀请码验证状态
 * @returns {Promise<boolean>} 是否已验证邀请码
 */
export async function getInviteCodeVerified() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先从 IndexedDB 获取
    const verified = await getSettingFromIDB(BASE_KEYS.INVITE_CODE_VERIFIED, userId);
    if (verified !== null) {
      return verified === true;
    }
  } catch (error) {
    console.warn('从 IndexedDB 获取邀请码验证状态失败:', error);
  }
  
  // 如果 IndexedDB 失败或没有数据，尝试从 localStorage 获取
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.INVITE_CODE_VERIFIED);
    // 检查用户特定设置
    const userVerified = localStorage.getItem(storageKey) === 'true';
    
    // 检查全局设置（兼容旧版）
    const globalVerified = localStorage.getItem('soul-note-invite-verified') === 'true';
    
    const isVerified = userVerified || globalVerified;
    
    // 同步到 IndexedDB
    if (isVerified) {
      await saveSettingToIDB(BASE_KEYS.INVITE_CODE_VERIFIED, true, userId);
    }
    
    return isVerified;
  } catch (error) {
    console.error('获取邀请码验证状态失败:', error);
    return false;
  }
}

/**
 * 设置邀请码验证状态
 * @param {string} inviteCode 邀请码
 * @param {boolean} verified 是否已验证
 * @returns {Promise<boolean>} 是否设置成功
 */
export async function setInviteCodeVerified(inviteCode, verified = true) {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先保存到 IndexedDB
    const savedVerified = await saveSettingToIDB(BASE_KEYS.INVITE_CODE_VERIFIED, verified, userId);
    
    // 保存已验证的邀请码
    if (verified && inviteCode) {
      await saveSettingToIDB(BASE_KEYS.INVITE_CODE, inviteCode, userId);
    }
    
    // 同时保存到 localStorage
    try {
      // 保存验证状态
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.INVITE_CODE_VERIFIED);
      localStorage.setItem(storageKey, verified ? 'true' : 'false');
      
      // 同时设置全局状态以兼容旧版
      localStorage.setItem('soul-note-invite-verified', verified ? 'true' : 'false');
      
      // 保存已验证的邀请码
      if (verified && inviteCode) {
        const codeStorageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.INVITE_CODE);
        localStorage.setItem(codeStorageKey, inviteCode);
        localStorage.setItem('soul-note-invite-code', inviteCode);
      }
    } catch (error) {
      console.warn('保存邀请码验证状态到 localStorage 失败 (备份):', error);
    }
    
    return savedVerified;
  } catch (error) {
    console.error('保存邀请码验证状态到 IndexedDB 失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      // 保存验证状态
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.INVITE_CODE_VERIFIED);
      localStorage.setItem(storageKey, verified ? 'true' : 'false');
      
      // 同时设置全局状态以兼容旧版
      localStorage.setItem('soul-note-invite-verified', verified ? 'true' : 'false');
      
      // 保存已验证的邀请码
      if (verified && inviteCode) {
        const codeStorageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.INVITE_CODE);
        localStorage.setItem(codeStorageKey, inviteCode);
        localStorage.setItem('soul-note-invite-code', inviteCode);
      }
      
      return true;
    } catch (fallbackError) {
      console.error('降级存储也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 保存API设置
 * @param {Object} settings API设置对象
 * @returns {Promise<boolean>} 是否保存成功
 */
export async function saveApiSettings(settings) {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先保存到 IndexedDB
    const savedToIDB = await saveSettingToIDB(BASE_KEYS.API_SETTINGS, settings, userId);
    
    // 同时保存到 localStorage
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.API_SETTINGS);
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (error) {
      console.warn('保存API设置到 localStorage 失败 (备份):', error);
    }
    
    // 触发自定义事件，通知组件API设置已更改
    const event = new CustomEvent('api-settings-changed', { detail: settings });
    document.dispatchEvent(event);
    
    return savedToIDB;
  } catch (error) {
    console.error('保存API设置到 IndexedDB 失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.API_SETTINGS);
      localStorage.setItem(storageKey, JSON.stringify(settings));
      
      // 即使使用降级方案，也触发事件
      const event = new CustomEvent('api-settings-changed', { detail: settings });
      document.dispatchEvent(event);
      
      return true;
    } catch (fallbackError) {
      console.error('降级存储也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 获取API设置
 * @returns {Promise<Object|null>} API设置对象
 */
export async function getApiSettings() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  // 如果 IndexedDB 失败或没有数据，尝试从 localStorage 获取
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.API_SETTINGS);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      const settings = JSON.parse(data);
      
      // 如果从 localStorage 获取成功，尝试同步到 IndexedDB
      try {
        await saveSettingToIDB(BASE_KEYS.API_SETTINGS, settings, userId);
      } catch (syncError) {
        console.warn('同步API设置到 IndexedDB 失败:', syncError);
      }
      
      return settings;
    }
  } catch (error) {
    console.error('获取API设置失败:', error);
  }
  
  return null;
}

/**
 * 清除API设置
 * @returns {Promise<boolean>} 是否清除成功
 */
export async function clearApiSettings() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    // 首先从 IndexedDB 清除
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const key = `${userId}:${BASE_KEYS.API_SETTINGS}`;
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
    
    // 然后从 localStorage 清除
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.API_SETTINGS);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('从 localStorage 清除API设置失败:', error);
    }
    
    // 触发自定义事件，通知组件API设置已更改（被清除）
    const event = new CustomEvent('api-settings-changed', { detail: null });
    document.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('清除API设置失败:', error);
    
    // 降级方案：尝试只从 localStorage 清除
    try {
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.API_SETTINGS);
      localStorage.removeItem(storageKey);
      
      // 即使使用降级方案，也触发事件
      const event = new CustomEvent('api-settings-changed', { detail: null });
      document.dispatchEvent(event);
      
      return true;
    } catch (fallbackError) {
      console.error('降级清除也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 完全重置用户数据
 * 清除所有用户相关数据并重置用户标识
 * @returns {Promise<boolean>} 是否重置成功
 */
export async function resetUserData() {
  try {
    const userId = await userIdentifierService.getOrCreateUserId();
    
    // 清除 IndexedDB 中的所有用户数据
    try {
      const db = await openDatabase();
      
      // 清除偏好设置
      await new Promise((resolve) => {
        const transaction = db.transaction(['preferences'], 'readwrite');
        const store = transaction.objectStore('preferences');
        const request = store.delete(userId);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve(); // 忽略错误，继续清除其他数据
      });
      
      // 清除笔记
      await new Promise((resolve) => {
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        const index = store.index('userId');
        const request = index.openCursor(IDBKeyRange.only(userId));
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => resolve(); // 忽略错误，继续清除其他数据
      });
      
      // 清除设置
      await new Promise((resolve) => {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const index = store.index('userId');
        const request = index.openCursor(IDBKeyRange.only(userId));
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => resolve(); // 忽略错误，继续清除其他数据
      });
    } catch (error) {
      console.error('清除 IndexedDB 数据失败:', error);
    }
    
    // 清除全局引导状态
    localStorage.removeItem('soul-note-onboarding-completed');
    
    // 清除旧版存储
    localStorage.removeItem(BASE_KEYS.PREFERENCES);
    localStorage.removeItem(BASE_KEYS.NOTES);
    
    // 重置用户标识和相关存储
    const success = await userIdentifierService.resetUserId();
    
    return success;
  } catch (error) {
    console.error('重置用户数据失败:', error);
    return false;
  }
}

/**
 * 检查存储健康状态
 * @returns {Promise<Object>} 存储健康状态
 */
export async function checkStorageHealth() {
  const health = {
    indexedDB: {
      available: false,
      writable: false
    },
    localStorage: {
      available: false,
      writable: false,
      spaceAvailable: 0
    }
  };
  
  // 检查 IndexedDB
  try {
    const db = await openDatabase();
    health.indexedDB.available = true;
    
    // 测试写入
    try {
      const testKey = 'storage-health-test';
      const testValue = { test: 'value', timestamp: Date.now() };
      const userId = await userIdentifierService.getOrCreateUserId();
      
      await saveSettingToIDB(testKey, testValue, userId);
      health.indexedDB.writable = true;
    } catch (error) {
      console.warn('IndexedDB 写入测试失败:', error);
    }
  } catch (error) {
    console.warn('IndexedDB 不可用:', error);
  }
  
  // 检查 localStorage
  try {
    const testKey = 'storage-health-test';
    const testValue = JSON.stringify({ test: 'value', timestamp: Date.now() });
    
    // 检查是否可用
    localStorage.setItem(testKey, testValue);
    localStorage.removeItem(testKey);
    health.localStorage.available = true;
    health.localStorage.writable = true;
    
    // 估计可用空间
    try {
      let i = 0;
      const chunk = '0'.repeat(1024 * 1024); // 1MB
      const maxIterations = 10; // 最多测试 10MB
      
      localStorage.setItem(testKey, '');
      
      while (i < maxIterations) {
        try {
          const currentValue = localStorage.getItem(testKey) || '';
          localStorage.setItem(testKey, currentValue + chunk);
          i++;
        } catch (e) {
          break;
        }
      }
      
      health.localStorage.spaceAvailable = i;
      localStorage.removeItem(testKey);
    } catch (error) {
      console.warn('localStorage 空间测试失败:', error);
    }
  } catch (error) {
    console.warn('localStorage 不可用:', error);
  }
  
  return health;
}

/**
 * 备份用户数据
 * @returns {Promise<Object>} 备份数据
 */
export async function backupUserData() {
  const userId = await userIdentifierService.getOrCreateUserId();
  
  try {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      userId,
      preferences: null,
      notes: [],
      settings: {}
    };
    
    // 获取偏好设置
    const preferences = await getUserPreferences();
    if (preferences) {
      backup.preferences = preferences;
    }
    
    // 获取笔记
    const notes = await getSavedNotes();
    if (notes && notes.length > 0) {
      backup.notes = notes;
    }
    
    // 获取设置
    try {
      const db = await openDatabase();
      const settings = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const index = store.index('userId');
        const request = index.getAll(userId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      });
      
      if (settings && settings.length > 0) {
        for (const setting of settings) {
          const key = setting.key.replace(`${userId}-`, '');
          backup.settings[key] = setting.value;
        }
      }
    } catch (error) {
      console.warn('获取设置备份失败:', error);
    }
    
    return backup;
  } catch (error) {
    console.error('备份用户数据失败:', error);
    return null;
  }
}

/**
 * 恢复用户数据
 * @param {Object} backup 备份数据
 * @returns {Promise<boolean>} 是否恢复成功
 */
export async function restoreUserData(backup) {
  if (!backup || !backup.version || !backup.userId) {
    console.error('无效的备份数据');
    return false;
  }
  
  try {
    // 恢复偏好设置
    if (backup.preferences) {
      await saveUserPreferences(backup.preferences);
    }
    
    // 恢复笔记
    if (backup.notes && backup.notes.length > 0) {
      for (const note of backup.notes) {
        await saveNote(note);
      }
    }
    
    // 恢复设置
    if (backup.settings) {
      const userId = await userIdentifierService.getOrCreateUserId();
      
      for (const [key, value] of Object.entries(backup.settings)) {
        await saveSettingToIDB(key, value, userId);
        
        // 同时恢复到 localStorage
        try {
          if (key === BASE_KEYS.API_SETTINGS) {
            const storageKey = await userIdentifierService.getUserStorageKey(key);
            localStorage.setItem(storageKey, JSON.stringify(value));
          } else if (key === BASE_KEYS.ONBOARDING_COMPLETED || key === BASE_KEYS.INVITE_CODE_VERIFIED) {
            const storageKey = await userIdentifierService.getUserStorageKey(key);
            localStorage.setItem(storageKey, value ? 'true' : 'false');
          } else if (key === BASE_KEYS.INVITE_CODE) {
            const storageKey = await userIdentifierService.getUserStorageKey(key);
            localStorage.setItem(storageKey, value);
          }
        } catch (error) {
          console.warn(`恢复设置 ${key} 到 localStorage 失败:`, error);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('恢复用户数据失败:', error);
    return false;
  }
}

/**
 * 更新已保存的纸条
 * @param {Object} note 要更新的纸条对象
 * @returns {Promise<boolean>} 是否更新成功
 */
export async function updateSavedNote(note) {
  if (!note || !note.id) {
    console.error('更新纸条失败: 无效的纸条对象或ID');
    return false;
  }
  
  try {
    // 确保数据可以被序列化
    const cleanNote = cleanDataForStorage(note);
    
    // 首先尝试从 IndexedDB 更新
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      
      const request = store.put(cleanNote);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
    
    // 同时更新 localStorage 中的笔记列表
    try {
      const savedNotes = await getSavedNotes();
      const existingIndex = savedNotes.findIndex(n => n.id === cleanNote.id);
      
      if (existingIndex >= 0) {
        savedNotes[existingIndex] = cleanNote;
        
        const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
        localStorage.setItem(storageKey, JSON.stringify(savedNotes));
      }
    } catch (error) {
      console.warn('更新 localStorage 中的笔记列表失败 (备份):', error);
    }
    
    return true;
  } catch (error) {
    console.error('更新纸条到 IndexedDB 失败:', error);
    
    // 降级方案：使用 localStorage
    try {
      const savedNotes = await getSavedNotes();
      const existingIndex = savedNotes.findIndex(n => n.id === note.id);
      
      if (existingIndex >= 0) {
        // 确保数据可以被序列化
        const cleanNote = cleanDataForStorage(note);
        savedNotes[existingIndex] = cleanNote;
        
        const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.NOTES);
        localStorage.setItem(storageKey, JSON.stringify(savedNotes));
        return true;
      }
      
      return false;
    } catch (fallbackError) {
      console.error('降级更新也失败:', fallbackError);
      return false;
    }
  }
}