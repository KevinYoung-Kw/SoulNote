<template>
  <div class="note-display-container" ref="noteContainerRef">
    <NoteCard 
      :content="content" 
      :mood="mood"
      :background="background"
      :fontSize="fontSize"
      :animate="isAnimating"
      :animation-duration="animationDuration"
      ref="noteCardRef"
    />

    <div class="background-selector">
      <span 
        v-for="(bg, index) in backgrounds" 
        :key="bg.value" 
        :class="['bg-dot', { active: background === bg.value }]"
        @click="updateBackground(bg.value)"
      ></span>
    </div>

    <div class="font-size-control">
      <button class="icon-btn" @click="decreaseFontSize">
        <i class="fas fa-font"></i>-
      </button>
      <span class="font-size-indicator">{{ fontSize }}px</span>
      
      <button class="icon-btn" @click="increaseFontSize">
        <i class="fas fa-font"></i>+
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import NoteCard from './NoteCard.vue';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';
import logger from '../utils/logger';

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
    default: 24
  }
});

// Emits
const emit = defineEmits(['update:fontSize', 'update:background']);

// Refs
const noteContainerRef = ref(null);
const noteCardRef = ref(null);

// State
const fontSize = ref(props.initialFontSize);
const background = ref(props.initialBackground);

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
    await saveUserPreferences({
      ...currentPrefs,
      fontSize: fontSize.value,
      background: background.value
    });
    
    if (noteCardRef.value) {
      noteCardRef.value.$forceUpdate();
    }
  } catch (error) {
    logger.error('PREFERENCES', '更新本地偏好设置失败:', error);
  }
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

/* 特别针对iPhone SE及小型设备的优化 */
@media (max-width: 375px) {
  .note-display-container {
    margin: 0 var(--spacing-xs);
    min-height: 300px;
  }
}
</style> 