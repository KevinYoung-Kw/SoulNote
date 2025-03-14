<template>
  <OnboardingStep
    title="语言偏好"
    description="选择您希望生成的心语纸条的语言类型"
  >
    <div class="language-options">
      <div 
        class="language-option"
        :class="{ active: modelValue === 'zh' }"
        @click="$emit('update:modelValue', 'zh')"
      >
        <div class="option-content">
          <h3>中文</h3>
          <p>纯中文表达，传统而温暖</p>
        </div>
      </div>
      
      <div 
        class="language-option"
        :class="{ active: modelValue === 'en-zh' }"
        @click="$emit('update:modelValue', 'en-zh')"
      >
        <div class="option-content">
          <h3>中英双语</h3>
          <p>中英文结合，现代而国际化</p>
        </div>
      </div>
    </div>
  </OnboardingStep>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import OnboardingStep from '../OnboardingStep.vue';

defineProps({
  modelValue: {
    type: String,
    default: 'zh'
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.language-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 450px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.language-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(123, 158, 137, 0.12);
  border-color: var(--primary-color);
}

.language-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(123, 158, 137, 0.25);
}

.language-option.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0.6;
  pointer-events: none;
}

.language-option.active .option-content p {
  color: rgba(255, 255, 255, 0.9);
}

.option-content {
  text-align: center;
  width: 100%;
}

.option-content h3 {
  margin: 0 0 var(--spacing-sm);
  font-size: 18px;
  font-weight: 500;
}

.option-content p {
  margin: 0;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.4;
}

@media (max-width: 480px) {
  .language-options {
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
  }
  
  .language-option {
    padding: var(--spacing-md);
  }
  
  .option-content h3 {
    font-size: 16px;
  }
  
  .option-content p {
    font-size: 14px;
  }
}
</style> 