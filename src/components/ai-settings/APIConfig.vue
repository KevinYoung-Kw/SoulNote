<template>
  <div class="api-config">
    <div class="setting-group">
      <div class="setting-header">
        <div class="toggle-wrapper">
          <label class="toggle">
            <input 
              type="checkbox" 
              v-model="useCustomAPI"
              @change="handleAPIToggle"
            >
            <span class="slider"></span>
          </label>
          <span>使用自定义 API</span>
        </div>
      </div>

      <!-- 系统默认API设置 -->
      <div class="setting-fields" v-if="!useCustomAPI">
        <div class="system-api-info">
          <div class="info-icon">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="info-text">
            <p>使用系统默认API无需配置API Key和端点，但请选择合适的模型：</p>
          </div>
        </div>
        
        <div class="custom-dropdown">
          <div class="dropdown-header" @click="showModelDropdown = !showModelDropdown">
            <div class="selected-model">
              <span :class="['model-tag', selectedModelInfo.tagClass]">{{ selectedModelInfo.tag }}</span>
              <span class="model-name">{{ selectedModelInfo.name }}</span>
            </div>
            <i class="fas fa-chevron-down" :class="{ 'rotate': showModelDropdown }"></i>
          </div>
          
          <div class="dropdown-options" v-if="showModelDropdown">
            <div 
              v-for="model in systemModels" 
              :key="model.value"
              :class="['dropdown-option', { active: systemModel === model.value }]"
              @click="selectModel(model.value)"
            >
              <div class="option-header">
                <span :class="['model-tag', model.tagClass]">{{ model.tag }}</span>
                <span class="model-name">{{ model.name }}</span>
              </div>
              <div class="option-body">
                <p>{{ model.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="setting-actions">
          <button 
            class="btn-primary" 
            @click="saveSystemSettings"
          >
            保存设置
          </button>
        </div>
      </div>

      <!-- 自定义API设置 -->
      <div class="setting-fields" :class="{ disabled: !useCustomAPI }" v-if="useCustomAPI">
        <div class="form-group">
          <label>API Key</label>
          <input 
            type="password" 
            v-model="apiKey"
            :disabled="!useCustomAPI"
            placeholder="输入你的 API Key"
          >
        </div>
        <div class="form-group">
          <label>API URL</label>
          <input 
            type="text" 
            v-model="apiUrl"
            :disabled="!useCustomAPI"
            placeholder="输入 API 地址"
          >
        </div>
        <div class="form-group">
          <label>选择模型</label>
          <select 
            v-model="selectedModel"
            :disabled="!useCustomAPI || useCustomModel"
          >
            <optgroup label="国产模型">
              <option value="qwen-turbo">通义千问 Turbo</option>
              <option value="qwen-plus">通义千问 Plus</option>
              <option value="qwen-max">通义千问 Max</option>
              <option value="baichuan-turbo">百川 Turbo</option>
              <option value="baichuan-plus">百川 Plus</option>
              <option value="chatglm-turbo">智谱 ChatGLM Turbo</option>
              <option value="chatglm-pro">智谱 ChatGLM Pro</option>
              <option value="spark-desk">讯飞星火认知</option>
              <option value="deepseek-r1">DeepSeek R1</option>
              <option value="deepseek-v3">DeepSeek V3</option>
            </optgroup>
            <optgroup label="OpenAI 模型">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </optgroup>
          </select>
        </div>
        
        <div class="custom-model-toggle">
          <label class="toggle">
            <input 
              type="checkbox" 
              v-model="useCustomModel"
              :disabled="!useCustomAPI"
            >
            <span class="slider"></span>
          </label>
          <span>使用自定义模型</span>
        </div>

        <div v-if="useCustomModel" class="form-group">
          <label>自定义模型名称</label>
          <input 
            type="text" 
            v-model="customModelName"
            :disabled="!useCustomAPI"
            placeholder="输入模型名称（如：my-model-v1）"
          >
        </div>
      
        <div class="setting-actions">
          <button 
            class="btn-primary" 
            :disabled="!useCustomAPI || !canSave"
            @click="saveSettings"
          >
            保存设置
          </button>
          <button 
            class="btn-secondary" 
            :disabled="!useCustomAPI || !canTest"
            @click="testConnection"
          >
            测试连接
          </button>
          <button 
            class="btn-danger" 
            :disabled="!hasSettings"
            @click="confirmClearSettings"
          >
            清除设置
          </button>
        </div>
      </div>

      <div v-if="testResult" :class="['test-result', testResult.status]">
        {{ testResult.message }}
      </div>

      <!-- 清除确认对话框 -->
      <div v-if="showClearConfirm" class="confirm-dialog">
        <div class="confirm-content">
          <h3>确认清除设置？</h3>
          <p>这将清除所有自定义 API 设置，此操作不可撤销。</p>
          <div class="confirm-actions">
            <button class="btn-danger" @click="clearSettings">确认清除</button>
            <button class="btn-secondary" @click="showClearConfirm = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { saveApiSettings, getApiSettings, clearApiSettings } from '@/services/storageService';
import { testApiConnection } from '@/services/aiService';

const emit = defineEmits(['update:apiSettings']);

// 状态变量
const useCustomAPI = ref(false);
const apiKey = ref('');
const apiUrl = ref('');
const selectedModel = ref('qwen-turbo');
const useCustomModel = ref(false);
const customModelName = ref('');
const testResult = ref(null);
const showClearConfirm = ref(false);
const systemModel = ref('qwen-turbo'); // 新增：系统默认模型选择
const showModelDropdown = ref(false);

// 系统模型定义
const systemModels = [
  {
    value: 'qwen-turbo',
    name: '通义千问 Turbo',
    tag: 'Turbo',
    tagClass: 'turbo',
    description: '响应最快，但可能出现对仗不工整，不建议用于诗歌和俳句创作'
  },
  {
    value: 'qwen-plus',
    name: '通义千问 Plus',
    tag: 'Plus',
    tagClass: 'plus',
    description: '响应速度和质量平衡，适合大多数场景'
  },
  {
    value: 'qwen-max',
    name: '通义千问 Max',
    tag: 'Max',
    tagClass: 'max',
    description: '响应较慢，但质量最高，适合需要高质量输出的场景'
  },
  {
    value: 'deepseek-r1',
    name: 'DeepSeek R1',
    tag: 'R1',
    tagClass: 'deepseek-r1',
    description: '响应较慢，但性能卓越，诗歌和俳句创作表现极佳'
  },
  {
    value: 'deepseek-v3',
    name: 'DeepSeek V3',
    tag: 'V3',
    tagClass: 'deepseek-v3',
    description: '响应适中，性能优秀，诗歌和俳句创作表现良好'
  }
];

// 计算属性
const canSave = computed(() => {
  const hasCustomModel = useCustomModel.value ? customModelName.value.trim() !== '' : true;
  return useCustomAPI.value && apiKey.value && apiUrl.value && 
         (useCustomModel.value ? customModelName.value : selectedModel.value) && hasCustomModel;
});

const canTest = computed(() => {
  return useCustomAPI.value && apiKey.value && apiUrl.value && 
         (useCustomModel.value ? customModelName.value : selectedModel.value);
});

const hasSettings = computed(() => {
  return apiKey.value || apiUrl.value || customModelName.value;
});

const selectedModelInfo = computed(() => {
  return systemModels.find(model => model.value === systemModel.value) || systemModels[0];
});

// 方法
async function loadSettings() {
  try {
    const settings = await getApiSettings();
    if (settings) {
      useCustomAPI.value = settings.useCustomAPI;
      
      if (settings.useCustomAPI) {
        apiKey.value = settings.apiKey || '';
        apiUrl.value = settings.apiUrl || '';
        useCustomModel.value = settings.isCustomModel || false;
        if (settings.isCustomModel) {
          customModelName.value = settings.model || '';
        } else {
          selectedModel.value = settings.model || 'qwen-turbo';
        }
      } else {
        // 加载系统默认API设置
        systemModel.value = settings.model || 'qwen-turbo';
      }
    }
  } catch (error) {
    console.error('加载API设置失败:', error);
  }
}

async function handleAPIToggle(event) {
  useCustomAPI.value = event.target.checked;
  
  // 如果启用但设置不完整，显示提示
  if (event.target.checked && !canSave.value) {
    testResult.value = { 
      status: 'warning', 
      message: '请完善API设置并点击保存按钮' 
    };
  } else {
    testResult.value = null;
  }
}

function confirmClearSettings() {
  showClearConfirm.value = true;
}

async function clearSettings() {
  // 清除所有设置
  apiKey.value = '';
  apiUrl.value = '';
  selectedModel.value = 'qwen-turbo';
  useCustomModel.value = false;
  customModelName.value = '';
  useCustomAPI.value = false;
  systemModel.value = 'qwen-turbo';
  testResult.value = null;
  
  await clearApiSettings();
  emit('update:apiSettings', null);
  
  showClearConfirm.value = false;
  testResult.value = { status: 'success', message: '设置已清除！' };
}

async function saveSettings() {
  if (!canSave.value) return;

  const settings = {
    useCustomAPI: useCustomAPI.value,
    apiKey: apiKey.value,
    apiUrl: apiUrl.value,
    model: useCustomModel.value ? customModelName.value : selectedModel.value,
    isCustomModel: useCustomModel.value
  };

  try {
    await saveApiSettings(settings);
    emit('update:apiSettings', settings);
    testResult.value = { status: 'success', message: '设置保存成功！' };
  } catch (error) {
    testResult.value = { status: 'error', message: '设置保存失败：' + error.message };
  }
}

// 新增：保存系统默认API设置
async function saveSystemSettings() {
  const settings = {
    useCustomAPI: false,
    apiKey: 'system_key',
    apiUrl: 'system_end_point',
    model: systemModel.value,
    isCustomModel: false
  };

  try {
    await saveApiSettings(settings);
    emit('update:apiSettings', settings);
    testResult.value = { status: 'success', message: '系统API设置保存成功！' };
  } catch (error) {
    testResult.value = { status: 'error', message: '设置保存失败：' + error.message };
  }
}

async function testConnection() {
  if (!canTest.value) return;
  
  testResult.value = { status: 'testing', message: '正在测试连接...' };
  
  try {
    const settings = {
      apiKey: apiKey.value.trim(),
      apiUrl: apiUrl.value.trim(),
      model: useCustomModel.value ? customModelName.value : selectedModel.value
    };
    
    const result = await testApiConnection(settings);
    testResult.value = { 
      status: 'success', 
      message: `${result.message} 模型：${result.model} ✅` 
    };
  } catch (error) {
    testResult.value = { 
      status: 'error', 
      message: error.message + ' ❌'
    };
  }
}

function selectModel(modelValue) {
  systemModel.value = modelValue;
  showModelDropdown.value = false;
}

// 点击外部关闭下拉菜单
function closeDropdownOnOutsideClick(event) {
  const dropdown = document.querySelector('.custom-dropdown');
  if (dropdown && !dropdown.contains(event.target) && showModelDropdown.value) {
    showModelDropdown.value = false;
  }
}

// 监听系统模型变化，自动保存设置
watch(systemModel, async (newModel) => {
  if (!useCustomAPI.value) {
    const settings = {
      useCustomAPI: false,
      apiKey: 'system_key',
      apiUrl: 'system_end_point',
      model: newModel,
      isCustomModel: false
    };

    try {
      await saveApiSettings(settings);
      emit('update:apiSettings', settings);
      testResult.value = { status: 'success', message: '系统模型已更新为：' + newModel };
    } catch (error) {
      testResult.value = { status: 'error', message: '设置保存失败：' + error.message };
    }
  }
});

// 监听自定义模型变化，自动保存设置
watch(selectedModel, async (newModel) => {
  if (useCustomAPI.value && !useCustomModel.value && canSave.value) {
    const settings = {
      useCustomAPI: true,
      apiKey: apiKey.value,
      apiUrl: apiUrl.value,
      model: newModel,
      isCustomModel: false
    };

    try {
      await saveApiSettings(settings);
      emit('update:apiSettings', settings);
      testResult.value = { status: 'success', message: '自定义模型已更新为：' + newModel };
    } catch (error) {
      testResult.value = { status: 'error', message: '设置保存失败：' + error.message };
    }
  }
});

// 生命周期钩子
onMounted(() => {
  loadSettings();
  document.addEventListener('click', closeDropdownOnOutsideClick);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick);
});
</script>

<style scoped>
.api-config {
  padding: var(--spacing-sm);
}

.setting-group {
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
}

.setting-header {
  margin-bottom: var(--spacing-sm);
}

.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.setting-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.setting-fields.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
  transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.setting-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
}

