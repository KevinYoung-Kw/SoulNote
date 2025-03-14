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
        @click="$emit('update:modelValue', status.value)"
      >
        <i :class="status.icon"></i>
        <span>{{ status.label }}</span>
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
    default: null
  }
});

defineEmits(['update:modelValue']);

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
  transition: all var(--transition-normal);
}

.relationship-option i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.relationship-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.relationship-option.active i {
  color: white;
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