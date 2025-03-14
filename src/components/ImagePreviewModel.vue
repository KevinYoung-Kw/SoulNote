<template>
  <div class="modal-container">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="image-preview-dialog">
      <div class="preview-header">
        <h3 class="preview-title">图片预览</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- 图片预览容器 -->
      <div class="image-container" ref="imageContainer">
        <div class="image-wrapper">
          <img 
            ref="previewImage" 
            :src="imageUrl" 
            alt="预览图片" 
            class="preview-image" 
          />
        </div>
        
        <!-- 导出格式选择 -->
        <div class="export-options">
          <div class="format-selector">
            <button 
              v-for="format in exportFormats" 
              :key="format.id"
              :class="['format-btn', { active: selectedFormat === format.id }]"
              @click="selectedFormat = format.id"
            >
              {{ format.label }}
            </button>
          </div>
          
          <div class="quality-selector" v-if="selectedFormat === 'jpg'">
            <label>质量:</label>
            <input 
              type="range" 
              min="0.5" 
              max="1" 
              step="0.1" 
              v-model.number="exportQuality" 
            />
            <span>{{ Math.round(exportQuality * 100) }}%</span>
          </div>
          
          <div class="transparent-bg" v-if="selectedFormat === 'png'">
            <label>
              <input type="checkbox" v-model="transparentBg" />
              透明背景
            </label>
          </div>
        </div>
        
        <div v-if="isWechat" class="wechat-tip">
          <i class="fas fa-hand-pointer"></i>
          <span>长按图片可保存至相册</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="action-btn" @click="tryDownload">
          <i class="fas fa-download"></i>
          <span>保存图片</span>
        </button>
        <button class="action-btn" @click="copyImage" v-if="supportClipboard">
          <i class="fas fa-copy"></i>
          <span>复制图片</span>
        </button>
        <button class="action-btn share-btn" @click="nativeShare" v-if="supportShare">
          <i class="fas fa-share-alt"></i>
          <span>系统分享</span>
        </button>
      </div>
      
      <!-- 返回自定义按钮 -->
      <div class="back-to-customize">
        <button class="btn-link" @click="backToCustomize">
          <i class="fas fa-arrow-left"></i>
          <span>返回自定义</span>
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
      transparentBg: false
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

// 导出格式选项
const exportFormats = [
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' }
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
    transparentBg: transparentBg.value
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
watch([selectedFormat, exportQuality, transparentBg], () => {
  // 通知父组件导出选项已更改
  emit('export', {
    format: selectedFormat.value,
    quality: exportQuality.value,
    transparentBg: transparentBg.value
  });
});

// 生命周期
onMounted(() => {
  // 初始化导出选项
  selectedFormat.value = props.exportOptions.format || 'png';
  exportQuality.value = props.exportOptions.quality || 0.9;
  transparentBg.value = props.exportOptions.transparentBg || false;
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
  max-width: 520px;
  background-color: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  animation: slideUp 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.preview-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

/* 图片容器样式 */
.image-container {
  position: relative;
  padding: 24px;
  text-align: center;
  background-color: #f9f9f9;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding: 8px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.preview-image {
  max-width: 100%;
  max-height: 50vh;
  border-radius: 6px;
  object-fit: contain;
}

/* 导出选项样式 */
.export-options {
  width: 100%;
  margin-top: 20px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.format-selector {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.format-btn {
  padding: 8px 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #f8f8f8;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-btn.active {
  background-color: var(--primary-color, #7B9E89);
  color: white;
  border-color: var(--primary-color, #7B9E89);
  box-shadow: 0 2px 8px rgba(123, 158, 137, 0.3);
}

.quality-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 8px;
}

.quality-selector label {
  width: 45px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.quality-selector input[type="range"] {
  flex: 1;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  -webkit-appearance: none;
}

.quality-selector input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--primary-color, #7B9E89);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.quality-selector span {
  width: 45px;
  font-size: 14px;
  text-align: right;
  color: #555;
  font-weight: 500;
}

.transparent-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.transparent-bg label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
  cursor: pointer;
}

.transparent-bg input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color, #7B9E89);
}

.wechat-tip {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: 8px;
  border-left: 3px solid var(--primary-color, #7B9E89);
}

.action-buttons {
  display: flex;
  padding: 20px 24px;
  gap: 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background-color: var(--primary-color, #7B9E89);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(123, 158, 137, 0.2);
}

.action-btn:hover {
  background-color: #6a8a77;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(123, 158, 137, 0.3);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(123, 158, 137, 0.2);
}

.share-btn {
  background-color: #4a6fb5;
  box-shadow: 0 4px 12px rgba(74, 111, 181, 0.2);
}

.share-btn:hover {
  background-color: #3a5a94;
  box-shadow: 0 6px 15px rgba(74, 111, 181, 0.3);
}

.share-btn:active {
  box-shadow: 0 2px 8px rgba(74, 111, 181, 0.2);
}

.back-to-customize {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  background-color: #fff;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-color, #7B9E89);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-link:hover {
  background-color: rgba(123, 158, 137, 0.1);
}

.save-tip-highlight {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 14px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: pulse 1.5s infinite;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.toast-message {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1100;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.toast-message.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@media (max-width: 480px) {
  .image-preview-dialog {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 16px;
  }
  
  .preview-header {
    padding: 16px 20px;
  }
  
  .image-container {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    padding: 16px 20px;
    gap: 12px;
  }
  
  .format-selector {
    gap: 10px;
  }
  
  .format-btn {
    padding: 6px 16px;
    font-size: 14px;
  }
  
  .export-options {
    padding: 14px;
  }
  
  .quality-selector {
    gap: 8px;
  }
}
</style>