.btn-primary,
.btn-secondary {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--border-color);
  color: var(--text-color);
}

.btn-primary:hover:not(:disabled),
.btn-secondary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: var(--error-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-content {
  background: var(--bg-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.confirm-content h3 {
  margin: 0 0 var(--spacing-sm);
  color: var(--text-color);
}

.confirm-content p {
  margin: 0 0 var(--spacing-md);
  color: var(--text-secondary);
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .setting-actions {
    flex-direction: column;
  }
  
  .confirm-content {
    width: 95%;
    padding: var(--spacing-md);
  }
  
  .confirm-actions {
    flex-direction: column;
  }
  
  .confirm-actions button {
    width: 100%;
  }
}

.custom-model-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.test-result {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  text-align: center;
}

.test-result.testing {
  background-color: var(--bg-warning);
  color: var(--text-warning);
}

.test-result.success {
  background-color: var(--bg-success);
  color: var(--text-success);
}

.test-result.error {
  background-color: var(--bg-error);
  color: var(--text-error);
}

.test-result.warning {
  background-color: var(--bg-warning);
  color: var(--text-warning);
}

optgroup {
  font-weight: 600;
  color: var(--text-secondary);
}

option {
  color: var(--text-color);
}

/* 系统API相关样式 */
.system-api-info {
  display: flex;
  gap: var(--spacing-sm);
  background-color: rgba(123, 158, 137, 0.1);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-sm);
}

.info-icon {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.info-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.model-selection-panel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.model-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 36px;
}

.model-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.model-detail-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.model-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.model-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color), var(--shadow-md);
}

