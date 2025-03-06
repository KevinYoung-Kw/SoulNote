const STORAGE_KEYS = {
  USER_PREFERENCES: 'soul-note-preferences',
  SAVED_NOTES: 'soul-note-saved-notes'
};

// 保存用户偏好设置
export function saveUserPreferences(preferences) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES, 
      JSON.stringify(preferences)
    );
    return true;
  } catch (error) {
    console.error('保存偏好设置失败:', error);
    return false;
  }
}

// 获取用户偏好设置
export function getUserPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : getDefaultPreferences();
  } catch (error) {
    console.error('获取偏好设置失败:', error);
    return getDefaultPreferences();
  }
}

// 默认偏好设置
function getDefaultPreferences() {
  return {
    zodiac: null,
    mbti: null,
    language: 'zh',
    theme: 'light',
    fontSize: 24,
    background: 'paper-1'
  };
}

// 保存生成的纸条
export function saveNote(note) {
  try {
    const savedNotes = getSavedNotes();
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
    
    localStorage.setItem(STORAGE_KEYS.SAVED_NOTES, JSON.stringify(savedNotes));
    return noteWithMeta;
  } catch (error) {
    console.error('保存纸条失败:', error);
    return null;
  }
}

// 获取保存的纸条
export function getSavedNotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_NOTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取保存纸条失败:', error);
    return [];
  }
}

// 删除纸条
export function deleteNote(noteId) {
  try {
    let savedNotes = getSavedNotes();
    savedNotes = savedNotes.filter(note => note.id !== noteId);
    localStorage.setItem(STORAGE_KEYS.SAVED_NOTES, JSON.stringify(savedNotes));
    return true;
  } catch (error) {
    console.error('删除纸条失败:', error);
    return false;
  }
}

// 清空所有保存的纸条
export function clearSavedNotes() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_NOTES);
    return true;
  } catch (error) {
    console.error('清空纸条失败:', error);
    return false;
  }
}
