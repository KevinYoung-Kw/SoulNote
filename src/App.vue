<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  
  <!-- 管理员入口 - 通过特殊手势或按键组合触发 -->
  <div 
    v-if="showAdminButton" 
    class="admin-button" 
    title="管理面板"
    @click="navigateToAdmin"
  >
    <i class="fas fa-cog"></i>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUserPreferences } from './services/storageService';
import logger from './utils/logger';

const router = useRouter();
const showAdminButton = ref(false);
const appReady = ref(false);

// 监听特殊组合键
function handleKeyDown(e) {
  // Ctrl+Alt+A 组合键显示管理员按钮
  if (e.ctrlKey && e.altKey && e.key === 'a') {
    showAdminButton.value = !showAdminButton.value;
  }
}

// 导航到管理面板
function navigateToAdmin() {
  router.push('/admin');
}

onMounted(async () => {
  try {
    // 初始化主题 - 异步获取用户偏好
    const preferences = await getUserPreferences();
    
    // 应用暗黑模式
    if (preferences && preferences.theme === 'dark') {
      document.body.classList.add('dark-mode');
      logger.info('THEME', 'Dark mode activated on app load');
    }
    
    // 应用毒舌模式
    if (preferences && preferences.savageMode) {
      document.body.classList.add('savage-mode');
      logger.info('THEME', 'Savage mode activated on app load');
    }
    
    // 添加全局事件监听，用于处理偏好设置更新
    document.addEventListener('preferences-updated', async (event) => {
      logger.info('PREFERENCES', 'Preferences updated event received:', event.detail);
      const updatedPrefs = await getUserPreferences();
      
      // 更新页面状态以适应新的偏好设置
      if (updatedPrefs) {
        document.body.classList.toggle('dark-mode', updatedPrefs.theme === 'dark');
        document.body.classList.toggle('savage-mode', updatedPrefs.savageMode);
      }
    });
    
  } catch (error) {
    logger.error('APP', '初始化应用失败', error);
  } finally {
    appReady.value = true;
  }

  // 注册快捷键监听
  window.addEventListener('keydown', handleKeyDown, { passive: true });
});

onUnmounted(() => {
  // 移除快捷键监听
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fixed-page-layout {
  background-color: var(--bg-color);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 管理员入口按钮 */
.admin-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

.admin-button:hover {
  transform: scale(1.1);
  background-color: var(--primary-color);
}
</style>
