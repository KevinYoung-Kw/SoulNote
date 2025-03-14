<template>
  <div class="filter-selector">
    <div class="filter-header" @click="toggleFilters">
      <h4>图片滤镜</h4>
      <i :class="['fas', isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up']"></i>
    </div>
    
    <div class="filter-content" v-show="!isCollapsed">
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
  }
});

// Emits
const emit = defineEmits(['update:filter']);

// 状态
const currentFilter = ref(props.initialFilter);
const filterIntensity = ref(props.initialIntensity);
const sampleImageUrl = computed(() => props.imageUrl || '/assets/filter-sample.jpg');
const isCollapsed = ref(false);

// 滤镜列表
const filters = [
  { id: 'none', label: '原图', filter: '' },
  { id: 'grayscale', label: '黑白', filter: 'grayscale(100%)' },
  { id: 'sepia', label: '复古', filter: 'sepia(100%)' },
  { id: 'contrast', label: '对比度', filter: 'contrast(150%)' },
  { id: 'brightness', label: '明亮', filter: 'brightness(150%)' },
  { id: 'blur', label: '模糊', filter: 'blur(5px)' },
  { id: 'hue-rotate', label: '色相', filter: 'hue-rotate(90deg)' },
  { id: 'invert', label: '反色', filter: 'invert(100%)' },
  { id: 'saturate', label: '饱和', filter: 'saturate(200%)' },
  // 添加更多有趣的滤镜
  { id: 'rainbow', label: '彩虹', filter: 'hue-rotate(180deg) saturate(200%) brightness(120%)' },
  { id: 'vintage', label: '复古', filter: 'sepia(50%) contrast(120%) brightness(90%)' },
  { id: 'dramatic', label: '戏剧', filter: 'contrast(150%) brightness(110%) saturate(150%)' },
  { id: 'dreamy', label: '梦幻', filter: 'brightness(120%) contrast(90%) blur(1px)' },
  { id: 'cyberpunk', label: '赛博朋克', filter: 'hue-rotate(270deg) saturate(200%) contrast(150%)' },
  { id: 'sunset', label: '日落', filter: 'sepia(30%) saturate(150%) hue-rotate(30deg)' },
  { id: 'cool', label: '冷色调', filter: 'hue-rotate(180deg) saturate(120%) brightness(110%)' },
  { id: 'warm', label: '暖色调', filter: 'sepia(30%) saturate(150%) brightness(110%)' },
  { id: 'neon', label: '霓虹', filter: 'brightness(120%) contrast(120%) saturate(200%) hue-rotate(230deg)' },
  { id: 'cinema', label: '电影', filter: 'contrast(130%) brightness(90%) saturate(110%)' },
  { id: 'polaroid', label: '宝丽来', filter: 'sepia(20%) brightness(105%) contrast(110%) saturate(90%)' }
];

// 方法
function toggleFilters() {
  isCollapsed.value = !isCollapsed.value;
}

function selectFilter(filterId) {
  currentFilter.value = filterId;
  updateFilter();
}

function updateFilter() {
  const filter = filters.find(f => f.id === currentFilter.value);
  if (!filter) return;
  
  let filterStyle = '';
  if (currentFilter.value !== 'none') {
    if (filter.id === 'invert') {
      // 特殊处理反色滤镜
      filterStyle = `invert(${filterIntensity.value * 100}%)`;
    } else {
      // 其他滤镜的处理
      filterStyle = filter.filter
        .replace(/(\d+)%/g, (match, number) => {
          if (filter.id === 'contrast' || filter.id === 'brightness') {
            return `${100 + (number - 100) * filterIntensity.value}%`;
          } else if (filter.id === 'saturate') {
            return `${100 + (number - 100) * filterIntensity.value}%`;
          } else {
            return `${number * filterIntensity.value}%`;
          }
        })
        .replace('5px', `${filterIntensity.value * 10}px`)
        .replace('90deg', `${filterIntensity.value * 180}deg`);
    }
  }
  
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

// 监听props变化
watch(() => props.initialFilter, (newFilter) => {
  currentFilter.value = newFilter;
}, { immediate: true });

watch(() => props.initialIntensity, (newIntensity) => {
  filterIntensity.value = newIntensity;
}, { immediate: true });
</script>

<style scoped>
.filter-selector {
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-header:hover {
  background-color: var(--border-color);
}

.filter-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.filter-header i {
  font-size: 14px;
  color: var(--text-secondary);
}

.filter-content {
  padding: var(--spacing-md);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

@media (max-width: 480px) {
  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .filter-preview {
    width: 60px;
    height: 60px;
  }
}
</style> 