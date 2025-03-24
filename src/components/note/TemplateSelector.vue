<template>
  <div class="template-tab">
    <div class="template-options">
      <div 
        v-for="template in availableTemplates" 
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
    
    <div class="template-info" v-if="infoMessage">
      <i class="fas fa-info-circle"></i>
      <span>{{ infoMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, toRefs } from 'vue';
// 导入模板集合
import { templateList } from '../templates';

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

// 计算属性：可用的模板列表
const availableTemplates = computed(() => {
  // 使用自定义模板或导入的组件模板
  const templateListToUse = templates.value.length > 0 ? templates.value : 
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

// 计算属性：信息提示消息
const infoMessage = computed(() => {
  if (customInfoMessage.value) {
    return customInfoMessage.value;
  }
  
  // 默认信息
  if (imageUrl.value) {
    return '选择"纸条"模板将移除已上传的图片';
  }
  
  return '';
});

// 方法：选择模板
function selectTemplate(templateId) {
  emit('update:modelValue', templateId);
  // 也发送带有更多信息的通用事件
  emit('template-action', {
    type: 'select',
    templateId,
    template: availableTemplates.value.find(t => t.id === templateId)
  });
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
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-component,
.preview-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-option span {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.template-option.active span {
  color: var(--primary-color);
  font-weight: 500;
}

.template-note {
  font-size: 10px;
  color: #B54A4A;
  margin-top: 2px;
}

.template-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-secondary);
}

.template-info i {
  color: var(--primary-color);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .template-options {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .template-preview-container {
    width: 60px;
    height: 75px;
  }
  
  .template-option span {
    font-size: 11px;
  }
  
  .template-note {
    font-size: 9px;
  }
}

@media (min-width: 768px) {
  .template-options {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 