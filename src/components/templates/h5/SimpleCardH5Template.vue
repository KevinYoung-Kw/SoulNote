<template>
  <div 
    class="simple-card-h5-template" 
    :class="{ 'preview-mode': isPreview }"
    :style="templateStyle"
  >
    <!-- 背景色和边框 -->
    <div class="card-bg"></div>
    
    <!-- 表情气泡容器 - 默认隐藏，不作为H5设置的一部分 -->
    <!-- <div 
      class="emoji-position-container"
      v-if="showEmojiBubble && moods.length > 0"
      :style="moodContainerStyle"
    >
      <span 
        v-for="(mood, index) in moods" 
        :key="index" 
        class="emoji-item"
        :style="moodStyle"
      >{{ mood }}</span>
    </div> -->
    
    <!-- 内容区域 -->
    <div class="content-container" :style="computedContentStyle">
      <p class="content-text">{{ content }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import H5BaseTemplate from './H5BaseTemplate.vue';

const props = defineProps({
  // 内容
  content: {
    type: String,
    default: '点击下方"生成心语"按钮，开始您的心灵之旅...'
  },
  // 表情数组
  moods: {
    type: Array,
    default: () => []
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({})
  },
  // 内容样式
  contentStyle: {
    type: Object,
    default: () => ({})
  },
  // 表情容器样式
  moodContainerStyle: {
    type: Object,
    default: () => ({})
  },
  // 单个表情样式
  moodStyle: {
    type: Object,
    default: () => ({})
  },
  // 其他属性
  hasCustomImage: {
    type: Boolean,
    default: false
  },
  // 预览模式
  isPreview: {
    type: Boolean,
    default: false
  },
  // 是否激活
  active: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  }
});

// 计算模板样式
const templateStyle = computed(() => {
  const style = {
    backgroundColor: props.customStyle?.backgroundColor || '#ffffff',
    borderRadius: props.customStyle?.borderRadius || '16px'
  };
  
  // 预览模式样式
  if (props.isPreview) {
    style.width = '100%';
    style.height = '100%';
    style.border = props.active ? '2px solid var(--primary-color)' : '2px solid var(--border-color)';
    style.opacity = props.disabled ? 0.5 : 1;
  }
  
  return style;
});

// 计算内容样式
const computedContentStyle = computed(() => {
  return {
    fontFamily: props.customStyle?.fontFamily || "'KaitiLocal', 'Kaiti', '楷体', 'STKaiti', '华文楷体', sans-serif",
    fontSize: `${props.customStyle?.fontSize || 18}px`,
    color: props.customStyle?.textColor || '#333333',
    textAlign: props.customStyle?.textPosition || 'center',
    ...props.contentStyle
  };
});
</script>

<style scoped>
.simple-card-h5-template {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  z-index: 1;
  border-radius: inherit;
}

.emoji-position-container {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  z-index: 3;
  justify-content: flex-end;
}

.emoji-item {
  font-size: 20px;
  line-height: 1.2;
}

.content-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 25px;
  box-sizing: border-box;
}

.content-text {
  margin: 0;
  line-height: 1.8;
  word-wrap: break-word;
  max-width: 100%;
  text-align: center;
}

/* 预览模式特殊样式 */
.preview-mode {
  transform: scale(0.95);
  transition: all 0.2s ease;
}

.preview-mode:hover {
  transform: scale(1);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .simple-card-h5-template {
    padding: 15px;
  }
  
  .content-container {
    padding: 20px;
  }
  
  .emoji-item {
    font-size: 18px;
  }
}
</style> 