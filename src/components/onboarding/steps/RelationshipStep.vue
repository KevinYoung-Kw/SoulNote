<template>
  <OnboardingStep
    title="您的感情状况？"
    description="了解您的情感状态有助于我们创作更贴合您内心的文字"
  >
    <div class="relationship-options">
      <div 
        v-for="status in relationshipStatuses" 
        :key="status.value"
        class="relationship-option"
        :class="{ active: modelValue === status.value }"
        @click="handleSelect(status.value)"
      >
        <i :class="status.icon"></i>
        <span>{{ status.label }}</span>
      </div>
    </div>
  </OnboardingStep>
</template>

<script setup>
import { defineProps, defineEmits, inject } from 'vue';
import OnboardingStep from '../OnboardingStep.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

// 获取注入的事件总线
const onboardingBus = inject('onboardingBus', null);

// 处理选择
function handleSelect(value) {
  // 只有在值变化时才触发
  if (props.modelValue !== value) {
    // 更新模型值
    emit('update:modelValue', value);
    
    // 使用事件总线自动前进
    if (onboardingBus) {
      setTimeout(() => {
        onboardingBus.autoAdvance();
      }, 600); // 适中的延迟时间，平衡动画效果与用户体验
    }
  }
}

// 婚恋状况数据
const relationshipStatuses = [
  { label: '单身', value: 'single', icon: 'fas fa-user' },
  { label: '有心仪对象', value: 'crushing', icon: 'fas fa-heart' },
  { label: '恋爱中', value: 'relationship', icon: 'fas fa-people-arrows' },
  { label: '已婚', value: 'married', icon: 'fas fa-ring' }
];
</script>

<style scoped>
.relationship-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xs);
}

.relationship-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  overflow: hidden;
}

.relationship-option i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  transition: all 0.4s ease;
}

.relationship-option span {
  font-size: 14px;
  transition: all 0.4s ease;
}

.relationship-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.relationship-option:before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transform: scale(0.2);
  transition: all 0.6s ease;
}

.relationship-option.active:before {
  opacity: 0.15;
  transform: scale(1);
}

.relationship-option.active i {
  color: white;
  transform: scale(1.2);
}

@media (max-width: 480px) {
  .relationship-options {
    grid-template-columns: 1fr;
    padding: 0;
    gap: var(--spacing-sm);
  }
  
  @media (max-height: 667px) {
    .relationship-option {
      padding: var(--spacing-sm);
    }
    
    .relationship-option i {
      font-size: 18px;
      margin-bottom: var(--spacing-xs);
    }
  }
}
</style> 