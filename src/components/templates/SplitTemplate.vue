<template>
  <!-- 渲染模式 -->
  <div v-if="!isPreview" class="split-template">
    <div class="split-layout">
      <!-- 左侧文本区域 -->
      <div class="split-section left">
        <div class="note-content" :style="contentStyle">{{ content }}</div>
      </div>
      
      <!-- 右侧图片区域 -->
      <div class="split-section right">
        <div 
          v-if="hasCustomImage" 
          class="note-image-layer"
          :style="imageLayerStyle"
        ></div>
      </div>
    </div>
    
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
    <div class="split-preview">
      <div class="split-section left">
        <div class="text-line"></div>
      </div>
      <div class="split-section right">
        <div class="image-indicator"></div>
      </div>
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
  // 分割方向：horizontal(默认)、vertical
  direction: {
    type: String,
    default: 'horizontal'
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

// 计算文本区域比例
const textRatio = computed(() => {
  // 默认值为0.5（50%），可以从customStyle中读取
  return props.customStyle?.textRatio || 0.5;
});

// 计算图片区域比例
const imageRatio = computed(() => {
  return 1 - textRatio.value;
});

// 计算布局方向
const layoutDirection = computed(() => {
  return props.customStyle?.splitDirection || props.direction || 'horizontal';
});

// 预览模式的背景
const background = 'linear-gradient(135deg, #F5F7FA, #E4E5E7)';

// 计算表情位置
const moodPositionClass = computed(() => {
  const position = props.customStyle?.moodPosition || 'default';
  
  // 默认位置根据模板自动确定
  if (position === 'default') {
    // 对于分屏布局，默认放在左上角
    return 'mood-position-left-top';
  }
  
  return `mood-position-${position}`;
});
</script>

<style scoped>
/* 渲染模式样式 */
.split-template {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: inherit; /* 继承父元素的圆角 */
}

.split-layout {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: v-bind("layoutDirection === 'horizontal' ? 'row' : 'column'");
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-radius: inherit; /* 继承父元素的圆角 */
}

.split-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin: 0;
}

.left {
  flex: v-bind('textRatio');
  background-color: #F9F3E5;
  padding: 10px;
  box-sizing: border-box;
}

.right {
  flex: v-bind('imageRatio');
  background-color: transparent;
  position: relative;
  overflow: hidden;
  padding: 0;
  margin: 0;
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
  margin: 0;
  box-sizing: border-box;
}

.note-content::-webkit-scrollbar {
  display: none;
}

/* 图片层样式 */
.note-image-layer {
  position: absolute;
  width: 101%; /* 略微放大以防止边缘出现白边 */
  height: 101%; /* 略微放大以防止边缘出现白边 */
  top: -0.5%; /* 调整位置以保持居中 */
  left: -0.5%; /* 调整位置以保持居中 */
  z-index: 1;
  background-size: cover;
  background-position: center;
  margin: 0;
  padding: 0;
  border-radius: inherit; /* 对齐容器圆角 */
}

/* 表情容器样式 */
.note-mood-container {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  z-index: 20;
}

/* 表情位置类 */
.mood-position-top {
  top: 10px;
  left: 0;
  right: 0;
  justify-content: center;
}

.mood-position-bottom {
  bottom: 10px;
  left: 0;
  right: 0;
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

.mood-position-left-top {
  top: 10px;
  left: 10px;
}

/* 九宫格位置 */
.mood-position-top-left {
  top: 10px;
  left: 10px;
}

.mood-position-top-right {
  top: 10px;
  right: 10px;
}

.mood-position-bottom-left {
  bottom: 10px;
  left: 10px;
}

.mood-position-bottom-right {
  bottom: 10px;
  right: 10px;
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
.split-preview {
  display: flex;
  height: 100%;
  width: 100%;
}

.split-preview .left {
  background-color: #F9F3E5;
}

.split-preview .right {
  background-color: #4A6FB5;
}

.text-line {
  width: 70%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.2);
}

.image-indicator {
  width: 60%;
  height: 60%;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}
</style> 