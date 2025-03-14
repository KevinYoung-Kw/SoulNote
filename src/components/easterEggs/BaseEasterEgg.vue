<template>
  <div class="easter-egg-container" :class="{ 'is-active': isActive }">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isActive: Boolean,
  currentStep: Number,
  targetStep: {
    type: Number,
    default: 9
  }
});

const emit = defineEmits([
  'activate', 
  'update-suggestions', 
  'update-note-content',
  'update-note-class'
]);

// 共享的基础方法
function activateMode(playSound = true) {
  emit('activate', true);
}

function deactivateMode() {
  emit('activate', false);
}

function updateSuggestions(suggestions) {
  emit('update-suggestions', suggestions);
}

function updateNoteContent(content) {
  emit('update-note-content', content);
}

function updateNoteClass(className) {
  emit('update-note-class', className);
}

// 获取默认欢迎类名
function getWelcomeClass() {
  return '';
}

// 获取默认笔记类名
function getNoteClass() {
  return '';
}

// 获取默认笔记内容
function getNoteContent() {
  return '';
}

// 监听步骤变化
watch(() => props.currentStep, (newStep) => {
  if (newStep === props.targetStep && props.isActive) {
    // 当到达目标步骤且彩蛋已激活时的通用逻辑
  }
});

// 暴露给子组件的方法
defineExpose({
  activateMode,
  deactivateMode,
  updateSuggestions,
  updateNoteContent,
  updateNoteClass,
  getWelcomeClass,
  getNoteClass,
  getNoteContent
});
</script>

<style scoped>
.easter-egg-container {
  display: none;
}

.easter-egg-container.is-active {
  display: block;
}
</style>