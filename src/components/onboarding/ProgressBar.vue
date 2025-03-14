<template>
  <div class="progress-bar fixed-header">
    <div class="progress" :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.progress-bar {
  height: 4px;
  background-color: var(--border-color);
  width: 100%;
}

.progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}
</style> 