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
      <div class="header-left">
        <button class="icon-btn" @click="goToSettings">
          <i class="fas fa-cog"></i>
        </button>
        <!-- 添加个人信息提醒 -->
        <div v-if="!hasUserInfo" class="user-info-reminder" @click="goToSettings">
          <i class="fas fa-exclamation-circle"></i>
          <span>请设置个人信息</span>
        </div>
      </div>
      
      <!-- 添加居中标题 -->
      <div class="header-title">
        <h1>星语心笺</h1>
      </div>
      
      <div class="header-right">
        <button class="icon-btn" @click="goToSavedNotes">
          <i class="fas fa-bookmark"></i>
        </button>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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
const hasUserInfo = ref(false);

// Methods
async function toggleHeader() {
  headerCollapsed.value = !headerCollapsed.value;
  
  // 保存用户偏好
  try {
    const currentPrefs = await getUserPreferences();
    await saveUserPreferences({
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

// 检查用户信息是否完整
async function checkUserInfo() {
  try {
    const preferences = await getUserPreferences();
    hasUserInfo.value = !!(preferences?.gender && preferences?.age && 
                          preferences?.relationship && preferences?.zodiac && 
                          preferences?.mbti);
  } catch (error) {
    logger.error('HEADER', '检查用户信息失败:', error);
    hasUserInfo.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    const preferences = await getUserPreferences();
    if (preferences) {
      headerCollapsed.value = preferences.headerCollapsed || false;
    }
    await checkUserInfo();
  } catch (error) {
    logger.error('HEADER', '加载页眉状态失败:', error);
  }
});

// 监听hasGeneratedContent变化，确保UI状态同步
watch(() => props.hasGeneratedContent, (newValue) => {
  // 当内容被清除时，确保UI状态同步
  if (!newValue) {
    logger.info('HEADER', '内容已清除，更新UI状态');
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
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: flex-start;
}

/* 添加居中标题样式 */
.header-title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none; /* 确保点击事件可以穿透到下面的元素 */
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

.user-info-reminder {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--warning-color, #ff9800);
  font-size: 14px;
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: rgba(255, 152, 0, 0.1);
  transition: all var(--transition-fast);
  z-index: 2; /* 确保在标题之上 */
}

.user-info-reminder:hover {
  background-color: rgba(255, 152, 0, 0.2);
}

.user-info-reminder i {
  font-size: 16px;
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
  z-index: 2; /* 确保在标题之上 */
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
  
  .user-info-reminder span {
    display: none;
  }
  
  .header-title h1 {
    font-size: 16px;
  }
}

/* 毒舌模式样式适配 */
:global(.savage-mode) .header-toggle-btn:hover .toggle-bar {
  background-color: var(--savage-primary-color, #ff5252);
}
</style> 