<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { getUserPreferences } from './services/storageService';

onMounted(() => {
  // 初始化主题
  const preferences = getUserPreferences();
  if (preferences && preferences.theme === 'dark') {
    document.body.classList.add('dark-mode');
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
