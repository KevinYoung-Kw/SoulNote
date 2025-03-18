<template>
  <OnboardingStep
    title="您的性别是？"
    description="让我们更好地了解您"
  >
    <div class="gender-options">
      <div 
        class="gender-option"
        :class="{ active: modelValue === 'male' }"
        @click="handleSelect('male')"
      >
        <i class="fas fa-mars"></i>
        <span>男性</span>
      </div>
      <div 
        class="gender-option"
        :class="{ active: modelValue === 'female' }"
        @click="handleSelect('female')"
      >
        <i class="fas fa-venus"></i>
        <span>女性</span>
      </div>
      <div 
        class="gender-option"
        :class="{ active: modelValue === 'other' }"
        @click="handleSelect('other')"
      >
        <i class="fas fa-cat"></i>
        <span>其他</span>
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
      // 延迟600ms是为了让UI有时间更新，创造更好的视觉反馈，确保动画完成
      setTimeout(() => {
        onboardingBus.autoAdvance();
      }, 600);
    }
  }
}
</script>

<style scoped>
.gender-options {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xs);
}

.gender-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  width: 100px;
  position: relative;
  overflow: hidden;
}

.gender-option i {
  font-size: 32px;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  transition: all 0.5s ease;
}

.gender-option span {
  font-size: 14px;
  transition: all 0.5s ease;
}

.gender-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.gender-option:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.5s ease;
}

.gender-option.active:before {
  opacity: 0.2;
  transform: scale(2);
}

@media (max-width: 480px) {
  .gender-options {
    flex-direction: column;
    align-items: center;
    padding: 0;
  }
  
  .gender-option {
    padding: var(--spacing-md);
    width: 80%;
    max-width: 200px;
  }
  
  .gender-option i {
    font-size: 24px;
    margin-bottom: var(--spacing-sm);
  }
  
  @media (max-height: 667px) {
    .gender-option {
      padding: var(--spacing-sm);
    }
    
    .gender-option i {
      font-size: 18px;
      margin-bottom: var(--spacing-xs);
    }
  }
}
</style> 