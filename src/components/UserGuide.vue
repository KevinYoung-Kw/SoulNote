<template>
  <div class="user-guide-overlay" v-if="visible" @click.self="closeGuide">
    <div class="user-guide-container">
      <div class="guide-header">
        <h2>{{ currentStep.title }} <span class="step-counter">{{ currentStepIndex + 1 }}/{{ steps.length }}</span></h2>
        <button class="icon-btn" @click="closeGuide">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="guide-content" ref="contentRef">
        <div class="guide-image-container" ref="imageContainerRef">
          <div class="guide-image" v-if="currentStep.image">
            <div v-if="svgContent[currentStepIndex]" v-html="svgContent[currentStepIndex]"></div>
            <div v-else-if="svgLoading" class="svg-loading">
              <div class="loading-spinner"></div>
              <div class="loading-text">加载中...</div>
            </div>
            <img v-else :src="currentStep.image" :alt="currentStep.title">
          </div>
          
          <!-- 图片滚动提示 (居中显示) -->
          <div class="image-scroll-hint" v-if="showImageScrollHint">
            <i class="fas fa-chevron-down scroll-hint-icon"></i>
            <span>向下滑动查看图片</span>
          </div>
        </div>
      </div>
      
      <!-- 固定字幕式文字说明 -->
      <div class="guide-subtitle">
        <p>{{ currentStep.description }}</p>
      </div>
      
      <div class="guide-footer">
        <div class="guide-dots">
          <span 
            v-for="(step, index) in steps" 
            :key="index" 
            :class="{'active': currentStepIndex === index}"
            @click="goToStep(index)"
          ></span>
        </div>
        <div class="guide-buttons">
          <button 
            class="btn-secondary" 
            v-if="currentStepIndex > 0" 
            @click="prevStep"
          >
            上一步
          </button>
          <button 
            class="btn-primary" 
            @click="nextStep"
          >
            {{ currentStepIndex === steps.length - 1 ? '完成' : '下一步' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, nextTick, watch } from 'vue';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';
import { loadSvg, createInlineSvg, preloadSvgs } from '../utils/svgOptimizer';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialStep: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close', 'finished']);

const currentStepIndex = ref(props.initialStep);
const svgContent = ref([]);
const svgLoading = ref(false);
const contentRef = ref(null);
const imageContainerRef = ref(null);
const showImageScrollHint = ref(false);

// 引导步骤定义
const steps = [
  {
    title: '欢迎使用星语心笺',
    description: '星语心笺是一款帮助您记录心情、生成文字笔记的应用。通过简单的几步，您就能创建出富有感情的心灵文字。',
    image: '/guide/welcome.svg'
  },
  {
    title: '使用指南',
    description: '在使用过程中，您可以随时点击右上角的关闭按钮退出本指南，或者继续阅读了解更多功能。',
    image: '/guide/welcome.svg'
  },
  {
    title: '设置个人参数',
    description: '点击参数卡片可以设置您的星座、MBTI、心情等个人特性，这些将帮助生成更符合您个性的心语内容。',
    image: '/guide/params.svg'
  },
  {
    title: '个性化生成',
    description: '您的个人特征会影响生成的内容风格，例如选择不同的心情会得到不同情感色彩的文字。',
    image: '/guide/params.svg'
  },
  {
    title: '生成专属心语',
    description: '点击底部的"生成心语"按钮，系统将根据您的个人特性自动创作一段情感丰富的文字，表达您当下的心情。',
    image: '/guide/generate.svg'
  },
  {
    title: '多样化内容',
    description: '每次生成的内容都是独一无二的，您可以多次尝试，直到找到您喜欢的表达。',
    image: '/guide/generate.svg'
  },
  {
    title: '收藏与分享心语',
    description: '您可以将喜欢的心语收藏起来，随时查看；也可以通过分享功能，将这些美好的文字分享给您的朋友。',
    image: '/guide/save.svg'
  },
  {
    title: '永久保存',
    description: '收藏的内容会永久保存在您的设备上，即使关闭应用也不会丢失。',
    image: '/guide/save.svg'
  },
  {
    title: '个性化定制',
    description: '点击"自定义"按钮，可以调整文字的背景、字体大小和样式，让您的心语展示得更加个性化。',
    image: '/guide/customize.svg'
  },
  {
    title: '个性化美化',
    description: '您可以根据自己的喜好调整字体大小、颜色和背景，使心语更符合您的审美。',
    image: '/guide/customize.svg'
  },
  {
    title: '探索更多功能',
    description: '在设置页面，您可以定制更多个人选项，包括星座、性别、年龄等，这些都会影响心语的生成效果。随时可以在设置中重新打开本指引。',
    image: '/guide/settings.svg'
  },
  {
    title: '持续优化',
    description: '我们将不断更新应用功能，为您带来更好的体验。',
    image: '/guide/settings.svg'
  }
];

// 计算当前步骤
const currentStep = computed(() => steps[currentStepIndex.value]);

// 检查图片是否需要滚动
function checkImageScrollable() {
  nextTick(() => {
    if (!imageContainerRef.value) return;
    
    const element = imageContainerRef.value;
    // 内容现在更简短，只有当内容高度明显大于容器高度时才显示滚动提示
    showImageScrollHint.value = element.scrollHeight > element.clientHeight + 30;
  });
}

// 预加载所有SVG图片
async function preloadAllSvgs() {
  if (svgLoading.value) return; // 避免重复加载
  
  svgLoading.value = true;
  
  try {
    const svgUrls = steps.map(step => step.image);
    
    // 使用Promise.all并行加载所有SVG
    const loadPromises = svgUrls.map(url => loadSvg(url));
    const results = await Promise.all(loadPromises);
    
    // 更新SVG内容
    svgContent.value = results.map(content => {
      if (content) {
        return content;
      }
      return null;
    });
    
    console.log('所有SVG预加载完成');
  } catch (error) {
    console.error('SVG预加载失败:', error);
  } finally {
    svgLoading.value = false;
  }
}

// 下一步
function nextStep() {
  if (currentStepIndex.value < steps.length - 1) {
    const currentImage = steps[currentStepIndex.value].image;
    const nextImage = steps[currentStepIndex.value + 1].image;
    
    currentStepIndex.value++;
    
    // 只有当图片真正变化时才重置滚动位置
    nextTick(() => {
      if (imageContainerRef.value && currentImage !== nextImage) {
        imageContainerRef.value.scrollTop = 0;
      }
      checkImageScrollable();
    });
  } else {
    finishGuide();
  }
}

// 上一步
function prevStep() {
  if (currentStepIndex.value > 0) {
    const currentImage = steps[currentStepIndex.value].image;
    const prevImage = steps[currentStepIndex.value - 1].image;
    
    currentStepIndex.value--;
    
    // 只有当图片真正变化时才重置滚动位置
    nextTick(() => {
      if (imageContainerRef.value && currentImage !== prevImage) {
        imageContainerRef.value.scrollTop = 0;
      }
      checkImageScrollable();
    });
  }
}

// 跳转到指定步骤
function goToStep(index) {
  if (index >= 0 && index < steps.length) {
    const currentImage = steps[currentStepIndex.value].image;
    const targetImage = steps[index].image;
    
    currentStepIndex.value = index;
    
    // 只有当图片真正变化时才重置滚动位置
    nextTick(() => {
      if (imageContainerRef.value && currentImage !== targetImage) {
        imageContainerRef.value.scrollTop = 0;
      }
      checkImageScrollable();
    });
  }
}

// 完成引导
async function finishGuide() {
  try {
    // 获取当前用户偏好设置
    const preferences = await getUserPreferences();
    
    // 标记用户已完成引导
    await saveUserPreferences({
      ...preferences,
      guideTaken: true,
      lastGuideVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
    });
    
    // 发出完成事件
    emit('finished');
    
    // 关闭引导
    closeGuide();
  } catch (error) {
    console.error('保存引导完成状态失败:', error);
    // 即使保存失败也关闭引导
    closeGuide();
  }
}

// 关闭引导
function closeGuide() {
  emit('close');
}

// 监听步骤变化，检查是否需要显示滚动提示
watch(currentStepIndex, () => {
  checkImageScrollable();
});

// 在组件挂载前预加载SVG
onBeforeMount(() => {
  preloadAllSvgs();
});

// 添加键盘导航支持并检查内容是否可滚动
onMounted(() => {
  // 检查内容是否可滚动
  checkImageScrollable();
  
  // 监听内容滚动事件，隐藏滚动提示
  if (imageContainerRef.value) {
    imageContainerRef.value.addEventListener('scroll', () => {
      if (imageContainerRef.value.scrollTop > 20) {
        showImageScrollHint.value = false;
      } else if (imageContainerRef.value.scrollTop === 0) {
        checkImageScrollable();
      }
    });
  }

  const handleKeyDown = (e) => {
    if (!props.visible) return;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextStep();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      prevStep();
    } else if (e.key === 'Escape') {
      closeGuide();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
});
</script>

<style scoped>
.user-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.user-guide-container {
  width: 90%;
  max-width: 500px;
  background-color: var(--card-bg, white);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.2));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  max-height: 85vh;
}

