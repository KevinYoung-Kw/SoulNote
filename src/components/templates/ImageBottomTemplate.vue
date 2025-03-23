<template>
  <!-- 渲染模式 -->
  <div v-if="!isPreview" class="image-bottom-template">
    <!-- 上半部分文本 -->
    <div class="note-content" :style="contentStyle">{{ content }}</div>
    
    <!-- 下半部分图片 -->
    <div 
      v-if="hasCustomImage" 
      class="note-image-layer"
      :style="imageLayerStyle"
    ></div>
    
    <!-- 表情符号容器 -->
    <div 
      class="note-mood-container" 
      v-if="moods.length > 0 && customStyle?.showEmojiBubble !== false" 
      :class="moodPositionClass"
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
    <div class="image-bottom-preview">
      <div class="text-area">
        <div class="text-line"></div>
        <div class="text-line short"></div>
      </div>
      <div class="image-area"></div>
    </div>
  </base-template>
</template>

<script setup>
import { defineProps, computed } from 'vue';
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

// 计算文本比例
const textRatio = computed(() => {
  // 默认值为0.5（50%），可以从customStyle中读取
  return props.customStyle?.textRatio || 0.5;
});

// 计算图片比例
const imageRatio = computed(() => {
  return 1 - textRatio.value;
});

// 预览模式的背景
const background = '#FFFFFF';

// 计算表情位置
const moodPositionClass = computed(() => {
  const position = props.customStyle?.moodPosition || 'default';
  
  // 默认位置根据模板自动确定
  if (position === 'default') {
    return 'mood-position-bottom';
  }
  
  return `mood-position-${position}`;
});
</script>

<style scoped>
/* 渲染模式样式 */
.image-bottom-template {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

/* 图片层样式 */
.note-image-layer {
  flex: v-bind('imageRatio');
  position: relative;
  width: 100%;
  z-index: 1;
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
}

/* 内容样式 */
.note-content {
  flex: v-bind('textRatio');
  position: relative;
  z-index: 2;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
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
.image-bottom-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.text-area {
  flex: 0.4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

.image-area {
  flex: 0.6;
  background-color: #4A6FB5;
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

/* 表情位置类 */
.mood-position-top {
  top: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.mood-position-bottom {
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.mood-position-left {
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.mood-position-right {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.mood-position-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 九宫格位置 */
.mood-position-top-left {
  top: 10px;
  left: 10px;
  justify-content: flex-start;
}

.mood-position-top-right {
  top: 10px;
  right: 10px;
  justify-content: flex-end;
}

.mood-position-bottom-left {
  bottom: 10px;
  left: 10px;
  justify-content: flex-start;
}

.mood-position-bottom-right {
  bottom: 10px;
  right: 10px;
  justify-content: flex-end;
}
</style> 