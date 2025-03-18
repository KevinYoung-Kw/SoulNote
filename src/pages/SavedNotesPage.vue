<template>
  <div class="saved-notes-page fixed-page-layout">
    <header class="header fixed-header">
      <button class="icon-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">我的收藏</h1>
      <button class="icon-btn" @click="showActionMenu = true" v-if="savedNotes.length">
        <i class="fas fa-ellipsis-v"></i>
      </button>
    </header>
    
    <div class="content-area scrollable-content">
      <!-- 没有收藏时显示 -->
      <div class="empty-state" v-if="!savedNotes.length">
        <i class="fas fa-bookmark empty-icon"></i>
        <p>还没有收藏任何心语纸条</p>
        <div class="empty-state-actions">
          <button class="btn btn-primary" @click="goHome">去生成心语</button>
          <button class="btn btn-text" @click="refreshNotes">
            <i class="fas fa-sync-alt"></i> 刷新列表
          </button>
        </div>
        <div class="debug-info" v-if="showDebugInfo">
          <p class="debug-text">应用状态：{{ storageState }}</p>
          <button class="btn btn-small btn-outline" @click="checkStorage">检查存储状态</button>
        </div>
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
        </div>
      </div>
    </div>
    
    <!-- 样式定制器弹窗 -->
    <div class="style-customizer-modal" v-if="showStyleCustomizer" @click.self="showStyleCustomizer = false">
      <div class="modal-content" @click.stop>
        <NoteStyleCustomizer 
          :note-content="currentNote?.content || ''"
          :note-mood="currentNote?.mood || ''"
          :initial-style="currentNote?.customStyle || {}"
          :external-font-size="currentNote?.fontSize || getDefaultFontSize()"
          @close="showStyleCustomizer = false"
          @update:style="updateNoteStyle"
          @export="handleExport"
        />
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import NoteCard from '../components/NoteCard.vue';
import NoteStyleCustomizer from '../components/NoteStyleCustomizer.vue';
import { getSavedNotes, deleteNote, clearSavedNotes, updateSavedNote } from '../services/storageService';
import { useNoteExport } from '../composables/useNoteExport';

const router = useRouter();
const savedNotes = ref([]);
const showNoteDetail = ref(false);
const showActionMenu = ref(false);
const currentNote = ref(null);
const detailNoteRef = ref(null);
const showStyleCustomizer = ref(false);
const storageState = ref('');
const showDebugInfo = ref(false);
let refreshTimer = null;

const { exportAsImage, saveToDevice } = useNoteExport();

// 获取收藏的笔记
async function loadSavedNotes() {
  try {
    console.log('加载收藏笔记...');
    savedNotes.value = await getSavedNotes();
    console.log(`成功加载了 ${savedNotes.value.length} 条笔记`);
    storageState.value = savedNotes.value.length > 0 ? '正常' : '没有数据';
  } catch (error) {
    console.error('加载收藏笔记失败:', error);
    savedNotes.value = [];
    storageState.value = '加载失败: ' + error.message;
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
  
  // 设置定时刷新 - 每60秒刷新一次收藏列表
  refreshTimer = setInterval(loadSavedNotes, 60000);
  
  // 双击标题时显示调试信息
  const titleEl = document.querySelector('.page-title');
  if (titleEl) {
    titleEl.addEventListener('dblclick', () => {
      showDebugInfo.value = !showDebugInfo.value;
    });
  }
});

// 清理定时器
onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});

// 自定义当前笔记样式
function customizeCurrentNote() {
  showStyleCustomizer.value = true;
}

// 更新笔记样式
async function updateNoteStyle(newStyle) {
  if (!currentNote.value) return;
  
  try {
    // 从新样式中解构出字体大小，其他样式属性保持不变
    const { fontSize: newFontSize, ...otherStyles } = newStyle;
    
    // 创建一个新的笔记对象，避免直接修改引用
    const updatedNote = {
      ...currentNote.value,
      customStyle: otherStyles,
      fontSize: newFontSize || currentNote.value.fontSize || getDefaultFontSize() // 确保字体大小被正确应用
    };
    
    // 确保params是可序列化的对象
    if (updatedNote.params) {
      // 如果params包含数组或复杂对象，确保它们被正确序列化
      updatedNote.params = JSON.parse(JSON.stringify(updatedNote.params));
    }
    
    // 更新笔记
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
      // 直接下载图片
      await saveToDevice(imageUrl, `心语_${formatDateForFile(currentNote.value.savedAt || new Date())}.png`);
      alert('导出成功！图片已保存到您的设备');
      showStyleCustomizer.value = false;
    }
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出图片失败，请重试');
  }
}

// 获取默认字体大小
function getDefaultFontSize() {
  // 根据屏幕宽度返回合适的字体大小
  return window.innerWidth <= 375 ? 18 : 24;
}

// 刷新笔记列表
async function refreshNotes() {
  storageState.value = '刷新中...';
  await loadSavedNotes();
}

// 检查存储状态
function checkStorage() {
  showDebugInfo.value = true;
  if (typeof window.diagnoseSoulNoteStorage === 'function') {
    window.diagnoseSoulNoteStorage();
    storageState.value = '已在控制台输出诊断信息';
  } else {
    storageState.value = '诊断工具不可用';
  }
}
</script>

<style scoped>
.saved-notes-page {
  /* 删除min-height: 100vh; 因为fixed-page-layout已设置height: 100vh */
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

.empty-state-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.btn-text {
  background: none;
  color: var(--primary-color);
  border: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.btn-text:hover {
  text-decoration: underline;
}

.debug-info {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-md);
  font-size: 12px;
  max-width: 270px;
}

.debug-text {
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.btn-small {
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-sm);
}

.btn-outline {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fa-sync-alt {
  animation: spin 1s linear infinite;
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

.style-customizer-modal {
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

.modal-content {
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 101;
}
</style>