<template>
  <div class="note-display-container" ref="noteContainerRef">
    <NoteCard 
      :content="content" 
      :mood="mood"
      :background="background"
      :fontSize="fontSize"
      :animate="isAnimating"
      :animation-duration="animationDuration"
      :custom-style="{
        ...customStyle,
        imageFilter: customStyle.imageFilter || { id: 'none', intensity: 0.5, style: '' }
      }"
      ref="noteCardRef"
    />

    <!-- 保留原有的背景选择器，仅在非自定义图片模式下显示 -->
    <div class="background-selector" v-if="!hasCustomImage">
      <span 
        v-for="(bg, index) in backgrounds" 
        :key="bg.value" 
        :class="['bg-dot', { active: background === bg.value }]"
        @click="updateBackground(bg.value)"
      ></span>
    </div>

    <!-- 保留原有的字体大小控制，仅在非自定义样式模式下显示 -->
    <div class="font-size-control" v-if="!hasCustomStyle">
      <button class="icon-btn" @click="decreaseFontSize">
        <i class="fas fa-font"></i>-
      </button>
      <span class="font-size-indicator">{{ fontSize }}px</span>
      
      <button class="icon-btn" @click="increaseFontSize">
        <i class="fas fa-font"></i>+
      </button>
    </div>
    
    <!-- 添加自定义样式按钮，仅当内容不是默认内容时显示 -->
    <div class="customize-button" v-if="content !== defaultContent">
      <button class="btn btn-outline" @click="openStyleCustomizer">
        <i class="fas fa-palette"></i>
        <span>自定义样式</span>
      </button>
    </div>
    
    <!-- 样式定制器弹窗 -->
    <div class="style-customizer-modal" v-if="showStyleCustomizer">
      <div class="modal-overlay" @click="showStyleCustomizer = false"></div>
      <div class="modal-content">
        <NoteStyleCustomizer 
          :note-content="content"
          :note-mood="mood"
          :initial-style="customStyle"
          :external-font-size="fontSize"
          @close="showStyleCustomizer = false"
          @update:style="updateCustomStyle"
          @export="handleExport"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import NoteCard from './NoteCard.vue';
import NoteStyleCustomizer from './NoteStyleCustomizer.vue';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';
import logger from '../utils/logger';
import { getDefaultFontSize } from '../config/style';

// Props
const props = defineProps({
  content: {
    type: String,
    default: '点击下方"生成心语"按钮，开始您的心灵之旅...'
  },
  mood: {
    type: String,
    default: ''
  },
  isAnimating: {
    type: Boolean,
    default: false
  },
  animationDuration: {
    type: Number,
    default: 2
  },
  initialBackground: {
    type: String,
    default: 'paper-1'
  },
  initialFontSize: {
    type: Number,
    default: getDefaultFontSize()
  }
});

// 默认内容，用于判断是否显示自定义按钮
const defaultContent = '点击下方"生成心语"按钮，开始您的心灵之旅...';

// Emits
const emit = defineEmits([
  'update:fontSize', 
  'update:background', 
  'update:customStyle',
  'export'
]);

// Refs
const noteContainerRef = ref(null);
const noteCardRef = ref(null);

// State
const fontSize = ref(props.initialFontSize);
const background = ref(props.initialBackground);
const customStyle = ref({});
const showStyleCustomizer = ref(false);

// 计算属性
const hasCustomImage = computed(() => {
  return (customStyle.value?.imageUrl && customStyle.value.imageUrl !== '') ||
         (customStyle.value?.defaultBgPath && customStyle.value.defaultBgPath !== '');
});

const hasCustomStyle = computed(() => {
  return Object.keys(customStyle.value).length > 0 && 
         ((customStyle.value.layout !== 'paper') || hasCustomImage.value);
});

// Data
const backgrounds = [
  { value: 'paper-1', label: '米白色' },
  { value: 'paper-2', label: '淡粉色' },
  { value: 'paper-3', label: '淡蓝色' },
  { value: 'paper-4', label: '淡绿色' }
];

// Methods
function updateBackground(newBackground) {
  background.value = newBackground;
  emit('update:background', newBackground);
  updateLocalPreferences();
}

