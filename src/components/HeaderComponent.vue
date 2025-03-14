<template>
  <div class="header-wrapper">
    <button 
      class="header-toggle-btn" 
      @click="toggleHeader" 
      :class="{'header-collapsed': headerCollapsed}"
      aria-label="折叠标题栏"
    >
      <div class="toggle-bar"></div>
    </button>

    <header class="header fixed-header" :class="{'header-collapsed': headerCollapsed}">
      <button class="icon-btn" @click="goToSettings">
        <i class="fas fa-cog"></i>
      </button>
      <h1 class="app-title">星语心笺</h1>
      <div class="header-right">
        <!-- 添加清除按钮 -->
        <button class="icon-btn" @click="clearContent" v-if="hasGeneratedContent">
          <i class="fas fa-times"></i>
        </button>
        <button class="icon-btn" @click="goToSavedNotes">
          <i class="fas fa-bookmark"></i>
        </button>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';
import logger from '../utils/logger';

const router = useRouter();

// Props
const props = defineProps({
  hasGeneratedContent: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['clear-content']);

// State
const headerCollapsed = ref(false);

// Methods
function toggleHeader() {
  headerCollapsed.value = !headerCollapsed.value;
  
  // 保存用户偏好
  try {
    const currentPrefs = getUserPreferences();
    saveUserPreferences({
      ...currentPrefs,
      headerCollapsed: headerCollapsed.value
    });
  } catch (error) {
    logger.error('HEADER', '保存页眉折叠状态失败:', error);
  }
  
  // 通知父组件头部状态已更改
  emit('header-toggle', headerCollapsed.value);
}

function goToSettings() {
  router.push('/settings');
}

function goToSavedNotes() {
  router.push('/saved');
}

function clearContent() {
  emit('clear-content');
}

// Lifecycle hooks
onMounted(async () => {
  try {
    const preferences = await getUserPreferences();
    if (preferences) {
      headerCollapsed.value = preferences.headerCollapsed || false;
    }
  } catch (error) {
    logger.error('HEADER', '加载页眉状态失败:', error);
  }
});
</script>

<style scoped>
.header-wrapper {
  position: relative;
  z-index: 20;
  height: auto;
  transition: height var(--transition-normal);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.app-title {
  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.1);
}

/* 页头折叠时，包装器高度调整为只包含按钮高度 */
.header-wrapper .header-collapsed {
  margin-top: -100%;
}

/* 替换页眉折叠按钮样式，改为横条 */
.header-toggle-btn {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: var(--card-bg);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 21;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  padding: 0;
}

.header-toggle-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(-50%) translateY(-2px);
}

/* 添加横条内部样式 */
.toggle-bar {
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
}

/* 鼠标悬停时改变颜色 */
.header-toggle-btn:hover .toggle-bar {
  background-color: var(--primary-color);
}

/* 针对较小屏幕的优化 */
@media (max-width: 480px) {
  .header-toggle-btn {
    width: 30px;
    height: 3px;
    bottom: -4px;
  }
  
  .toggle-bar {
    height: 3px;
  }
}

/* 毒舌模式样式适配 */
:global(.savage-mode) .header-toggle-btn:hover .toggle-bar {
  background-color: var(--savage-primary-color, #ff5252);
}

:global(.savage-mode) .app-title {
  color: var(--savage-primary-color, #ff5252);
  text-shadow: 0 0 5px rgba(255, 82, 82, 0.2);
}
</style> 