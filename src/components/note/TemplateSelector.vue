<template>
  <div class="template-tab">
    <!-- 添加选项卡切换 -->
    <div class="template-mode-tabs">
      <button 
        class="mode-tab" 
        :class="{ active: templateMode === 'normal' }"
        @click="templateMode = 'normal'"
      >
        <i class="fas fa-sticky-note"></i> 纸条模板
      </button>
      <button 
        class="mode-tab" 
        :class="{ active: templateMode === 'h5' }"
        @click="templateMode = 'h5'"
      >
        <i class="fas fa-mobile-alt"></i> H5模板 <span class="new-badge" v-if="!h5TabClicked">新</span>
      </button>
    </div>
    
    <!-- 普通纸条模板选项 -->
    <div class="template-options" v-if="templateMode === 'normal'">
      <div 
        v-for="template in normalTemplates" 
        :key="template.id"
        :class="[
          'template-option', 
          { 
            active: modelValue === template.id,
            disabled: template.disabled
          }
        ]"
        @click="template.disabled ? handleDisabledClick(template) : selectTemplate(template.id)"
      >
        <div class="template-preview-container">
          <component 
            :is="template.component" 
            v-if="template.component"
            :active="modelValue === template.id"
            :disabled="template.disabled"
            :isPreview="true"
          />
          <div v-else class="template-preview" :style="getTemplatePreviewStyle(template)">
            <component 
              :is="template.previewComponent" 
              v-if="template.previewComponent"
              class="preview-component"
            />
            <div v-else class="preview-fallback">
              <div 
                v-if="template.previewStructure"
                v-for="(element, index) in template.previewStructure" 
                :key="index"
                :class="[
                  'preview-element',
                  `element-type-${element.type || 'default'}`,
                  `element-position-${element.position || 'center'}`
                ]"
              ></div>
            </div>
          </div>
          <div class="template-badge" v-if="template.isNew">新</div>
        </div>
        <span>{{ template.label }}</span>
        <small v-if="template.note" class="template-note">
          ({{ template.note }})
        </small>
      </div>
    </div>
    
    <!-- H5模板选项 -->
    <div class="template-options" v-else-if="templateMode === 'h5'">
      <div 
        v-for="template in h5Templates" 
        :key="template.id"
        :class="[
          'template-option', 
          { 
            active: modelValue === template.id,
            disabled: template.disabled
          }
        ]"
        @click="template.disabled ? handleDisabledClick(template) : selectTemplate(template.id)"
      >
        <div class="template-preview-container">
          <component 
            :is="template.component" 
            v-if="template.component"
            :active="modelValue === template.id"
            :disabled="template.disabled"
            :isPreview="true"
            :content="'H5效果预览'"
            :moods="['😊']"
          />
          <div class="template-badge" v-if="template.isNew">新</div>
        </div>
        <span>{{ template.label }}</span>
        <small v-if="template.note" class="template-note">
          ({{ template.note }})
        </small>
      </div>
    </div>
    
    <div class="template-info" v-if="infoMessage">
      <i class="fas fa-info-circle"></i>
      <span>{{ infoMessage }}</span>
    </div>
    
    <!-- H5模板信息提示 -->
    <div class="template-info h5-info" v-if="templateMode === 'h5'">
      <i class="fas fa-lightbulb"></i>
      <span>H5模板提供更丰富的视觉效果，适合分享到社交媒体</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, toRefs, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
// 导入模板集合
import { templateList, h5TemplateList } from '../templates';

// Props
const props = defineProps({
  // 当前选中的模板ID
  modelValue: {
    type: String,
    required: true
  },
  // 图片URL，用于判断是否有图片可用
  imageUrl: {
    type: String,
    default: ''
  },
  // 可以接收外部定义的模板列表
  templates: {
    type: Array,
    default: () => []
  },
  // 是否使用默认模板（如果没有提供自定义模板）
  useDefaultTemplates: {
    type: Boolean,
    default: true
  },
  // 自定义信息文本
  customInfoMessage: {
    type: String,
    default: ''
  }
});

// 解构props以便在计算属性中使用
const { imageUrl, templates, useDefaultTemplates, customInfoMessage } = toRefs(props);

// Emits
const emit = defineEmits([
  'update:modelValue',  // 更新选中的模板
  'template-action',    // 通用模板操作事件
  'need-resource'       // 模板需要资源事件（例如需要上传图片）
]);

// 当前模板模式：普通或H5
const templateMode = ref('normal');
const h5TabClicked = ref(false);
const router = useRouter();

// 监听H5标签页点击
watch(templateMode, (newMode) => {
  if (newMode === 'h5') {
    h5TabClicked.value = true;
  }
});

