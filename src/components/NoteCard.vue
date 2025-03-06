<template>
  <div class="note-card" ref="noteCardRef" :style="cardStyle">
    <!-- 添加心情/场景显示 -->
    <div class="note-mood" v-if="mood">{{ mood }}</div>
    
    <div class="note-content" :style="{ fontSize: `${fontSize}px` }">{{ content }}</div>
    <div class="note-glow"></div>
    <div class="note-watermark">
      <span>星语心笺</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNoteAnimation } from '../composables/useNoteAnimation';

const props = defineProps({
  content: {
    type: String,
    default: '在无限宇宙中，你是独一无二的星光。今天的每一步，都是内心力量的证明。'
  },
  mood: {
    type: String,
    default: ''
  },
  background: {
    type: String,
    default: 'paper-1'
  },
  fontSize: {
    type: Number,
    default: 24
  },
  animate: {
    type: Boolean,
    default: false
  }
});

const noteCardRef = ref(null);
const { noteRef, playGenerateAnimation } = useNoteAnimation();

// 检测当前是否为深色模式
const isDarkMode = computed(() => document.body.classList.contains('dark-mode'));

// 定义亮色模式和深色模式下的背景
const lightModeBackgrounds = {
  'paper-1': 'linear-gradient(to right bottom, #FFFFFF, #F9F3E5)',
  'paper-2': 'linear-gradient(to right bottom, #FFF9F9, #FFE8E8)',
  'paper-3': 'linear-gradient(to right bottom, #F0F8FF, #E6F0F9)',
  'paper-4': 'linear-gradient(to right bottom, #F5FFF5, #E6F9E6)'
};

// 修改为更柔和的深色背景
const darkModeBackgrounds = {
  'paper-1': 'linear-gradient(to right bottom, #3C3C3C, #444444)',
  'paper-2': 'linear-gradient(to right bottom, #3E3839, #463B3C)',
  'paper-3': 'linear-gradient(to right bottom, #373D40, #394249)',
  'paper-4': 'linear-gradient(to right bottom, #384038, #3F4A3F)'
};

// 根据当前模式选择背景
const cardStyle = computed(() => {
  const backgroundMap = isDarkMode.value ? darkModeBackgrounds : lightModeBackgrounds;
  return {
    background: backgroundMap[props.background] || backgroundMap['paper-1'],
    color: isDarkMode.value ? '#E0E0E0' : '#333333',
    boxShadow: isDarkMode.value 
      ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
      : 'var(--shadow-md)'
  };
});

onMounted(() => {
  noteRef.value = noteCardRef.value;
  if (props.animate) {
    playGenerateAnimation();
  }
});
</script>

<style scoped>
.note-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.note-content {
  font-family: var(--font-decorative);
  line-height: 1.6;
  text-align: center;
  z-index: 2;
  padding: 0 var(--spacing-md);
}

/* 添加心情/场景样式 */
.note-mood {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  font-size: 24px;
  z-index: 2;
  opacity: 0.85;
}

.note-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.note-watermark {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.15);
  transform: rotate(-15deg);
  z-index: 1;
  transition: color 0.3s ease;
}

:global(.dark-mode) .note-watermark {
  color: rgba(255, 255, 255, 0.15);
}

:global(.dark-mode) .note-glow {
  background: radial-gradient(circle at center, rgba(100,100,100,0.4) 0%, rgba(80,80,80,0) 70%);
}
</style>
