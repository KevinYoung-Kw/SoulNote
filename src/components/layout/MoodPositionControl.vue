<template>
  <div class="mood-position-control-container">
    <h4>表情气泡位置</h4>
    
    <!-- 九宫格选择器 -->
    <div class="position-grid-container">
      <div class="position-grid">
        <div 
          v-for="pos in gridPositions" 
          :key="pos.value"
          class="position-cell"
          :class="{ active: modelValue === pos.value }"
          @click="updatePosition(pos.value)"
          :title="pos.label"
        >
          <div class="position-icon">
            <i :class="pos.icon"></i>
          </div>
        </div>
      </div>
      
      <!-- 显示/隐藏气泡按钮 -->
      <button 
        class="toggle-emoji-button"
        :class="{ active: !showEmoji }"
        @click="toggleEmojiVisibility"
        type="button"
      >
        <i :class="showEmoji ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        <span>{{ showEmoji ? '隐藏表情气泡' : '显示表情气泡' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'default'
  },
  showEmoji: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'update:showEmoji']);

// 九宫格位置选项
const gridPositions = [
  { value: 'top-left', icon: 'fas fa-arrow-up-left', label: '左上角' },
  { value: 'top', icon: 'fas fa-arrow-up', label: '顶部' },
  { value: 'top-right', icon: 'fas fa-arrow-up-right', label: '右上角' },
  { value: 'left', icon: 'fas fa-arrow-left', label: '左侧' },
  { value: 'center', icon: 'fas fa-arrows-to-dot', label: '中心' },
  { value: 'right', icon: 'fas fa-arrow-right', label: '右侧' },
  { value: 'bottom-left', icon: 'fas fa-arrow-down-left', label: '左下角' },
  { value: 'bottom', icon: 'fas fa-arrow-down', label: '底部' },
  { value: 'bottom-right', icon: 'fas fa-arrow-down-right', label: '右下角' }
];

// 更新表情位置
function updatePosition(position) {
  // 确保position值有效后再发送更新事件
  if (position && gridPositions.find(p => p.value === position)) {
    console.log('更新表情位置:', position);
    emit('update:modelValue', position);
  }
}

// 切换表情显示状态
function toggleEmojiVisibility() {
  // 只发送事件，但不改变当前组件的显示状态
  emit('update:showEmoji', !props.showEmoji);
}

// 生命周期钩子，确保在组件渲染后添加点击事件
onMounted(() => {
  // 确保位置选择器正常工作
  nextTick(() => {
    console.log('MoodPositionControl组件已挂载，表情位置:', props.modelValue);
  });
});
</script>

<style scoped>
.mood-position-control-container {
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.mood-position-control-container h4 {
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.position-grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 4px;
  width: 150px;
  height: 150px;
  background-color: #f0f0f0;
  border-radius: 6px;
  padding: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.position-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 5;
}

.position-cell:hover {
  background-color: #edf2f7;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.position-cell.active {
  background-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.position-cell.active .position-icon {
  color: white;
}

.position-icon {
  font-size: 14px;
  color: #4a5568;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.toggle-emoji-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  width: 150px;
  margin-top: 8px;
  color: #4a5568;
}

.toggle-emoji-button:hover {
  background-color: #edf2f7;
}

.toggle-emoji-button.active {
  background-color: #feebc8;
  border-color: #ed8936;
  color: #c05621;
}

.toggle-emoji-button i {
  font-size: 12px;
}
</style> 