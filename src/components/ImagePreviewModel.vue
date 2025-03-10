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
      
      <!-- Simplified container with direct image display -->
      <div class="image-container" ref="imageContainer">
        <div class="image-wrapper">
          <img 
            ref="previewImage" 
            :src="imageUrl" 
            alt="预览图片" 
            class="preview-image" 
          />
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImagePreviewModel',
  props: {
    imageUrl: {
      type: String,
      required: true
    },
    onDownload: {
      type: Function,
      default: null
    },
    onThemeChange: {
      type: Function,
      required: true
    },
    onShare: {
      type: Function,
      default: null
    }
  },
  emits: ['close', 'theme-change'],
  data() {
    return {
      // Simplified data structure - remove theme/background complexity
      isWechat: this.checkWechat(),
      supportClipboard: 'clipboard' in navigator && 'write' in navigator.clipboard,
      supportShare: 'share' in navigator
    };
  },
  methods: {
    checkWechat() {
      const ua = navigator.userAgent.toLowerCase();
      return ua.indexOf('micromessenger') !== -1;
    },
    async tryDownload() {
      if (this.onDownload) {
        try {
          await this.onDownload(this.imageUrl);
        } catch (error) {
          if (this.isWechat) {
            this.showSaveTip();
          } else {
            alert('保存失败，请尝试长按图片保存');
          }
        }
      }
    },
    async copyImage() {
      try {
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        this.showToast('图片已复制到剪贴板');
      } catch (err) {
        console.error('复制图片失败:', err);
        this.showToast('复制失败，此功能可能不被您的浏览器支持');
      }
    },
    nativeShare() {
      if (this.onShare) {
        this.onShare(this.imageUrl);
      }
    },
    showSaveTip() {
      const tipEl = document.createElement('div');
      tipEl.className = 'save-tip-highlight';
      tipEl.innerHTML = '<i class="fas fa-arrows-alt"></i> 请长按图片保存';
      
      this.$refs.imageContainer.appendChild(tipEl);
      
      setTimeout(() => {
        if (tipEl.parentNode) {
          tipEl.parentNode.removeChild(tipEl);
        }
      }, 3000);
    },
    showToast(message) {
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
  }
}
</script>

function closeImagePreview() {
  showImagePreview.value = false;
  previewImageUrl.value = '';
}

// Make sure to handle these methods properly
function handleThemeChange(theme) {
  // Implementation for theme changes
}

function handleSystemShare(imageUrl) {
  if (onShare) {
    onShare(imageUrl);
  }
}

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
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.image-preview-dialog {
  position: relative;
  width: 90%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  z-index: 1001;
  animation: slideUp 0.3s ease;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eaeaea;
}

.preview-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

/* Simplified image container with reliable centering */
.image-container {
  position: relative;
  padding: 20px;
  text-align: center;
  background-color: #f8f8f8;
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
}

.preview-image {
  max-width: 100%;
  max-height: 50vh;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  object-fit: contain;
}

.wechat-tip {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  padding: 16px;
  gap: 12px;
  border-top: 1px solid #eaeaea;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: #7B9E89;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: #658a75;
}

.share-btn {
  background-color: #4a6fb5;
}

.share-btn:hover {
  background-color: #3a5a94;
}

.save-tip-highlight {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pulse 1.5s infinite;
  z-index: 10;
}

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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .image-preview-dialog {
    width: 95%;
    max-height: 85vh;
    overflow-y: auto;
  }
}
</style>