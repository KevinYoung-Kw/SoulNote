<template>
  <transition name="fade">
    <div v-if="visible" class="community-modal" @click.self="handleOutsideClick">
      <div class="community-container" :class="{ 'compact': compact }">
        <div class="community-header">
          <div class="tab-container">
            <button 
              class="tab-button" 
              :class="{ 'active': activeTab === 'community' }"
              @click="activeTab = 'community'"
            >
              <i class="fas fa-users"></i> 加入社群
            </button>
            <button 
              class="tab-button" 
              :class="{ 'active': activeTab === 'updates' }"
              @click="activeTab = 'updates'"
            >
              <i class="fas fa-history"></i> 更新日志
            </button>
          </div>
          <button class="close-btn" @click="close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="community-content">
          <!-- 社群信息标签页 -->
          <div v-if="activeTab === 'community'">
            <div class="community-message">
              <p v-if="message" class="main-message">{{ message }}</p>
              <p v-else class="main-message">
              作为一名独立开发者，每一位用户的反馈对我都非常重要。加入社群，您可以：
              </p>
              
              <ul class="benefit-list">
                <li><i class="fas fa-star"></i> 第一时间获取新功能通知</li>
                <li><i class="fas fa-mobile-alt"></i> 获取App下载及更新信息</li>
                <li><i class="fas fa-comments"></i> 基本上用户一提出来建议我就实现了嘎嘎嘎</li>
                <li><i class="fas fa-gift"></i> 星与心笺公测后获得免费试用资格</li>
                <li><i class="fas fa-flask"></i> 参与其他应用开发抢先内测</li>
              </ul>
            </div>
            
            <div class="qrcode-container">
              <div class="qrcode-wrap">
                <img :src="qrcodeUrl" alt="社群二维码" class="qrcode-image" />
              </div>
              <p class="qrcode-tip">扫码加入{{ title || '星语心笺' }}</p>
            </div>
          </div>
          
          <!-- 更新日志标签页 -->
          <div v-else-if="activeTab === 'updates'" class="updates-tab">
            <div class="version-filter">
              <span>版本筛选：</span>
              <select v-model="selectedVersion" class="version-select">
                <option value="all">全部版本</option>
                <option v-for="version in versions" :key="version.number" :value="version.number">
                  {{ version.number }} ({{ formatDate(version.date) }})
                </option>
              </select>
            </div>
            
            <div class="updates-list">
              <div 
                v-for="version in filteredVersions" 
                :key="version.number"
                class="version-item"
              >
                <div class="version-header">
                  <h4>版本 {{ version.number }}</h4>
                  <span class="version-date">{{ formatDate(version.date) }}</span>
                </div>
                
                <div class="version-features">
                  <div 
                    v-for="(category, idx) in version.updates" 
                    :key="`cat-${idx}`"
                    class="feature-category"
                  >
                    <h5>
                      <i :class="getCategoryIcon(category.type)"></i>
                      {{ getCategoryTitle(category.type) }}
                    </h5>
                    <ul class="feature-list">
                      <li v-for="(feature, i) in category.items" :key="`feat-${i}`">
                        {{ feature }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="action-area" v-if="!compact">
            <template v-if="activeTab === 'community'">
              <button class="remind-later-btn" @click="remindLater">稍后提醒</button>
              <button class="close-btn-text" @click="neverRemind">本版本不再提醒</button>
            </template>
            <template v-else>
              <button class="primary-btn" @click="activeTab = 'community'">
                <i class="fas fa-arrow-left"></i> 返回社群
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';
import { APP_VERSION } from '../config/version';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  qrcodeUrl: {
    type: String,
    default: '/assets/community-qr.png'
  },
  compact: {
    type: Boolean,
    default: false
  },
  allowClose: {
    type: Boolean,
    default: true
  },
  // 新增：更新日志数据
  updateLogs: {
    type: Array,
    default: () => []
  },
  // 新增：初始激活的标签页
  activeTab: {
    type: String,
    default: 'community'
  }
});

const emit = defineEmits(['close', 'later', 'never']);

// 活动标签页，默认显示社群标签
const activeTab = ref(props.activeTab);

// 监听属性变化，同步更新标签页
watch(() => props.activeTab, (newValue) => {
  if (newValue) {
    activeTab.value = newValue;
    console.log('标签页切换为:', newValue);
  }
}, { immediate: true }); // 添加 immediate: true 确保组件挂载时立即生效

// 选中的版本筛选
const selectedVersion = ref('all');

