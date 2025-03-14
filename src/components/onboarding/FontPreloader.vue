<template>
  <div class="font-preload">楷体预加载</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const fontPreloaded = ref(false);

onMounted(() => {
  // 尝试预加载字体
  if ('fonts' in document) {
    Promise.all([
      document.fonts.load('1em KaitiLocal'),
      document.fonts.load('1em var(--font-note)')
    ]).then(() => {
      console.log('字体已预加载');
      fontPreloaded.value = true;
    }).catch(err => {
      console.warn('字体预加载失败', err);
      fontPreloaded.value = true;
    });
  } else {
    console.warn('浏览器不支持字体API，跳过字体预加载');
    fontPreloaded.value = true;
  }
});

defineExpose({
  fontPreloaded
});
</script>

<style scoped>
.font-preload {
  position: absolute;
  visibility: hidden;
  width: 0;
  height: 0;
  overflow: hidden;
  font-family: var(--font-note);
}
</style> 