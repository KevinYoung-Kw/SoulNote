<template>
  <div class="font-preload">楷体预加载</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const fontPreloaded = ref(false);

// 预加载字体的函数
async function preloadFonts() {
  if (fontPreloaded.value) {
    console.log('字体已预加载，无需重复加载');
    return true;
  }
  
  try {
    if ('fonts' in document) {
      // 只预加载明确的字体名称，不使用CSS变量
      await Promise.all([
        document.fonts.load('1em KaitiLocal'),
        document.fonts.load('1em Kaiti'),
        document.fonts.load('1em 楷体'),
        document.fonts.load('1em STKaiti'),
        document.fonts.load('1em 华文楷体')
      ]);
      
      console.log('字体已预加载');
      fontPreloaded.value = true;
      return true;
    } else {
      console.warn('浏览器不支持字体API，跳过字体预加载');
      fontPreloaded.value = true;
      return false;
    }
  } catch (err) {
    console.warn('字体预加载失败', err);
    // 即使有错误也继续，标记为已加载
    fontPreloaded.value = true;
    return false;
  }
}

onMounted(() => {
  // 组件挂载后自动尝试预加载字体
  preloadFonts();
});

defineExpose({
  fontPreloaded,
  preloadFonts  // 暴露预加载字体的方法
});
</script>

<style scoped>
.font-preload {
  position: absolute;
  visibility: hidden;
  width: 0;
  height: 0;
  overflow: hidden;
  /* 列出所有可能的字体，避免使用CSS变量 */
  font-family: KaitiLocal, Kaiti, 楷体, STKaiti, 华文楷体, 'Noto Sans SC', sans-serif;
}
</style> 