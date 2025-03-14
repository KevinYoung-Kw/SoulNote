<template>
  <div class="onboarding-step">
    <h1 class="step-title">{{ title }}</h1>
    <p class="step-desc" :class="descriptionClass">{{ description }}</p>
    
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  descriptionClass: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.onboarding-step {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  padding-bottom: var(--spacing-xl);
  min-height: min-content;
  margin-top: auto;
  margin-bottom: auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

.step-title {
  font-size: 24px;
  margin-bottom: var(--spacing-md);
  padding-top: var(--spacing-md);
}

.step-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 480px) {
  .onboarding-step {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
  
  .step-title {
    font-size: 20px;
    margin-bottom: var(--spacing-sm);
  }
  
  .step-desc {
    margin-bottom: var(--spacing-md);
  }
}
</style> 