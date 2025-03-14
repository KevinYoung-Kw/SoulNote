<template>
  <div class="filter-selector">
    <h4>图片滤镜</h4>
    
    <div class="filters-grid">
      <div 
        v-for="filter in filters" 
        :key="filter.id"
        :class="['filter-item', { active: currentFilter === filter.id }]"
        @click="selectFilter(filter.id)"
      >
        <div class="filter-preview" :style="getFilterStyle(filter)">
          <img :src="sampleImageUrl" alt="滤镜预览" />
        </div>
        <span>{{ filter.label }}</span>
      </div>
    </div>
    
    <div class="filter-controls" v-if="currentFilter !== 'none'">
      <div class="control-group">
        <label>强度</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          v-model.number="filterIntensity" 
          @input="updateFilter"
        />
        <span>{{ Math.round(filterIntensity * 100) }}%</span>
      </div>
    </div>
    
    <!-- 添加表情气泡显示控制 -->
    <div class="emoji-bubble-control">
      <div class="control-group">
        <label>表情气泡</label>
        <div class="toggle-switch">
          <input 
            type="checkbox" 
            id="emoji-bubble-toggle" 
            v-model="showEmojiBubble" 
            @change="updateEmojiBubble"
          />
          <label for="emoji-bubble-toggle"></label>
        </div>
        <span>{{ showEmojiBubble ? '显示' : '隐藏' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
  imageUrl: {
    type: String,
    default: ''
  },
  initialFilter: {
    type: String,
    default: 'none'
  },
  initialIntensity: {
    type: Number,
    default: 0.5
  },
  initialShowEmojiBubble: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['update:filter', 'update:emojiBubble']);

// 状态
const currentFilter = ref(props.initialFilter);
const filterIntensity = ref(props.initialIntensity);
const sampleImageUrl = computed(() => props.imageUrl || '/assets/filter-sample.jpg');
const showEmojiBubble = ref(props.initialShowEmojiBubble); // 使用prop初始化

// 滤镜列表
const filters = [
  { id: 'none', label: '原图', filter: '' },
  { id: 'grayscale', label: '黑白', filter: 'grayscale(100%)' },
  { id: 'sepia', label: '复古', filter: 'sepia(100%)' },
  { id: 'contrast', label: '对比度', filter: 'contrast(150%)' },
  { id: 'brightness', label: '明亮', filter: 'brightness(150%)' },
  { id: 'blur', label: '模糊', filter: 'blur(5px)' },
  { id: 'hue-rotate', label: '色相', filter: 'hue-rotate(90deg)' },
  { id: 'invert', label: '反色', filter: 'invert(80%)' },
  { id: 'saturate', label: '饱和', filter: 'saturate(200%)' }
];

// 方法
function selectFilter(filterId) {
  currentFilter.value = filterId;
  updateFilter();
}

function updateFilter() {
  const filter = filters.find(f => f.id === currentFilter.value);
  if (!filter) return;
  
  const filterStyle = currentFilter.value === 'none' 
    ? '' 
    : filter.filter.replace('100%', `${filterIntensity.value * 100}%`)
      .replace('150%', `${100 + filterIntensity.value * 100}%`)
      .replace('200%', `${100 + filterIntensity.value * 200}%`)
      .replace('5px', `${filterIntensity.value * 10}px`)
      .replace('90deg', `${filterIntensity.value * 180}deg`)
      .replace('80%', `${filterIntensity.value * 100}%`);
  
  emit('update:filter', {
    id: currentFilter.value,
    intensity: filterIntensity.value,
    style: filterStyle
  });
}

function getFilterStyle(filter) {
  if (filter.id === 'none') {
    return {};
  }
  
  return {
    filter: filter.filter
  };
}

// 更新表情气泡显示状态
function updateEmojiBubble() {
  console.log('更新表情气泡显示状态:', showEmojiBubble.value);
  emit('update:emojiBubble', showEmojiBubble.value);
}

// 监听props变化
watch(() => props.initialFilter, (newFilter) => {
  currentFilter.value = newFilter;
}, { immediate: true });

watch(() => props.initialIntensity, (newIntensity) => {
  filterIntensity.value = newIntensity;
}, { immediate: true });

watch(() => props.initialShowEmojiBubble, (newValue) => {
  showEmojiBubble.value = newValue;
}, { immediate: true });
</script>

<style scoped>
.filter-selector {
  margin-bottom: var(--spacing-lg);
}

.filter-selector h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: 16px;
  font-weight: 500;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.filter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-preview {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.filter-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.filter-item.active .filter-preview {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.filter-item span {
  font-size: 12px;
  color: var(--text-secondary);
}

.filter-item.active span {
  color: var(--primary-color);
  font-weight: 500;
}

.filter-controls {
  margin-top: var(--spacing-md);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.control-group label {
  width: 60px;
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

.emoji-bubble-control {
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: var(--primary-color);
}

.toggle-switch input:checked + label:before {
  transform: translateX(20px);
}

@media (max-width: 480px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-preview {
    width: 60px;
    height: 60px;
  }
}
</style> 