.model-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.model-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
}

.model-card-body {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.model-card-body p {
  margin: 0;
}

.model-tag {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  min-width: 50px;
  text-align: center;
}

.model-tag.turbo {
  background-color: #4caf50;
}

.model-tag.plus {
  background-color: #2196f3;
}

.model-tag.max {
  background-color: #9c27b0;
}

.model-tag.deepseek-r1 {
  background-color: #ff9800;
}

.model-tag.deepseek-v3 {
  background-color: #2196f3;
}

@media (max-width: 480px) {
  .model-selection-panel {
    grid-template-columns: 1fr;
  }
}

.custom-dropdown {
  position: relative;
  margin-bottom: var(--spacing-md);
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--card-bg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.dropdown-header:hover {
  border-color: var(--primary-color);
}

.selected-model {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.dropdown-header i {
  transition: transform 0.3s ease;
}

.dropdown-header i.rotate {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: var(--shadow-md);
  margin-top: 4px;
}

.dropdown-option {
  padding: var(--spacing-md);
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background-color: rgba(123, 158, 137, 0.05);
}

.dropdown-option.active {
  background-color: rgba(123, 158, 137, 0.1);
  border-left: 3px solid var(--primary-color);
}

.option-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.option-body {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  padding-left: calc(50px + var(--spacing-sm)); /* 对齐标签宽度 + 间距 */
}
</style>
