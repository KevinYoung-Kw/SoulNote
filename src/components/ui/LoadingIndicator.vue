<template>
  <div class="loading-container loading-animation-exempt">
    <div class="loading-progress" :style="{ width: `${progress}%` }"></div>
    <div class="loading-content">
      <span class="loading-text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '正在生成中...'
  },
  adaptiveTime: {
    type: Number,
    default: 5000 // 默认预计5秒钟
  }
});

const progress = ref(0);
let interval = null;
let startTime = null;
let requestId = null;

// 使用requestAnimationFrame代替setInterval来模拟进度，提高性能
function simulateProgress() {
  if (!startTime) startTime = Date.now();
  
  // 已经过去的时间占总预计时间的比例
  const elapsed = Date.now() - startTime;
  const ratio = Math.min(elapsed / props.adaptiveTime, 0.9); // 最多到90%
  
  // 使用缓动函数让进度变化更自然
  // 开始快，接近满时变慢
  progress.value = Math.floor(100 * (1 - Math.pow(1 - ratio, 2)));
  
  // 如果仍在加载，继续请求下一帧
  if (props.isLoading) {
    requestId = requestAnimationFrame(simulateProgress);
  }
}

// 重置进度
function resetProgress() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  if (requestId) {
    cancelAnimationFrame(requestId);
    requestId = null;
  }
  progress.value = 0;
  startTime = null;
}

// 当开始加载时，开启进度模拟
watch(() => props.isLoading, (isLoading) => {
  if (isLoading) {
    resetProgress();
    startTime = Date.now();
    // 使用requestAnimationFrame代替setInterval提高动画流畅度
    requestId = requestAnimationFrame(simulateProgress);
  } else {
    // 加载完成，显示100%然后淡出
    if (requestId) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
    progress.value = 100;
    setTimeout(() => {
      resetProgress();
    }, 300);
  }
});

// 根据不同模型动态调整预计加载时间
watch(() => props.adaptiveTime, () => {
  if (props.isLoading) {
    startTime = Date.now(); // 重置开始时间
  }
});

onMounted(() => {
  if (props.isLoading) {
    requestId = requestAnimationFrame(simulateProgress);
  }
});

onBeforeUnmount(() => {
  resetProgress();
});
</script>

<style scoped>
/* Add a shared CSS class to override savage-mode's transition restrictions */
:deep(.loading-animation-exempt),
:deep(.loading-animation-exempt *) {
  transition: all 0.3s ease !important;
}

.loading-container {
  width: 100%;
  position: relative;
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-md);
  overflow: hidden;
  max-height: 50px; /* 限制最大高度 */
  background-color: transparent; /* 改为透明背景 */
}

.loading-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px; /* 减小高度 */
  background: linear-gradient(to right, var(--primary-color), var(--accent-color), var(--primary-color));
  background-size: 200% 100%;
  transition: width 0.3s ease !important; /* 添加!important确保过渡效果不被覆盖 */
  animation: progress-animation 1.5s infinite linear !important; /* 添加动画确保在savage模式下也流畅 */
  will-change: width, background-position; /* 提示浏览器这些属性会变化，优化性能 */
  transform: translateZ(0); /* 启用硬件加速 */
}

/* 添加动画定义 */
@keyframes progress-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) 0;
  width: 100%;
  height: 28px; /* 添加固定高度 */
}

.loading-spinner {
  width: 16px; /* 减小尺寸 */
  height: 16px; /* 减小尺寸 */
  border: 2px solid rgba(123, 158, 137, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-right: var(--spacing-sm);
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap; /* 保持不换行 */
  overflow: visible; /* 允许内容溢出显示 */
  width: auto; /* 自动宽度适应内容 */
  flex-grow: 1; /* 允许文本占用剩余空间 */
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
