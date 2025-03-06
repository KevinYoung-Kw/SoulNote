<template>
  <div class="saved-notes-page">
    <header class="header">
      <button class="icon-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">我的收藏</h1>
      <button class="icon-btn" @click="showActionMenu = true" v-if="savedNotes.length">
        <i class="fas fa-ellipsis-v"></i>
      </button>
    </header>
    
    <div class="content-area">
      <!-- 没有收藏时显示 -->
      <div class="empty-state" v-if="!savedNotes.length">
        <i class="fas fa-bookmark empty-icon"></i>
        <p>还没有收藏任何心语纸条</p>
        <button class="btn btn-primary" @click="goHome">去生成心语</button>
      </div>
      
      <!-- 网格布局展示收藏 -->
      <div class="notes-grid" v-else>
        <div 
          class="note-item" 
          v-for="note in savedNotes" 
          :key="note.id"
          @click="viewNote(note)"
        >
          <div class="note-preview" :style="getNoteStyle(note)">
            <div class="note-content">{{ truncateContent(note.content) }}</div>
          </div>
          <div class="note-date">{{ formatDate(note.savedAt) }}</div>
        </div>
      </div>
    </div>
    
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
            ref="detailNoteRef"
          />
        </div>
        
        <div class="note-detail-footer">
          <button class="icon-btn action-btn" @click="deleteCurrentNote">
            <i class="fas fa-trash"></i>
          </button>
          <button class="icon-btn action-btn" @click="exportCurrentNote">
            <i class="fas fa-download"></i>
          </button>
          <button class="icon-btn action-btn" @click="shareCurrentNote">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 操作菜单 -->
    <div class="action-menu" v-if="showActionMenu" @click="showActionMenu = false">
      <div class="action-menu-content" @click.stop>
        <div class="action-menu-item" @click="deleteAll">
          <i class="fas fa-trash"></i>
          <span>清空收藏</span>
        </div>
        <div class="action-menu-item" @click="exportAll">
          <i class="fas fa-download"></i>
          <span>导出全部</span>
        </div>
        <div class="action-menu-item" @click="showActionMenu = false">
          <i class="fas fa-times"></i>
          <span>取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NoteCard from '../components/NoteCard.vue';
import { getSavedNotes, deleteNote, clearSavedNotes } from '../services/storageService';
import { useNoteExport } from '../composables/useNoteExport';

const router = useRouter();
const savedNotes = ref([]);
const showNoteDetail = ref(false);
const showActionMenu = ref(false);
const currentNote = ref(null);
const detailNoteRef = ref(null);

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

// 导出当前笔记
async function exportCurrentNote() {
  if (!detailNoteRef.value) return;
  
  try {
    const imageUrl = await exportAsImage(detailNoteRef.value.$el);
    if (imageUrl) {
      await saveToDevice(imageUrl, `心语_${formatDateForFile(currentNote.value.savedAt)}.png`);
    }
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出图片失败，请重试');
  }
}

// 分享当前笔记
async function shareCurrentNote() {
  if (!detailNoteRef.value) return;
  
  try {
    const imageUrl = await exportAsImage(detailNoteRef.value.$el);
    if (imageUrl) {
      const shared = await shareImage(imageUrl);
      if (!shared) {
        await saveToDevice(imageUrl);
        alert('图片已保存，您可以手动分享');
      }
    }
  } catch (error) {
    console.error('分享失败:', error);
    alert('分享失败，请重试');
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
.saved-notes-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.content-area {
  padding: var(--spacing-md);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--text-secondary);
  opacity: 0.3;
  margin-bottom: var(--spacing-lg);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.note-item {
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.note-item:hover {
  transform: translateY(-2px);
}

.note-preview {
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-decorative);
  font-size: 12px;
  text-align: center;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.note-date {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.note-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.note-detail-content {
  width: 90%;
  max-width: 400px;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.note-detail-header {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.note-detail-body {
  padding: var(--spacing-md);
  overflow-y: auto;
  flex: 1;
}

.note-detail-footer {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.action-btn {
  font-size: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.action-menu-content {
  width: 100%;
  background-color: var(--card-bg);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  padding: var(--spacing-md) 0;
}

.action-menu-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-xl);
  cursor: pointer;
}

.action-menu-item i {
  margin-right: var(--spacing-md);
  width: 24px;
  text-align: center;
}

.action-menu-item:active {
  background-color: rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .notes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .note-detail-content {
    width: 95%;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}
</style>