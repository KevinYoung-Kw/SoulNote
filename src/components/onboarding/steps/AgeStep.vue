<template>
  <OnboardingStep
    title="您的年龄段是？"
    description="我们将根据年龄特点提供更贴切的内容"
  >
    <div class="age-options">
      <div 
        v-for="ageGroup in ageGroups" 
        :key="ageGroup.value"
        class="age-option"
        :class="{ active: modelValue === ageGroup.value }"
        @click="$emit('update:modelValue', ageGroup.value)"
      >
        <span>{{ ageGroup.label }}</span>
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

// 年龄段数据
const ageGroups = [
  { label: '18岁以下', value: 'under18' },
  { label: '18-24岁', value: '18-24' },
  { label: '25-34岁', value: '25-34' },
  { label: '35-44岁', value: '35-44' },
  { label: '45-54岁', value: '45-54' },
  { label: '55岁以上', value: 'above55' }
];
</script>

<style scoped>
.age-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xs);
}

.age-option {
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
}

.age-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateX(8px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 480px) {
  .age-options {
    padding: 0;
    gap: var(--spacing-sm);
  }
  
  .age-option {
    padding: var(--spacing-sm);
  }
}

@media (max-height: 667px) {
  .age-option {
    padding: var(--spacing-sm);
  }
}
</style> 