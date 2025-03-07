<template>
  <div 
    class="note-card" 
    ref="noteCardRef" 
    :class="{'savage-note': isSavageMode}"
    :style="cardStyle"
  >
    <div class="note-mood" v-if="props.mood" :style="moodStyle">{{ props.mood }}</div>
    <div class="note-content" :style="contentStyle">{{ props.content }}</div>
    <div class="note-glow"></div>
    <div class="note-watermark">
      <span>星语心笺</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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

// 计算卡片样式，包括动态高度
const cardStyle = computed(() => {
  // 获取背景
  const background = getBackgroundVariable.value;
  
  // 基础样式
  const style = {
    background: background,
    color: 'var(--text-color)',
    boxShadow: 'var(--shadow-md)',
  };
  
  // 根据内容长度动态调整高度
  const contentLength = props.content ? props.content.length : 0;
  if (contentLength > 100) {
    // 如果内容超过100个字符，调整高度比例
    const heightRatio = Math.min(6, 5 + (contentLength - 100) / 200); // 最多增加到6:5的比例
    style.aspectRatio = `4 / ${heightRatio}`;
  }
  
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

// 创建内容样式的计算属性，确保字体大小变化时能够正确更新
const contentStyle = computed(() => {
  console.log("应用字体大小:", props.fontSize);
  return {
    fontSize: `${props.fontSize}px`,
    fontFamily: 'var(--font-decorative)',
    lineHeight: 1.6
  };
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

// 监听字体大小变化，强制更新DOM
watch(() => props.fontSize, (newSize) => {
  console.log('Font size changed to:', newSize);
  // 确保DOM更新
  nextTick(() => {
    const contentEl = noteCardRef.value?.querySelector('.note-content');
    if (contentEl) {
      contentEl.style.fontSize = `${newSize}px`;
      console.log('直接更新DOM元素字体大小:', newSize);
    }
  });
}, { immediate: true });

// 监听动画时长变化
watch(() => props.animationDuration, (newDuration) => {
  // 这里不需要额外处理，因为useNoteAnimation会在下一次调用时使用新的动画时长
});
</script>

<style scoped>
.note-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5; /* 默认比例，可以被内联样式覆盖 */
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, aspect-ratio 0.5s ease;
  min-height: 300px; /* 设置最小高度确保短内容也有足够空间 */
  max-height: 800px; /* 设置最大高度防止过长内容导致卡片过大 */
}

.note-content {
  font-family: var(--font-decorative);
  line-height: 1.6;
  text-align: center;
  z-index: 2;
  padding: 0 var(--spacing-md);
  overflow-y: auto; /* 允许长内容滚动 */
  max-height: 100%; /* 防止内容超出卡片 */
  width: 100%; /* 确保宽度充满容器 */
  /* 重要：不要在这里设置固定的字体大小，应该使用内联样式 */
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* 隐藏Webkit浏览器的滚动条 */
.note-content::-webkit-scrollbar {
  display: none;
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

/* 媒体查询，在小屏幕上调整内边距 */
@media (max-width: 480px) {
  .note-card {
    padding: var(--spacing-lg) var(--spacing-md);
    min-height: 250px; /* 小屏幕上稍微减小最小高度 */
  }
}

</style>