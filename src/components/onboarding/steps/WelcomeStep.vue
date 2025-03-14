<template>
  <OnboardingStep
    title="欢迎使用星语心笺"
    description="让我们完成简单设置，为您提供更个性化的体验"
  >
    <div class="step-image">
      <img :src="welcomeSvg" alt="Welcome" />
    </div>
  </OnboardingStep>
</template>

<script setup>
import OnboardingStep from '../OnboardingStep.vue';
import welcomeSvg from '../../../assets/onboarding-welcome.svg';
</script>

<style scoped>
.step-image {
  margin: var(--spacing-lg) 0;
  padding: 0 var(--spacing-xs);
}

.step-image img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 480px) {
  .step-image {
    margin: var(--spacing-md) 0;
    padding: 0;
  }
  
  @media (max-height: 667px) {
    .step-image {
      margin: var(--spacing-sm) 0;
    }
  }
}
</style> 