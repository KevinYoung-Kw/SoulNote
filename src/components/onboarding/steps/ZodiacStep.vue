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
        @click="handleSelect(zodiac.value)"
      >
        <i :class="zodiac.icon"></i>
        <span>{{ zodiac.label }}</span>
      </div>
    </div>
  </OnboardingStep>
</template>

<script setup>
import { defineProps, defineEmits, inject } from 'vue';
import OnboardingStep from '../OnboardingStep.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

// 获取注入的事件总线
const onboardingBus = inject('onboardingBus', null);

// 处理选择
function handleSelect(value) {
  // 只有在值变化时才触发
  if (props.modelValue !== value) {
    // 更新模型值
    emit('update:modelValue', value);
    
    // 使用事件总线自动前进
    if (onboardingBus) {
      setTimeout(() => {
        onboardingBus.autoAdvance();
      }, 700); // 星座选择给适当的动画时间
    }
  }
}

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
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  overflow: hidden;
}

.zodiac-item i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  transition: all 0.4s ease;
}

.zodiac-item span {
  font-size: 14px;
  transition: all 0.4s ease;
}

.zodiac-item.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.zodiac-item:before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transform: scale(0.2);
  transition: all 0.6s ease;
}

.zodiac-item.active:before {
  opacity: 0.15;
  transform: scale(1);
}

.zodiac-item.active i {
  color: white;
  transform: scale(1.2);
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