<template>
  <div 
    class="image-uploader"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="{ 'dragging': isDragging }"
    @click.stop="handleContainerClick"
  >
    <input 
      type="file" 
      ref="fileInput" 
      accept="image/*" 
      @change="handleFileChange" 
      class="file-input"
    />
    
    <div class="upload-content" @click.stop>
      <i class="fas fa-cloud-upload-alt"></i>
      <p>点击或拖拽图片到此处上传</p>
      <button class="upload-btn" @click.stop="triggerFileInput">
        选择图片
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Refs
const fileInput = ref(null);
const isDragging = ref(false);

// Emits
const emit = defineEmits(['image-selected']);

// Methods
function handleContainerClick() {
  triggerFileInput();
}

function handleDragOver(event) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave(event) {
  event.preventDefault();
  isDragging.value = false;
}

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
}

function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    processFile(file);
  }
}

function processFile(file) {
  // 检查文件大小，限制为5MB
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const imageUrl = e.target.result;
    
    // 检查图片尺寸并进行压缩
    const img = new Image();
    img.onload = () => {
      // 如果图片尺寸过大，进行压缩
      if (img.width > 1200 || img.height > 1200) {
        const compressedUrl = compressImage(img, file.type);
        emit('image-selected', compressedUrl);
      } else {
        emit('image-selected', imageUrl);
      }
    };
    img.src = imageUrl;
  };
  reader.readAsDataURL(file);
}

function compressImage(img, mimeType) {
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;
  
  // 计算缩放比例
  const maxSize = 1200;
  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  
  // 根据mime类型确定压缩质量
  const quality = mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 0.8 : 0.9;
  
  return canvas.toDataURL(mimeType, quality);
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
  height: 150px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.image-uploader:hover {
  border-color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.05);
}

.image-uploader.dragging {
  border-color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.1);
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-md);
}

.upload-content i {
  font-size: 28px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.upload-content p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.upload-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  z-index: 5;
  pointer-events: auto;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.upload-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.upload-btn:active {
  transform: translateY(1px);
  box-shadow: none;
}

@media (max-width: 480px) {
  .image-uploader {
    height: 150px;
  }
  
  .upload-content i {
    font-size: 28px;
  }
  
  .upload-content p {
    font-size: 12px;
  }
}
</style> 