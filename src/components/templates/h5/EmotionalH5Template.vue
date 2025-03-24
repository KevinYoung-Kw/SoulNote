<template>
  <div 
    class="emotional-h5-template" 
    :class="{ 'is-preview': isPreview }"
    :style="computedTemplateStyle"
  >
    <div class="gradient-background"></div>
    
    <div class="content-container" :style="computedContentContainerStyle">
      <!-- 标题区域 -->
      <div class="title-area" v-if="showTitle">
        <h2 :style="computedTitleStyle">{{ title }}</h2>
      </div>
      
      <!-- 引言装饰 -->
      <div class="quote-decoration">
        <div class="quote-mark">"</div>
      </div>
      
      <!-- 主要内容区域 -->
      <div class="content-area" :style="computedContentStyle">
        <p>{{ content }}</p>
      </div>
      
      <!-- 情感图标区域 -->
      <div class="mood-area" v-if="showEmojiBubble && moodsArray.length > 0">
        <div 
          v-for="(mood, index) in moodsArray" 
          :key="index"
          class="mood-bubble"
          :style="{
            animationDelay: `${index * 0.1}s`,
            top: `${getRandomPosition()}%`,
            left: `${getRandomPosition()}%`
          }"
        >
          {{ mood }}
        </div>
      </div>
      
      <!-- 署名区域 -->
      <div class="signature-area" v-if="signature">
        <div class="signature-line"></div>
        <p class="signature-text">{{ signature }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

// Props
const props = defineProps({
  content: {
    type: String,
    default: '在这个世界上，总有那么一个人，愿意用温暖的手，握住你颤抖的心。'
  },
  title: {
    type: String,
    default: '心语'
  },
  signature: {
    type: String,
    default: ''
  },
  moods: {
    type: [Array, String],
    default: () => []
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  customStyle: {
    type: Object,
    default: () => ({})
  },
  contentStyle: {
    type: Object,
    default: () => ({})
  }
});

// 随机位置生成器
function getRandomPosition() {
  return Math.floor(Math.random() * 80) + 10; // 10-90之间的随机数
}

// 计算属性
const moodsArray = computed(() => {
  if (Array.isArray(props.moods)) {
    return props.moods;
  }
  if (typeof props.moods === 'string' && props.moods.length > 0) {
    // 处理字符串中的表情符号
    const emojiRegex = /\p{Emoji}/gu;
    return props.moods.match(emojiRegex) || [];
  }
  return [];
});

// 显示标题
const showTitle = computed(() => {
  return props.title && props.title.trim() !== '';
});

// 显示表情气泡
const showEmojiBubble = computed(() => {
  return props.customStyle?.showEmojiBubble !== false;
});

// 模板样式
const computedTemplateStyle = computed(() => {
  const gradientColors = props.customStyle?.gradientColors || ['#a18cd1', '#fbc2eb'];
  
  return {
    backgroundColor: props.customStyle?.backgroundColor || '#ffffff',
    borderRadius: props.customStyle?.borderRadius || '12px',
    boxShadow: props.isPreview ? 'none' : '0 8px 30px rgba(0, 0, 0, 0.12)',
    backgroundImage: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
    ...props.customStyle
  };
});

// 内容容器样式
const computedContentContainerStyle = computed(() => {
  return {
    padding: props.isPreview ? '10px' : '30px',
    ...props.customStyle?.containerStyle
  };
});

// 标题样式
const computedTitleStyle = computed(() => {
  return {
    color: props.customStyle?.titleColor || '#ffffff',
    fontSize: props.isPreview ? '14px' : (props.customStyle?.titleSize || '28px'),
    fontFamily: props.customStyle?.fontFamily || "var(--font-serif, 'Noto Serif SC', serif)",
    ...props.customStyle?.titleStyle
  };
});

// 内容样式
const computedContentStyle = computed(() => {
  return {
    fontSize: props.isPreview ? '10px' : (props.contentStyle?.fontSize || '18px'),
    lineHeight: props.contentStyle?.lineHeight || '1.8',
    color: props.contentStyle?.color || '#ffffff',
    fontFamily: props.contentStyle?.fontFamily || "var(--font-serif, 'Noto Serif SC', serif)",
    textAlign: props.contentStyle?.textAlign || 'center',
    ...props.contentStyle
  };
});
</script>

<style scoped>
.emotional-h5-template {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  aspect-ratio: 9 / 16;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.is-preview {
  height: 90px;
  aspect-ratio: 9 / 16;
  transform: scale(0.8);
  box-shadow: none !important;
  min-width: 0 !important;
}

.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  z-index: 0;
}

.content-container {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title-area {
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
}

.title-area h2 {
  margin: 0;
  font-weight: 600;
  letter-spacing: 2px;
}

.quote-decoration {
  margin-bottom: 15px;
  position: relative;
}

.quote-mark {
  font-size: 60px;
  line-height: 1;
  opacity: 0.4;
  font-family: 'Georgia', serif;
  transform: rotate(180deg);
  position: absolute;
  top: -30px;
  left: -20px;
}

.is-preview .quote-mark {
  font-size: 24px;
  top: -12px;
  left: -8px;
}

.content-area {
  width: 90%;
  max-width: 450px;
  position: relative;
  padding: 0 10px;
  margin: 0 auto;
  text-align: center;
}

.content-area p {
  margin: 0;
  word-break: break-word;
  white-space: pre-wrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mood-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.mood-bubble {
  position: absolute;
  font-size: 20px;
  animation: float 6s ease-in-out infinite;
  opacity: 0.8;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  pointer-events: none;
}

.is-preview .mood-bubble {
  font-size: 12px;
}

.signature-area {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signature-line {
  width: 40px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
}

.signature-text {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0) rotate(0);
    opacity: 0.8;
  }
  25% {
    transform: translateY(-10px) translateX(5px) rotate(5deg);
  }
  50% {
    transform: translateY(5px) translateX(-5px) rotate(-5deg);
    opacity: 1;
  }
  75% {
    transform: translateY(-5px) translateX(10px) rotate(10deg);
  }
  100% {
    transform: translateY(0) translateX(0) rotate(0);
    opacity: 0.8;
  }
}
</style> 