function increaseFontSize() {
  // 小屏幕上的最大字体限制更小
  const maxSize = window.innerWidth <= 375 ? 30 : 36;
  
  if (fontSize.value < maxSize) {
    fontSize.value += 2;
    emit('update:fontSize', fontSize.value);
    applyFontSize();
    updateLocalPreferences();
    logger.info('FONT_SIZE', 'Increased font size to:', fontSize.value);
  }
}

function decreaseFontSize() {
  // 小屏幕上的最小字体可以更小
  const minSize = window.innerWidth <= 375 ? 14 : 16;
  
  if (fontSize.value > minSize) {
    fontSize.value -= 2;
    emit('update:fontSize', fontSize.value);
    applyFontSize();
    updateLocalPreferences();
    logger.info('FONT_SIZE', 'Decreased font size to:', fontSize.value);
  }
}

function applyFontSize() {
  nextTick(() => {
    try {
      if (noteCardRef.value && noteCardRef.value.$el) {
        const contentEl = noteCardRef.value.$el.querySelector('.note-content');
        if (contentEl) {
          contentEl.style.fontSize = `${fontSize.value}px`;
          logger.info('FONT_SIZE', '直接通过DOM更新字体大小:', fontSize.value);
        }
      }
    } catch (error) {
      logger.error('FONT_SIZE', '应用字体大小失败:', error);
    }
  });
}

async function updateLocalPreferences() {
  try {
    const currentPrefs = await getUserPreferences();
    
    // 确保defaultBgId和defaultBgPath也被保存
    const styleToSave = {
      ...customStyle.value,
      // 如果有默认背景ID但没有选择合适的布局，自动使用image-bg布局
      layout: customStyle.value.defaultBgId && customStyle.value.layout === 'paper' 
        ? 'image-bg' 
        : customStyle.value.layout
    };
    
    await saveUserPreferences({
      ...currentPrefs,
      fontSize: fontSize.value,
      background: background.value,
      customStyle: styleToSave
    });
    
    if (noteCardRef.value) {
      noteCardRef.value.$forceUpdate();
    }
  } catch (error) {
    logger.error('PREFERENCES', '更新本地偏好设置失败:', error);
  }
}

// 自定义样式相关方法
function openStyleCustomizer() {
  showStyleCustomizer.value = true;
}

function updateCustomStyle(newStyle) {
  // 从新样式中解构出字体大小，其他样式属性保持不变
  const { fontSize: newFontSize, ...otherStyles } = newStyle;
  customStyle.value = otherStyles;
  
  // 如果有默认背景ID但没有选择合适的布局，自动使用image-bg布局
  if (customStyle.value.defaultBgId && customStyle.value.layout === 'paper') {
    customStyle.value.layout = 'image-bg';
  }
  
  emit('update:customStyle', customStyle.value);
  updateLocalPreferences();
}

function handleExport(style) {
  emit('export', { 
    element: noteCardRef.value.$el,
    style: style
  });
}

// Expose methods to parent component
defineExpose({
  noteCardRef,
  applyFontSize
});

// Watchers
watch(fontSize, (newSize) => {
  logger.info('FONT_SIZE', 'Font size changed in NoteDisplay:', newSize);
  nextTick(() => {
    applyFontSize();
  });
});

// 监听内容变化，重置自定义样式
watch(() => props.content, (newContent, oldContent) => {
  if (newContent !== oldContent && newContent !== defaultContent) {
    // 如果是新生成的内容，但保留之前的自定义样式设置
    // 这里不重置样式，让用户可以保持自己的样式偏好
  }
});
</script>

<style scoped>
.note-display-container {
  margin: var(--spacing-md);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: visible;
  min-height: 400px;
}

.background-selector {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.bg-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--border-color);
  margin: 0 var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bg-dot.active {
  background-color: var(--primary-color);
  transform: scale(1.2);
}

.font-size-control {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.font-size-indicator {
  margin: 0 var(--spacing-md);
  font-size: 14px;
  color: var(--text-secondary);
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.1);
}

.customize-button {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.btn-outline {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: white;
}

.btn i {
  font-size: 16px;
}

.style-customizer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  height: 90%;
  max-height: 700px;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 1001;
}

/* 特别针对iPhone SE及小型设备的优化 */
@media (max-width: 375px) {
  .note-display-container {
    margin: 0 var(--spacing-xs);
    min-height: 300px;
  }
  
  .modal-content {
    width: 95%;
    height: 95%;
  }
}
</style>