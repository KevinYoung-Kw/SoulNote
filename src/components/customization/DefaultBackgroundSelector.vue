<template>
  <div class="default-bg-selector">
    <div class="selector-header">
      <h4 class="selector-title">选择一个背景图片</h4>
      <p class="selector-description">点击下方图片选择您喜欢的默认背景</p>
    </div>
    <div class="background-grid">
      <div 
        v-for="(bg, index) in backgrounds" 
        :key="index"
        :class="['bg-item', { active: selectedBg === bg.id }]"
        @click="selectBackground(bg.id)"
      >
        <div class="bg-preview" :style="{ background: bg.gradient }">
          <div v-if="bg.svgContent" class="svg-content" v-html="bg.svgContent"></div>
          <div v-else class="loading-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        </div>
        <span class="bg-label">{{ bg.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { loadSvg, createInlineSvg } from '../../utils/svgOptimizer';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'background-selected']);

// 将computed属性改为普通ref，避免引起循环更新
const selectedBg = ref(props.modelValue || '');

// 监听props变化，但避免在内部已有同值时触发更新
watch(() => props.modelValue, (newVal) => {
  if (newVal !== selectedBg.value) {
    selectedBg.value = newVal || '';
  }
}, { immediate: true });

// 默认背景图片列表
const backgrounds = ref([
  { 
    id: 'bg1', 
    path: '/background/background1.svg', 
    label: '粉绿渐变',
    gradient: 'linear-gradient(to right, #f3b5be, #d5fdc5)',
    svgContent: null 
  },
  { 
    id: 'bg2', 
    path: '/background/background2.svg', 
    label: '黄蓝渐变',
    gradient: 'linear-gradient(to right, #f7dda1, #dbfaf9)',
    svgContent: null
  },
  { 
    id: 'bg3', 
    path: '/background/background3.svg', 
    label: '粉紫渐变',
    gradient: 'linear-gradient(to right, #f8d4f7, #f4d1c9)',
    svgContent: null
  }
]);

// 选择背景图片
function selectBackground(bgId) {
  // 避免重复选择相同的背景
  if (selectedBg.value === bgId) {
    return;
  }
  
  // 先更新内部状态
  selectedBg.value = bgId;
  
  // 延迟发送事件，打破循环依赖
  setTimeout(() => {
    // 先发送v-model事件
    emit('update:modelValue', bgId);
    
    // 查找选中的背景图片信息
    const selectedBackground = backgrounds.value.find(bg => bg.id === bgId);
    if (selectedBackground) {
      // 再发送background-selected事件
      emit('background-selected', {
        id: selectedBackground.id,
        path: selectedBackground.path,
        svgContent: selectedBackground.svgContent
      });
    }
  }, 0);
}

// 加载SVG图片
async function loadBackgroundSvgs() {
  try {
    for (const bg of backgrounds.value) {
      const svgContent = await loadSvg(bg.path, {
        useCache: true,
        saveToPersistentCache: true
      });
      
      // 使用提供的工具创建内联SVG
      if (svgContent) {
        bg.svgContent = createInlineSvg(svgContent).__html;
      }
    }
  } catch (error) {
    console.error('加载背景图片失败:', error);
  }
}

onMounted(() => {
  loadBackgroundSvgs();
  
  // 移除自动选择第一个背景的逻辑
  // 仅在有明确指定modelValue时才选择背景
  if (selectedBg.value && backgrounds.value.length > 0) {
    // 仅同步选中状态，不触发选择事件
    const validBg = backgrounds.value.find(bg => bg.id === selectedBg.value);
    if (validBg) {
      // 只是确保选中状态显示正确，不自动选择
      selectedBg.value = validBg.id;
    }
  }
});
</script>

<style scoped>
.default-bg-selector {
  margin-bottom: var(--spacing-md);
}

.selector-header {
  margin-bottom: var(--spacing-sm);
}

.selector-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.selector-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.bg-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bg-preview {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  position: relative;
}

.svg-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-content ::v-deep(svg) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.bg-item.active .bg-preview {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.bg-item span {
  font-size: 12px;
  color: var(--text-secondary);
}

.bg-item.active span {
  color: var(--primary-color);
  font-weight: 500;
}

@media (max-width: 480px) {
  .bg-preview {
    width: 60px;
    height: 60px;
  }
  
  .bg-label {
    font-size: 10px;
  }
}
</style> 