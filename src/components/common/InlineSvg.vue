<template>
  <div 
    class="inline-svg-container" 
    :class="{ 'is-loading': loading }"
    :style="containerStyle"
  >
    <!-- 加载动画 -->
    <div class="svg-loading" v-if="loading">
      <div class="loading-spinner">
        <div class="spinner-item"></div>
        <div class="spinner-item"></div>
        <div class="spinner-item"></div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div class="svg-error" v-if="error && !loading">
      <i class="fas fa-image"></i>
      <span>{{ errorMessage }}</span>
    </div>
    
    <!-- SVG内容 -->
    <div 
      v-if="svgContent && !loading" 
      class="svg-content"
      v-html="svgContent"
      :style="contentStyle"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { loadSvg } from '../../utils/svgOptimizer';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: 'auto'
  },
  height: {
    type: String,
    default: 'auto'
  },
  color: {
    type: String,
    default: null
  },
  errorMessage: {
    type: String,
    default: '加载失败'
  }
});

const loading = ref(true);
const error = ref(false);
const svgContent = ref(null);

// 容器样式
const containerStyle = computed(() => ({
  width: props.width,
  height: props.height
}));

// 内容样式
const contentStyle = computed(() => {
  const styles = {};
  if (props.color) {
    styles.fill = props.color;
  }
  return styles;
});

// 加载SVG
async function fetchSvg() {
  if (!props.src) return;
  
  loading.value = true;
  error.value = false;
  
  try {
    const content = await loadSvg(props.src);
    if (content) {
      svgContent.value = content;
      error.value = false;
    } else {
      error.value = true;
    }
  } catch (err) {
    console.error('Error loading SVG:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

// 监听src变化重新加载
watch(() => props.src, fetchSvg);

onMounted(fetchSvg);
</script>

<style scoped>
.inline-svg-container {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 24px;
  min-height: 24px;
}

.svg-content {
  width: 100%;
  height: 100%;
}

.svg-content :deep(svg) {
  width: 100%;
  height: 100%;
}

.svg-loading {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.loading-spinner {
  display: flex;
  align-items: center;
}

.spinner-item {
  width: 0.5rem;
  height: 0.5rem;
  margin: 0 0.25rem;
  background-color: var(--primary-color, #7b9e89);
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.4s infinite ease-in-out both;
}

.spinner-item:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-item:nth-child(2) {
  animation-delay: -0.16s;
}

.svg-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}

.svg-error i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 