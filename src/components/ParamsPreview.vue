<template>
  <div class="params-card" :class="{'savage-panel': params.savageMode}">
    <div class="params-preview" @click="openParamsPanel">
      <!-- 修改心情参数预览，只显示第一个心情 -->
      <div class="params-item mood-container">
        <template v-if="params.moods && params.moods.length > 0">
          <!-- 只显示第一个emoji，但在后面添加提示点表示还有更多 -->
          <span class="mood-emoji">{{ params.moods[0] }}</span>
          <span v-if="params.moods.length > 1" class="mood-counter-preview">+{{ params.moods.length - 1 }}</span>
        </template>
        <template v-else>
          <i class="fas fa-smile"></i>
          <span>心情</span>
        </template>
      </div>
      <!-- 添加主题参数显示 -->
      <div class="params-item" :class="{'unsupported': isUnsupportedTheme}">
        <i :class="themeOptions.find(t => t.value === params.theme)?.icon || 'fas fa-comment-dots'"></i>
        <span>{{ themeOptions.find(t => t.value === params.theme)?.label || '聊天' }}</span>
        <span v-if="isUnsupportedTheme" class="unsupported-badge" title="当前模型不支持此功能">!</span>
      </div>
      <div class="params-item" v-if="params.enableFortune">
        <i :class="fortuneAspects.find(a => a.value === params.fortuneAspect)?.icon || 'fas fa-star'"></i>
        <span>{{ getFortuneAspectLabel() }}</span>
      </div>
      <button class="params-edit-btn">
        <i class="fas fa-sliders-h"></i>
        <span>设置</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getApiSettings } from '../services/storageService';
import { isFeatureSupported } from '../services/aiService';
import { themeOptions, fortuneAspects } from '../data/emojiData';

// Props
const props = defineProps({
  params: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['open-params-panel']);

// State
const supportsPoetry = ref(true);
const supportsHaiku = ref(true);
const currentModel = ref('qwen-turbo');
const apiSettingsChangeListener = ref(null);

// Computed
const isSavageMode = computed(() => props.params.savageMode);

// 检查当前主题是否不被支持
const isUnsupportedTheme = computed(() => {
  return (props.params.theme === 'poetry' && !supportsPoetry.value) || 
         (props.params.theme === 'haiku' && !supportsHaiku.value);
});

// Methods
function openParamsPanel() {
  emit('open-params-panel');
}

function getFortuneAspectLabel() {
  const aspect = fortuneAspects.find(a => a.value === props.params.fortuneAspect);
  return aspect ? aspect.label : '整体';
}

// 检查当前模型是否支持诗歌和俳句
async function checkModelFeatures() {
  try {
    // 获取当前API设置
    const settings = await getApiSettings();
    if (settings) {
      currentModel.value = settings.model || 'qwen-turbo';
      
      // 根据模型直接判断功能支持
      if (settings.model === 'qwen-turbo') {
        supportsPoetry.value = false;
        supportsHaiku.value = false;
      } else if (settings.model === 'qwen-plus' || settings.model === 'qwen-max') {
        supportsPoetry.value = true;
        supportsHaiku.value = true;
      } else {
        // 对于其他模型，使用API检查
        supportsPoetry.value = await isFeatureSupported('poetry');
        supportsHaiku.value = await isFeatureSupported('haiku');
      }
    } else {
      // 默认使用turbo模型
      currentModel.value = 'qwen-turbo';
      supportsPoetry.value = false;
      supportsHaiku.value = false;
    }
  } catch (error) {
    console.error('检查模型功能失败:', error);
    // 出错时默认允许所有功能
    supportsPoetry.value = true;
    supportsHaiku.value = true;
  }
}

// 设置API设置变化的监听器
function setupApiSettingsChangeListener() {
  // 创建一个存储事件监听器
  apiSettingsChangeListener.value = async () => {
    // 当存储变化时，重新检查模型功能
    await checkModelFeatures();
  };
  
  // 添加事件监听器
  window.addEventListener('storage', apiSettingsChangeListener.value);
  
  // 自定义事件监听器，用于非存储触发的API设置变化
  document.addEventListener('api-settings-changed', apiSettingsChangeListener.value);
}

// 移除API设置变化的监听器
function removeApiSettingsChangeListener() {
  if (apiSettingsChangeListener.value) {
    window.removeEventListener('storage', apiSettingsChangeListener.value);
    document.removeEventListener('api-settings-changed', apiSettingsChangeListener.value);
    apiSettingsChangeListener.value = null;
  }
}

// 监听参数变化，当参数变化时重新检查模型功能
watch(() => props.params, async () => {
  await checkModelFeatures();
}, { deep: true });

// 生命周期钩子
onMounted(async () => {
  await checkModelFeatures();
  setupApiSettingsChangeListener();
});

onBeforeUnmount(() => {
  removeApiSettingsChangeListener();
});
</script>

<style scoped>
.params-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  margin: var(--spacing-md) 0;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.params-preview {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  position: relative;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.mood-emoji {
  font-size: 16px;
  line-height: 1;
  margin-right: var(--spacing-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.params-item {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-md);
  color: var(--text-color);
  background-color: rgba(123, 158, 137, 0.1);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 14px;
  position: relative;
}

.params-item i {
  margin-right: var(--spacing-xs);
  color: var(--primary-color);
  font-size: 14px;
}

/* 不支持的主题样式 */
.params-item.unsupported {
  background-color: rgba(255, 152, 0, 0.1);
  border: 1px dashed var(--warning-color, #ff9800);
}

.params-item.unsupported i {
  color: var(--warning-color, #ff9800);
}

.unsupported-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--warning-color, #ff9800);
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.params-edit-btn {
  margin-left: auto;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.params-edit-btn i {
  margin-right: var(--spacing-xs);
}

.mood-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.mood-counter-preview {
  font-size: 12px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

/* 毒舌模式样式 - 直接应用而不是使用全局选择器 */
.savage-panel .mood-counter-preview {
  background-color: var(--savage-primary-color, #ff5252);
}

/* 媒体查询优化 */
@media (max-width: 480px) {
  .params-item {
    padding: var(--spacing-xs) var(--spacing-xs);
    font-size: 12px;
    margin-right: var(--spacing-xs);
  }
  
  .params-item i {
    font-size: 12px;
  }
  
  .mood-emoji {
    font-size: 14px;
  }
  
  .mood-counter-preview {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
  
  .params-edit-btn {
    font-size: 12px;
  }
  
  .params-edit-btn i {
    font-size: 12px;
  }
}
</style>