<template>
  <div class="h5-display-container" ref="displayContainerRef">
    <!-- H5卡片展示区域 -->
    <div class="h5-card-container" :style="containerStyle">
      <component 
        :is="currentTemplateComponent" 
        v-if="currentTemplateComponent"
        :content="displayContent"
        :moods="moodsArray"
        :has-custom-image="hasCustomImage"
        :custom-style="customStyle"
        :mood-style="moodStyle"
        :mood-container-style="moodContainerStyle"
        :content-style="contentStyle"
        :image-layer-style="imageLayerStyle"
        v-bind="templateSpecificProps"
        ref="h5CardRef"
      />
    </div>
    
    <!-- 控制面板 -->
    <div class="controls-panel" v-if="showControls">
      <!-- 模板选择器 -->
      <div class="template-selector">
        <h4>选择模板样式</h4>
        <div class="template-options">
          <div 
            v-for="template in templates" 
            :key="template.id"
            :class="['template-option', { active: currentTemplate === template.id }]"
            @click="updateTemplate(template.id)"
          >
            <div class="template-thumbnail">
              <component 
                :is="template.component" 
                :is-preview="true"
                :active="currentTemplate === template.id"
                :content="template.previewContent || '预览文本'"
                :moods="['😊']"
              />
            </div>
            <span class="template-name">{{ template.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 样式调整控制 -->
      <div class="style-controls">
        <h4>样式调整</h4>
        <div class="control-group">
          <label>字体大小</label>
          <div class="slider-control">
            <input 
              type="range" 
              min="14" 
              max="36" 
              step="1" 
              v-model.number="fontSize"
              @input="updateFontSize"
            >
            <span class="value-display">{{ fontSize }}px</span>
          </div>
        </div>
        
        <div class="control-group">
          <label>背景透明度</label>
          <div class="slider-control">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              v-model.number="bgOpacity"
              @input="updateBgOpacity"
            >
            <span class="value-display">{{ Math.round(bgOpacity * 100) }}%</span>
          </div>
        </div>
        
        <div class="control-group">
          <label>表情气泡</label>
          <div class="switch-control">
            <input 
              type="checkbox" 
              id="emoji-toggle" 
              v-model="showEmoji"
              @change="updateEmojiDisplay"
            >
            <label for="emoji-toggle" class="toggle-switch"></label>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-outline" @click="resetStyle">
          <i class="fas fa-undo"></i> 重置样式
        </button>
        <button class="btn btn-primary" @click="exportImage">
          <i class="fas fa-download"></i> 保存图片
        </button>
      </div>
    </div>
    
    <!-- 样式定制器弹窗 -->
    <div class="style-customizer-modal" v-if="showStyleCustomizer">
      <div class="modal-overlay" @click="showStyleCustomizer = false"></div>
      <div class="modal-content">
        <!-- 这里可以引入自定义样式编辑器组件 -->
        <h3>高级样式定制</h3>
        <!-- 高级样式编辑器内容 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUpdate, onActivated, inject } from 'vue';
import CalendarH5Template from '../templates/h5/CalendarH5Template.vue';
import SimpleCardH5Template from '../templates/h5/SimpleCardH5Template.vue';
import EmotionalH5Template from '../templates/h5/EmotionalH5Template.vue';
import html2canvas from 'html2canvas';
import { h5TemplateList } from '../templates';

// 定义H5模板映射对象
const h5TemplateComponents = {
  'calendar-h5': CalendarH5Template,
  'simple-card-h5': SimpleCardH5Template,
  'emotional-h5': EmotionalH5Template
};

// Props
const props = defineProps({
  initialTemplate: {
    type: String,
    default: 'calendar-h5'  // 默认使用日历模板
  },
  initialStyle: {
    type: Object,
    default: () => ({})
  },
  showControls: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits([
  'update:template',
  'update:style',
  'export'
]);

// 内部状态
const displayContainerRef = ref(null);
const h5CardRef = ref(null);
const currentTemplate = ref(props.initialTemplate);
const customStyle = ref({...props.initialStyle});
const fontSize = ref(props.initialStyle.fontSize || 24);
const bgOpacity = ref(props.initialStyle.bgOpacity || 1);
const showEmoji = ref(props.initialStyle.showEmojiBubble !== false);
const showStyleCustomizer = ref(false);
// 添加forceTrigger标志，用于强制刷新计算属性
const forceTrigger = ref(Date.now());

// 从全局状态中获取笔记内容和表情
const globalNoteContent = inject('noteContent', ref(''));
const globalNoteMood = inject('noteMood', ref(''));

// 刷新内容方法
function refreshContent() {
  console.log('手动刷新内容');
  // 更新强制刷新标志
  forceTrigger.value = Date.now();
  
  // 尝试从localStorage重新读取内容和表情
  try {
    const savedContent = localStorage.getItem('soulnote_last_content');
    const savedMood = localStorage.getItem('soulnote_last_mood');
    
    if (savedContent && !globalNoteContent.value) {
      console.log('强制刷新: 从localStorage更新内容');
      globalNoteContent.value = savedContent;
    }
    
    if (savedMood && !globalNoteMood.value) {
      console.log('强制刷新: 从localStorage更新表情');
      globalNoteMood.value = savedMood;
    }
  } catch (error) {
    console.error('刷新内容过程中读取localStorage失败:', error);
  }
}

// 日历模板的固定日期信息
const calendarDateInfo = computed(() => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    weekday: now.getDay(),
    // 其他信息将由CalendarH5Template组件自行获取
    lunarDate: '',
    solarTerm: ''
  };
});

// 计算实际显示的内容
const displayContent = computed(() => {
  // forceTrigger变量确保计算属性在刷新时强制重新计算
  const _ = forceTrigger.value;
  
  // 处理content标签
  const processContent = (content) => {
    if (!content) return '';
    
    // 检查是否有content标签
    const contentMatch = content.match(/<content>([\s\S]*?)<\/content>/i);
    if (contentMatch && contentMatch[1]) {
      // 返回content标签内的内容
      return contentMatch[1].trim();
    }
    
    return content;
  };

  console.log('重新计算显示内容', globalNoteContent.value ? '有全局内容' : '无全局内容');
  
  // 首先检查全局内容
  if (globalNoteContent.value) {
    return processContent(globalNoteContent.value);
  }
  
  // 如果全局内容为空，尝试从localStorage读取
  try {
    const savedContent = localStorage.getItem('soulnote_last_content');
    if (savedContent) {
      console.log('从localStorage读取到内容');
      return processContent(savedContent);
    }
  } catch (error) {
    console.error('读取localStorage内容失败:', error);
  }
  
  // 如果都没有，显示默认提示
  return '请先在主页生成一条心语，然后来这里制作精美的H5作品';
});

// 计算实际显示的表情
const displayMood = computed(() => {
  // forceTrigger变量确保计算属性在刷新时强制重新计算
  const _ = forceTrigger.value;
  
  console.log('重新计算显示表情', globalNoteMood.value ? '有全局表情' : '无全局表情');
  
  // 首先检查全局表情
  if (globalNoteMood.value) {
    return globalNoteMood.value;
  }
  
  // 如果全局表情为空，尝试从localStorage读取
  try {
    const savedMood = localStorage.getItem('soulnote_last_mood');
    if (savedMood) {
      console.log('从localStorage读取到表情');
      return savedMood;
    }
  } catch (error) {
    console.error('读取localStorage表情失败:', error);
  }
  
  return '';
});

// 计算将mood字符串转换为数组
const moodsArray = computed(() => {
  if (!displayMood.value) return [];
  
  // 处理Unicode表情符号
  const emojiRegex = /\p{Emoji}/gu;
  const emojis = displayMood.value.match(emojiRegex);
  return emojis || Array.from(displayMood.value);
});

// 计算当前模板组件
const currentTemplateComponent = computed(() => {
  return h5TemplateComponents[currentTemplate.value] || CalendarH5Template;
});

// 计算模板特定的动态props
const templateSpecificProps = computed(() => {
  // 为不同模板类型返回不同的额外props
  if (currentTemplate.value === 'calendar-h5') {
    return { 
      dateInfo: calendarDateInfo.value,
      // 不覆盖表情气泡相关属性
    };
  }
  return {};
});

// 计算容器样式
const containerStyle = computed(() => {
  return {
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    borderRadius: '20px',
    overflow: 'hidden'
  };
});

// 计算是否有自定义图片
const hasCustomImage = computed(() => {
  return (customStyle.value?.imageUrl && customStyle.value.imageUrl !== '') ||
         (customStyle.value?.defaultBgPath && customStyle.value.defaultBgPath !== '');
});

// 计算图片层样式
const imageLayerStyle = computed(() => {
  if (!hasCustomImage.value) return {};
  
  const imageUrl = customStyle.value?.imageUrl || customStyle.value?.defaultBgPath || '';
  
  return {
    backgroundImage: `url(${imageUrl})`,
    opacity: customStyle.value.imageOpacity || bgOpacity.value,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: customStyle.value.imageFilter?.style || ''
  };
});

// 计算内容样式
const contentStyle = computed(() => {
  return {
    fontSize: `${fontSize.value}px`,
    fontFamily: customStyle.value?.fontFamily || "'KaitiLocal', 'Kaiti', '楷体', 'STKaiti', '华文楷体', sans-serif",
    color: customStyle.value?.textColor || '#333333',
    textAlign: customStyle.value?.textPosition || 'center',
    textShadow: customStyle.value?.textShadow ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none'
  };
});

// 计算表情容器样式
const moodContainerStyle = computed(() => {
  if (!showEmoji.value) return { display: 'none' };
  
  return {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '20px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
  };
});

// 计算表情样式
const moodStyle = computed(() => {
  return {
    fontSize: '20px',
    lineHeight: '1'
  };
});

// 可用的模板列表 - 只保留需要的H5模板
const templates = computed(() => {
  return h5TemplateList.filter(template => 
    ['calendar-h5', 'simple-card-h5', 'emotional-h5'].includes(template.id)
  );
});

// 方法
function updateTemplate(templateId) {
  currentTemplate.value = templateId;
  emit('update:template', templateId);
  
  // 更新整体自定义样式
  const updatedStyle = {
    ...customStyle.value,
    template: templateId
  };
  
  customStyle.value = updatedStyle;
  emit('update:style', updatedStyle);
}

function updateFontSize() {
  const updatedStyle = {
    ...customStyle.value,
    fontSize: fontSize.value
  };
  
  customStyle.value = updatedStyle;
  emit('update:style', updatedStyle);
}

function updateBgOpacity() {
  const updatedStyle = {
    ...customStyle.value,
    bgOpacity: bgOpacity.value,
    imageOpacity: bgOpacity.value
  };
  
  customStyle.value = updatedStyle;
  emit('update:style', updatedStyle);
}

function updateEmojiDisplay() {
  const updatedStyle = {
    ...customStyle.value,
    showEmojiBubble: showEmoji.value
  };
  
  customStyle.value = updatedStyle;
  emit('update:style', updatedStyle);
}

function resetStyle() {
  // 重置为默认样式
  fontSize.value = 24;
  bgOpacity.value = 1;
  showEmoji.value = true;
  
  const defaultStyle = {
    fontSize: 24,
    bgOpacity: 1,
    showEmojiBubble: true,
    template: currentTemplate.value
  };
  
  customStyle.value = defaultStyle;
  emit('update:style', defaultStyle);
}

function exportImage() {
  if (!h5CardRef.value) return;
  
  const element = h5CardRef.value.$el;
  
  // 配置导出选项
  const exportOptions = {
    backgroundColor: customStyle.value.transparentBg ? null : '#ffffff',
    scale: 2, // 高分辨率导出
    useCORS: true,
    allowTaint: true
  };
  
  html2canvas(element, exportOptions).then(canvas => {
    emit('export', {
      canvas,
      element,
      style: customStyle.value
    });
    
    // 自动下载图片
    const link = document.createElement('a');
    link.download = `h5-card-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// 生命周期钩子
onMounted(() => {
  console.log('H5Display组件已挂载，刷新内容');
  refreshContent();
  
  // 创建一个定时器，每分钟更新日期信息
  const dateUpdateTimer = setInterval(() => {
    // 强制刷新
    forceTrigger.value = Date.now();
  }, 60000); // 每分钟更新一次
  
  // 组件卸载时清除定时器
  return () => {
    clearInterval(dateUpdateTimer);
  };
});

onBeforeUpdate(() => {
  console.log('H5Display组件即将更新，刷新内容');
  refreshContent();
});

onActivated(() => {
  console.log('H5Display组件被激活，刷新内容');
  refreshContent();
});

// 监听全局内容和表情变化
watch([globalNoteContent, globalNoteMood], () => {
  console.log('全局内容或表情变化，刷新内容');
  refreshContent();
});

// 监听props变化
watch(() => props.initialStyle, (newStyle) => {
  if (newStyle && Object.keys(newStyle).length > 0) {
    customStyle.value = {...newStyle};
    fontSize.value = newStyle.fontSize || 24;
    bgOpacity.value = newStyle.bgOpacity || 1;
    showEmoji.value = newStyle.showEmojiBubble !== false;
  }
}, { immediate: true });

watch(() => props.initialTemplate, (newTemplate) => {
  if (newTemplate) {
    currentTemplate.value = newTemplate;
  }
}, { immediate: true });
</script>

<style scoped>
.h5-display-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
}

.h5-card-container {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 9 / 16;
  margin: 0 auto;
  overflow: hidden;
}

.controls-panel {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h4 {
  font-size: 16px;
  margin: var(--spacing-sm) 0;
  color: var(--text-color);
}

.template-options {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-md);
}

.template-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.template-option:hover {
  background-color: var(--hover-color);
}

.template-option.active {
  background-color: var(--primary-color-light);
}

.template-thumbnail {
  width: 60px;
  height: 90px;
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.template-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.template-option.active .template-name {
  color: var(--primary-color);
  font-weight: 500;
}

.style-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.control-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-group label {
  font-size: 14px;
  color: var(--text-secondary);
  flex: 1;
}

.slider-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 2;
}

.slider-control input[type="range"] {
  flex: 1;
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  appearance: none;
  outline: none;
}

.slider-control input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--primary-color);
  cursor: pointer;
}

.value-display {
  font-size: 14px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

.switch-control {
  display: flex;
  align-items: center;
}

.switch-control input[type="checkbox"] {
  display: none;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

input[type="checkbox"]:checked + .toggle-switch {
  background-color: var(--primary-color);
}

input[type="checkbox"]:checked + .toggle-switch::after {
  transform: translateX(20px);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn i {
  font-size: 14px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color-light);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-color-dark);
}

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
  max-height: 80%;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  padding: var(--spacing-md);
  overflow-y: auto;
}

/* 响应式样式 */
@media (max-width: 480px) {
  .h5-card-container {
    max-width: 320px;
  }
  
  .controls-panel {
    padding: var(--spacing-sm);
  }
  
  .template-options {
    gap: var(--spacing-sm);
  }
  
  .template-thumbnail {
    width: 50px;
    height: 75px;
  }
  
  .btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 12px;
  }
}
</style> 