// 版本历史数据（如果未提供则使用默认数据）
const versions = ref(props.updateLogs.length > 0 ? props.updateLogs : [
  {
    number: '1.7.0',
    date: new Date().toISOString(), // 使用当前日期作为最新版本日期
    updates: [
      {
        type: 'feature',
        items: [
          '增强笔记收藏功能和状态管理，提升用户体验',
          '优化收藏功能和存储管理，提升用户体验',
          '实现更稳定的收藏状态持久化，解决页面切换后状态丢失问题',
          '改进收藏按钮样式，包括在普通模式和毒舌模式下的不同颜色表现'
        ]
      },
      {
        type: 'improvement',
        items: [
          '优化路由检测，确保收藏状态在页面重新激活时正确恢复',
          '改进localStorage存储机制，提高数据一致性',
          '优化笔记ID的存储和清除逻辑，确保用户体验的一致性和流畅度'
        ]
      },
      {
        type: 'fix',
        items: [
          '修复在页面切换后收藏状态丢失的问题',
          '修复收藏按钮在毒舌模式下颜色显示不正确的问题'
        ]
      },
      {
        type: 'chore',
        items: [
          '添加备份目录到.gitignore，优化版本控制'
        ]
      }
    ]
  },
  {
    number: '1.6.0',
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), // 上一个版本的日期
    updates: [
      {
        type: 'feature',
        items: [
          '更新字体和图像预加载逻辑，优化加载性能',
          '重构字体管理系统，支持更多中文字体',
          '增强系统API支持，提升应用稳定性',
          '优化用户交互反馈机制，提高应用响应速度'
        ]
      },
      {
        type: 'improvement',
        items: [
          '优化引导流程和组件交互体验',
          '完善错误处理机制，提升应用稳定性',
          '改善资源加载策略，减少等待时间',
          '调整移动端显示效果，适配更多设备尺寸'
        ]
      },
      {
        type: 'fix',
        items: [
          '修复字体加载失败的问题',
          '解决样式定制器中背景设置异常',
          '修正部分组件在特定屏幕尺寸下的显示问题',
          '修复社群二维码图片加载路径问题'
        ]
      }
    ]
  },
  {
    number: '1.5.0',
    date: '2025-3-17T10:30:00',
    updates: [
      {
        type: 'feature',
        items: [
          '增强DeepSeek模型配置，提升AI生成质量',
          '更新社群提示和样式定制功能',
          '增强表情选择器和搜索功能',
          '更新欢迎页面和图标样式',
          '新增全局错误处理和用户信息检查功能'
        ]
      },
      {
        type: 'improvement',
        items: [
          '优化笔记样式定制和内容管理功能',
          '改进图片滤镜选择器，增强滤镜强度控制',
          '升级API设置界面，增强用户交互体验',
          '优化组件层级结构，提升渲染性能'
        ]
      },
      {
        type: 'fix',
        items: [
          '修复滤镜参数重置问题',
          '解决字体加载延迟导致的布局抖动',
          '修正移动端下部分UI元素位置错误',
          '修复图片导出时的质量损失问题'
        ]
      }
    ]
  },
  {
    number: '1.4.0',
    date: '2025-3-16T14:45:00',
    updates: [
      {
        type: 'feature',
        items: [
          '添加样式定制器和导出功能，支持更多自定义选项',
          '更新图片预览和导出功能，支持更多格式',
          '更新底部导航，优化操作流程',
          '增强笔记显示功能，支持多种布局'
        ]
      },
      {
        type: 'improvement',
        items: [
          '更新图片滤镜功能，支持更多效果',
          '优化组件结构，提升页面渲染速度',
          '改进用户交互反馈机制，增强操作流畅度',
          '完善引导页面，优化首次使用体验'
        ]
      },
      {
        type: 'fix',
        items: [
          '修复部分设备上图片渲染异常问题',
          '解决夜间模式下的对比度问题',
          '修正长文本在卡片中的显示溢出问题'
        ]
      }
    ]
  },
  {
    number: '1.3.0',
    date: '2025-3-15T09:20:00',
    updates: [
      {
        type: 'feature',
        items: [
          '重构首页组件，优化布局和用户交互体验',
          '重构引导页面，优化用户体验和组件结构',
          '首次发布星语心笺Web应用',
          '支持多种心情表情选择',
          '提供5种卡片背景样式'
        ]
      },
      {
        type: 'improvement',
        items: [
          '实现流畅的生成动画效果',
          '支持暗黑模式切换',
          '优化图片保存与分享功能'
        ]
      },
      {
        type: 'fix',
        items: [
          '修复初始化过程中的性能瓶颈',
          '解决多设备兼容性问题'
        ]
      }
    ]
  }
]);

// 根据筛选条件过滤版本
const filteredVersions = computed(() => {
  if (selectedVersion.value === 'all') {
    return versions.value;
  }
  return versions.value.filter(v => v.number === selectedVersion.value);
});

// 格式化日期
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    
    // 格式化年月日
    const dateOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    const dateFormatted = date.toLocaleDateString('zh-CN', dateOptions);
    
    // 格式化时分
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };
    const timeFormatted = date.toLocaleTimeString('zh-CN', timeOptions);
    
    // 组合日期和时间
    return `${dateFormatted} ${timeFormatted}`;
  } catch (e) {
    return dateStr;
  }
}

