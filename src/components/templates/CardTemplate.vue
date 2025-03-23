<template>
  <!-- 渲染模式 -->
  <div v-if="!isPreview" class="card-template">
    <div class="card-layout">
      <div class="card-header"></div>
      
      <div class="card-content">
        <div class="note-content" :style="contentStyle">{{ content }}</div>
      </div>
      
      <div class="card-footer"></div>
    </div>
    
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
    <div class="card-preview">
      <div class="card-header"></div>
      <div class="card-content">
        <div class="text-line"></div>
        <div class="text-line short"></div>
      </div>
      <div class="card-footer"></div>
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
const background = 'white';
</script>

<style scoped>
/* 渲染模式样式 */
.card-template {
  position: relative;
  width: 100%;
  height: 100%;
}

.card-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.card-header {
  height: 15%;
  background: linear-gradient(to right, var(--primary-color), var(--primary-light));
}

.card-content {
  flex: 1;
  padding: 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.card-footer {
  height: 10%;
  background-color: #f5f5f5;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
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
.card-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.card-preview .card-header {
  height: 15%;
  background: linear-gradient(to right, var(--primary-color), var(--primary-light));
}

.card-preview .card-content {
  flex: 1;
  padding: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card-preview .card-footer {
  height: 10%;
  background-color: #f5f5f5;
}

.text-line {
  width: 70%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.2);
  margin-bottom: 4px;
}

.text-line.short {
  width: 50%;
}
</style> 