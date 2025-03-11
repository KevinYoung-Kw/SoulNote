<template>
  <div 
    class="note-card" 
    ref="noteCardRef" 
    :class="{'savage-note': isSavageMode, 'font-loaded': fontLoaded}"
    :style="cardStyle"
    data-v-notecard
  >
    <!-- 修改mood展示区域，创建水平排列的表情容器 -->
    <div class="note-mood-container" v-if="moodsArray.length > 0" :style="moodContainerStyle">
      <div 
        v-for="(emoji, index) in moodsArray" 
        :key="`mood-${index}`" 
        class="note-mood-item" 
        :style="moodStyle"
      >
        {{ emoji }}
      </div>
    </div>
    <div class="note-content" :style="contentStyle">{{ sanitizedContent }}</div>
    <div class="note-glow"></div>
    <div class="note-watermark">
      <span>@星语心笺</span>
    </div>
  </div>

  <!-- 添加可关闭的感谢文本 -->
  <div class="appreciation-container" v-if="showAppreciation">
    <div class="appreciation-text">
      <p>
        喜欢这个应用？
        <a href="#" @click.prevent="navigateToAbout">请作者喝杯咖啡</a>
        支持独立开发者 ☕️
      </p>
    </div>
    <button class="close-appreciation" @click="hideAppreciation">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useNoteAnimation } from '../composables/useNoteAnimation';
import { useRouter } from 'vue-router'; // 添加导入
import { getUserPreferences, saveUserPreferences } from '../services/storageService'; // 添加导入

const router = useRouter(); // 初始化router
const showAppreciation = ref(true); // 初始化showAppreciation

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

// 将传入的mood字符串转换为数组以便遍历渲染
const moodsArray = computed(() => {
  if (!props.mood) return [];
  
  // 改进表情解析处理，处理Unicode表情符号
  // 使用Array.from确保正确处理包括emoji在内的所有Unicode字符
  const emojiRegex = /\p{Emoji}/gu;
  const emojis = props.mood.match(emojiRegex);
  return emojis || Array.from(props.mood);
});

// 根据表情数量计算容器样式
const moodContainerStyle = computed(() => {
  // 基础样式
  const style = {
    display: 'flex',
    flexWrap: 'wrap', // 允许换行
    gap: '4px', // 表情之间的间距
    maxWidth: '70%', // 限制容器宽度，防止占用太多空间
    zIndex: 3 // 确保在内容上方
  };
  
  // 如果只有一个表情，可以使用原来的位置
  if (moodsArray.value.length === 1) {
    style.top = 'var(--spacing-md)';
    style.left = 'var(--spacing-md)';
  } else {
    // 多表情时，位置调整为顶部居中
    style.top = 'var(--spacing-md)';
    style.left = '50%';
    style.transform = 'translateX(-50%)'; // 水平居中
    style.justifyContent = 'center'; // 内部元素居中
  }
  
  return style;
});

// 验证和清理内容，确保没有未关闭的标签
const sanitizedContent = computed(() => {
  let content = props.content;
  
  // 如果以 <content> 开头，但没有结束标签，添加结束标签
  if (content.includes('<content>') && !content.includes('</content>')) {
    content = content.replace('<content>', '').trim();
  }
  
  // 移除所有content标签，只显示实际内容
  content = content.replace(/<\/?content>/g, '').trim();
  
  return content;
});

const noteCardRef = ref(null);
const { noteRef, isAnimating, playGenerateAnimation } = useNoteAnimation(props.animationDuration);
const fontLoaded = ref(false); // 跟踪字体是否已加载

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
  return {
    fontSize: `${props.fontSize}px`,
    fontFamily: 'var(--font-note)', // 确保使用正确的字体变量
    lineHeight: 1.6,
    // 添加上边距，为多个emoji腾出空间
    paddingTop: moodsArray.value.length > 1 ? 'calc(var(--spacing-xl) + 8px)' : 'var(--spacing-md)'
  };
});

// 表情符号样式
const moodStyle = computed(() => {
  const style = {
    fontSize: moodsArray.value.length > 3 ? '18px' : '24px' // 根据表情数量调整大小
  };
  
  if (isSavageMode.value) {
    style.color = isDarkMode.value ? 'var(--savage-text)' : '#333333';
  } else {
    style.color = 'inherit';
  }
  
  return style;
});

// 新增：跳转到关于页面
function navigateToAbout() {
  router.push('/about-us');
}

// 新增：隐藏感谢文本并记住用户选择
async function hideAppreciation() {
  showAppreciation.value = false;
  
  // 保存用户偏好，记住用户选择隐藏感谢文本
  try {
    const userPrefs = await getUserPreferences();
    await saveUserPreferences({
      ...userPrefs,
      hideAppreciation: true
    });
  } catch (error) {
    console.error('保存用户偏好失败:', error);
  }
}

