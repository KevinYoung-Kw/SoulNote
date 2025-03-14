<template>
  <OnboardingStep
    title="您的性别是？"
    description="让我们更好地了解您"
  >
    <div class="gender-options">
      <div 
        class="gender-option"
        :class="{ active: modelValue === 'male' }"
        @click="$emit('update:modelValue', 'male')"
      >
        <i class="fas fa-mars"></i>
        <span>男性</span>
      </div>
      <div 
        class="gender-option"
        :class="{ active: modelValue === 'female' }"
        @click="$emit('update:modelValue', 'female')"
      >
        <i class="fas fa-venus"></i>
        <span>女性</span>
      </div>
      <div 
        class="gender-option"
        :class="{ active: modelValue === 'other' }"
        @click="$emit('update:modelValue', 'other')"
      >
        <i class="fas fa-cat"></i>
        <span>其他</span>
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
  transition: all var(--transition-normal);
  width: 100px;
}

.gender-option i {
  font-size: 32px;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.gender-option span {
  font-size: 14px;
}

.gender-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.gender-option.active i {
  color: white;
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