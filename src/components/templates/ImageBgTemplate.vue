<template>
  <!-- 渲染模式 -->
  <div v-if="!isPreview" class="image-bg-template">
    <!-- 图片背景层 -->
    <div 
      v-if="hasCustomImage" 
      class="note-image-layer"
      :style="imageLayerStyle"
    ></div>
    
    <!-- 内容层 -->
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
    <div class="image-bg-preview">
      <div class="overlay-text">
        <div class="text-line"></div>
        <div class="text-line short"></div>
      </div>
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
  imageLayerStyle: {
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
const background = 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), linear-gradient(45deg, #4A6FB5, #7B9E89)';
</script>

<style scoped>
/* 渲染模式样式 */
.image-bg-template {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: inherit; /* 继承父元素的圆角 */
}

/* 图片层样式 */
.note-image-layer {
  position: absolute;
  width: 101%;
  height: 101%;
  top: -0.5%;
  left: -0.5%;
  z-index: 1;
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
  margin: 0;
  padding: 0;
  border-radius: inherit; /* 继承父元素的圆角 */
}

/* 内容样式 */
.note-content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  box-sizing: border-box;
  padding: 20px; /* 统一内容区域的内边距 */
  margin: 0;
}

.note-content-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.note-content::-webkit-scrollbar {
  display: none;
}

/* 表情容器样式 */
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
.image-bg-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.overlay-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80%;
}

.text-line {
  width: 70%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
}

.text-line.short {
  width: 50%;
}
</style> 