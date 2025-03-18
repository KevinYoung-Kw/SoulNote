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
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: var(--spacing-lg) auto;
}

.step-image img {
  max-width: 50%;
  width: 200px;
  height: auto;
  display: block;
  margin: 0 auto;
}

@media (max-width: 480px) {
  .step-image {
    margin: var(--spacing-md) auto;
  }
  
  .step-image img {
    max-width: 55%;
    width: 180px;
  }
  
  @media (max-height: 667px) {
    .step-image {
      margin: var(--spacing-sm) auto;
    }
    
    .step-image img {
      max-width: 50%;
      width: 160px;
    }
  }
}
</style> 