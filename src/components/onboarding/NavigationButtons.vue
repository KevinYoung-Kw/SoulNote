<template>
  <div class="onboarding-actions fixed-footer">
    <button 
      v-if="showBackButton"
      class="btn btn-secondary" 
      @click="$emit('back')"
    >
      {{ backButtonText }}
    </button>
    
    <button 
      class="btn btn-primary" 
      @click="$emit('next')"
      :disabled="nextButtonDisabled"
    >
      {{ nextButtonText }}
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineEmits(['back', 'next']);

defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backButtonText: {
    type: String,
    default: '上一步'
  },
  nextButtonText: {
    type: String,
    default: '下一步'
  },
  nextButtonDisabled: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.onboarding-actions {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 480px) {
  .onboarding-actions {
    padding: var(--spacing-md);
  }
}
</style> 