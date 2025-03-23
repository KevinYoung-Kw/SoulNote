<template>
  <div 
    class="note-card" 
    ref="noteCardRef" 
    :class="{'savage-note': isSavageMode, 'font-loaded': fontLoaded}"
    :style="cardStyle"
    data-v-notecard
  >
    <!-- 使用动态导入的模板组件 -->
    <component 
      :is="currentTemplateComponent" 
      v-if="currentTemplateComponent"
      :custom-style="props.customStyle"
      :content="sanitizedContent"
      :moods="moodsArray"
      :has-custom-image="hasCustomImage"
      :mood-style="moodStyle"
      :mood-container-style="moodContainerStyle"
      :content-style="contentStyle"
      :image-layer-style="imageLayerStyle"
    />
    
    <div class="note-glow"></div>
    <div class="note-watermark">
      <span></span> 
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, defineAsyncComponent } from 'vue';
import { useNoteAnimation } from '../composables/useNoteAnimation';
import { useRouter } from 'vue-router';

const router = useRouter();

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
    default: 2.0
  },
  // 新增自定义样式属性
  customStyle: {
    type: Object,
    default: () => ({})
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
  const isSmallScreen = window.innerWidth <= 480;
  const isVerySmallScreen = window.innerWidth <= 385;
  
  // 基础样式
  const style = {
    display: 'flex',
    flexWrap: moodsArray.value.length > 3 ? 'wrap' : 'nowrap', // 只有超过3个表情时才允许换行
    gap: isVerySmallScreen ? '1px' : isSmallScreen ? '2px' : '4px', // 根据屏幕大小调整表情之间的间距
    maxWidth: isVerySmallScreen ? '90%' : isSmallScreen ? '85%' : '70%', // 根据屏幕大小调整容器宽度
    zIndex: 10, // 确保在内容上方
    justifyContent: 'center', // 居中显示表情
    position: 'absolute' // 确保使用绝对定位
  };
  
  // 检查是否应该显示emoji气泡
  if (props.customStyle?.showEmojiBubble === false) {
    style.display = 'none';
    return style;
  }
  
  // 获取用户设置的表情位置
  const moodPosition = props.customStyle?.moodPosition || 'default';
  
  // 如果位置是'default'，根据不同的布局设置不同的默认位置
  if (moodPosition === 'default') {
    if (props.customStyle?.layout === 'image-top') {
      // 上图下文布局 - emoji气泡放在下半部分的顶部，使用固定像素值
      style.top = '50%'; // 放在分界线位置
      style.marginTop = isVerySmallScreen ? '3px' : '5px'; // 根据屏幕大小调整边距
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    } else if (props.customStyle?.layout === 'image-bottom') {
      // 下图上文布局 - emoji气泡放在上半部分的底部，使用固定像素值
      style.bottom = '50%'; // 放在分界线位置
      style.marginBottom = isVerySmallScreen ? '3px' : '5px'; // 根据屏幕大小调整边距
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    } else {
      // 纸条布局或图片背景布局
      style.top = isVerySmallScreen ? '10px' : '15px';
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    }
  } else {
    // 使用用户设置的位置 - 清除可能冲突的样式
    style.top = null;
    style.bottom = null;
    style.left = null;
    style.right = null;
    style.transform = null;
    style.marginTop = null;
    style.marginBottom = null;
    
    // 根据九宫格位置应用相应的样式
    switch (moodPosition) {
      case 'top-left':
        style.top = '10px';
        style.left = '10px';
        break;
      case 'top':
        style.top = '10px';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
      case 'top-right':
        style.top = '10px';
        style.right = '10px';
        break;
      case 'left':
        style.left = '10px';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        break;
      case 'center':
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
        break;
      case 'right':
        style.right = '10px';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        break;
      case 'bottom-left':
        style.bottom = '10px';
        style.left = '10px';
        break;
      case 'bottom':
        style.bottom = '10px';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
        style.bottom = '10px';
        style.right = '10px';
        break;
    }
  }
  
  // 添加边框和背景，使表情气泡更明显
  if (moodsArray.value.length > 0) {
    style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    style.borderRadius = '20px';
    style.padding = '3px 8px';
    style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
  }
  
  return style;
});

