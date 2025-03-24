<template>
  <div class="image-settings">
    <div v-if="!hasImage" class="image-upload-area">
      <slot name="image-uploader"></slot>
    </div>
    
    <div v-else class="image-settings-container">
      <!-- 图片基础控制 -->
      <div class="image-controls">
        <div class="control-group">
          <label>透明度</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            v-model.number="currentSettings.imageOpacity" 
            @input="updateSettings"
          />
          <span>{{ Math.round(currentSettings.imageOpacity * 100) }}%</span>
        </div>
        
        <div class="control-group">
          <label>缩放</label>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            v-model.number="currentSettings.imageScale" 
            @input="updateSettings"
          />
          <span>{{ Math.round(currentSettings.imageScale * 100) }}%</span>
        </div>
      </div>

      <!-- 图片来源提示 -->
      <div class="image-source">
        <span v-if="imageUrl">自定义上传图片</span>
        <span v-else-if="defaultBgId">默认背景：{{ getDefaultBgLabel() }}</span>
      </div>

      <!-- 图片滤镜设置插槽 -->
      <slot name="filter-selector"></slot>

      <!-- 图片预览区域 -->
      <div class="image-preview">
        <template v-if="imageUrl">
          <img 
            :src="imageUrl" 
            alt="已上传图片" 
            :style="{
              opacity: currentSettings.imageOpacity,
              filter: currentSettings.imageFilter?.style || '',
              transform: `scale(${currentSettings.imageScale})`
            }"
          />
        </template>
        <template v-else-if="defaultBgPath">
          <img 
            :src="defaultBgPath" 
            alt="默认背景" 
            :style="{
              opacity: currentSettings.imageOpacity,
              filter: currentSettings.imageFilter?.style || '',
              transform: `scale(${currentSettings.imageScale})`
            }"
          />
        </template>
        <button class="remove-image-btn" @click="removeImage">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      
      <!-- 切换图片按钮 -->
      <div class="actions">
        <button class="change-image-btn" @click="showImageOptions">
          <i class="fas fa-exchange-alt"></i>
          <span>更换图片</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, reactive, watch, ref, computed } from 'vue';

// Props
const props = defineProps({
  imageUrl: {
    type: String,
    default: ''
  },
  defaultBgId: {
    type: String,
    default: ''
  },
  defaultBgPath: {
    type: String,
    default: ''
  },
  imageOpacity: {
    type: Number,
    default: 1
  },
  imageScale: {
    type: Number,
    default: 1
  },
  imageFilter: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:settings', 'remove-image', 'show-image-options']);

// 当前设置
const currentSettings = reactive({
  imageOpacity: props.imageOpacity,
  imageScale: props.imageScale,
  imageFilter: props.imageFilter
});

// 判断是否有背景图片
const hasImage = computed(() => {
  return props.imageUrl || props.defaultBgPath;
});

// 默认背景标签映射
const defaultBgLabels = {
  'bg1': '粉绿渐变',
  'bg2': '黄蓝渐变',
  'bg3': '粉紫渐变'
};

// 方法
function updateSettings() {
  emit('update:settings', { ...currentSettings });
}

function removeImage() {
  emit('remove-image');
}

function showImageOptions() {
  emit('show-image-options');
}

function getDefaultBgLabel() {
  return defaultBgLabels[props.defaultBgId] || '默认背景';
}

// 监听props变化
watch(() => props.imageOpacity, (newValue) => {
  currentSettings.imageOpacity = newValue;
}, { immediate: true });

watch(() => props.imageScale, (newValue) => {
  currentSettings.imageScale = newValue;
}, { immediate: true });

watch(() => props.imageFilter, (newValue) => {
  currentSettings.imageFilter = newValue;
}, { immediate: true, deep: true });
</script>

<style scoped>
.image-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.image-settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.image-controls {
  background-color: var(--bg-color);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  width: 80px;
  font-size: 14px;
  color: var(--text-secondary);
}

.control-group input[type="range"] {
  flex: 1;
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  -webkit-appearance: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--primary-color);
  cursor: pointer;
}

.control-group span {
  width: 50px;
  font-size: 14px;
  text-align: right;
  color: var(--text-secondary);
}

.image-source {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  padding: var(--spacing-xs) 0;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-color);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.remove-image-btn {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.remove-image-btn:hover {
  background-color: rgba(220, 53, 69, 0.8);
}

.actions {
  display: flex;
  justify-content: center;
}

.change-image-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--bg-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  transition: all var(--transition-fast);
}

.change-image-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .control-group label {
    width: 60px;
    font-size: 12px;
  }
  
  .control-group span {
    width: 40px;
    font-size: 12px;
  }
  
  .image-preview {
    height: 100px;
  }
}
</style> 