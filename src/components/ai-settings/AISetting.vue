<template>
  <div v-if="visible" class="ai-setting-modal">
    <div class="modal-overlay" @click="handleClose"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>AI 设置</h2>
        <button class="btn-close" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </button>
        </div>

        <div class="tab-content">
          <div v-if="currentTab === 'api'" class="api-tab-header">
            <div class="api-mode-info">
              <div class="api-mode-badge" :class="apiModeClass">
                {{ apiModeText }}
              </div>
              <p v-if="!useCustomAPI" class="api-mode-description">
                当前使用系统默认API，模型：{{ currentModelName }}
              </p>
              <p v-else class="api-mode-description">
                当前使用自定义API配置
              </p>
            </div>
          </div>
          
          <APIConfig 
            v-if="currentTab === 'api'"
            @update:apiSettings="handleAPISettingsUpdate"
          />
          <KnowledgeBase 
            v-if="currentTab === 'knowledge'"
          />
          <PremiumFeatures 
            v-if="currentTab === 'premium'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import APIConfig from './APIConfig.vue';
import KnowledgeBase from './KnowledgeBase.vue';
import PremiumFeatures from './PremiumFeatures.vue';
import { getApiSettings } from '../../services/storageService';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'update:apiSettings']);

const currentTab = ref('api');
const useCustomAPI = ref(false);
const currentModel = ref('qwen-turbo');

const tabs = [
  { id: 'api', name: 'API 配置', icon: 'fas fa-cog' },
  { id: 'knowledge', name: '知识库设置', icon: 'fas fa-book' },
  { id: 'premium', name: '高级功能', icon: 'fas fa-crown' }
];

// 计算属性
const apiModeClass = computed(() => {
  return useCustomAPI.value ? 'custom-mode' : 'system-mode';
});

const apiModeText = computed(() => {
  return useCustomAPI.value ? '自定义API' : '系统API';
});

const currentModelName = computed(() => {
  switch(currentModel.value) {
    case 'qwen-turbo':
      return '通义千问 Turbo';
    case 'qwen-plus':
      return '通义千问 Plus';
    case 'qwen-max':
      return '通义千问 Max';
    default:
      return currentModel.value;
  }
});

function handleClose() {
  emit('update:visible', false);
}

function handleAPISettingsUpdate(settings) {
  emit('update:apiSettings', settings);
  
  // 更新当前API模式状态
  if (settings) {
    useCustomAPI.value = settings.useCustomAPI;
    currentModel.value = settings.model || 'qwen-turbo';
  }
  
  // 不要立即关闭窗口，让用户看到保存成功的提示
  // handleClose();
}

// 生命周期钩子
onMounted(async () => {
  try {
    const settings = await getApiSettings();
    if (settings) {
      useCustomAPI.value = settings.useCustomAPI;
      currentModel.value = settings.model || 'qwen-turbo';
    }
  } catch (error) {
    console.error('加载API设置失败:', error);
  }
});
</script>

<style scoped>
.ai-setting-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: var(--bg-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.modal-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.btn-close:hover {
  background: var(--border-color);
  color: var(--text-color);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-color);
}

.tabs {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.95rem;
}

.tab-btn i {
  font-size: 1rem;
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: var(--border-color);
  color: var(--text-color);
}

.tab-content {
  min-height: 400px;
}

/* API模式信息样式 */
.api-tab-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.api-mode-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
}

.api-mode-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.api-mode-badge.system-mode {
  background-color: var(--primary-color);
}

.api-mode-badge.custom-mode {
  background-color: var(--warning-color, #ff9800);
}

.api-mode-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .tabs {
    padding: var(--spacing-xs);
  }

  .tab-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.9rem;
  }

  .tab-btn span {
    display: none;
  }

  .tab-btn i {
    margin: 0;
  }
}
</style> 