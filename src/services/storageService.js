import userIdentifierService from './userIdentifierService';

// 存储键基础名称（无用户标识）
const BASE_KEYS = {
  PREFERENCES: 'preferences',
  NOTES: 'notes',
  ONBOARDING_COMPLETED: 'onboarding-completed',
  INVITE_CODE_VERIFIED: 'invite-code-verified',
  INVITE_CODE: 'invite-code'
};

/**
 * 保存用户偏好设置
 * @param {Object} preferences 用户偏好对象
 * @returns {Promise<boolean>} 是否保存成功
 */
export async function saveUserPreferences(preferences) {
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.USER_PREFERENCES);
    localStorage.setItem(
      storageKey, 
      JSON.stringify(preferences)
    );
    return true;
  } catch (error) {
    console.error('保存偏好设置失败:', error);
    // 降级方案：使用通用键存储
    try {
      localStorage.setItem(
        BASE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
      return true;
    } catch (fallbackError) {
      console.error('降级存储也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 获取用户偏好设置
 * @returns {Promise<Object|null>} 用户偏好对象
 */
export async function getUserPreferences() {
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.USER_PREFERENCES);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // 尝试从旧存储位置读取
    const oldData = localStorage.getItem(BASE_KEYS.USER_PREFERENCES);
    if (oldData) {
      const parsedData = JSON.parse(oldData);
      // 如果成功从旧位置读取，则迁移到新位置
      await saveUserPreferences(parsedData);
      return parsedData;
    }
    
    return getDefaultPreferences();
  } catch (error) {
    console.error('获取偏好设置失败:', error);
    return getDefaultPreferences();
  }
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
    language: 'zh',
    theme: 'light',
    fontSize: 24,
    background: 'paper-1',
    savageMode: false
  };
}

/**
 * 保存生成的纸条
 * @param {Object} note 纸条对象
 * @returns {Promise<Object|null>} 保存后的纸条对象（包含元数据）
 */
export async function saveNote(note) {
  try {
    const savedNotes = await getSavedNotes();
    // 添加ID和保存时间戳
    const noteWithMeta = {
      ...note,
      id: Date.now().toString(),
      savedAt: new Date().toISOString()
    };
    
    savedNotes.unshift(noteWithMeta);
    
    // 最多保存50个纸条
    if (savedNotes.length > 50) {
      savedNotes.pop();
    }
    
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.SAVED_NOTES);
    localStorage.setItem(storageKey, JSON.stringify(savedNotes));
    return noteWithMeta;
  } catch (error) {
    console.error('保存纸条失败:', error);
    return null;
  }
}

/**
 * 获取保存的纸条列表
 * @returns {Promise<Array>} 纸条对象数组
 */
export async function getSavedNotes() {
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.SAVED_NOTES);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // 尝试从旧存储位置读取
    const oldData = localStorage.getItem(BASE_KEYS.SAVED_NOTES);
    if (oldData) {
      const parsedData = JSON.parse(oldData);
      // 如果成功从旧位置读取，则迁移到新位置
      const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.SAVED_NOTES);
      localStorage.setItem(storageKey, oldData);
      return parsedData;
    }
    
    return [];
  } catch (error) {
    console.error('获取保存纸条失败:', error);
    return [];
  }
}

/**
 * 删除指定纸条
 * @param {string} noteId 纸条ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteNote(noteId) {
  try {
    let savedNotes = await getSavedNotes();
    savedNotes = savedNotes.filter(note => note.id !== noteId);
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.SAVED_NOTES);
    localStorage.setItem(storageKey, JSON.stringify(savedNotes));
    return true;
  } catch (error) {
    console.error('删除纸条失败:', error);
    return false;
  }
}

/**
 * 清空所有保存的纸条
 * @returns {Promise<boolean>} 是否清空成功
 */
export async function clearSavedNotes() {
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.SAVED_NOTES);
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('清空纸条失败:', error);
    return false;
  }
}

/**
 * 获取引导完成状态
 * @returns {Promise<boolean>} 是否已完成引导
 */
export async function getOnboardingCompleted() {
  try {
    // 对于引导状态，我们首先检查全局设置（旧版）
    const globalSetting = localStorage.getItem('soul-note-onboarding-completed');
    if (globalSetting === 'true') {
      return true;
    }
    
    // 然后检查用户特定设置
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.ONBOARDING_COMPLETED);
    return localStorage.getItem(storageKey) === 'true';
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
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.ONBOARDING_COMPLETED);
    localStorage.setItem(storageKey, completed ? 'true' : 'false');
    // 同时设置全局状态以兼容旧版
    localStorage.setItem('soul-note-onboarding-completed', completed ? 'true' : 'false');
    return true;
  } catch (error) {
    console.error('设置引导状态失败:', error);
    return false;
  }
}

/**
 * 完全重置用户数据
 * 清除所有用户相关数据并重置用户标识
 * @returns {Promise<boolean>} 是否重置成功
 */
export async function resetUserData() {
  try {
    // 清除全局引导状态
    localStorage.removeItem('soul-note-onboarding-completed');
    
    // 清除旧版存储
    localStorage.removeItem(BASE_KEYS.USER_PREFERENCES);
    localStorage.removeItem(BASE_KEYS.SAVED_NOTES);
    
    // 重置用户标识和相关存储
    const success = await userIdentifierService.resetUserId();
    
    return success;
  } catch (error) {
    console.error('重置用户数据失败:', error);
    return false;
  }
}

/**
 * 获取邀请码验证状态
 * @returns {Promise<boolean>} 是否已验证邀请码
 */
export async function getInviteCodeVerified() {
  try {
    const storageKey = await userIdentifierService.getUserStorageKey(BASE_KEYS.INVITE_CODE_VERIFIED);
    // 检查用户特定设置
    const userVerified = localStorage.getItem(storageKey) === 'true';
    
    // 检查全局设置（兼容旧版）
    const globalVerified = localStorage.getItem('soul-note-invite-verified') === 'true';
    
    return userVerified || globalVerified;
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
  } catch (error) {
    console.error('设置邀请码验证状态失败:', error);
    return false;
  }
}
