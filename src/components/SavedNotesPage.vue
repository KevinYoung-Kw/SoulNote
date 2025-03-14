<template>
  <div class="saved-notes-page fixed-page-layout">
    <!-- 保留现有的头部和内容区域代码 -->
    
    <!-- 查看笔记弹窗 -->
    <div class="note-detail-modal" v-if="showNoteDetail" @click="showNoteDetail = false">
      <div class="note-detail-content" @click.stop>
        <div class="note-detail-header">
          <button class="icon-btn" @click="showNoteDetail = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="note-detail-body">
          <NoteCard
            :content="currentNote.content"
            :background="currentNote.background"
            :fontSize="currentNote.fontSize"
            :custom-style="currentNote.customStyle || {}"
            ref="detailNoteRef"
          />
        </div>
        
        <div class="note-detail-footer">
          <button class="icon-btn action-btn" @click="deleteCurrentNote">
            <i class="fas fa-trash"></i>
          </button>
          <button class="icon-btn action-btn" @click="customizeCurrentNote">
            <i class="fas fa-palette"></i>
          </button>
          <button class="icon-btn action-btn" @click="shareCurrentNote">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 样式定制器弹窗 -->
    <div class="style-customizer-modal" v-if="showStyleCustomizer">
      <div class="modal-overlay" @click="showStyleCustomizer = false"></div>
      <div class="modal-content">
        <NoteStyleCustomizer 
          :note-content="currentNote?.content || ''"
          :note-mood="currentNote?.mood || ''"
          :initial-style="currentNote?.customStyle || {}"
          @close="showStyleCustomizer = false"
          @update:style="updateNoteStyle"
          @export="handleExport"
        />
      </div>
    </div>
    
    <!-- 图片预览弹窗 -->
    <ImagePreviewModel
      v-if="showImagePreview"
      :image-url="previewImageUrl"
      :on-download="handleDownload"
      :on-share="handleShare"
      :export-options="exportOptions"
      @close="closeImagePreview"
      @customize="showStyleCustomizer = true; showImagePreview = false"
      @export="updateExportOptions"
    />
    
    <!-- 保留现有的操作菜单代码 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NoteCard from '../components/NoteCard.vue';
import NoteStyleCustomizer from '../components/NoteStyleCustomizer.vue';
import ImagePreviewModel from '../components/ImagePreviewModel.vue';
import { getSavedNotes, deleteNote, clearSavedNotes, updateSavedNote } from '../services/storageService';
import { useNoteExport } from '../composables/useNoteExport';
import { generateNote } from '../services/aiService.js';

const router = useRouter();
const savedNotes = ref([]);
const showNoteDetail = ref(false);
const showActionMenu = ref(false);
const showStyleCustomizer = ref(false);
const showImagePreview = ref(false);
const currentNote = ref(null);
const detailNoteRef = ref(null);
const previewImageUrl = ref('');
const exportOptions = ref({
  format: 'png',
  quality: 0.9,
  transparentBg: false
});

const { exportAsImage, saveToDevice, shareImage } = useNoteExport();

// 获取收藏的笔记
async function loadSavedNotes() {
  try {
    savedNotes.value = await getSavedNotes();
  } catch (error) {
    console.error('加载收藏笔记失败:', error);
    savedNotes.value = [];
  }
}

// 查看笔记详情
function viewNote(note) {
  currentNote.value = note;
  showNoteDetail.value = true;
}