// 获取分类图标
function getCategoryIcon(type) {
  const icons = {
    'feature': 'fas fa-star',
    'improvement': 'fas fa-arrow-up',
    'fix': 'fas fa-bug',
    'chore': 'fas fa-tasks',
    'default': 'fas fa-info-circle'
  };
  return icons[type] || icons.default;
}

// 获取分类标题
function getCategoryTitle(type) {
  const titles = {
    'feature': '新功能',
    'improvement': '优化改进',
    'fix': '问题修复',
    'chore': '其他更新',
    'default': '其他更新'
  };
  return titles[type] || titles.default;
}

function close() {
  if (props.allowClose) {
    console.log('关闭弹窗');
    emit('close');
  }
}

async function remindLater() {
  try {
    // 设置5分钟后再次提醒
    const nextRemindDate = new Date();
    nextRemindDate.setMinutes(nextRemindDate.getMinutes() + 5);
    
    // 先获取当前用户偏好设置
    const currentPrefs = await getUserPreferences();
    
    // 合并偏好设置，保留现有设置同时更新提醒时间
    await saveUserPreferences({
      ...currentPrefs,
      communityRemindAt: nextRemindDate.toISOString(),
      communityShownBefore: true // 确保标记为已显示过
    });
    
    console.log('已设置5分钟后提醒');
    emit('later');
  } catch (error) {
    console.error('设置提醒时间失败:', error);
    emit('later'); // 即使出错也关闭弹窗
  }
}

async function neverRemind() {
  try {
    // 先获取当前用户偏好设置
    const currentPrefs = await getUserPreferences();
    
    // 合并偏好设置，保留现有设置同时添加不再提醒标记
    await saveUserPreferences({
      ...currentPrefs,
      neverRemindCommunity: true,
      communityShownBefore: true // 确保标记为已显示过
    });
    
    console.log('已设置本版本内不再提醒');
    emit('never');
  } catch (error) {
    console.error('设置不再提醒失败:', error);
    emit('never'); // 即使出错也关闭弹窗
  }
}

function handleOutsideClick() {
  if (props.allowClose) {
    close();
  }
}
</script>

<style scoped>
.community-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.community-container {
  background-color: var(--bg-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 460px;
  max-height: 85vh; /* 限制最大高度 */
  overflow: hidden;
  animation: slide-up 0.3s ease;
  display: flex;
  flex-direction: column;
}

.community-container.compact {
  max-width: 360px;
}

.community-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-container {
  display: flex;
  gap: var(--spacing-sm);
}

.tab-button {
  background: none;
  border: none;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.tab-button i {
  font-size: 14px;
}

.tab-button.active {
  background-color: var(--primary-color-light);
  color: var(--primary-color);
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.close-btn:hover {
  background-color: var(--hover-color);
  color: var(--text-color);
}

.community-content {
  padding: var(--spacing-md);
  overflow-y: auto;
  flex-grow: 1;
}

.community-message {
  margin-bottom: var(--spacing-md);
}

.main-message {
  font-size: 15px;
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

.benefit-list {
  padding-left: var(--spacing-lg);
  margin: var(--spacing-md) 0;
}

.benefit-list li {
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
}

.benefit-list li i {
  color: var(--primary-color);
  margin-right: var(--spacing-xs);
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: var(--spacing-md) 0;
}

.qrcode-wrap {
  background-color: white;
  padding: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.qrcode-image {
  width: 160px;
  height: 160px;
  object-fit: contain;
}

.compact .qrcode-image {
  width: 140px;
  height: 140px;
}

.qrcode-tip {
  margin-top: var(--spacing-md);
  font-size: 14px;
  color: var(--text-secondary);
}

/* 更新日志样式 */
.updates-tab {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.version-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.version-select {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
}

.updates-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.version-item {
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-xs);
}

.version-header h4 {
  margin: 0;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 600;
}

/* 调整版本日期显示样式 */
.version-date {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap; /* 防止日期换行 */
}

.feature-category {
  margin-bottom: var(--spacing-md);
}

.feature-category h5 {
  font-size: 14px;
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.feature-category h5 i {
  color: var(--primary-color);
  font-size: 12px;
}

.feature-list {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.feature-list li {
  font-size: 13px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.action-area {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.remind-later-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
}

.close-btn-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.primary-btn {
  background-color: var(--primary-color-light);
  color: var(--primary-color);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.primary-btn:hover {
  background-color: var(--primary-color-lighter);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .community-container {
    max-width: 100%;
    max-height: 90vh;
  }
  
  .qrcode-image {
    width: 140px;
    height: 140px;
  }
  
  .community-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .community-content {
    padding: var(--spacing-sm);
  }
  
  .tab-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 13px;
  }
}
</style>