.guide-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color, #eee);
}

.guide-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #333);
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-counter {
  font-size: 14px;
  color: var(--text-secondary, #666);
  font-weight: normal;
  background-color: var(--bg-color, #f5f5f5);
  padding: 2px 8px;
  border-radius: 12px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary, #666);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color, #333);
}

.guide-content {
  overflow: hidden;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.guide-image-container {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  position: relative;
  scroll-behavior: smooth;
}

.guide-image {
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.guide-image img, 
.guide-image :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}

/* 字幕式固定文字说明 */
.guide-subtitle {
  position: relative;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 16px 20px;
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap; /* 保留换行符 */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.5s ease;
}

.guide-subtitle p {
  margin: 0;
}

.guide-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color, #eee);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guide-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 70%;
}

.guide-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--border-color, #ddd);
  cursor: pointer;
  transition: all 0.2s;
}

.guide-dots span.active {
  background-color: var(--primary-color, #7b9e89);
  transform: scale(1.3);
}

.guide-buttons {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: var(--radius-md, 8px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color, #7b9e89);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark, #5a7a68);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: var(--bg-color, #f5f5f5);
  color: var(--text-color, #333);
  border: 1px solid var(--border-color, #ddd);
}

.btn-secondary:hover {
  background-color: var(--border-color, #eee);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 图片滚动提示样式 */
.image-scroll-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  animation: fadeInOut 2.5s infinite;
  z-index: 10;
  pointer-events: none;
}

.scroll-hint-icon {
  margin-bottom: 6px;
  font-size: 18px;
  animation: bounceUpDown 1.5s infinite;
}

@keyframes bounceUpDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.9; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 响应式样式 */
@media (max-width: 480px) {
  .user-guide-container {
    width: 95%;
    max-height: 85vh;
  }
  
  .guide-header h2 {
    font-size: 16px;
  }
  
  .guide-subtitle {
    font-size: 14px;
    padding: 12px 16px;
  }
  
  .btn-primary, .btn-secondary {
    padding: 7px 14px;
    font-size: 14px;
  }
  
  .image-scroll-hint {
    font-size: 12px;
    padding: 8px 16px;
  }
}

/* SVG加载中样式 */
.svg-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: var(--bg-color, #f5f5f5);
  border-radius: var(--radius-md, 8px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color, #7b9e89);
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary, #666);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 