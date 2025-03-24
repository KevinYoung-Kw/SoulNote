<template>
  <div class="h5-template" :style="containerStyle">
    <div class="h5-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  // 内容
  content: {
    type: String,
    default: ''
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
  // 容器样式
  containerStyle: {
    type: Object,
    default: () => ({})
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

// 计算容器样式
const computedContainerStyle = computed(() => {
  const style = {
    ...props.containerStyle
  };
  
  // 预览模式下的样式调整
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
    ...props.contentStyle
  };
});
</script>

<style scoped>
.h5-template {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.h5-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* 预览模式特殊样式 */
.h5-template.preview {
  transition: all 0.2s ease;
}

.h5-template.preview:hover {
  transform: scale(1.03);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style> 