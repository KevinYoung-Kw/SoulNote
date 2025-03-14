<template>
  <div class="modal-container">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="image-preview-dialog">
      <div class="preview-header">
        <h3 class="preview-title">导出预览</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="preview-content">
        <!-- 左侧预览区域 -->
        <div class="preview-section">
          <div class="image-container" ref="imageContainer">
            <div class="image-wrapper">
              <img 
                ref="previewImage" 
                :src="imageUrl" 
                alt="预览图片" 
                class="preview-image" 
              />
            </div>
          </div>
        </div>

        <!-- 右侧设置区域 -->
        <div class="settings-section">
          <!-- 导出格式选择 -->
          <div class="setting-group">
            <label class="setting-label">
              <i class="fas fa-file-image"></i>
              导出格式
            </label>
            <div class="format-buttons">
              <button 
                v-for="format in exportFormats" 
                :key="format.id"
                :class="['format-btn', { active: selectedFormat === format.id }]"
                @click="selectedFormat = format.id"
              >
                {{ format.label }}
              </button>
            </div>
          </div>

          <!-- 图片质量选择 -->
          <div class="setting-group" v-if="selectedFormat === 'jpg'">
            <label class="setting-label">
              <i class="fas fa-star-half-alt"></i>
              图片质量
            </label>
            <select v-model="exportQuality" class="quality-select">
              <option value="1">最佳 (100%)</option>
              <option value="0.9">优质 (90%)</option>
              <option value="0.8">良好 (80%)</option>
              <option value="0.6">普通 (60%)</option>
            </select>
          </div>

          <!-- 分辨率选择 -->
          <div class="setting-group">
            <label class="setting-label">
              <i class="fas fa-expand-arrows-alt"></i>
              分辨率
            </label>
            <select v-model="selectedSize" class="size-select">
              <option v-for="size in pixelSizes" :key="size.value" :value="size.value">
                {{ size.label }} ({{ size.value }}倍)
              </option>
            </select>
          </div>

          <!-- 透明背景选项 -->
          <div class="setting-group" v-if="selectedFormat === 'png'">
            <label class="setting-label">
              <i class="fas fa-chess-board"></i>
              背景设置
            </label>
            <div class="switch-control">
              <input 
                type="checkbox" 
                id="transparent-bg" 
                v-model="transparentBg"
              />
              <label for="transparent-bg"></label>
              <span>透明背景</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="action-buttons">
        <button class="btn-secondary" @click="$emit('customize')">
          <i class="fas fa-arrow-left"></i>
          <span>返回编辑</span>
        </button>
        <button class="btn-primary" @click="copyImage" v-if="supportClipboard">
          <i class="fas fa-copy"></i>
          <span>复制图片</span>
        </button>
        <button class="btn-primary" @click="tryDownload">
          <i class="fas fa-download"></i>
          <span>保存图片</span>
        </button>
        <button class="btn-share" @click="nativeShare" v-if="supportShare">
          <i class="fas fa-share-alt"></i>
          <span>分享</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// Props
const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  onDownload: {
    type: Function,
    default: null
  },
  onShare: {
    type: Function,
    default: null
  },
  exportOptions: {
    type: Object,
    default: () => ({
      format: 'png',
      quality: 0.9,
      transparentBg: false,
      pixelSize: 1
    })
  }
});

// Emits
const emit = defineEmits(['close', 'customize', 'export']);

// Refs
const imageContainer = ref(null);
const previewImage = ref(null);

// State
const isWechat = ref(checkWechat());
const supportClipboard = ref('clipboard' in navigator && 'write' in navigator.clipboard);
const supportShare = ref('share' in navigator);
const selectedFormat = ref(props.exportOptions.format || 'png');
const exportQuality = ref(props.exportOptions.quality || 0.9);
const transparentBg = ref(props.exportOptions.transparentBg || false);
const selectedSize = ref(props.exportOptions.pixelSize || 1);

// 导出格式选项
const exportFormats = [
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' }
];

// 像素尺寸选项
const pixelSizes = [
  { value: 4, label: '4x' },
  { value: 6, label: '6x' },
  { value: 8, label: '8x' },
  { value: 12, label: '12x' },
  { value: 16, label: '16x' }
];

// Methods
function checkWechat() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
}

async function tryDownload() {
  // 根据当前选择的格式和选项导出
  const exportOptions = {
    format: selectedFormat.value,
    quality: exportQuality.value,
    transparentBg: transparentBg.value,
    pixelSize: selectedSize.value,
    useWhiteBackground: true // 始终使用白色背景，即使是透明PNG
  };
  
  emit('export', exportOptions);
  
  if (props.onDownload) {
    try {
      await props.onDownload(props.imageUrl, exportOptions);
    } catch (error) {
      if (isWechat.value) {
        showSaveTip();
      } else {
        alert('保存失败，请尝试长按图片保存');
      }
    }
  }
}

