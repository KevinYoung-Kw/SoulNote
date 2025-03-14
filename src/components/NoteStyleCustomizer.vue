<template>
  <div class="style-customizer-container">
    <div class="customizer-header">
      <h3>自定义样式</h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="tabs-container">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>
      
      <div class="tab-content">
        <!-- 布局选择标签页 -->
        <div v-if="activeTab === 'layout'" class="layout-tab">

          <div class="layout-options">
            <div 
              v-for="layout in layouts" 
              :key="layout.id"
              :class="[
                'layout-option', 
                { 
                  active: currentStyle.layout === layout.id,
                  disabled: layout.requiresImage && !currentStyle.imageUrl
                }
              ]"
              @click="layout.requiresImage && !currentStyle.imageUrl ? promptImageUpload(layout.id) : updateStyle({ layout: layout.id })"
            >
              <div class="layout-preview" :style="getLayoutPreviewStyle(layout)">
                <div class="layout-preview-inner">
                  <div v-if="layout.id === 'image-top'" class="layout-preview-image"></div>
                  <div v-if="layout.id === 'image-top' || layout.id === 'paper' || layout.id === 'image-bg'" class="layout-preview-text"></div>
                  <div v-if="layout.id === 'image-bottom'" class="layout-preview-text layout-preview-text-top"></div>
                  <div v-if="layout.id === 'image-bottom'" class="layout-preview-image"></div>
                </div>
              </div>
              <span>{{ layout.label }}</span>
              <small v-if="layout.id === 'paper' && currentStyle.imageUrl" class="layout-note">
                (将移除图片)
              </small>
              <small v-if="layout.requiresImage && !currentStyle.imageUrl" class="layout-note">
                (需要上传图片)
              </small>
            </div>
          </div>
          
          <div class="layout-info" v-if="currentStyle.imageUrl">
            <i class="fas fa-info-circle"></i>
            <span>选择"纸条"布局将移除已上传的图片</span>
          </div>
        </div>
        
        <!-- 图片设置标签页 -->
        <div v-if="activeTab === 'image'" class="image-tab">
          
          <div v-if="!currentStyle.imageUrl" class="image-upload-area">
            <ImageUploader @image-selected="handleImageSelected" />
          </div>
          
          <div v-else class="image-settings">

            
            <div class="image-controls">
              <div class="control-group">
                <label>透明度</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  v-model.number="currentStyle.imageOpacity" 
                  @input="updateStyle({ imageOpacity: currentStyle.imageOpacity })"
                />
                <span>{{ Math.round(currentStyle.imageOpacity * 100) }}%</span>
              </div>
              
              <div class="control-group">
                <label>缩放</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  v-model.number="currentStyle.imageScale" 
                  @input="updateStyle({ imageScale: currentStyle.imageScale })"
                />
                <span>{{ Math.round(currentStyle.imageScale * 100) }}%</span>
              </div>
            </div>

            <div class="image-preview">
              <img :src="currentStyle.imageUrl" alt="已上传图片" />
              <button class="remove-image-btn" @click="removeImage">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 文字设置标签页 -->
        <div v-if="activeTab === 'text'" class="text-tab">
        
          
          <div class="text-settings-panel">
            <!-- 字体大小控制 -->
            <div class="setting-group">
              <div class="setting-header">
                <i class="fas fa-text-height"></i>
                <span>字体大小</span>
              </div>
              <div class="slider-with-value">
                <button 
                  class="size-preset-btn" 
                  @click="updateStyle({ fontSize: Math.max(14, currentStyle.fontSize - 2) })"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <div class="slider-container">
                  <input 
                    type="range" 
                    min="14" 
                    max="36" 
                    step="1" 
                    v-model.number="currentStyle.fontSize" 
                    @input="updateStyle({ fontSize: currentStyle.fontSize })"
                  />
                  <div class="slider-track">
                    <div class="slider-fill" :style="{ width: `${(currentStyle.fontSize - 14) / 22 * 100}%` }"></div>
                  </div>
                </div>
                <button 
                  class="size-preset-btn" 
                  @click="updateStyle({ fontSize: Math.min(36, currentStyle.fontSize + 2) })"
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
            
            <!-- 表情气泡开关 -->
            <div class="setting-group" v-if="noteMood && noteMood.trim() !== ''">
              <div class="setting-header">
                <i class="fas fa-smile"></i>
                <span>表情气泡</span>
              </div>
              <div class="switch-container">
                <div class="switch-control">
                  <input 
                    type="checkbox" 
                    id="emoji-bubble-toggle" 
                    v-model="currentStyle.showEmojiBubble"
                    @change="updateStyle({ showEmojiBubble: currentStyle.showEmojiBubble })"
                  />
                  <label for="emoji-bubble-toggle"></label>
                </div>
                <span class="switch-label">{{ currentStyle.showEmojiBubble !== false ? '显示' : '隐藏' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="preview-toggle">
      <button @click="togglePreview" class="toggle-btn">
        <i :class="showPreview ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        <span>{{ showPreview ? '隐藏预览' : '显示预览' }}</span>
      </button>
    </div>
    
    <div class="preview-area" v-if="showPreview">
      <div class="preview-wrapper">
        <div class="preview-scale-container" ref="previewContainer">
          <NoteCard 
            :content="noteContent"
            :mood="noteMood"
            :custom-style="currentStyle"
            ref="noteCardRef"
          />
        </div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="btn btn-secondary" @click="resetStyle">
        <i class="fas fa-undo"></i>
        <span>重置</span>
      </button>
      <button class="btn btn-primary" @click="$emit('close')" v-if="!showPreview">
        <i class="fas fa-check"></i>
        <span>保存设置</span>
      </button>
      <button class="btn btn-success" @click="saveAsImage" v-if="showPreview">
        <i class="fas fa-image"></i>
        <span>保存图片</span>
      </button>
    </div>
  </div>
  
  <!-- 图片预览模态框 -->
  <ImagePreviewModel
    v-if="showImagePreview"
    :image-url="capturedImageUrl"
    :export-options="exportOptions"
    :on-download="handleDownload"
    :on-share="handleShare"
    @close="showImagePreview = false"
    @customize="showImagePreview = false"
    @export="handleExportOptions"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import NoteCard from './NoteCard.vue';
import ImageUploader from './ImageUploader.vue';
import ImagePreviewModel from './ImagePreviewModel.vue';
import html2canvas from 'html2canvas';

// Props
const props = defineProps({
  noteContent: {
    type: String,
    default: '在无限宇宙中，你是独一无二的星光。今天的每一步，都是内心力量的证明。'
  },
  noteMood: {
    type: String,
    default: ''
  },
  initialStyle: {
    type: Object,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['close', 'update:style', 'export']);

// 标签页
const activeTab = ref('layout');
const tabs = [
  { id: 'layout', label: '布局', icon: 'fas fa-th-large' },
  { id: 'image', label: '图片', icon: 'fas fa-image' },
  { id: 'text', label: '文字', icon: 'fas fa-font' }
];

// 布局选项
const layouts = [
  { id: 'paper', label: '纸条', preview: 'paper-bg.jpg' },
  { id: 'image-top', label: '上图下文', preview: 'image-top.jpg', requiresImage: true },
  { id: 'image-bottom', label: '下图上文', preview: 'image-bottom.jpg', requiresImage: true },
  { id: 'image-bg', label: '图片背景', preview: 'image-bg.jpg', requiresImage: true }
];

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

// 默认样式
const defaultStyle = {
  layout: 'paper',
  background: 'paper-1',
  fontSize: 24,
  textColor: '#000000',
  textShadow: false,
  textPosition: 'center',
  imageUrl: '',
  imageOpacity: 1,
  imageScale: 1,
  showQrcode: true,  // 二维码始终显示
  qrcodeSize: 60,
  qrcodePosition: 'bottom-left',
  slogan: '星语心笺',  // 固定的slogan
  showEmojiBubble: true, // 默认显示表情气泡
  exportFormat: 'png',
  transparentBg: false,
  exportQuality: 0.9
};

// 当前样式
const currentStyle = ref({ ...defaultStyle });

// 预览控制
const showPreview = ref(false);
const previewContainer = ref(null);
const noteCardRef = ref(null);

// 图片预览相关
const showImagePreview = ref(false);
const capturedImageUrl = ref('');
const exportOptions = ref({
  format: 'png',
  quality: 0.9,
  transparentBg: false
});

// 方法
function updateStyle(updates) {
  // 确保二维码始终显示
  if (updates.hasOwnProperty('showQrcode')) {
    updates.showQrcode = true;
  }
  
  // 确保slogan固定
  if (updates.hasOwnProperty('slogan')) {
    updates.slogan = '星语心笺';
  }
  
  // 如果选择了纸条布局，清除图片URL
  if (updates.layout === 'paper') {
    updates.imageUrl = '';
  }
  
  // 确保文本颜色有效
  if (updates.hasOwnProperty('textColor') && (!updates.textColor || updates.textColor.trim() === '')) {
    updates.textColor = defaultStyle.textColor;
  }
  
  // 处理表情气泡显示状态
  if (updates.hasOwnProperty('showEmojiBubble')) {
    console.log('更新表情气泡显示状态:', updates.showEmojiBubble);
  }
  
  currentStyle.value = { ...currentStyle.value, ...updates };
  emit('update:style', currentStyle.value);
}

function resetStyle() {
  currentStyle.value = { ...defaultStyle };
  emit('update:style', currentStyle.value);
}

function handleImageSelected(imageUrl) {
  // 如果当前是纸条布局，直接切换到上图下文布局
  if (currentStyle.value.layout === 'paper') {
    // 更新图片和布局
    updateStyle({ 
      imageUrl, 
      layout: 'image-top' // 默认使用上图下文布局
    });
    
    // 切换到布局标签页让用户看到效果
    activeTab.value = 'layout';
  } else {
    // 如果已经是图片布局，直接更新图片
    updateStyle({ imageUrl });
  }
}

function removeImage() {
  // 移除图片时，自动切换到纸条布局
  updateStyle({ 
    imageUrl: '',
    layout: 'paper'
  });
}

function getLayoutPreviewStyle(layout) {
  // 为布局选项提供直观的预览样式
  const baseStyles = {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    overflow: 'hidden'
  };
  
  if (layout.id === 'paper') {
    return {
      ...baseStyles,
      background: 'linear-gradient(to right bottom, #FFFFFF, #F9F3E5)'
    };
  } else if (layout.id === 'image-top') {
    return {
      ...baseStyles,
      background: '#FFFFFF'
    };
  } else if (layout.id === 'image-bottom') {
    return {
      ...baseStyles,
      background: '#FFFFFF'
    };
  } else if (layout.id === 'image-bg') {
    return {
      ...baseStyles,
      background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), linear-gradient(45deg, #4A6FB5, #7B9E89)'
    };
  }
  
  return baseStyles;
}

function togglePreview() {
  showPreview.value = !showPreview.value;
}

function exportNote() {
  // 确保导出前更新样式
  emit('update:style', currentStyle.value);
  
  // 触发导出事件，传递当前样式
  emit('export', { ...currentStyle.value });
  
  // 显示保存成功提示
  showToast('样式设置已保存');
}

// 保存为图片
async function saveAsImage() {
  if (!showPreview.value || !noteCardRef.value) {
    showToast('请先显示预览');
    return;
  }
  
  try {
    // 显示加载提示
    showToast('正在生成图片...');
    
    // 等待下一个渲染周期，确保DOM已更新
    await nextTick();
    
    // 使用html2canvas捕获预览内容
    const noteCardElement = noteCardRef.value.$el;
    const canvas = await html2canvas(noteCardElement, {
      useCORS: true, // 允许跨域图片
      scale: 2, // 提高图片质量
      backgroundColor: null, // 透明背景
      logging: false // 关闭日志
    });
    
    // 将canvas转换为图片URL
    capturedImageUrl.value = canvas.toDataURL('image/png');
    
    // 显示图片预览模态框
    showImagePreview.value = true;
  } catch (error) {
    console.error('生成图片失败:', error);
    showToast('生成图片失败，请重试');
  }
}

// 处理导出选项变更
function handleExportOptions(options) {
  exportOptions.value = options;
}

// 下载图片
async function handleDownload(imageUrl, options) {
  try {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `星语心笺_${new Date().getTime()}.${options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示成功提示
    showToast('图片已保存');
    return true;
  } catch (error) {
    console.error('下载图片失败:', error);
    return Promise.reject(error);
  }
}

// 分享图片
async function handleShare(imageUrl) {
  try {
    // 获取图片Blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // 使用Web Share API分享
    if (navigator.share) {
      await navigator.share({
        title: '星语心笺',
        text: '我的心情笔记',
        files: [new File([blob], `星语心笺_${new Date().getTime()}.${exportOptions.value.format}`, { type: blob.type })]
      });
      showToast('分享成功');
    } else {
      // 如果不支持Web Share API，尝试复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        showToast('图片已复制到剪贴板');
      } else {
        showToast('您的浏览器不支持分享功能');
      }
    }
  } catch (error) {
    console.error('分享图片失败:', error);
    showToast('分享失败，请重试');
  }
}

// 显示提示消息
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

function promptImageUpload(layoutId) {
  // 切换到图片标签页
  activeTab.value = 'image';
  
  // 显示提示信息
  alert('请先上传图片以使用此布局');
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

// 获取位置图标
function getPositionIcon(position) {
  const pos = textPositions.find(p => p.id === position);
  return pos ? pos.icon : 'fas fa-align-center';
}

// 监听初始样式变化
watch(() => props.initialStyle, (newStyle) => {
  if (newStyle && Object.keys(newStyle).length > 0) {
    // 合并默认样式和初始样式，确保所有必要的属性都存在
    currentStyle.value = { 
      ...defaultStyle, 
      ...newStyle,
      showQrcode: true,  // 确保二维码始终显示
      slogan: '星语心笺'  // 确保slogan固定
    };
  }
}, { deep: true, immediate: true });

// 生命周期
onMounted(() => {
  // 初始化样式
  if (Object.keys(props.initialStyle).length > 0) {
    currentStyle.value = { 
      ...defaultStyle, 
      ...props.initialStyle,
      showQrcode: true,
      slogan: '星语心笺'
    };
  }
  
  // 如果有图片URL但布局是纸条，自动切换到图片背景布局
  if (currentStyle.value.imageUrl && currentStyle.value.layout === 'paper') {
    currentStyle.value.layout = 'image-bg';
  }
});

// 处理颜色点击
function handleColorClick(color) {
  // 确保颜色值有效
  if (color && color.trim() !== '') {
    updateStyle({ textColor: color });
  }
}
</script>

<style scoped>
.style-customizer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.customizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.customizer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
}

.tabs-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn i {
  font-size: 16px;
  margin-bottom: var(--spacing-xs);
}

.tab-btn span {
  font-size: 12px;
}

.tab-btn.active {
  color: var(--primary-color);
  background-color: var(--card-bg);
  border-bottom: 2px solid var(--primary-color);
}

.tab-content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.tab-content h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: 16px;
  font-weight: 500;
}

/* 布局选项样式 */
.layout-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.layout-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.layout-option.disabled .layout-preview {
  border-color: var(--border-color);
  position: relative;
}

.layout-option.disabled .layout-preview::after {
  content: "\f070";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: rgba(0, 0, 0, 0.5);
}

.layout-preview {
  width: 80px;
  height: 100px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-color);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.layout-preview-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-preview-image {
  background-color: #4A6FB5;
  height: 50%;
  flex-shrink: 0;
}

.layout-preview-text {
  background-color: rgba(0, 0, 0, 0.1);
  height: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.layout-preview-text::before {
  content: "";
  width: 70%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.2);
  margin-bottom: 4px;
}

.layout-preview-text::after {
  content: "";
  width: 50%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.2);
}

.layout-preview-text-top {
  border-bottom: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.layout-preview-text-top::before {
  margin-bottom: 2px;
}

.layout-option.active .layout-preview {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.layout-option span {
  font-size: 12px;
  color: var(--text-secondary);
}

.layout-option.active span {
  color: var(--primary-color);
  font-weight: 500;
}

.layout-note {
  font-size: 10px;
  color: #B54A4A;
  margin-top: 2px;
}

.layout-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-secondary);
}

.layout-info i {
  color: var(--primary-color);
}

/* 图片上传和设置样式 */
.image-upload-area {
  margin-bottom: var(--spacing-md);
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.image-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.image-preview {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.image-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* 控制组样式 */
.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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

/* 颜色选项样式 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-sm);
  margin-top: 8px;
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
  width: 40px;
  height: 40px;
  margin: 0 auto;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.color-option.active {
  transform: scale(1.15);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(123, 158, 137, 0.3);
}

.color-option i {
  font-size: 16px;
  opacity: 0.9;
}

/* 开关控制样式 */
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

/* 预览区域样式 */
.preview-toggle {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.preview-area {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  max-height: 600px;
  overflow: auto;
  margin-bottom: var(--spacing-md);
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.preview-scale-container {
  transform: scale(1.0);
  transform-origin: top center;
  width: 100%;
  max-width: 400px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  gap: var(--spacing-sm);
}

.action-buttons .btn {
  flex: 1;
  justify-content: center;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--bg-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--border-color);
}

.btn-success {
  background-color: #4CAF50;
  color: white;
}

.btn-success:hover {
  background-color: #45a049;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .layout-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .layout-preview {
    width: 60px;
    height: 75px;
  }
  
  .control-group label {
    width: 60px;
    font-size: 12px;
  }
  
  .tab-btn i {
    font-size: 14px;
  }
  
  .tab-btn span {
    font-size: 10px;
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
  
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .action-buttons .btn {
    margin-bottom: var(--spacing-sm);
  }
}

/* 文字设置面板样式 - 全新设计 */
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

/* 颜色选择网格 */
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
  gap: var(--spacing-xs);
}

.position-btn {
  flex: 1;
  height: 30px;
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
  font-size: 14px;
}

.position-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 开关样式 */
.switch-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.switch-control {
  position: relative;
  width: 36px;
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
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.switch-control input:checked + label {
  background-color: var(--primary-color);
}

.switch-control input:checked + label:before {
  transform: translateX(16px);
}

.switch-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 添加toast消息样式 */
.toast-message {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1100;
}

.toast-message.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
</style> 