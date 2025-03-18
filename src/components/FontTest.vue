<template>
  <div class="font-test-container">
    <h3>字体测试组件</h3>
    <div class="test-section">
      <p class="test-font kaiti">这是使用明确字体名列表的楷体文本</p>
      <p class="test-font system">这是使用系统字体的文本</p>
    </div>
    <div v-if="fontStatus">
      <p>字体加载状态: {{ fontStatus }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const fontStatus = ref('');

onMounted(() => {
  if ('fonts' in document) {
    // 测试各种字体加载
    Promise.all([
      document.fonts.load('1em KaitiLocal').then(() => '楷体本地加载成功'),
      document.fonts.load('1em Kaiti').then(() => 'Kaiti加载成功'),
      document.fonts.load('1em 楷体').then(() => '楷体加载成功'),
    ]).then(results => {
      fontStatus.value = `成功: ${results.join(', ')}`;
    }).catch(err => {
      fontStatus.value = `错误: ${err.message}`;
    });
  } else {
    fontStatus.value = '浏览器不支持字体API';
  }
});
</script>

<style scoped>
.font-test-container {
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.test-section {
  margin: 16px 0;
}

.test-font {
  margin: 8px 0;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.kaiti {
  font-family: KaitiLocal, Kaiti, 楷体, STKaiti, 华文楷体, 'Noto Sans SC', sans-serif;
  font-size: 18px;
}

.system {
  font-family: 'Noto Sans SC', Arial, sans-serif;
  font-size: 18px;
}
</style> 