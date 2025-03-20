<template>
  <OnboardingStep
    title="设置完成！"
    :description="welcomeMessage"
    :descriptionClass="welcomeClass"
  >
    <div class="completion-image" :class="{ 'nolan-completion': isNolanFanMode, 'cyberpunk-completion': isCyberpunkMode }">
      <img :src="completeSvg" alt="Complete" />
      <div class="sample-note" :class="[noteClass, { 'nolan-note': isNolanFanMode && !noteClass, 'cyberpunk-note': isCyberpunkMode && !noteClass }]">
        <p>{{ noteContent }}</p>
      </div>
    </div>
  </OnboardingStep>
</template>

<script setup>
import OnboardingStep from '../OnboardingStep.vue';
import completeSvg from '../../../assets/onboarding-complete.svg';

defineProps({
  welcomeMessage: {
    type: String,
    default: '现在开始享受您的专属心灵纸条吧'
  },
  welcomeClass: {
    type: String,
    default: ''
  },
  noteContent: {
    type: String,
    required: true
  },
  noteClass: {
    type: String,
    default: ''
  },
  isNolanFanMode: {
    type: Boolean,
    default: false
  },
  isCyberpunkMode: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.completion-image {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: var(--spacing-lg) 0;
  transition: all 0.5s ease;
  position: relative;
  padding: 0 var(--spacing-xs);
}

.completion-image img {
  max-width: 50%;
  width: 200px;
  height: auto;
  display: block;
  margin: 0 auto;
  transition: all 0.5s ease;
}

.sample-note {
  background-color: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
  font-family: var(--font-decorative);
  font-size: 18px;
  line-height: 1.6;
  box-shadow: var(--shadow-md);
  transition: all 0.5s ease-in-out;
  position: relative;
  z-index: 1;
}

.sample-note p {
  margin: 0;
  transition: all 0.5s ease-in-out;
}

/* 确保诺兰风格的样式能覆盖原有样式 */
.sample-note[class*="nolan-"] p {
  line-height: 1.8;
}

/* 诺兰风格样式 */
.nolan-completion {
  perspective: 1000px;
}

.nolan-completion img {
  filter: grayscale(20%) contrast(110%);
  transform: scale(1.05);
}

.nolan-note {
  background-color: #f5f5f5;
  border: 1px solid #1a2a3a;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  font-family: 'Georgia', serif;
  color: #1a2a3a;
  transform: rotateX(5deg);
  transform-origin: bottom;
}

.nolan-note p {
  font-style: italic;
  letter-spacing: 0.5px;
}

/* 赛博朋克风格样式 */
.cyberpunk-completion {
  position: relative;
}

.cyberpunk-completion::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, #ff0054, #00ffaa);
  z-index: 0;
  filter: blur(15px);
  opacity: 0.5;
  border-radius: var(--radius-md);
}

.cyberpunk-completion img {
  filter: hue-rotate(180deg) saturate(150%);
  position: relative;
  z-index: 1;
}

.cyberpunk-note {
  background-color: rgba(0, 0, 0, 0.8);
  border: 2px solid #ff0054;
  color: #00ffaa;
  font-family: 'Share Tech Mono', monospace;
  text-shadow: 0 0 5px rgba(0, 255, 170, 0.5);
  box-shadow: 0 0 20px rgba(255, 0, 84, 0.5);
  position: relative;
  overflow: hidden;
}

.cyberpunk-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 170, 0.2), transparent);
  animation: cyberpunk-scan 3s ease infinite;
}

@keyframes cyberpunk-scan {
  0% { left: -100%; }
  100% { left: 100%; }
}

.cyberpunk-note p {
  position: relative;
  z-index: 1;
}

@media (max-width: 480px) {
  .completion-image {
    margin: var(--spacing-md) 0;
  }
  
  .completion-image img {
    max-width: 55%;
    width: 180px;
  }
  
  .sample-note {
    padding: var(--spacing-md);
    font-size: 16px;
  }
  
  @media (max-height: 667px) {
    .completion-image {
      margin: var(--spacing-sm) 0;
    }
    
    .completion-image img {
      max-width: 50%;
      width: 160px;
    }
    
    .sample-note {
      padding: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }
  }
}
</style> 