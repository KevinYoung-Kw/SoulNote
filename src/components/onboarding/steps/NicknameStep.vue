<template>
  <OnboardingStep
    title="您希望如何被称呼？"
    description="设置一个专属称呼，让心语纸条更有温度"
  >
    <div class="nickname-container" :class="{ 'nolan-fan-mode': isNolanFanMode, 'cyberpunk-mode': isCyberpunkMode }">
      <div class="nickname-input">
        <input 
          type="text" 
          v-model="nickname" 
          placeholder="请输入您喜欢的称呼"
          maxlength="12"
          @input="$emit('update:modelValue', nickname)"
        />
        <p class="input-desc">最多12个字符</p>
      </div>

      <p class="suggestion-title" :class="{ 'cyberpunk-text': isCyberpunkMode }">
        <i class="fas fa-lightbulb"></i> 称呼建议
      </p>
      
      <div class="nickname-suggestions">
        <button 
          v-for="(name, index) in nameSuggestions" 
          :key="index"
          class="nickname-suggestion"
          :class="{ 
            'active': nickname === name, 
            'nolan-suggestion': isNolanFanMode,
            'cyberpunk-suggestion': isCyberpunkMode
          }"
          @click="selectNickname(name)"
        >
          {{ name }}
        </button>
        
        <button 
          class="nickname-suggestion refresh-btn"
          :class="{ 
            'nolan-refresh-btn': isNolanFanMode,
            'cyberpunk-refresh-btn': isCyberpunkMode
          }"
          @click="$emit('refresh-suggestions')"
        >
          <i class="fas fa-sync-alt"></i> 换一批
        </button>
      </div>
    </div>
  </OnboardingStep>
</template>

<script setup>
import { ref, watch } from 'vue';
import OnboardingStep from '../OnboardingStep.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  nameSuggestions: {
    type: Array,
    default: () => []
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

const emit = defineEmits(['update:modelValue', 'refresh-suggestions', 'select-nickname']);

const nickname = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  nickname.value = newValue;
});

function selectNickname(name) {
  nickname.value = name;
  emit('update:modelValue', name);
  emit('select-nickname', name);
}
</script>

<style scoped>
.nickname-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  width: 100%;
  transition: all 0.3s ease;
  border-radius: var(--radius-lg);
  background-color: rgba(255, 255, 255, 0.02);
}

.nickname-input {
  width: 100%;
  position: relative;
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.nickname-input input {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  transition: all 0.3s ease;
  display: block;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.8);
}

.nickname-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(123, 158, 137, 0.15);
  transform: translateY(-2px);
  background-color: #fff;
}

.input-desc {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: var(--spacing-sm);
  width: 100%;
  opacity: 0.8;
}

.suggestion-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: var(--spacing-xl) 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  transition: all 0.3s ease;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.suggestion-title i {
  color: var(--primary-color);
  font-size: 20px;
}

.nickname-suggestions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.nickname-suggestion {
  padding: var(--spacing-md) var(--spacing-sm);
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.nickname-suggestion:hover {
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(123, 158, 137, 0.12);
}

.nickname-suggestion.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(123, 158, 137, 0.25);
  font-weight: 500;
}

.nickname-suggestion.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0.6;
  pointer-events: none;
}

.refresh-btn {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background-color: rgba(123, 158, 137, 0.08);
  color: var(--primary-color);
  font-weight: 500;
  margin-top: var(--spacing-sm);
  border: 1px dashed rgba(123, 158, 137, 0.3);
}

.refresh-btn i {
  font-size: 14px;
  opacity: 0.8;
}

.refresh-btn:hover {
  background-color: rgba(123, 158, 137, 0.15);
  border-style: solid;
}

/* 响应式调整优化 */
@media (max-width: 480px) {
  .nickname-container {
    padding: var(--spacing-lg) var(--spacing-sm);
    gap: var(--spacing-md);
  }
  
  .nickname-input input {
    font-size: 18px;
    padding: var(--spacing-md);
    max-width: 100%;
  }
  
  .suggestion-title {
    font-size: 16px;
    margin: var(--spacing-lg) 0 var(--spacing-md);
  }
  
  .nickname-suggestion {
    padding: var(--spacing-md) var(--spacing-xs);
    font-size: 15px;
  }
  
  .nickname-suggestions {
    gap: var(--spacing-md);
    max-width: 100%;
  }
}

/* 在极小屏幕上的额外优化 */
@media (max-width: 350px) {
  .nickname-suggestions {
    grid-template-columns: 1fr;
  }
  
  .refresh-btn {
    grid-column: span 1;
  }
  
  .nickname-container {
    padding: var(--spacing-sm);
  }
}

/* 诺兰粉丝模式样式 */
.nolan-fan-mode {
  background-color: rgba(0, 0, 0);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nolan-fan-mode .nickname-input input {
  border-color: #1a2a3a;
  background-color: rgba(255, 255, 255, 0.9);
  font-family: 'Georgia', serif;
}

.nolan-suggestion {
  font-family: 'Georgia', serif;
  letter-spacing: 0.5px;
}

.nolan-suggestion.active {
  background-color: #1a2a3a;
  border-color: #1a2a3a;
}

.nolan-refresh-btn {
  background-color: rgba(26, 42, 58, 0.1);
  color: #1a2a3a;
}

.nolan-refresh-btn:hover {
  background-color: rgba(26, 42, 58, 0.2);
}

/* 赛博朋克模式样式 */
.cyberpunk-mode {
  background-color: rgba(0, 0, 0, 0.8);
  border: 2px solid #ff0054;
  box-shadow: 0 0 15px rgba(255, 0, 84, 0.5);
  padding: var(--spacing-lg);
  border-radius: 5px;
}

.cyberpunk-mode .nickname-input input {
  background-color: rgba(0, 0, 0, 0.7);
  border-color: #00ffaa;
  color: #00ffaa;
  font-family: 'Share Tech Mono', monospace;
  text-shadow: 0 0 5px rgba(0, 255, 170, 0.5);
}

.cyberpunk-text {
  color: #ff0054;
  text-shadow: 0 0 5px rgba(255, 0, 84, 0.7);
  font-family: 'Rajdhani', sans-serif;
}

.cyberpunk-suggestion {
  background-color: rgba(0, 0, 0, 0.7);
  border-color: #ff0054;
  color: #ff0054;
  font-family: 'Share Tech Mono', monospace;
}

.cyberpunk-suggestion:hover {
  border-color: #00ffaa;
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
}

.cyberpunk-suggestion.active {
  background-color: #ff0054;
  border-color: #00ffaa;
  box-shadow: 0 0 15px rgba(255, 0, 84, 0.7);
}

.cyberpunk-refresh-btn {
  background-color: rgba(255, 0, 84, 0.2);
  color: #00ffaa;
  border: 1px solid #00ffaa;
}

.cyberpunk-refresh-btn:hover {
  background-color: rgba(0, 255, 170, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
}
</style> 