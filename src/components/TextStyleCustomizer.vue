<template>
  <div class="text-settings-panel">
    <!-- 字体选择 -->
    <div class="setting-group">
      <div class="setting-header">
        <i class="fas fa-font"></i>
        <span>字体选择</span>
      </div>
      <div class="font-selection">
        <div 
          v-for="font in fontFamilies" 
          :key="font.value"
          :class="['font-option', { active: currentStyle.fontFamily === font.value }]"
          @click="updateStyle({ fontFamily: font.value })"
          :style="{ fontFamily: font.value }"
        >
          <span>{{ font.label }}</span>
        </div>
      </div>
    </div>
    
    <!-- 字体大小控制 -->
    <div class="setting-group">
      <div class="setting-header">
        <i class="fas fa-text-height"></i>
        <span>字体大小</span>
      </div>
      <div class="slider-with-value">
        <button 
          class="size-preset-btn" 
          @click="updateStyle({ fontSize: Math.max(fontSizeConfig.MIN, currentStyle.fontSize - 2) })"
        >
          <i class="fas fa-minus"></i>
        </button>
        <div class="slider-container">
          <input 
            type="range" 
            :min="fontSizeConfig.MIN" 
            :max="fontSizeConfig.MAX" 
            step="1" 
            v-model.number="currentStyle.fontSize" 
            @input="updateStyle({ fontSize: currentStyle.fontSize })"
          />
          <div class="slider-track">
            <div class="slider-fill" :style="{ width: `${(currentStyle.fontSize - fontSizeConfig.MIN) / (fontSizeConfig.MAX - fontSizeConfig.MIN) * 100}%` }"></div>
          </div>
        </div>
        <button 
          class="size-preset-btn" 
          @click="updateStyle({ fontSize: Math.min(fontSizeConfig.MAX, currentStyle.fontSize + 2) })"
        >
          <i class="fas fa-plus"></i>
        </button>
        <div class="size-value">{{ currentStyle.fontSize }}px</div>
      </div>
    </div>
    
    <!-- 文字颜色选择 -->
    <div class="setting-group">
      <div class="setting-header">
        <i class="fas fa-palette"></i>
        <span>文字颜色</span>
      </div>
      <div class="color-grid">
        <div 
          v-for="color in textColors" 
          :key="color.value"
          :class="['color-option', { active: currentStyle.textColor === color.value }]"
          :style="{ backgroundColor: color.value }"
          @click="handleColorClick(color.value)"
        >
          <i 
            v-if="currentStyle.textColor === color.value" 
            class="fas fa-check" 
            :style="{ color: isLightColor(color.value) ? '#000' : '#fff' }"
          ></i>
        </div>
      </div>
    </div>
    
    <!-- 文字位置控制 -->
    <div class="setting-group">
      <div class="setting-header">
        <i class="fas fa-align-justify"></i>
        <span>文字对齐</span>
      </div>
      <div class="position-controls">
        <button 
          v-for="pos in textPositions" 
          :key="pos.id"
          :class="['position-btn', { active: currentStyle.textPosition === pos.id }]"
          @click="updateStyle({ textPosition: pos.id })"
          :title="getPositionLabel(pos.id)"
        >
          <i :class="pos.icon"></i>
        </button>
      </div>
    </div>
    
    <!-- 文字阴影开关 -->
    <div class="setting-group">
      <div class="setting-header">
        <i class="fas fa-moon"></i>
        <span>文字阴影</span>
      </div>
      <div class="switch-container">
        <div class="switch-control">
          <input 
            type="checkbox" 
            id="text-shadow-toggle" 
            v-model="currentStyle.textShadow"
            @change="updateStyle({ textShadow: currentStyle.textShadow })"
          />
          <label for="text-shadow-toggle"></label>
        </div>
        <span class="switch-label">{{ currentStyle.textShadow ? '开启' : '关闭' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, reactive } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  fontSizeConfig: {
    type: Object,
    default: () => ({
      MIN: 14,
      MAX: 36
    })
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// 文字位置选项
const textPositions = [
  { id: 'left', icon: 'fas fa-align-left' },
  { id: 'center', icon: 'fas fa-align-center' },
  { id: 'right', icon: 'fas fa-align-right' }
];

// 文字颜色选项
const textColors = [
  { value: '#000000', label: '黑色' },
  { value: '#FFFFFF', label: '白色' },
  { value: '#333333', label: '深灰' },
  { value: '#7B9E89', label: '主题绿' },
  { value: '#4A6FB5', label: '蓝色' },
  { value: '#B54A4A', label: '红色' }
];

// 字体选项
const fontFamilies = [
  { value: "'KaitiLocal', 'Kaiti', '楷体', 'STKaiti', '华文楷体', 'Noto Sans SC', sans-serif", label: '默认楷体' },
  { value: "'KaitiLocal', 'Kaiti', '楷体', 'STKaiti', '华文楷体'", label: '楷体' },
  { value: "'Noto Sans SC', 'PingFang SC', '微软雅黑', sans-serif", label: '黑体' },
  { value: "'Noto Serif SC', 'SimSun', '宋体', serif", label: '宋体' },
  { value: "'Dancing Script', cursive", label: '英文草书' },
  { value: "'Arial', sans-serif", label: '英文无衬线' },
  { value: "'Times New Roman', serif", label: '英文衬线' }
];

// 当前样式（响应式引用）
const currentStyle = reactive({ ...props.modelValue });

// 方法
function updateStyle(updates) {
  Object.assign(currentStyle, updates);
  emit('update:modelValue', {...currentStyle});
}

function isLightColor(color) {
  // 简单的颜色亮度检测
  // 将十六进制颜色转换为RGB
  let r, g, b;
  
  if (color.startsWith('#')) {
    // 处理十六进制颜色
    const hex = color.substring(1);
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else {
    // 默认为深色
    return false;
  }
  
  // 计算亮度 (基于人眼对不同颜色的感知)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // 亮度大于125被认为是浅色
  return brightness > 125;
}

function getPositionLabel(position) {
  switch (position) {
    case 'left':
      return '居左';
    case 'center':
      return '居中';
    case 'right':
      return '居右';
    default:
      return position;
  }
}

// 处理颜色点击
function handleColorClick(color) {
  // 确保颜色值有效
  if (color && color.trim() !== '') {
    updateStyle({ textColor: color });
  }
}
</script>

<style scoped>
/* 文字设置面板样式 */
.text-settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 2px rgba(173, 173, 173, 0.05);
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.setting-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: 14px;
}

.setting-header i {
  color: var(--primary-color);
  width: 16px;
  text-align: center;
  font-size: 14px;
}

/* 字体大小滑块样式 */
.slider-with-value {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.size-preset-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background-color: var(--card-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.size-preset-btn:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.slider-container {
  flex: 1;
  position: relative;
  height: 24px;
  display: flex;
  align-items: center;
}

.slider-container input[type="range"] {
  position: absolute;
  width: 100%;
  height: 4px;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.slider-fill {
  position: absolute;
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  transition: width 0.1s ease;
}

.size-value {
  min-width: 40px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  background-color: var(--card-bg);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

/* 字体选择样式 */
.font-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.font-option {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--card-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-option span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.font-option:hover {
  border-color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.05);
}

.font-option.active {
  border-color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.1);
  box-shadow: 0 0 0 1px var(--primary-color);
}

/* 颜色选择样式 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-xs);
  margin-top: 4px;
}

.color-option {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 30px;
  height: 30px;
  margin: 0 auto;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
}

.color-option.active {
  transform: scale(1.15);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(123, 158, 137, 0.2);
}

.color-option i {
  font-size: 14px;
  opacity: 0.9;
}

/* 位置控制样式 */
.position-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.position-btn {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.position-btn i {
  font-size: 16px;
}

.position-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 开关控制样式 */
.switch-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.switch-control {
  position: relative;
  width: 40px;
  height: 20px;
}

.switch-control input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-control label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.switch-control label:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.switch-control input:checked + label {
  background-color: var(--primary-color);
}

.switch-control input:checked + label:before {
  transform: translateX(20px);
}

.switch-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .control-group label {
    width: 60px;
    font-size: 12px;
  }
  
  .color-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .color-option {
    width: 28px;
    height: 28px;
  }
  
  .setting-header {
    font-size: 13px;
  }
  
  .setting-header i {
    font-size: 13px;
  }
  
  .position-btn {
    height: 28px;
  }
  
  .position-btn i {
    font-size: 13px;
  }
}
</style> 