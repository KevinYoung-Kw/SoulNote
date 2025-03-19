<template>
  <div class="user-guide-overlay" v-if="visible" @click.self="closeGuide">
    <div class="user-guide-container">
      <div class="guide-header">
        <h2>{{ currentStep.title }}</h2>
        <button class="icon-btn" @click="closeGuide">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="guide-content">
        <div class="guide-image" v-if="currentStep.image">
          <img :src="currentStep.image" :alt="currentStep.title">
        </div>
        <div class="guide-text">
          <p>{{ currentStep.description }}</p>
        </div>
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
import { ref, computed, onMounted } from 'vue';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';

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

// 引导步骤定义
const steps = [
  {
    title: '欢迎使用星语心笺',
    description: '星语心笺是一款帮助您记录心情、生成文字笔记的应用。通过简单的几步，您就能创建出富有感情的心灵文字。',
    image: '/assets/guide/welcome.png'
  },
  {
    title: '参数设置',
    description: '点击参数卡片可以设置您的星座、MBTI、心情等个人特性，这些将帮助生成更符合您个性的心语内容。',
    image: '/assets/guide/params.png'
  },
  {
    title: '生成心语',
    description: '点击底部的"生成心语"按钮，系统将根据您的个人特性自动创作一段情感丰富的文字，表达您当下的心情。',
    image: '/assets/guide/generate.png'
  },
  {
    title: '收藏与分享',
    description: '您可以将喜欢的心语收藏起来，随时查看；也可以通过分享功能，将这些美好的文字分享给您的朋友。',
    image: '/assets/guide/save.png'
  },
  {
    title: '样式定制',
    description: '点击"自定义"按钮，可以调整文字的背景、字体大小和样式，让您的心语展示得更加个性化。',
    image: '/assets/guide/customize.png'
  },
  {
    title: '探索更多',
    description: '在设置页面，您可以定制更多个人选项，包括星座、性别、年龄等，这些都会影响心语的生成效果。随时可以在设置中重新打开本指引。',
    image: '/assets/guide/settings.png'
  }
];

// 计算当前步骤
const currentStep = computed(() => steps[currentStepIndex.value]);

// 下一步
function nextStep() {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++;
  } else {
    finishGuide();
  }
}

// 上一步
function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
}

// 跳转到指定步骤
function goToStep(index) {
  if (index >= 0 && index < steps.length) {
    currentStepIndex.value = index;
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

// 添加键盘导航支持
onMounted(() => {
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
  max-height: 80vh;
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
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.guide-image {
  margin-bottom: 20px;
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.guide-image img {
  width: 100%;
  height: auto;
  display: block;
}

.guide-text {
  color: var(--text-secondary, #666);
  line-height: 1.6;
  font-size: 16px;
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
  gap: 8px;
}

.guide-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--border-color, #ddd);
  cursor: pointer;
  transition: all 0.2s;
}

.guide-dots span.active {
  background-color: var(--primary-color, #7b9e89);
  transform: scale(1.2);
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
  
  .guide-text {
    font-size: 14px;
  }
  
  .btn-primary, .btn-secondary {
    padding: 7px 14px;
    font-size: 14px;
  }
}
</style> 