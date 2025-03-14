<template>
  <div class="control-section fixed-footer">
    <LoadingIndicator 
      v-if="isGenerating" 
      :is-loading="isGenerating"
      :message="loadingMessage"
      :adaptive-time="estimatedResponseTime"
    />
    
    <button 
      class="btn btn-primary generate-btn" 
      @click="generateNote"
      :disabled="isGenerating"
    >
      <i class="fas fa-magic"></i>
      <span>{{ isGenerating ? '生成中...' : '生成心语' }}</span>
    </button>
    
    <div class="action-buttons">
      <button class="icon-btn action-btn" @click="regenerateNote" :disabled="isGenerating">
        <i class="fas fa-redo"></i>
      </button>
      <button class="icon-btn action-btn" @click="saveNote" :disabled="!noteContent || isGenerating">
        <i class="fas fa-heart"></i>
      </button>
      <button class="icon-btn action-btn" @click="customizeNote" :disabled="!noteContent || isGenerating">
        <i class="fas fa-palette"></i>
      </button>
      <button class="icon-btn action-btn" @click="openAISettings" :disabled="isGenerating">
        <i class="fas fa-robot"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LoadingIndicator from './LoadingIndicator.vue';

// Props
const props = defineProps({
  isGenerating: {
    type: Boolean,
    default: false
  },
  loadingMessage: {
    type: String,
    default: '正在生成中...'
  },
  estimatedResponseTime: {
    type: Number,
    default: 3000
  },
  noteContent: {
    type: String,
    default: ''
  },
  savageMode: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'generate', 
  'regenerate', 
  'save', 
  'customize', 
  'openAISettings'
]);

// Methods
function generateNote() {
  emit('generate');
}

function regenerateNote() {
  if (!props.isGenerating) {
    emit('regenerate');
  }
}

function saveNote() {
  if (props.noteContent) {
    emit('save');
  }
}

function customizeNote() {
  if (props.noteContent) {
    emit('customize');
  }
}

function openAISettings() {
  emit('openAISettings');
}
</script>

<style scoped>
.control-section {
  margin: 0;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  position: relative;
}

.generate-btn {
  width: 100%;
  padding: var(--spacing-sm) 0;
  font-size: 16px;
  margin-bottom: var(--spacing-sm);
  position: relative;
  z-index: 1;
  min-height: 42px;
}

.generate-btn i {
  margin-right: var(--spacing-sm);
}

.action-buttons {
  display: flex;
  justify-content: space-around;
}

.action-btn {
  font-size: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 毒舌模式的样式覆盖 */
:global(.savage-mode) .generate-btn {
  background-color: var(--savage-primary-color, #ff5252);
  border-color: var(--savage-accent-color, #8a0000);
}

:global(.savage-mode) .generate-btn:hover {
  background-color: var(--savage-accent-color, #8a0000);
}

:global(.savage-mode) .action-btn {
  background-color: #333333;
}

:global(.savage-mode) .action-btn:hover {
  background-color: #444444;
  color: var(--savage-primary-color, #ff5252);
}

/* 针对较小屏幕的优化 */
@media (max-width: 480px) {
  .control-section {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .generate-btn {
    min-height: 38px;
    font-size: 15px;
  }
}

/* 特别针对iPhone SE及小型设备的优化 */
@media (max-width: 375px) {
  .generate-btn {
    min-height: 36px;
    font-size: 14px;
    padding: var(--spacing-xs) 0;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .control-section {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>