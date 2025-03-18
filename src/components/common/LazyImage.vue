<template>
  <div class="lazy-image-container" :style="{ width, height }">
    <!-- 加载状态 -->
    <div class="image-loading" v-if="loading">
      <div class="loading-spinner">
        <div class="spinner-item"></div>
        <div class="spinner-item"></div>
        <div class="spinner-item"></div>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div class="image-error" v-if="error && !loading">
      <i class="fas fa-image"></i>
      <p>{{ errorMessage }}</p>
    </div>
    
    <!-- 图片 -->
    <img
      v-show="!loading && !error"
      :src="src"
      :alt="alt"
      @load="onLoad"
      @error="onError"
      :class="{ 'image-loaded': !loading && !error, 'image-fade-in': fadeIn }"
      :style="imgStyle"
      ref="imgRef"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Image'
  },
  width: {
    type: String,
    default: 'auto'
  },
  height: {
    type: String,
    default: 'auto'
  },
  errorMessage: {
    type: String,
    default: '加载失败'
  },
  fadeIn: {
    type: Boolean,
    default: true
  },
  objectFit: {
    type: String,
    default: 'cover'
  },
  lazy: {
    type: Boolean,
    default: true
  },
  placeholderColor: {
    type: String,
    default: '#f0f0f0'
  }
});

const loading = ref(true);
const error = ref(false);
const observer = ref(null);
const imgRef = ref(null);

const imgStyle = computed(() => ({
  objectFit: props.objectFit
}));

// 处理图片加载完成
function onLoad() {
  loading.value = false;
}

// 处理图片加载错误
function onError() {
  loading.value = false;
  error.value = true;
}

onMounted(() => {
  // 如果不使用懒加载，直接返回
  if (!props.lazy) return;
  
  // 使用 Intersection Observer API 进行懒加载
  observer.value = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      // 图片进入视口时加载
      const img = new Image();
      img.src = props.src;
      img.onload = onLoad;
      img.onerror = onError;
      
      // 取消观察
      observer.value.disconnect();
    }
  }, {
    rootMargin: '50px 0px', // 提前 50px 加载
    threshold: 0.1
  });
  
  // 开始观察
  if (imgRef.value) observer.value.observe(imgRef.value);
});
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: v-bind('props.placeholderColor');
  border-radius: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  width: 100%;
  height: 100%;
  display: block;
  transition: opacity 0.3s ease-in-out;
}

.image-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.image-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
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

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 0.8rem;
  padding: 1rem;
  text-align: center;
}

.image-error i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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