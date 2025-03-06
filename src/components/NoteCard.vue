<template>
  <div 
    class="note-card" 
    ref="noteCardRef" 
    :class="{'savage-note': isSavageMode}"
    :style="cardStyle"
  >
    <div class="note-mood" v-if="props.mood" :style="moodStyle">{{ props.mood }}</div>
    <div class="note-content" :style="{ fontSize: `${props.fontSize}px` }">{{ props.content }}</div>
    <div class="note-glow"></div>
    <div class="note-watermark">
      <span>星语心笺</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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
  },
  animationDuration: {
    type: Number,
    default: 2.0 // 默认动画时长2秒
  }
});

const noteCardRef = ref(null);
const { noteRef, isAnimating, playGenerateAnimation } = useNoteAnimation(props.animationDuration);

// 检测当前是否为深色模式和毒舌模式
const isDarkMode = computed(() => document.body.classList.contains('dark-mode'));
const isSavageMode = computed(() => document.body.classList.contains('savage-mode'));

// 使用CSS变量映射背景
const getBackgroundVariable = computed(() => {
  // 根据背景类型确定对应的CSS变量索引
  const bgIndex = props.background.replace('paper-', '');
  return `var(--note-bg-${bgIndex})`;
});

// 简化的卡片样式计算
const cardStyle = computed(() => {
  // 获取背景
  const background = getBackgroundVariable.value;
  
  // 基础样式
  const style = {
    background: background,
    color: 'var(--text-color)',
    boxShadow: 'var(--shadow-md)',
  };
  
  // 毒舌模式下的特殊样式
  if (isSavageMode.value) {
    // 根据是否暗黑模式选择文本颜色
    if (isDarkMode.value) {
      style.color = 'var(--savage-text)'; // 暗黑毒舌模式下使用浅色文本
    } else {
      style.color = '#333333'; // 亮色毒舌模式下使用深色文本
    }
    style.boxShadow = 'var(--savage-shadow)';
    style.fontWeight = '500'; // 稍微加粗以增强扎心感
  }
  
  return style;
});

// 表情符号样式
const moodStyle = computed(() => {
  if (isSavageMode.value) {
    return {
      color: isDarkMode.value ? 'var(--savage-text)' : '#333333'
    };
  }
  return {
    color: 'inherit'
  };
});

onMounted(() => {
  noteRef.value = noteCardRef.value;
  if (props.animate) {
    playGenerateAnimation();
  }
});

// 监听内容变化，触发动画
watch(() => props.content, (newContent, oldContent) => {
  if (newContent !== oldContent && noteRef.value && props.animate) {
    playGenerateAnimation();
  }
});

// 监听动画时长变化
watch(() => props.animationDuration, (newDuration) => {
  // 这里不需要额外处理，因为useNoteAnimation会在下一次调用时使用新的动画时长
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

/* 毒舌模式特殊样式 */
.savage-note .note-watermark {
  color: rgba(183, 28, 28, 0.15);
}

:global(.dark-mode) .savage-note .note-watermark {
  color: rgba(255, 182, 182, 0.15);
}
</style>
