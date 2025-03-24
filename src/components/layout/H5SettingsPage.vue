<template>
  <div class="h5-settings-page">
    <!-- 固定页眉 -->
    <div class="header-wrapper">
      <header class="header fixed-header">
        <div class="header-left">
          <button class="icon-btn back-btn" @click="goBack">
            <i class="fas fa-arrow-left"></i>
          </button>
        </div>
        
        <div class="header-title">
          <h1>H5模板设置</h1>
        </div>
        
        <div class="header-right">
          <!-- 右侧空间 -->
        </div>
      </header>
    </div>
    
    <div class="content-area">
      <div class="h5-preview-container">
        <H5Display 
          :initial-template="selectedTemplate"
          :initial-style="customStyle"
          ref="h5DisplayRef"
          @update:template="updateTemplate"
          @update:style="updateStyle"
          @export="handleExport"
        />
      </div>
      
      <div class="action-buttons">
        <button class="btn btn-outline" @click="resetSettings">
          <i class="fas fa-undo"></i> 重置样式
        </button>
        <button class="btn btn-primary" @click="saveSettings">
          <i class="fas fa-save"></i> 保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, inject, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import H5Display from '../display/H5Display.vue';
import { getUserPreferences, saveUserPreferences, getSavedNotes } from '../../services/storageService';

const router = useRouter();
const route = useRoute();

// 从全局状态获取笔记内容和表情
const globalNoteContent = inject('noteContent', ref(''));
const globalNoteMood = inject('noteMood', ref(''));
// 添加设置函数
const setGlobalNoteContent = inject('setNoteContent', null);
const setGlobalNoteMood = inject('setNoteMood', null);

// 状态
const selectedTemplate = ref('calendar-h5');
const customStyle = ref({});
const fontSize = ref(24);
const bgOpacity = ref(1);
// 是否正在加载内容
const isLoadingContent = ref(false);

// H5Display组件引用
const h5DisplayRef = ref(null);

// 处理content标签内容的函数
const processContent = (content) => {
  if (!content) return '';
  
  // 检查是否有content标签
  const contentMatch = content.match(/<content>([\s\S]*?)<\/content>/i);
  if (contentMatch && contentMatch[1]) {
    // 返回content标签内的内容
    return contentMatch[1].trim();
  }
  
  return content;
};

// 方法
function goBack() {
  router.push('/');
}

function updateTemplate(templateId) {
  selectedTemplate.value = templateId;
}

function updateStyle(newStyle) {
  customStyle.value = newStyle;
}

function updateFontSize() {
  customStyle.value = {
    ...customStyle.value,
    fontSize: fontSize.value
  };
}

function updateBgOpacity() {
  customStyle.value = {
    ...customStyle.value,
    bgOpacity: bgOpacity.value
  };
}

