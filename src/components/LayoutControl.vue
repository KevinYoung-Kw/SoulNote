<template>
  <div class="layout-control-container">
    <!-- 图文布局占比控制 -->
    <div v-if="showRatioControl" class="layout-ratio-control">
      <h4>布局占比控制</h4>
      
      <!-- 上图下文/下图上文模板的控制 -->
      <div v-if="layout === 'image-top' || layout === 'image-bottom'">
        <div class="ratio-label">
          <span>{{ layout === 'image-top' ? '图片' : '文字' }} 
            {{ Math.round((layout === 'image-top' ? imageRatio : textRatio) * 100) }}%</span>
          <span>{{ layout === 'image-top' ? '文字' : '图片' }} 
            {{ Math.round((layout === 'image-top' ? (1-imageRatio) : (1-textRatio)) * 100) }}%</span>
        </div>
        <input 
          type="range" 
          min="0.2" 
          max="0.8"
          step="0.05"
          :value="layout === 'image-top' ? imageRatio : textRatio"
          @input="updateRatio($event, layout === 'image-top' ? 'imageRatio' : 'textRatio')"
          class="ratio-slider"
        />
      </div>
      
      <!-- 分屏布局的控制 -->
      <div v-if="layout === 'split'">
        <div class="direction-control">
          <label class="direction-label">
            <input 
              type="radio" 
              name="splitDirection" 
              value="horizontal" 
              :checked="splitDirection === 'horizontal'"
              @change="updateSplitDirection('horizontal')"
            />
            <span>左右分屏</span>
          </label>
          <label class="direction-label">
            <input 
              type="radio" 
              name="splitDirection" 
              value="vertical" 
              :checked="splitDirection === 'vertical'"
              @change="updateSplitDirection('vertical')"
            />
            <span>上下分屏</span>
          </label>
        </div>
        
        <div class="ratio-label">
          <span>文字 {{ Math.round(textRatio * 100) }}%</span>
          <span>图片 {{ Math.round((1-textRatio) * 100) }}%</span>
        </div>
        <input 
          type="range" 
          min="0.2" 
          max="0.8"
          step="0.05"
          :value="textRatio"
          @input="updateRatio($event, 'textRatio')"
          class="ratio-slider"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  layout: {
    type: String,
    required: true
  },
  imageRatio: {
    type: Number,
    default: 0.5
  },
  textRatio: {
    type: Number,
    default: 0.5
  },
  splitDirection: {
    type: String,
    default: 'horizontal'
  }
});

const emit = defineEmits(['update:imageRatio', 'update:textRatio', 'update:splitDirection']);

// 是否显示占比控制
const showRatioControl = computed(() => {
  return props.layout === 'image-top' || props.layout === 'image-bottom' || props.layout === 'split';
});

// 更新占比比例
function updateRatio(event, type) {
  const value = parseFloat(event.target.value);
  
  // 更新指定类型的比例
  if (type === 'imageRatio') {
    emit('update:imageRatio', value);
  } else if (type === 'textRatio') {
    emit('update:textRatio', value);
  }
}

// 更新分屏方向
function updateSplitDirection(direction) {
  emit('update:splitDirection', direction);
}
</script>

<style scoped>
.layout-control-container {
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.layout-ratio-control h4 {
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.ratio-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  color: #4a5568;
  font-weight: 400;
}

.ratio-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e2e8f0;
  outline: none;
  border-radius: 2px;
  margin: 8px 0;
  border: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.ratio-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
}

.ratio-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.ratio-slider:focus {
  outline: none;
}

.direction-control {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.direction-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #4a5568;
  font-weight: 400;
}

.direction-label input {
  margin: 0;
  width: 12px;
  height: 12px;
  accent-color: #3b82f6;
}
</style> 