// 验证和清理内容，确保没有未关闭的标签
const sanitizedContent = computed(() => {
  let content = props.content;
  
  // 检查内容是否有效
  if (!content) return '内容加载中...';
  
  try {
    // 尝试从<content>标签中提取内容
    const contentMatch = content.match(/<content>([\s\S]*?)<\/content>/i);
    
    if (contentMatch && contentMatch[1]) {
      // 已找到完整的<content>标签，提取内容
      return contentMatch[1].trim();
    }
    
    // 如果以 <content> 开头，但没有结束标签，截取内容并移除标签
    if (content.includes('<content>') && !content.includes('</content>')) {
      content = content.replace('<content>', '').trim();
    }
    
    // 如果以 </content> 结束，但没有开始标签，截取内容并移除标签
    if (content.includes('</content>') && !content.includes('<content>')) {
      content = content.replace('</content>', '').trim();
    }
    
    // 移除所有剩余的content标签，只显示实际内容
    content = content.replace(/<\/?content>/g, '').trim();
    
    // 移除可能存在的<think>标签及其内容
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    
    // 如果内容长度为0，返回错误提示
    if (content.length === 0) {
      return '无法显示内容，请尝试重新生成';
    }
    
    return content;
  } catch (err) {
    console.error('处理内容时出错:', err);
    return '内容解析错误，请尝试重新生成';
  }
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

// 检查是否有自定义图片
const hasCustomImage = computed(() => {
  // 只要有图片URL或默认背景路径即可，无需考虑layout
  return (props.customStyle?.imageUrl && props.customStyle.imageUrl !== '') ||
         (props.customStyle?.defaultBgPath && props.customStyle.defaultBgPath !== '');
});

// 获取显示的图片URL
const displayImageUrl = computed(() => {
  // 优先使用自定义上传的图片，其次使用默认背景图片
  return props.customStyle?.imageUrl || props.customStyle?.defaultBgPath || '';
});

// 图片层样式
const imageLayerStyle = computed(() => {
  // 如果布局是paper，不显示图片层
  if (props.customStyle?.layout === 'paper') return {};
  
  // 如果没有图片URL或默认背景路径，返回空样式
  if (!displayImageUrl.value) return {};
  
  const style = {
    backgroundImage: `url(${displayImageUrl.value})`,
    opacity: props.customStyle?.imageOpacity || 1,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: props.customStyle?.imageFilter?.style || ''
  };
  
  // 根据布局调整图片位置
  if (props.customStyle?.layout === 'image-top') {
    style.height = '50%';
    style.top = '0';
    style.backgroundSize = 'cover';
  } else if (props.customStyle?.layout === 'image-bottom') {
    style.height = '50%';
    style.top = '50%';
    style.backgroundSize = 'cover';
  } else if (props.customStyle?.layout === 'split') {
    // 分屏布局
    const direction = props.customStyle.splitDirection || 'horizontal';
    const imageRatio = props.customStyle.imageRatio || 0.5;
    
    if (direction === 'horizontal') {
      style.width = `${imageRatio * 100}%`;
      style.height = '100%';
      style.top = '0';
      style.left = '0';
    } else {
      style.width = '100%';
      style.height = `${imageRatio * 100}%`;
      style.top = '0';
      style.left = '0';
    }
  } else if (props.customStyle?.layout === 'image-bg') {
    style.width = '100%';
    style.height = '100%';
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.zIndex = '1'; // 确保图片层在纸条背景之上，但在内容之下
  }
  
  // 应用缩放
  if (props.customStyle?.imageScale) {
    style.transform = `scale(${props.customStyle.imageScale})`;
    style.transformOrigin = 'center';
  }
  
  return style;
});

// 计算卡片样式，包括动态高度
const cardStyle = computed(() => {
  // 获取背景
  let background;
  
  if (props.customStyle?.layout === 'paper') {
    // 纸条布局使用默认背景
    background = getBackgroundVariable.value;
  } else if (hasCustomImage.value && props.customStyle?.layout === 'image-bg') {
    // 图片背景布局
    if (props.customStyle.preservePaperBg) {
      // 如果需要保留纸条背景，使用默认背景
      background = getBackgroundVariable.value;
    } else {
      // 否则使用透明背景，让图片层显示
      background = 'transparent';
    }
  } else {
    // 其他情况使用默认背景
    background = getBackgroundVariable.value;
  }
  
  const isSmallScreen = window.innerWidth <= 375;
  
  // 基础样式
  const style = {
    background: background,
    boxShadow: 'var(--shadow-md)',
    position: 'relative' // 确保定位上下文正确
  };
  
  // 小屏幕特殊处理，调整纵横比
  if (isSmallScreen) {
    style.aspectRatio = '5 / 6'; // 更紧凑的卡片比例
    style.minHeight = '180px'; // 减小最小高度
  }
  
  // 根据内容长度动态调整高度
  const contentLength = props.content ? props.content.length : 0;
  if (contentLength > 100) {
    // 如果内容超过100个字符，调整高度比例，但要考虑屏幕大小
    const heightRatio = Math.min(6, 5 + (contentLength - 100) / 200);
    if (!isSmallScreen) { // 仅在非小屏幕上应用这个比例
      style.aspectRatio = `4 / ${heightRatio}`;
    }
  }
  
  // 毒舌模式下的特殊样式
  if (isSavageMode.value) {
    // 根据是否暗黑模式选择文本颜色
    if (isDarkMode.value) {
      style.color = 'var(--savage-text)';
    } else {
      style.color = '#333333';
    }
    style.boxShadow = 'var(--savage-shadow)';
    style.fontWeight = '500';
  }
  
  // 应用自定义布局样式
  if (props.customStyle?.layout === 'image-top' || props.customStyle?.layout === 'image-bottom') {
    style.display = 'flex';
    style.flexDirection = 'column';
    style.padding = '0';
  } else {
    // 纸条布局和图片背景布局需要内边距
    style.padding = isSmallScreen ? 'var(--spacing-md) var(--spacing-sm)' : 'var(--spacing-xl)';
    
    // 纸条布局下添加居中样式
    style.display = 'flex';
    style.alignItems = 'center';
    style.justifyContent = 'center';
  }
  
  return style;
});

// 修改contentStyle计算属性
const contentStyle = computed(() => {
  const isSmallScreen = window.innerWidth <= 480;
  const isVerySmallScreen = window.innerWidth <= 385;
  
  // 获取适当的字体大小
  const fontSize = props.customStyle?.fontSize || props.fontSize;
  
  const style = {
    fontSize: `${fontSize}px`,
    fontFamily: props.customStyle?.fontFamily || 'KaitiLocal, Kaiti, 楷体, STKaiti, 华文楷体, "Noto Sans SC", sans-serif',
    lineHeight: isVerySmallScreen ? 1.5 : isSmallScreen ? 1.5 : 1.6,
    position: 'relative',
    zIndex: '2' // 确保内容在图片层之上
  };
  
  // 根据布局和emoji气泡位置调整内边距
  if (props.customStyle?.layout === 'image-top') {
    // 上图下文布局
    style.flex = '1';
    style.display = 'flex';
    style.flexDirection = 'column';
    style.justifyContent = 'center'; // 垂直居中
    style.padding = isVerySmallScreen ? '10px' : isSmallScreen ? '12px' : '15px'; // 根据屏幕大小调整内边距
    style.height = '50%'; // 确保文本区域占据下半部分
    
    // 如果有emoji气泡，增加顶部内边距
    if (props.customStyle?.showEmojiBubble !== false && moodsArray.value.length > 0) {
      style.paddingTop = isVerySmallScreen ? '25px' : isSmallScreen ? '30px' : '35px'; // 根据屏幕大小调整顶部内边距
    }
  } else if (props.customStyle?.layout === 'image-bottom') {
    // 下图上文布局
    style.flex = '1';
    style.display = 'flex';
    style.flexDirection = 'column';
    style.justifyContent = 'center'; // 垂直居中
    style.padding = isVerySmallScreen ? '10px' : isSmallScreen ? '12px' : '15px'; // 根据屏幕大小调整内边距
    style.height = '50%'; // 确保文本区域占据上半部分
    
    // 如果有emoji气泡，增加底部内边距
    if (props.customStyle?.showEmojiBubble !== false && moodsArray.value.length > 0) {
      style.paddingBottom = isVerySmallScreen ? '25px' : isSmallScreen ? '30px' : '35px'; // 根据屏幕大小调整底部内边距
    }
  } else {
    // 纸条布局或图片背景布局 - 为emoji腾出顶部空间
    const showEmojiBubble = props.customStyle?.showEmojiBubble !== false && moodsArray.value.length > 0;
    style.paddingTop = showEmojiBubble ? 
      (moodsArray.value.length > 1 ? 
        (isVerySmallScreen ? '30px' : isSmallScreen ? '35px' : '40px') : 
        (isVerySmallScreen ? '25px' : isSmallScreen ? '28px' : '30px')) : 
      (isVerySmallScreen ? '10px' : isSmallScreen ? '12px' : '15px'); // 根据屏幕大小调整顶部内边距
  }
  
  // 应用文字颜色 - 确保颜色值有效
  if (props.customStyle?.textColor && props.customStyle.textColor.trim() !== '') {
    style.color = props.customStyle.textColor;
  }
  
  // 添加文字阴影
  if (props.customStyle?.textShadow) {
    style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  }
  
  // 根据布局调整内容样式
  if (props.customStyle?.layout === 'image-top' || props.customStyle?.layout === 'image-bottom') {
    style.height = '50%';
    style.display = 'flex';
    style.alignItems = 'center';
    style.justifyContent = 'center';
    style.padding = '1rem';
    style.boxSizing = 'border-box';
  } else if (props.customStyle?.layout === 'image-bg') {
    style.position = 'relative';
    style.zIndex = '2'; // 确保内容在图片层之上
    
    // 如果图片背景较深，可能需要更强的文字阴影
    if (props.customStyle?.textShadow) {
      style.textShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
    }
  }
  
  // 根据文字位置调整
  const textPosition = props.customStyle?.textPosition || 'center';
  
  // 处理水平对齐方式
  if (textPosition === 'left') {
    style.textAlign = 'left';
    if (!props.customStyle?.layout || props.customStyle.layout === 'paper' || props.customStyle.layout === 'image-bg') {
      style.alignItems = 'flex-start'; // 纸条布局下左对齐
    }
  } else if (textPosition === 'center') {
    style.textAlign = 'center';
    if (!props.customStyle?.layout || props.customStyle.layout === 'paper' || props.customStyle.layout === 'image-bg') {
      style.alignItems = 'center'; // 纸条布局下居中对齐
    }
  } else if (textPosition === 'right') {
    style.textAlign = 'right';
    if (!props.customStyle?.layout || props.customStyle.layout === 'paper' || props.customStyle.layout === 'image-bg') {
      style.alignItems = 'flex-end'; // 纸条布局下右对齐
    }
  }
  
  // 保留原有的垂直对齐逻辑，用于兼容旧数据
  if (textPosition === 'top') {
    if (props.customStyle?.layout === 'image-top' || props.customStyle?.layout === 'image-bottom') {
      style.justifyContent = 'flex-start';
      style.paddingTop = 'var(--spacing-lg)';
    } else {
      // 纸条布局下的顶部对齐
      style.justifyContent = 'flex-start';
      style.paddingTop = 'var(--spacing-lg)';
    }
  } else if (textPosition === 'center') {
    style.justifyContent = 'center';
  } else if (textPosition === 'bottom') {
    if (props.customStyle?.layout === 'image-top' || props.customStyle?.layout === 'image-bottom') {
      style.justifyContent = 'flex-end';
      style.paddingBottom = 'var(--spacing-lg)';
    } else {
      // 纸条布局下的底部对齐
      style.justifyContent = 'flex-end';
      style.paddingBottom = 'var(--spacing-lg)';
    }
  }
  
  return style;
});

// 表情符号样式
const moodStyle = computed(() => {
  const isSmallScreen = window.innerWidth <= 480;
  const isVerySmallScreen = window.innerWidth <= 385;
  
  // 根据表情数量和屏幕大小动态调整字体大小
  let fontSize;
  if (isVerySmallScreen) {
    fontSize = moodsArray.value.length > 2 ? '14px' : '16px';
  } else if (isSmallScreen) {
    fontSize = moodsArray.value.length > 2 ? '16px' : '18px';
  } else {
    fontSize = moodsArray.value.length > 3 ? '18px' : '24px';
  }
  
  const style = {
    fontSize: fontSize,
    lineHeight: '1',
    padding: isVerySmallScreen ? '1px' : '2px'
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

// 修改onMounted方法，增加对小屏幕默认字体大小的初始化
onMounted(async () => {
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

  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    if (noteCardRef.value) {
      nextTick(() => {
        const contentEl = noteCardRef.value?.querySelector('.note-content');
        if (contentEl) {
          // 应用props中的字体大小
          contentEl.style.fontSize = `${props.fontSize}px`;
        }
      });
    }
  });
});

// 监听内容变化，触发动画
watch(() => props.content, (newContent, oldContent) => {
  if (newContent !== oldContent && noteRef.value && props.animate) {
    playGenerateAnimation();
  }
});

// 修改监听字体大小变化的处理方法
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

// 监听customStyle变化
watch(() => props.customStyle, (newStyle) => {
  console.log('NoteCard接收到新的customStyle:', newStyle);
  
  // 特别记录表情气泡显示状态变化
  if (newStyle && 'showEmojiBubble' in newStyle) {
    console.log('表情气泡显示状态:', newStyle.showEmojiBubble ? '显示' : '隐藏');
  }
}, { deep: true });

// 动态导入当前模板组件
const currentTemplateComponent = computed(() => {
  const layout = props.customStyle?.layout || 'paper';
  
  // 根据布局直接加载对应模板组件
  if (layout === 'image-top') {
    return defineAsyncComponent(() => import('./templates/ImageTopTemplate.vue'));
  } else if (layout === 'image-bottom') {
    return defineAsyncComponent(() => import('./templates/ImageBottomTemplate.vue'));
  } else if (layout === 'image-bg') {
    return defineAsyncComponent(() => import('./templates/ImageBgTemplate.vue'));
  } else if (layout === 'split') {
    return defineAsyncComponent(() => import('./templates/SplitTemplate.vue'));
  } else if (layout === 'card') {
    return defineAsyncComponent(() => import('./templates/CardTemplate.vue'));
  } else {
    // 默认使用纸条模板
    return defineAsyncComponent(() => import('./templates/PaperTemplate.vue'));
  }
});
</script>

<style scoped>
.note-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5; /* 默认比例，可以被内联样式覆盖 */
  padding: 0; /* 移除默认内边距，由内部元素控制 */
  margin: var(--spacing-lg) auto; /* 改为auto使其居中 */
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column; /* 默认垂直排列 */
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, aspect-ratio 0.5s ease;
  min-height: 300px; /* 设置最小高度确保短内容也有足够空间 */
  max-height: 800px; /* 设置最大高度防止过长内容导致卡片过大 */
}

/* 图片层样式 */
.note-image-layer {
  position: relative; /* 改为相对定位，作为flex子元素 */
  width: 100%;
  height: 50%; /* 默认高度为50% */
  z-index: 1;
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
}

/* 纸条布局和图片背景布局下的图片层 */
.note-card:not([style*="flex-direction: column"]) .note-image-layer {
  position: absolute; /* 在非flex布局下使用绝对定位 */
  top: 0;
  left: 0;
  height: 100%;
}

.note-content {
  position: relative;
  font-family: KaitiLocal, Kaiti, 楷体, STKaiti, 华文楷体, 'Noto Sans SC', sans-serif;
  line-height: 1.6;
  z-index: 2;
  padding: var(--spacing-md);
  overflow-y: auto; /* 允许长内容滚动 */
  flex: 1; /* 在flex布局中占据剩余空间 */
  width: 100%; /* 确保宽度充满容器 */
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  transition: color 0.3s ease; /* 添加颜色过渡效果 */
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
    min-height: 200px; /* 小屏幕上进一步减小最小高度 */
  }
  
  .note-card:not([style*="flex-direction: column"]) {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .note-content {
    padding: var(--spacing-sm);
  }
  
  .note-mood-container {
    padding: 3px 6px;
    gap: 2px;
    border-radius: 12px;
    max-width: 85%; /* 在小屏幕上增加最大宽度比例 */
  }
  
  .note-mood-item {
    font-size: 16px;
    line-height: 1;
    margin: 0;
  }
}

/* 特别针对iPhone SE及小型设备的优化 */
@media (max-width: 385px) {
  .note-card {
    padding: var(--spacing-sm) var(--spacing-xs);
    min-height: 200px; /* 小屏幕上进一步减小最小高度 */
    min-width: 200px; /* 进一步减小最小宽度 */
    max-width: 285px;
    aspect-ratio: 5/6; /* 调整长宽比，使卡片更紧凑 */
  }
  
  /* 移除!important，避免强制覆盖内联样式 */
  .note-content {
    line-height: 1.5; /* 稍微减少行高 */
    padding: 0 var(--spacing-xs); /* 减小左右内边距 */
  }
  
  .note-mood-container {
    /* 移除强制定位，使用计算属性中的定位 */
    padding: 2px 4px; /* 进一步减小内边距 */
    gap: 1px; /* 减小间距 */
    border-radius: 10px; /* 减小圆角 */
    max-width: 90%; /* 在超小屏幕上进一步增加最大宽度比例 */
  }
  
  .note-mood-item {
    font-size: 14px; /* 进一步减小表情大小 */
    line-height: 1;
    margin: 0; /* 移除间距 */
  }
  
  .note-watermark {
    bottom: 8px;
    right: 8px;
    font-size: 10px; /* 缩小水印字体 */
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

/* 替换原有的note-mood样式为新的容器样式 */
.note-mood-container {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 20;
  max-width: 70%;
  width: auto;
  justify-content: center;
  align-items: center;
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
  font-size: 20px;
  line-height: 1;
  margin: 0;
}

.note-mood-item:hover {
  transform: scale(1.1);
  opacity: 1;
}

.note-content-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}
</style>