async function copyImage() {
  try {
    const response = await fetch(props.imageUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    showToast('图片已复制到剪贴板');
  } catch (err) {
    console.error('复制图片失败:', err);
    showToast('复制失败，此功能可能不被您的浏览器支持');
  }
}

function nativeShare() {
  if (props.onShare) {
    props.onShare(props.imageUrl);
  }
}

function showSaveTip() {
  const tipEl = document.createElement('div');
  tipEl.className = 'save-tip-highlight';
  tipEl.innerHTML = '<i class="fas fa-arrows-alt"></i> 请长按图片保存';
  
  imageContainer.value.appendChild(tipEl);
  
  setTimeout(() => {
    if (tipEl.parentNode) {
      tipEl.parentNode.removeChild(tipEl);
    }
  }, 3000);
}

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

function backToCustomize() {
  emit('customize');
}

// 监听导出选项变化
watch([selectedFormat, exportQuality, transparentBg, selectedSize], () => {
  // 通知父组件导出选项已更改
  emit('export', {
    format: selectedFormat.value,
    quality: exportQuality.value,
    transparentBg: transparentBg.value,
    pixelSize: selectedSize.value
  });
});

// 生命周期
onMounted(() => {
  // 初始化导出选项
  selectedFormat.value = props.exportOptions.format || 'png';
  exportQuality.value = props.exportOptions.quality || 0.9;
  transparentBg.value = props.exportOptions.transparentBg || false;
  selectedSize.value = props.exportOptions.pixelSize || 1;
});
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}

.image-preview-dialog {
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  animation: slideUp 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.preview-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-content {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

.preview-content::-webkit-scrollbar {
  width: 8px;
}

.preview-content::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 4px;
}

.preview-content::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 4px;
  border: 2px solid var(--scrollbar-track);
}

.preview-section {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.image-wrapper {
  width: 100%;
  padding: var(--spacing-sm);
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.settings-section {
  width: 240px;
  flex-shrink: 0;
  padding: var(--spacing-sm);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.setting-group {
  margin-bottom: var(--spacing-sm);
}

.setting-label {
  font-size: 14px;
  margin-bottom: var(--spacing-xs);
}

.format-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.format-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 13px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-color);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.format-btn:hover {
  background-color: var(--hover-color);
}

.format-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.quality-select,
.size-select {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 13px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-color);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.quality-select:hover,
.size-select:hover {
  border-color: var(--primary-color);
}

.quality-select:focus,
.size-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-alpha);
}

.switch-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.switch-control input {
  display: none;
}

.switch-control label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.switch-control label:before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-control input:checked + label {
  background-color: var(--primary-color);
}

.switch-control input:checked + label:before {
  transform: translateX(20px);
}

.switch-control span {
  font-size: 14px;
  color: var(--text-secondary);
}

.action-buttons {
  padding: var(--spacing-sm) var(--spacing-md);
  gap: var(--spacing-xs);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-color);
  display: flex;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-share {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 13px;
  border-radius: var(--radius-md);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 32px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--bg-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--hover-color);
  border-color: var(--border-color-dark);
  transform: translateY(-1px);
}

.btn-share {
  background-color: var(--info-color, #4a6fb5);
  color: white;
  border: none;
}

.btn-share:hover {
  background-color: var(--info-color-dark, #3a5a94);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .image-preview-dialog {
    width: 95%;
    height: 95vh;
  }

  .preview-content {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .image-container {
    max-width: 100%;
  }
  
  .settings-section {
    width: 100%;
  }
  
  .action-buttons {
    padding: var(--spacing-sm);
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-share {
    flex: 1 0 calc(50% - var(--spacing-xs));
  }
}

@media (max-width: 480px) {
  .image-preview-dialog {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .preview-content {
    padding: var(--spacing-sm);
  }
  
  .image-wrapper {
    padding: var(--spacing-xs);
  }
  
  .settings-section {
    padding: var(--spacing-xs);
  }
  
  .action-buttons {
    padding: var(--spacing-xs);
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-share {
    flex: 1 0 100%;
    margin-bottom: var(--spacing-xs);
  }

  /* 在小屏幕下最后一个按钮不需要底部间距 */
  .btn-primary:last-child,
  .btn-secondary:last-child,
  .btn-share:last-child {
    margin-bottom: 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(40px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast 消息样式优化 */
.toast-message {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background-color: var(--toast-bg, rgba(0, 0, 0, 0.85));
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transition: all var(--transition-fast);
  z-index: 1100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-message.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* 保存提示样式优化 */
.save-tip-highlight {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--toast-bg, rgba(0, 0, 0, 0.85));
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>