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
        @click="handleSelect(ageGroup.value)"
      >
        <span>{{ ageGroup.label }}</span>
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
      }, 600); // 适中的延迟时间，平衡动画效果与用户体验
    }
  }
}

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
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.age-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateX(15px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.age-option:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 100%;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
  transition: all 0.5s ease;
}

.age-option.active:after {
  right: 0;
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