// 修改 onMounted 方法，添加 async 修饰符
onMounted(async () => { // 添加 async
  noteRef.value = noteCardRef.value;
  if (props.animate) {
    playGenerateAnimation();
  }
  
  // 检查字体加载状况
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      // 字体加载完成后设置标志
      fontLoaded.value = true;
    });
  } else {
    // 如果浏览器不支持 document.fonts API，设置一个超时作为替代
    setTimeout(() => {
      fontLoaded.value = true;
    }, 1000);
  }

  // 获取用户偏好设置
  try {
    const userPrefs = await getUserPreferences();
    if (userPrefs?.hideAppreciation) {
      showAppreciation.value = false;
    }
  } catch (error) {
    console.error('获取用户偏好失败:', error);
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
  // 确保DOM更新
  nextTick(() => {
    const contentEl = noteCardRef.value?.querySelector('.note-content');
    if (contentEl) {
      contentEl.style.fontSize = `${newSize}px`;
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
  margin: var(--spacing-lg) auto; /* 改为auto使其居中 */
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, aspect-ratio 0.5s ease;
  min-height: 300px; /* 设置最小高度确保短内容也有足够空间 */
  max-height: 800px; /* 设置最大高度防止过长内容导致卡片过大 */
}

/* 替换原有的note-mood样式为新的容器样式 */
.note-mood-container {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  background-color: rgba(255, 255, 255, 0.7); /* 半透明背景 */
  backdrop-filter: blur(2px); /* 轻微模糊效果 */
  box-shadow: var(--shadow-xs);
  transition: all 0.3s ease;
  z-index: 10; /* 确保高于其他元素 */
  /* 位置由计算属性控制 */
}

/* 暗黑模式下容器背景调整 */
:global(.dark-mode) .note-mood-container {
  background-color: rgba(40, 40, 40, 0.7);
}

/* 毒舌模式下容器样式 */
.savage-note .note-mood-container {
  background-color: rgba(255, 235, 235, 0.7);
}

:global(.dark-mode) .savage-note .note-mood-container {
  background-color: rgba(80, 20, 20, 0.7);
}

/* 单个表情样式 */
.note-mood-item {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: all 0.2s ease;
}

.note-mood-item:hover {
  transform: scale(1.1);
  opacity: 1;
}

.note-content {
  font-family: var(--font-note); /* 使用 --font-note 变量而不是装饰字体 */
  line-height: 1.6;
  text-align: center;
  z-index: 2;
  padding: 0 var(--spacing-md);
  overflow-y: auto; /* 允许长内容滚动 */
  max-height: 100%; /* 防止内容超出卡片 */
  width: 100%; /* 确保宽度充满容器 */
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* 字体加载完成后应用的样式 */
.font-loaded .note-content {
  /* 可以添加平滑过渡效果 */
  transition: opacity 0.3s ease;
}

/* 隐藏Webkit浏览器的滚动条 */
.note-content::-webkit-scrollbar {
  display: none;
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
    padding: var(--spacing-md) var(--spacing-sm);
    min-height: 200px; /* 小屏幕上进一步减小最小高度 */
  }
  
  .note-mood-container {
    padding: 2px 4px; /* 小屏幕上进一步减少内边距 */
    gap: 2px; /* 进一步减少表情间距 */
  }
  
  .note-mood-item {
    font-size: 16px !important; /* 在小屏幕上进一步减小字体大小 */
  }
}

/* 添加平板和桌面设备的居中样式 */
@media (min-width: 768px) {
  .note-card {
    width: 85%; /* 在大屏设备上减小宽度以实现更好的可读性 */
    max-width: 500px; /* 限制最大宽度 */
    margin: var(--spacing-xl) auto; /* 增加上下间距并保持水平居中 */
    box-shadow: var(--shadow-lg); /* 增强阴影效果 */
  }
}

/* 针对更大屏幕的优化 */
@media (min-width: 1024px) {
  .note-card {
    width: 70%; /* 在更大的屏幕上进一步减小宽度比例 */
    max-width: 550px; /* 增加最大宽度但仍保持限制 */
    transform: translateY(-10px); /* 轻微上移，增强视觉效果 */
  }
}


/* 修改感谢文本容器样式，添加关闭按钮 */
.appreciation-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.appreciation-text {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.appreciation-text p {
  margin: 0;
}

.appreciation-text a {
  color: var(--primary-color);
  text-decoration: underline;
  text-decoration-style: dotted;
  font-weight: 500;
  transition: color 0.2s ease;
}

.appreciation-text a:hover {
  color: var(--primary-color-dark);
}

.close-appreciation {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  opacity: 0.6;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.close-appreciation:hover {
  opacity: 1;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .appreciation-container {
    margin-top: var(--spacing-sm);
  }
  
  .appreciation-text {
    font-size: 12px;
  }
  
  .close-appreciation {
    padding: 3px;
  }
}
</style>