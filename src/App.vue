<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserPreferences } from './services/storageService';

const appReady = ref(false);

onMounted(async () => {
  try {
    // 初始化主题 - 异步获取用户偏好
    const preferences = await getUserPreferences();
    if (preferences && preferences.theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  } catch (error) {
    console.error('初始化主题失败:', error);
  } finally {
    appReady.value = true;
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
