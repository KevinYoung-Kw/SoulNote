<template>
  <OnboardingStep
    title="您的星座是？"
    description="我们将根据星座特质为您提供更契合的内容"
  >
    <div class="zodiac-grid">
      <div 
        v-for="zodiac in zodiacs" 
        :key="zodiac.value"
        class="zodiac-item"
        :class="{ active: modelValue === zodiac.value }"
        @click="$emit('update:modelValue', zodiac.value)"
      >
        <i :class="zodiac.icon"></i>
        <span>{{ zodiac.label }}</span>
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

// 星座数据
const zodiacs = [
  { label: '白羊座', value: 'aries', icon: 'fas fa-fire' },
  { label: '金牛座', value: 'taurus', icon: 'fas fa-chess-rook' },
  { label: '双子座', value: 'gemini', icon: 'fas fa-user-friends' },
  { label: '巨蟹座', value: 'cancer', icon: 'fas fa-moon' },
  { label: '狮子座', value: 'leo', icon: 'fas fa-crown' },
  { label: '处女座', value: 'virgo', icon: 'fas fa-leaf' },
  { label: '天秤座', value: 'libra', icon: 'fas fa-balance-scale' },
  { label: '天蝎座', value: 'scorpio', icon: 'fas fa-skull' },
  { label: '射手座', value: 'sagittarius', icon: 'fas fa-arrow-alt-circle-right' },
  { label: '摩羯座', value: 'capricorn', icon: 'fas fa-mountain' },
  { label: '水瓶座', value: 'aquarius', icon: 'fas fa-tint' },
  { label: '双鱼座', value: 'pisces', icon: 'fas fa-fish' }
];
</script>

<style scoped>
.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xs);
}

.zodiac-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.zodiac-item i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.zodiac-item span {
  font-size: 14px;
}

.zodiac-item.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.zodiac-item.active i {
  color: white;
}

@media (max-width: 480px) {
  .zodiac-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0;
    gap: var(--spacing-sm);
  }
  
  @media (max-height: 667px) {
    .zodiac-item {
      padding: var(--spacing-sm);
    }
    
    .zodiac-item i {
      font-size: 18px;
      margin-bottom: var(--spacing-xs);
    }
  }
}
</style> 