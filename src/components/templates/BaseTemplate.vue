<template>
  <div class="template-preview" :style="previewStyle">
    <slot></slot>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  // 模板背景色或渐变
  background: {
    type: String,
    default: '#FFFFFF'
  },
  // 是否激活状态
  active: {
    type: Boolean,
    default: false
  },
  // 是否禁用状态
  disabled: {
    type: Boolean,
    default: false
  }
});

// 计算样式
const previewStyle = computed(() => {
  return {
    background: props.background,
    opacity: props.disabled ? '0.5' : '1',
    border: props.active ? '2px solid var(--primary-color)' : '2px solid var(--border-color)'
  };
});
</script>

<style scoped>
.template-preview {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

.template-preview:hover {
  transform: scale(1.03);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style> 