function handleExport({ canvas }) {
  // 自动下载图片
  const link = document.createElement('a');
  link.download = `h5-card-${new Date().getTime()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function saveSettings() {
  try {
    const currentPrefs = await getUserPreferences();
    
    // 保存H5相关设置
    await saveUserPreferences({
      ...currentPrefs,
      h5Settings: {
        template: selectedTemplate.value,
        customStyle: customStyle.value,
        fontSize: fontSize.value,
        bgOpacity: bgOpacity.value
      }
    });
    
    alert('设置已保存');
  } catch (error) {
    console.error('保存设置失败:', error);
    alert('保存设置失败');
  }
}

function resetSettings() {
  // 重置所有设置
  selectedTemplate.value = 'calendar-h5';
  customStyle.value = {};
  fontSize.value = 24;
  bgOpacity.value = 1;
  
  // 确保自定义样式包含重置的值
  customStyle.value = {
    fontSize: fontSize.value,
    bgOpacity: bgOpacity.value
  };
}

// 新增：加载最新内容
async function loadLatestContent() {
  if (isLoadingContent.value) return; // 防止重复加载
  
  isLoadingContent.value = true;
  try {
    console.log('开始加载最新内容...');
    
    // 1. 尝试从localStorage中获取最新内容
    const savedNoteContent = localStorage.getItem('soulnote_last_content');
    const savedNoteMood = localStorage.getItem('soulnote_last_mood');
    
    // 2. 如果localStorage中有内容，直接使用
    if (savedNoteContent) {
      console.log('从localStorage加载到内容');
      const processedContent = processContent(savedNoteContent);
      
      // 更新全局状态
      if (setGlobalNoteContent && processedContent) {
        setGlobalNoteContent(processedContent);
      } else {
        globalNoteContent.value = processedContent;
      }
      
      if (setGlobalNoteMood && savedNoteMood) {
        setGlobalNoteMood(savedNoteMood);
      } else if (savedNoteMood) {
        globalNoteMood.value = savedNoteMood;
      }
      
      return;
    }
    
    // 3. 如果localStorage没有内容，尝试从已保存的笔记中加载最新的一条
    console.log('未在localStorage找到内容，正在从已保存笔记中获取...');
    const savedNotes = await getSavedNotes();
    
    if (savedNotes && savedNotes.length > 0) {
      // 获取最新保存的笔记内容
      const latestNote = savedNotes[0];
      
      if (latestNote.content) {
        console.log('从保存的笔记中加载到内容');
        const processedContent = processContent(latestNote.content);
        
        // 更新全局状态
        if (setGlobalNoteContent && processedContent) {
          setGlobalNoteContent(processedContent);
        } else {
          globalNoteContent.value = processedContent;
        }
        
        // 同时获取表情
        if (latestNote.mood) {
          if (setGlobalNoteMood) {
            setGlobalNoteMood(latestNote.mood);
          } else {
            globalNoteMood.value = latestNote.mood;
          }
          
          // 更新localStorage以便下次直接加载
          try {
            localStorage.setItem('soulnote_last_content', latestNote.content);
            localStorage.setItem('soulnote_last_mood', latestNote.mood);
          } catch (storageError) {
            console.warn('保存内容到localStorage失败', storageError);
          }
        }
      }
    } else {
      console.log('未找到任何保存的笔记');
    }
  } catch (error) {
    console.error('加载最新内容失败:', error);
  } finally {
    isLoadingContent.value = false;
  }
}

// 初始化
async function initSettings() {
  try {
    const prefs = await getUserPreferences();
    if (prefs.h5Settings) {
      selectedTemplate.value = prefs.h5Settings.template || 'calendar-h5';
      customStyle.value = prefs.h5Settings.customStyle || {};
      fontSize.value = prefs.h5Settings.fontSize || 24;
      bgOpacity.value = prefs.h5Settings.bgOpacity || 1;
      
      // 确保customStyle中包含这些值
      customStyle.value.fontSize = fontSize.value;
      customStyle.value.bgOpacity = bgOpacity.value;
    }

    // 加载最新内容
    await loadLatestContent();
  } catch (error) {
    console.error('加载设置失败:', error);
  }
}

// 监听路由变化
watch(() => route.fullPath, () => {
  console.log('路由变化，重新加载内容');
  loadLatestContent();
});

// 在组件激活时重新加载内容
onActivated(() => {
  console.log('组件激活，重新加载内容');
  loadLatestContent();
});

onMounted(async () => {
  console.log('组件挂载，初始化设置');
  await initSettings();
});
</script>

<style scoped>
.h5-settings-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: var(--bg-color);
}

/* 页眉样式 */
.header-wrapper {
  position: relative;
  z-index: 20;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: flex-start;
}

.header-title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  z-index: 1;
}

.header-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: flex-end;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  z-index: 2;
}

.icon-btn:hover {
  color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 内容区域 */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

.h5-preview-container {
  margin-bottom: var(--spacing-lg);
}

/* 按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn i {
  font-size: 16px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-color-dark);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color-light);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style> 