// 删除当前笔记
async function deleteCurrentNote() {
  if (!currentNote.value) return;
  
  if (confirm('确定要删除这条心语吗？')) {
    try {
      const success = await deleteNote(currentNote.value.id);
      if (success) {
        await loadSavedNotes();
        showNoteDetail.value = false;
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除笔记失败:', error);
      alert('删除失败，请重试');
    }
  }
}

// 自定义当前笔记样式
function customizeCurrentNote() {
  showStyleCustomizer.value = true;
}

// 更新笔记样式
async function updateNoteStyle(newStyle) {
  if (!currentNote.value) return;
  
  try {
    const updatedNote = {
      ...currentNote.value,
      customStyle: newStyle
    };
    
    const success = await updateSavedNote(updatedNote);
    if (success) {
      currentNote.value = updatedNote;
      await loadSavedNotes();
    } else {
      alert('更新样式失败，请重试');
    }
  } catch (error) {
    console.error('更新笔记样式失败:', error);
    alert('更新样式失败，请重试');
  }
}

// 处理导出
async function handleExport(style) {
  if (!detailNoteRef.value) return;
  
  try {
    // 应用样式
    if (style) {
      await updateNoteStyle(style);
    }
    
    // 导出图片
    const imageUrl = await exportAsImage(detailNoteRef.value.$el);
    if (imageUrl) {
      previewImageUrl.value = imageUrl;
      showImagePreview.value = true;
      showStyleCustomizer.value = false;
    }
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出图片失败，请重试');
  }
}

// 处理下载
async function handleDownload(imageUrl, options) {
  try {
    // 如果有像素大小选项，重新生成图片
    if (detailNoteRef.value && options?.pixelSize) {
      // 重新导出图片，应用新的导出选项
      const newImageUrl = await exportAsImage(detailNoteRef.value.$el, {
        format: options.format || 'png',
        quality: options.quality || 0.9,
        transparentBg: options.transparentBg || false,
        pixelSize: options.pixelSize || 2,
        useWhiteBackground: options.useWhiteBackground || false
      });
      
      if (newImageUrl) {
        imageUrl = newImageUrl;
      }
    }
    
    const format = options?.format || 'png';
    await saveToDevice(imageUrl, `心语_${formatDateForFile(currentNote.value.savedAt)}.${format}`);
    return true;
  } catch (error) {
    console.error('下载失败:', error);
    return false;
  }
}

// 处理分享
async function handleShare(imageUrl) {
  try {
    // 如果有像素大小选项，重新生成图片
    if (detailNoteRef.value && exportOptions.value?.pixelSize) {
      // 重新导出图片，应用新的导出选项
      const newImageUrl = await exportAsImage(detailNoteRef.value.$el, {
        format: exportOptions.value.format || 'png',
        quality: exportOptions.value.quality || 0.9,
        transparentBg: exportOptions.value.transparentBg || false,
        pixelSize: exportOptions.value.pixelSize || 2,
        useWhiteBackground: exportOptions.value.useWhiteBackground || false
      });
      
      if (newImageUrl) {
        imageUrl = newImageUrl;
      }
    }
    
    const shared = await shareImage(imageUrl);
    if (!shared) {
      await saveToDevice(imageUrl);
      alert('图片已保存，您可以手动分享');
    }
    return shared;
  } catch (error) {
    console.error('分享失败:', error);
    return false;
  }
}

// 分享当前笔记
async function shareCurrentNote() {
  if (!detailNoteRef.value) return;
  
  try {
    const imageUrl = await exportAsImage(detailNoteRef.value.$el);
    if (imageUrl) {
      previewImageUrl.value = imageUrl;
      showImagePreview.value = true;
    }
  } catch (error) {
    console.error('分享失败:', error);
    alert('分享失败，请重试');
  }
}

// 更新导出选项
function updateExportOptions(options) {
  exportOptions.value = { ...options };
}

// 关闭图片预览
function closeImagePreview() {
  showImagePreview.value = false;
  previewImageUrl.value = '';
}

// 清空所有收藏
async function deleteAll() {
  if (confirm('确定要清空所有收藏吗？此操作不可恢复。')) {
    try {
      const success = await clearSavedNotes();
      if (success) {
        await loadSavedNotes();
        showActionMenu.value = false;
      } else {
        alert('操作失败，请重试');
      }
    } catch (error) {
      console.error('清空收藏失败:', error);
      alert('操作失败，请重试');
    }
  }
}

// 导出所有笔记
async function exportAll() {
  alert('批量导出功能暂未实现');
  showActionMenu.value = false;
}

// 返回上一页
function goBack() {
  router.back();
}

// 前往首页
function goHome() {
  router.push('/');
}

// 获取笔记样式
function getNoteStyle(note) {
  // 如果有自定义样式且有图片，使用图片作为背景
  if (note.customStyle?.imageUrl && note.customStyle.layout === 'image-bg') {
    return {
      backgroundImage: `url(${note.customStyle.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  
  // 否则使用默认背景
  const backgrounds = {
    'paper-1': 'linear-gradient(to right bottom, #FFFFFF, #F9F3E5)',
    'paper-2': 'linear-gradient(to right bottom, #FFF9F9, #FFE8E8)',
    'paper-3': 'linear-gradient(to right bottom, #F0F8FF, #E6F0F9)',
    'paper-4': 'linear-gradient(to right bottom, #F5FFF5, #E6F9E6)'
  };
  
  return {
    background: backgrounds[note.background] || backgrounds['paper-1']
  };
}

// 裁剪内容
function truncateContent(content) {
  return content.length > 18 ? content.substring(0, 18) + '...' : content;
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// 格式化日期用于文件名
function formatDateForFile(dateString) {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 10);
}

// 生命周期
onMounted(() => {
  loadSavedNotes();
});
</script>

<style scoped>
/* 保留现有样式 */

/* 添加样式定制器弹窗样式 */
.style-customizer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  height: 90%;
  max-height: 700px;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 1001;
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    height: 95%;
  }
}
</style> 