// 计算属性：普通模板列表
const normalTemplates = computed(() => {
  // 使用自定义模板或导入的组件模板
  const templateListToUse = templates.value.length > 0 ? 
    templates.value.filter(t => !t.isH5) : 
    (useDefaultTemplates.value ? templateList : []);
  
  // 处理模板可用性和附加信息
  return templateListToUse.map(template => {
    // 检查是否需要图片但图片不可用
    const disabled = template.requiresImage && !imageUrl.value;
    
    // 根据模板状态添加提示信息
    let note = template.note;
    if (template.id === 'paper' && imageUrl.value) {
      note = '将移除图片';
    } else if (template.requiresImage && !imageUrl.value) {
      note = '需要上传图片';
    }
    
    return {
      ...template,
      disabled,
      note
    };
  });
});

// 计算属性：H5模板列表
const h5Templates = computed(() => {
  // 使用H5模板列表
  return h5TemplateList.map(template => {
    // 检查是否需要图片但图片不可用
    const disabled = template.requiresImage && !imageUrl.value;
    
    // 根据模板状态添加提示信息
    let note = template.note;
    if (template.requiresImage && !imageUrl.value) {
      note = '需要上传图片';
    }
    
    return {
      ...template,
      disabled,
      note
    };
  });
});

// 计算属性：信息提示消息
const infoMessage = computed(() => {
  if (customInfoMessage.value) {
    return customInfoMessage.value;
  }
  
  // 默认信息
  if (imageUrl.value && templateMode.value === 'normal') {
    return '选择"纸条"模板将移除已上传的图片';
  }
  
  return '';
});

// 方法：选择模板
function selectTemplate(templateId) {
  // 检查是否选择了H5模板
  const isH5Template = templateMode.value === 'h5';
  
  // 先发送更新事件
  emit('update:modelValue', templateId);
  
  // 发送带有更多信息的通用事件
  emit('template-action', {
    type: 'select',
    templateId,
    template: [...normalTemplates.value, ...h5Templates.value].find(t => t.id === templateId),
    isH5: isH5Template
  });
  
  // 如果是H5模板类型，导航到H5设置页面
  if (templateMode.value === 'h5') {
    console.log('选择了H5模板:', templateId);
    // 导航到H5设置页面
    router.push('/h5-settings');
    return;
  }
}

// 处理禁用模板的点击
function handleDisabledClick(template) {
  if (template.requiresImage && !imageUrl.value) {
    emit('need-resource', {
      type: 'image',
      templateId: template.id,
      reason: 'required-for-template'
    });
  } else {
    // 其他禁用原因的处理
    emit('template-action', {
      type: 'disabled-click',
      templateId: template.id,
      template
    });
  }
}

// 获取模板预览样式
function getTemplatePreviewStyle(template) {
  const baseStyles = {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    overflow: 'hidden'
  };
  
  // 使用模板自定义背景或默认背景
  if (template.previewBackground) {
    return {
      ...baseStyles,
      background: template.previewBackground
    };
  }
  
  // 默认样式
  return baseStyles;
}
</script>

<style scoped>
/* 模板模式标签页 */
.template-mode-tabs {
  display: flex;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-xs);
}

.mode-tab {
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
  position: relative;
}

.mode-tab i {
  font-size: 14px;
}

.mode-tab.active {
  background-color: var(--primary-color-light);
  color: var(--primary-color);
  font-weight: 500;
}

.new-badge {
  position: absolute;
  top: -8px;
  right: -5px;
  background-color: #FF5722;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: bold;
}

/* 模板选项样式 */
.template-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.template-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
}

.template-option:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.template-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.template-preview-container {
  width: 80px;
  height: 100px;
  margin-bottom: var(--spacing-xs);
  position: relative;
}

.template-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #FF5722;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: bold;
}

.template-preview {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-color);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.template-option.active .template-preview {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-option span {
  font-size: 14px;
  color: var(--text-color);
  margin-bottom: 4px;
  text-align: center;
}

.template-option.active span {
  color: var(--primary-color);
  font-weight: 500;
}

.template-note {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

/* 预览元素样式 */
.preview-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--card-bg);
}

.preview-element {
  background-color: var(--border-color);
  border-radius: var(--radius-xs);
}

.element-type-header {
  width: 80%;
  height: 10px;
  margin-bottom: 10px;
}

.element-type-content {
  width: 90%;
  height: 50px;
}

.element-type-footer {
  width: 80%;
  height: 10px;
  margin-top: 10px;
}

.element-position-center {
  align-self: center;
}

.element-position-left {
  align-self: flex-start;
  margin-left: 5px;
}

.element-position-right {
  align-self: flex-end;
  margin-right: 5px;
}

/* 信息提示样式 */
.template-info {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--info-bg);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  color: var(--info-color);
}

.h5-info {
  background-color: var(--primary-color-lighter);
  color: var(--primary-color);
}

.template-info i {
  font-size: 16px;
  color: var(--info-icon);
}

.h5-info i {
  color: var(--primary-color);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .template-options {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .template-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mode-tab {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 12px;
  }
  
  .template-preview-container {
    width: 70px;
    height: 85px;
  }
}
</style> 