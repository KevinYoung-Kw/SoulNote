<template>
  <!-- 渲染模式 -->
  <div v-if="!isPreview" class="paper-template">
    <!-- 纸条布局 - 居中显示的文本 -->
    <div class="note-content note-content-centered" :style="contentStyle">{{ content }}</div>
    
    <!-- 表情符号容器 -->
    <div 
      class="note-mood-container" 
      v-if="moods.length > 0 && customStyle?.showEmojiBubble !== false" 
      :style="moodContainerStyle"
    >
      <div 
        v-for="(emoji, index) in moods" 
        :key="`mood-${index}`" 
        class="note-mood-item" 
        :style="moodStyle"
      >
        {{ emoji }}
      </div>
    </div>
  </div>
  
  <!-- 预览模式 -->
  <base-template v-else :background="background" :active="active" :disabled="disabled">
    <div class="paper-preview-content">
      <div class="text-line"></div>
      <div class="text-line short"></div>
    </div>
  </base-template>
</template>

<script setup>
import { defineProps } from 'vue';
import BaseTemplate from './BaseTemplate.vue';

const props = defineProps({
  // 渲染所需的属性
  content: {
    type: String,
    default: ''
  },
  moods: {
    type: Array,
    default: () => []
  },
  customStyle: {
    type: Object,
    default: () => ({})
  },
  // 样式相关属性
  contentStyle: {
    type: Object,
    default: () => ({})
  },
  moodContainerStyle: {
    type: Object,
    default: () => ({})
  },
  moodStyle: {
    type: Object,
    default: () => ({})
  },
  // 其他属性
  hasCustomImage: {
    type: Boolean,
    default: false
  },
  // 预览模式相关属性
  isPreview: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

// 预览模式的背景
const background = 'linear-gradient(to right bottom, #FFFFFF, #F9F3E5)';
</script>

<style scoped>
/* 渲染模式样式 */
.paper-template {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.note-content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.note-content::-webkit-scrollbar {
  display: none;
}

.note-content-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.note-mood-container {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  z-index: 20;
}

.note-mood-item {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: all 0.2s ease;
}

.note-mood-item:hover {
  transform: scale(1.1);
  opacity: 1;
}

/* 预览模式样式 */
.paper-preview-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 12px;
}

.text-line {
  width: 70%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.2);
  margin-bottom: 8px;
}

.text-line.short {
  width: 50%;
}
</style> 