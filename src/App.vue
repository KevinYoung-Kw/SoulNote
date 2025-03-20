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
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { getUserPreferences, getInviteCodeVerified } from './services/storageService';
import logger from './utils/logger';

const router = useRouter();
const showAdminButton = ref(false);
const appReady = ref(false);

// 提供生成分享链接的函数，可在全局使用
const getShareLinkWithInviteCode = async (inviteCode) => {
  // 获取当前环境的基础URL
  const getBaseUrl = () => {
    const { protocol, hostname, port, pathname } = window.location;
    // 对于localhost环境，我们需要包含端口号
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}${pathname}`;
    return baseUrl;
  };
  
  if (!inviteCode) {
    // 如果没有提供邀请码，返回普通的分享链接
    return getBaseUrl() + '#/';
  }
  
  try {
    // 验证邀请码是否有效
    const inviteResult = await getInviteCodeVerified();
    if (!inviteResult.verified) {
      console.warn('尝试分享未验证的邀请码:', inviteCode);
    }
    
    // 生成带邀请码的分享链接
    return `${getBaseUrl()}#/?invitecode=${encodeURIComponent(inviteCode)}`;
  } catch (error) {
    console.error('生成分享链接时出错:', error);
    return getBaseUrl() + '#/';
  }
};

// 将函数提供给所有组件
provide('getShareLinkWithInviteCode', getShareLinkWithInviteCode);

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
    
    // 应用毒舌模式 - 优先使用localStorage中的状态
    const isSavageMode = localStorage.getItem('soulnote_savage_mode') === 'true';
    if (isSavageMode || (preferences && preferences.savageMode)) {
      // 确保状态一致
      if (!isSavageMode && preferences && preferences.savageMode) {
        localStorage.setItem('soulnote_savage_mode', 'true');
      }
      document.body.classList.add('savage-mode');
      logger.info('THEME', 'Savage mode activated on app load');
    }
    
    // 修改偏好设置更新事件监听器
    document.addEventListener('preferences-updated', async (event) => {
      logger.info('PREFERENCES', 'Preferences updated event received:', event.detail);
      
      // 如果事件包含详细的更新信息，直接使用它避免额外的数据库请求
      if (event.detail) {
        // 处理字体大小更新
        if (event.detail.fontSize) {
          logger.info('PREFERENCES', '应用更新的字体大小:', event.detail.fontSize);
        }
        
        // 处理毒舌模式更新 - 直接从事件详情获取
        if (event.detail.savageMode !== undefined) {
          const isSavageMode = event.detail.savageMode === true;
          logger.info('PREFERENCES', '从事件应用毒舌模式:', isSavageMode);
          document.body.classList.toggle('savage-mode', isSavageMode);
        }
      } else {
        // 如果事件没有提供详细信息，从数据库获取完整的偏好设置
        const updatedPrefs = await getUserPreferences();
        
        // 更新页面状态以适应新的偏好设置
        if (updatedPrefs) {
          document.body.classList.toggle('dark-mode', updatedPrefs.theme === 'dark');
          
          // 明确记录和应用毒舌模式状态
          const isSavageMode = updatedPrefs.savageMode === true;
          logger.info('PREFERENCES', '从数据库应用毒舌模式:', isSavageMode);
          document.body.classList.toggle('savage-mode', isSavageMode);
        }
      }
    });
    
    // 添加键盘快捷键监听
    window.addEventListener('keydown', handleKeyDown, { passive: true });
  } catch (error) {
    logger.error('APP', '初始化应用失败:', error);
  } finally {
    appReady.value = true;
  }
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
