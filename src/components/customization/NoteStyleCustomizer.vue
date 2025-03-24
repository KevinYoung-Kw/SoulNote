<template>
  <div class="style-customizer-container">
    <div class="customizer-header">
      <h3>自定义样式</h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="tabs-container">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>
      
      <div class="tab-content">
        <!-- 模板选择标签页 -->
        <div v-if="activeTab === 'layout'" class="layout-tab">
          <TemplateSelector 
            :model-value="currentStyle.layout"
            :image-url="currentStyle.imageUrl || currentStyle.defaultBgPath"
            @update:model-value="updateTemplateHandler"
            @need-resource="handleResourceNeeded"
            @template-action="handleTemplateAction"
          />
          
          <!-- 使用解耦后的布局控制容器组件 -->
          <RatioAndMoodControls
            :layout="currentStyle.layout"
            :image-ratio="imageRatio"
            :text-ratio="textRatio"
            :split-direction="splitDirection"
            :mood-position="moodPosition"
            :show-emoji="showEmojiBubble"
            :show-mood-control="showMoodControl"
            @update:image-ratio="val => updateStyle({ imageRatio: val })"
            @update:text-ratio="val => updateStyle({ textRatio: val })"
            @update:split-direction="val => updateStyle({ splitDirection: val })"
            @update:mood-position="val => updateStyle({ moodPosition: val })"
            @update:show-emoji="val => updateStyle({ showEmojiBubble: val })"
          />
          
          <!-- 添加默认背景提示，当用户选择了默认背景但使用不兼容的模板时显示 -->
          <div class="template-info" v-if="currentStyle.defaultBgPath && !isTemplateCompatibleWithImage">
            <i class="fas fa-exclamation-circle"></i>
            <span>当前模板不会显示背景图片。请选择"图片背景"、"上图下文"、"下图上文"或"分屏布局"模板以显示背景图片。</span>
          </div>
        </div>
        
        <!-- 图片设置标签页 -->
        <div v-if="activeTab === 'image'" class="image-tab">
          <!-- 修改初始界面为选择新的背景图片 -->
          <div class="image-section">
            <h4>选择背景图片</h4>
            
            <div class="image-option-tabs">
              <button 
                class="image-option-tab" 
                @click="switchToDefaultBgs"
                :class="{ active: showDefaultBgs }"
              >
                <i class="fas fa-images"></i>
                <span>默认背景</span>
              </button>
              <button 
                class="image-option-tab" 
                @click="switchToUploader"
                :class="{ active: !showDefaultBgs }"
              >
                <i class="fas fa-upload"></i>
                <span>上传图片</span>
              </button>
            </div>
            
            <div v-if="showDefaultBgs" class="image-option-section">
              <DefaultBackgroundSelector
                v-model="selectedDefaultBg"
                @background-selected="handleDefaultBackgroundSelected"
              />
            </div>
            <div v-else class="image-option-section">
              <ImageUploader @image-selected="handleImageSelected" />
            </div>
            
            <!-- 已有图片时的设置界面 -->
            <div v-if="currentStyle.imageUrl || currentStyle.defaultBgPath" class="image-settings-section">
              <h4>当前背景设置</h4>
              <ImageSettingsControl
                :image-url="currentStyle.imageUrl"
                :default-bg-id="currentStyle.defaultBgId"
                :default-bg-path="currentStyle.defaultBgPath"
                :image-opacity="currentStyle.imageOpacity"
                :image-scale="currentStyle.imageScale"
                :image-filter="currentStyle.imageFilter"
                @update:settings="updateImageSettings"
                @remove-image="removeImage"
                @show-image-options="toggleImageOptions"
              >
                <template #filter-selector>
                  <ImageFilterSelector
                    :image-url="currentStyle.imageUrl || currentStyle.defaultBgPath"
                    :initial-filter="currentStyle.imageFilter?.id || 'none'"
                    :initial-intensity="currentStyle.imageFilter?.intensity || 0.5"
                    @update:filter="handleFilterUpdate"
                  />
                </template>
              </ImageSettingsControl>
            </div>
          </div>
        </div>
        
        <!-- 文字设置标签页 -->
        <div v-if="activeTab === 'text'" class="text-tab">
          <TextStyleCustomizer
            :model-value="textStyleData"
            :font-size-config="FONT_SIZE_CONFIG"
            @update:model-value="updateTextStyle"
          />
        </div>
      </div>
    </div>
    
    <div class="preview-toggle">
      <button @click="togglePreview" class="toggle-btn">
        <i :class="showPreview ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        <span>{{ showPreview ? '隐藏预览' : '显示预览' }}</span>
      </button>
    </div>
    
    <div class="preview-area" v-if="showPreview">
      <div class="preview-wrapper">
        <div class="preview-scale-container" ref="previewContainer">
          <NoteCard 
            :content="noteContent"
            :mood="noteMood"
            :custom-style="currentStyle"
            ref="noteCardRef"
          />
        </div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="btn btn-text" @click="resetStyle">
        <i class="fas fa-history"></i>
        <span>恢复默认设置</span>
      </button>
      <button class="btn btn-primary" @click="$emit('close')" v-if="!showPreview">
        <i class="fas fa-check"></i>
        <span>保存设置</span>
      </button>
      <button class="btn btn-success" @click="saveImage" v-if="showPreview">
        <i class="fas fa-image"></i>
        <span>保存图片</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import NoteCard from '../note/NoteCard.vue';
import ImageUploader from './ImageUploader.vue';
import html2canvas from 'html2canvas';
import { FONT_SIZE_CONFIG } from '../../config/style';
import ImageFilterSelector from './ImageFilterSelector.vue';
import TemplateSelector from '../note/TemplateSelector.vue';
import TextStyleCustomizer from './TextStyleCustomizer.vue';
import ImageSettingsControl from './ImageSettingsControl.vue';
import RatioAndMoodControls from '../layout/RatioAndMoodControls.vue';
import DefaultBackgroundSelector from './DefaultBackgroundSelector.vue';
import { convertSvgToImageUrl } from '../../utils/svgOptimizer';
import { templateList } from '../templates';

// Props
const props = defineProps({
  noteContent: {
    type: String,
    default: '在无限宇宙中，你是独一无二的星光。今天的每一步，都是内心力量的证明。'
  },
  noteMood: {
    type: String,
    default: ''
  },
  initialStyle: {
    type: Object,
    default: () => ({})
  },
  externalFontSize: {
    type: Number,
    default: 24
  }
});

// Emits
const emit = defineEmits(['close', 'update:style', 'export', 'update:customStyle']);

// 标签页
const activeTab = ref('layout');
const tabs = [
  { id: 'layout', label: '模板', icon: 'fas fa-th-large' },
  { id: 'image', label: '图片', icon: 'fas fa-image' },
  { id: 'text', label: '文字', icon: 'fas fa-font' }
];

// 添加防止循环更新的标志
const isExporting = ref(false);

// 添加一个防循环更新的标记
const isUpdatingStyle = ref(false);

// 默认样式
const defaultStyle = {
  layout: 'paper',
  background: 'paper-1',
  fontSize: props.externalFontSize,
  fontFamily: "'KaitiLocal', 'Kaiti', '楷体', 'STKaiti', '华文楷体', 'Noto Sans SC', sans-serif",
  textColor: '#000000',
  textShadow: false,
  textPosition: 'center',
  imageUrl: '',
  defaultBgId: '',
  defaultBgPath: '',
  imageOpacity: 1,
  imageScale: 1,
  preservePaperBg: false,
  showEmojiBubble: true,
  exportFormat: 'png',
  transparentBg: false,
  exportQuality: 1,
  imageRatio: 0.5,
  textRatio: 0.5,
  splitDirection: 'horizontal',
  moodPosition: 'default'
};

// 当前样式
const currentStyle = ref({ ...defaultStyle });

// 提取文本样式数据用于传递给TextStyleCustomizer
const textStyleData = computed(() => ({
  fontFamily: currentStyle.value.fontFamily,
  fontSize: currentStyle.value.fontSize,
  textColor: currentStyle.value.textColor,
  textPosition: currentStyle.value.textPosition,
  textShadow: currentStyle.value.textShadow
}));

// 是否显示占比控制
const showRatioControl = computed(() => {
  const layout = currentStyle.value.layout;
  return layout === 'image-top' || layout === 'image-bottom' || layout === 'split';
});

// 是否显示表情位置控制
const showMoodControl = computed(() => {
  return true; // 始终显示表情位置控制组件
});

// 图片比例
const imageRatio = computed(() => {
  return currentStyle.value.imageRatio || 0.5;
});

// 文本比例
const textRatio = computed(() => {
  return currentStyle.value.textRatio || 0.5;
});

// 分屏方向
const splitDirection = computed(() => {
  return currentStyle.value.splitDirection || 'horizontal';
});

// 表情位置
const moodPosition = computed(() => {
  return currentStyle.value.moodPosition || 'default';
});

// 表情气泡是否显示
const showEmojiBubble = computed(() => {
  return currentStyle.value.showEmojiBubble !== false;
});

// 预览控制
const showPreview = ref(false);
const previewContainer = ref(null);
const noteCardRef = ref(null);

// 添加检测是否为微信环境的方法
const isWechat = computed(() => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
});

// 图片选项标签页控制
const showDefaultBgs = ref(true); // 默认显示默认背景标签页，但不自动选择背景
const showImageOptions = ref(false);

// 默认背景相关
const selectedDefaultBg = ref(''); // 初始不选择任何默认背景

// 计算是否模板兼容图片
const isTemplateCompatibleWithImage = computed(() => {
  const layout = currentStyle.value.layout;
  // 这些模板可以显示图片
  return ['image-bg', 'image-top', 'image-bottom', 'split'].includes(layout);
});

// 监听模板变化，处理默认背景兼容性
watch(() => currentStyle.value.layout, (newLayout) => {
  // 如果有默认背景但当前模板不支持图片，提醒用户
  if (currentStyle.value.defaultBgPath && !['image-bg', 'image-top', 'image-bottom', 'split'].includes(newLayout)) {
    // 如果切换到纸条或卡片模板，需要提醒用户
    if (newLayout === 'paper' || newLayout === 'card') {
      nextTick(() => {
        if (confirm('当前模板不会显示背景图片，是否换用"图片背景"模板?')) {
          updateStyle({ layout: 'image-bg' });
        }
      });
    }
  }
}, { immediate: false });

// 方法
function updateStyle(updates) {
  // 如果正在导出或正在更新中，不执行样式更新
  if (isExporting.value || isUpdatingStyle.value) return;
  
  // 标记正在更新中
  isUpdatingStyle.value = true;
  
  try {
    // 检查是否有实际变化，避免无意义的更新
    let hasRealChanges = false;
    for (const key in updates) {
      if (JSON.stringify(updates[key]) !== JSON.stringify(currentStyle.value[key])) {
        hasRealChanges = true;
        break;
      }
    }
    
    if (!hasRealChanges) {
      isUpdatingStyle.value = false;
      return;
    }
    
    // 如果选择了纸条布局，清除图片URL和默认背景
    if (updates.layout === 'paper') {
      updates.imageUrl = '';
      updates.defaultBgId = '';
      updates.defaultBgPath = '';
    }
    
    // 如果切换到分屏布局，设置默认分屏方向
    if (updates.layout === 'split' && !updates.splitDirection) {
      updates.splitDirection = 'horizontal';
    }
    
    // 处理图片透明度，确保在有效范围内
    if (updates.hasOwnProperty('imageOpacity')) {
      if (updates.imageOpacity < 0) updates.imageOpacity = 0;
      if (updates.imageOpacity > 1) updates.imageOpacity = 1;
    }
    
    // 处理图片缩放，确保在有效范围内
    if (updates.hasOwnProperty('imageScale')) {
      if (updates.imageScale < 0.5) updates.imageScale = 0.5;
      if (updates.imageScale > 2) updates.imageScale = 2;
    }
    
    // 特殊处理：如果设置了图片URL，并且当前是纸条布局，自动切换到图片背景布局
    if (updates.hasOwnProperty('imageUrl') && updates.imageUrl && currentStyle.value.layout === 'paper') {
      updates.layout = 'image-top'; // 默认使用上图下文布局
      updates.preservePaperBg = false;
    }
    
    // 确保文本颜色有效
    if (updates.hasOwnProperty('textColor') && (!updates.textColor || updates.textColor.trim() === '')) {
      updates.textColor = defaultStyle.textColor;
    }
    
    // 批量更新当前样式，减少更新次数
    currentStyle.value = { ...currentStyle.value, ...updates };
    
    // 延迟发送更新事件，避免在渲染周期中触发太多更新
    setTimeout(() => {
      // 发送更新事件，但不包含字体大小
      const { fontSize, ...styleWithoutFontSize } = currentStyle.value;
      emit('update:style', styleWithoutFontSize);
      
      // 发送完整的自定义样式更新
      emit('update:customStyle', currentStyle.value);
      
      // 在本地存储用户偏好设置
      saveUserPreference();
    }, 0);
  } finally {
    // 重置更新标记
    isUpdatingStyle.value = false;
  }
}

// 将用户样式偏好保存到本地存储
function saveUserPreference() {
  try {
    // 过滤掉不需要保存的临时属性
    const styleToSave = { ...currentStyle.value };
    delete styleToSave.exportFormat; // 不保存导出格式
    delete styleToSave.exportQuality; // 不保存导出质量
    
    // 确保默认背景ID和路径被保存
    if (styleToSave.defaultBgId && styleToSave.defaultBgPath) {
      // 检查布局类型，确保图片布局正确选择
      if (styleToSave.layout === 'paper') {
        styleToSave.layout = 'image-bg';
      }
    }
    
    localStorage.setItem('note-style-preference', JSON.stringify(styleToSave));
  } catch (e) {
    console.error('保存样式偏好失败:', e);
  }
}

// 从本地存储恢复用户样式偏好
function loadUserPreference() {
  try {
    const saved = localStorage.getItem('note-style-preference');
    if (saved) {
      const savedStyle = JSON.parse(saved);
      // 合并保存的样式，保留默认值和传入的初始样式
      currentStyle.value = {
        ...defaultStyle,
        ...props.initialStyle,
        ...savedStyle
      };
      
      // 如果有保存的默认背景ID，同步到选择状态
      if (currentStyle.value.defaultBgId) {
        selectedDefaultBg.value = currentStyle.value.defaultBgId;
      } else {
        selectedDefaultBg.value = ''; // 确保没有自动选择默认背景
      }
      
      // 发送完整的自定义样式更新
      emit('update:customStyle', currentStyle.value);
    }
  } catch (e) {
    console.error('加载样式偏好失败:', e);
  }
}

// 初始化时加载用户偏好，但不自动选择默认背景
onMounted(() => {
  loadUserPreference();
  // 确保在初始化时不自动选择默认背景
  if (!currentStyle.value.defaultBgId) {
    selectedDefaultBg.value = '';
  }
});

// 模板选择器事件处理
function updateTemplateHandler(templateId) {
  const template = templateList.find(t => t.id === templateId);
  
  // 更新到当前样式
  updateStyle({ 
    layout: templateId,
    // 如果有额外属性也可以添加
    ...(template?.extraProps || {})
  });
}

// 处理模板需要资源的情况
function handleResourceNeeded(event) {
  if (event.type === 'image') {
    // 如果已有默认背景，直接应用模板
    if (currentStyle.value.defaultBgPath) {
      updateTemplateHandler(event.templateId);
      return;
    }
    
    // 否则切换到图片标签页
    activeTab.value = 'image';
    alert('请先选择或上传图片以使用此模板');
  }
}

// 处理模板操作事件
function handleTemplateAction(event) {
  console.log('模板操作:', event);
  // 这里可以处理其他特殊的模板操作事件
}

// 文本样式更新处理
function updateTextStyle(newTextStyle) {
  updateStyle(newTextStyle);
}

// 图片设置更新处理
function updateImageSettings(settings) {
  updateStyle(settings);
}

function resetStyle() {
  // 添加确认对话框
  if (!confirm('确定要重置所有样式设置吗？这将无法撤销。')) {
    return;
  }
  
  // 重置时保持当前字体大小不变
  const currentFontSize = currentStyle.value.fontSize;
  currentStyle.value = { 
    ...defaultStyle,
    fontSize: currentFontSize // 保持当前字体大小不变
  };
  const { fontSize, ...styleWithoutFontSize } = currentStyle.value;
  emit('update:style', styleWithoutFontSize);
}

function handleImageSelected(imageUrl) {
  // 创建一个包含所有需要更新的属性的对象
  const updates = {
    imageUrl,
    defaultBgId: '', // 清除默认背景
    defaultBgPath: '' // 清除默认背景路径
  };
  
  // 根据当前布局添加不同的配置
  if (currentStyle.value.layout === 'paper') {
    // 如果当前是纸条布局，切换到上图下文布局
    Object.assign(updates, {
      layout: 'image-top', // 默认使用上图下文布局
      imageOpacity: 1, // 默认不透明
      preservePaperBg: false, // 默认不保留纸条背景
    });
    
    // 使用单一更新调用，减少反应式更新次数
    updateStyle(updates);
    
    // 切换到布局标签页让用户看到效果，使用setTimeout避免更新冲突
    setTimeout(() => {
      activeTab.value = 'layout';
    }, 100);
  } else if (currentStyle.value.layout === 'image-bg') {
    // 如果是图片背景布局，设置半透明并保留纸条背景
    Object.assign(updates, {
      imageOpacity: 0.7, // 默认半透明
      preservePaperBg: true, // 保留纸条背景
    });
    
    // 使用单一更新调用
    updateStyle(updates);
  } else {
    // 如果已经是其他图片布局，直接更新图片
    Object.assign(updates, {
      imageOpacity: 1, // 默认不透明
      preservePaperBg: false, // 默认不保留纸条背景
    });
    
    // 使用单一更新调用
    updateStyle(updates);
  }
  
  // 重置图片选项显示状态
  resetImageOptions();
  
  // 如果有默认背景被选中，清除选择
  if (selectedDefaultBg.value) {
    // 延迟更新，避免触发循环更新
    setTimeout(() => {
      selectedDefaultBg.value = '';
    }, 0);
  }
}

function removeImage() {
  // 移除图片时，自动切换到纸条布局，并清除默认背景
  updateStyle({ 
    imageUrl: '',
    defaultBgId: '',
    defaultBgPath: '',
    layout: 'paper'
  });
  
  // 重置默认背景选择
  selectedDefaultBg.value = '';
}

function togglePreview() {
  showPreview.value = !showPreview.value;
}

// 处理滤镜更新
function handleFilterUpdate(filterData) {
  updateStyle({ 
    imageFilter: {
      ...filterData,
      style: filterData.style || ''
    }
  });
}

// 显示提示消息
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

// 根据心情标签设置背景
function setBackgroundByMood(mood) {
  // 如果已经有自定义样式，不覆盖用户的设置
  if (currentStyle.value.imageUrl) return;
  
  // 简单的心情到背景映射
  const moodBackgrounds = {
    '😊': 'paper-1', // 开心
    '😄': 'paper-1',
    '🥰': 'paper-1',
    '😌': 'paper-2', // 放松
    '😇': 'paper-2',
    '🤔': 'paper-3', // 思考
    '🧐': 'paper-3',
    '😔': 'paper-4', // 伤感
    '😢': 'paper-4',
    '😭': 'paper-4',
    '😎': 'paper-5', // 酷
    '🤩': 'paper-5'
  };
  
  // 遍历心情表情，如果找到匹配的就设置背景
  for (const emoji of mood) {
    if (moodBackgrounds[emoji]) {
      currentStyle.value.background = moodBackgrounds[emoji];
      break; // 只使用第一个匹配的表情
    }
  }
}

// 监听外部字体大小变化，仅在初始化时更新
watch(() => props.externalFontSize, (newSize) => {
  // 只在组件初始化时更新字体大小
  if (currentStyle.value.fontSize === defaultStyle.fontSize) {
    currentStyle.value.fontSize = newSize;
    defaultStyle.fontSize = newSize; // 同时更新默认样式的字体大小
  }
}, { immediate: true });

// 监听初始样式变化
watch(() => props.initialStyle, (newStyle) => {
  // 如果正在导出过程中，不执行更新
  if (isExporting.value) return;
  
  if (newStyle && Object.keys(newStyle).length > 0) {
    // 合并默认样式和初始样式，但保留当前的字体大小
    const currentFontSize = currentStyle.value.fontSize;
    currentStyle.value = { 
      ...defaultStyle, 
      ...newStyle,
      fontSize: currentFontSize // 保持当前字体大小不变
    };
    
    // 检查是否有默认背景或自定义图片
    if (currentStyle.value.defaultBgId || currentStyle.value.imageUrl) {
      // 发送样式更新事件，确保保存生效
      emit('update:style', currentStyle.value);
      emit('update:customStyle', currentStyle.value);
    }
  }
}, { deep: true, immediate: true });

// 监听标签页变化
watch(() => activeTab.value, (newTab) => {
  // 如果切换到"布局"标签页，确保组件已渲染完毕
  if (newTab === 'layout') {
    nextTick(() => {
      // 布局标签页激活时的初始化逻辑
    });
  }
}, { immediate: true });

// 生命周期
onMounted(() => {
  // 如果有初始样式，合并到当前样式
  if (props.initialStyle) {
    // 合并初始样式
    currentStyle.value = {
      ...currentStyle.value,
      ...props.initialStyle,
      // 确保字体大小正确
      fontSize: props.initialStyle.fontSize || props.externalFontSize || defaultStyle.fontSize,
      // 确保字体正确
      fontFamily: props.initialStyle.fontFamily || defaultStyle.fontFamily
    };
  }
  
  // 如果有心情标签，设置相应的背景
  if (props.noteMood) {
    setBackgroundByMood(props.noteMood);
  }
  
  // 如果有图片URL但布局是纸条，自动切换到图片背景布局
  if (currentStyle.value.imageUrl && currentStyle.value.layout === 'paper') {
    currentStyle.value.layout = 'image-bg';
    currentStyle.value.preservePaperBg = true; // 确保保留纸条背景
    
    // 如果透明度是1，设置为默认半透明
    if (currentStyle.value.imageOpacity === 1) {
      currentStyle.value.imageOpacity = 0.7;
    }
  }
  
  // 如果是图片背景布局但没有设置preservePaperBg，默认设置为true
  if (currentStyle.value.layout === 'image-bg' && currentStyle.value.preservePaperBg === undefined) {
    currentStyle.value.preservePaperBg = true;
  }
});

// 新的保存图片方法
async function saveImage() {
  if (!showPreview.value || !noteCardRef.value) {
    showToast('请先显示预览');
    return;
  }

  // 设置导出标志，防止循环更新
  isExporting.value = true;

  try {
    showToast('正在生成图片...');
    await nextTick();

    // 获取 NoteCard 元素
    const noteCard = noteCardRef.value.$el;
    if (!noteCard) {
      throw new Error('找不到笔记卡片元素');
    }

    // 如果使用了SVG默认背景，需要先转换为PNG
    let tempImageUrl = null;
    let originalStyle = null;
    
    if (currentStyle.value.defaultBgPath && currentStyle.value.defaultBgPath.includes('.svg')) {
      try {
        showToast('正在处理SVG背景...');
        // 保存原始样式以便稍后恢复
        originalStyle = JSON.parse(JSON.stringify(currentStyle.value));
        
        // 转换SVG为PNG
        tempImageUrl = await convertSvgToImageUrl(currentStyle.value.defaultBgPath, {
          width: 1000,
          height: 1000,
          scale: 2,
          quality: 1
        });
        
        if (tempImageUrl) {
          // 直接修改当前样式，避免触发updateStyle内的监听器
          currentStyle.value = {
            ...currentStyle.value,
            imageUrl: tempImageUrl,
            defaultBgPath: '', // 清空原始SVG路径
            defaultBgId: ''    // 清空原始SVG ID
          };
          
          // 等待样式更新应用到DOM
          await nextTick();
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          showToast('SVG处理失败，尝试直接导出');
        }
      } catch (error) {
        console.error('SVG背景处理错误:', error);
        showToast('SVG处理失败，尝试直接导出');
      }
    }

    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '0';
    tempContainer.style.left = '0';
    tempContainer.style.width = noteCard.offsetWidth + 'px';
    tempContainer.style.height = 'auto';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.zIndex = '-1';
    tempContainer.style.opacity = '0';
    tempContainer.style.transform = 'none';
    tempContainer.style.transformOrigin = 'top left';
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.padding = '0';
    tempContainer.style.margin = '0';
    tempContainer.style.border = 'none';
    tempContainer.style.borderRadius = '0';
    
    // 克隆笔记卡片
    const clonedCard = noteCard.cloneNode(true);
    clonedCard.style.transform = 'none';
    clonedCard.style.margin = '0';
    clonedCard.style.width = noteCard.offsetWidth + 'px';
    clonedCard.style.height = 'auto';
    clonedCard.style.position = 'relative';
    clonedCard.style.padding = '0';
    clonedCard.style.border = 'none';
    clonedCard.style.borderRadius = '0';
    clonedCard.style.boxShadow = 'none';
    
    // 确保图片背景布局下的背景层正确显示
    if (currentStyle.value.layout === 'image-bg') {
      // 查找图片层元素
      const imageLayer = clonedCard.querySelector('.note-image-layer');
      if (imageLayer) {
        // 确保图片层样式正确
        imageLayer.style.position = 'absolute';
        imageLayer.style.top = '0';
        imageLayer.style.left = '0';
        imageLayer.style.width = '100%';
        imageLayer.style.height = '100%';
        imageLayer.style.zIndex = '1';
        
        // 如果需要保留纸条背景，确保背景色正确
        if (currentStyle.value.preservePaperBg) {
          // 确保卡片背景色正确
          clonedCard.style.backgroundColor = getComputedStyle(noteCard).backgroundColor;
        }
      }
      
      // 确保内容层在图片层之上
      const contentLayer = clonedCard.querySelector('.note-content');
      if (contentLayer) {
        contentLayer.style.position = 'relative';
        contentLayer.style.zIndex = '2';
      }
    }
    
    // 查找并移除二维码图片元素（如果存在）
    const qrCodeImg = clonedCard.querySelector('img[src*="community-qr.png"]');
    if (qrCodeImg && qrCodeImg.parentNode) {
      qrCodeImg.parentNode.removeChild(qrCodeImg);
    }
    
    tempContainer.appendChild(clonedCard);
    document.body.appendChild(tempContainer);

    // 等待样式和资源加载
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 如果使用了SVG背景转换，显示提示信息
    if (tempImageUrl) {
      showToast('默认背景已转换为PNG格式，正在导出...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 使用html2canvas生成高清图片
    const canvas = await html2canvas(clonedCard, {
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      scale: 3,
      backgroundColor: null,
      logging: false,
      width: noteCard.offsetWidth,
      height: clonedCard.offsetHeight,
      onclone: customOncloneHandler
    });

    // 移除临时容器
    document.body.removeChild(tempContainer);
    
    // 如果使用了临时样式，恢复原始样式
    if (originalStyle) {
      // 直接设置，避免触发updateStyle内部的监听器
      currentStyle.value = originalStyle;
      // 使用setTimeout延迟发出事件，避免循环更新
      setTimeout(() => {
        // 发送完整的自定义样式更新（可选，如果需要的话）
        emit('update:customStyle', currentStyle.value);
      }, 0);
      await nextTick();
    }

    // 获取图片URL
    const imageUrl = canvas.toDataURL('image/png', 1.0);

    // 创建预览界面
    const imagePreviewContainer = document.createElement('div');
    imagePreviewContainer.style.position = 'fixed';
    imagePreviewContainer.style.top = '0';
    imagePreviewContainer.style.left = '0';
    imagePreviewContainer.style.width = '100%';
    imagePreviewContainer.style.height = '100%';
    imagePreviewContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    imagePreviewContainer.style.zIndex = '10000';
    imagePreviewContainer.style.display = 'flex';
    imagePreviewContainer.style.flexDirection = 'column';
    imagePreviewContainer.style.alignItems = 'center';
    imagePreviewContainer.style.justifyContent = 'center';

    // 添加提示文本
    const tipText = document.createElement('div');
    tipText.textContent = isWechat.value ? '长按图片即可保存' : '点击图片即可保存';
    tipText.style.color = 'white';
    tipText.style.padding = '10px 20px';
    tipText.style.borderRadius = '20px';
    tipText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    tipText.style.position = 'fixed';
    tipText.style.top = '20px';
    tipText.style.left = '50%';
    tipText.style.transform = 'translateX(-50%)';
    tipText.style.zIndex = '10001';
    tipText.style.fontSize = '15px';
    tipText.style.fontWeight = '500';

    // 创建图片元素
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '80%';
    img.style.objectFit = 'contain';
    img.style.userSelect = 'none';
    img.style.borderRadius = '12px';
    img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';

    // 非微信环境下点击图片下载
    if (!isWechat.value) {
      img.style.cursor = 'pointer';
      img.onclick = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `星语心笺_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }

    // 点击空白区域关闭预览
    imagePreviewContainer.onclick = (e) => {
      if (e.target === imagePreviewContainer) {
        document.body.removeChild(imagePreviewContainer);
        document.body.removeChild(tipText);
      }
    };

    imagePreviewContainer.appendChild(img);
    document.body.appendChild(imagePreviewContainer);
    document.body.appendChild(tipText);

    showToast(isWechat.value ? '请长按图片进行保存' : '点击图片即可保存');
  } catch (error) {
    console.error('保存图片失败:', error);
    showToast('保存失败，请重试');
  } finally {
    // 重置导出标志
    isExporting.value = false;
  }
}

// html2canvas的自定义处理逻辑函数
function customOncloneHandler(clonedDoc) {
  const element = clonedDoc.body.querySelector('.note-card');
  if (!element) return;
  
  // 基本样式设置
  element.style.transform = 'none';
  element.style.margin = '0';
  element.style.width = document.querySelector('.note-card').offsetWidth + 'px';
  element.style.height = 'auto';
  element.style.position = 'relative';
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.transition = 'none';
  element.style.transformOrigin = 'top left';
  element.style.padding = '0';
  element.style.border = 'none';
  element.style.borderRadius = '0';
  element.style.boxShadow = 'none';

  // 处理包含图片的布局
  const hasImageLayout = ['image-bg', 'split', 'image-top', 'image-bottom'].includes(currentStyle.value.layout);
  if (hasImageLayout) {
    // 查找所有图片层元素
    const imageLayers = element.querySelectorAll('.note-image-layer');
    imageLayers.forEach(imageLayer => {
      // 基本样式设置
      imageLayer.style.position = 'absolute';
      imageLayer.style.zIndex = '1';
      imageLayer.style.backgroundRepeat = 'no-repeat';
      imageLayer.style.backgroundSize = 'cover';
      
      // 根据布局类型设置不同的样式
      if (currentStyle.value.layout === 'image-bg') {
        imageLayer.style.top = '0';
        imageLayer.style.left = '0';
        imageLayer.style.width = '100%';
        imageLayer.style.height = '100%';
      } else if (currentStyle.value.layout === 'split') {
        // 分屏布局可能需要特殊处理
        imageLayer.style.width = '101%';
        imageLayer.style.height = '101%';
        imageLayer.style.top = '-0.5%';
        imageLayer.style.left = '-0.5%';
      }
      
      // 确保图片已加载
      const bgImageUrl = getComputedStyle(imageLayer).backgroundImage;
      if (bgImageUrl && bgImageUrl !== 'none') {
        const urlMatch = bgImageUrl.match(/url\(['"]?(.*?)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          // 预加载图片
          const img = new Image();
          img.src = urlMatch[1];
        }
      }
    });
    
    // 如果需要保留纸条背景，确保背景色正确
    if (currentStyle.value.preservePaperBg && currentStyle.value.layout === 'image-bg') {
      element.style.backgroundColor = getComputedStyle(document.querySelector('.note-card')).backgroundColor;
    }
    
    // 确保内容层在图片层之上
    const contentLayers = element.querySelectorAll('.note-content');
    contentLayers.forEach(contentLayer => {
      contentLayer.style.position = 'relative';
      contentLayer.style.zIndex = '2';
    });
  }

  // 移除二维码相关元素
  const qrCodes = element.querySelectorAll('img[src*="community-qr.png"]');
  qrCodes.forEach(qrCode => {
    if (qrCode.parentNode) {
      qrCode.parentNode.removeChild(qrCode);
    }
  });
}

// 处理默认背景图片选择
function handleDefaultBackgroundSelected(background) {
  if (background) {
    // 防止重复更新和循环触发
    if (currentStyle.value.defaultBgId === background.id) {
      return;
    }
    
    // 临时标记，防止监听器触发循环
    const updatingFromSelection = true;
    
    // 创建更新对象，包含所有需要一次性更新的属性
    const updates = { 
      defaultBgId: background.id, 
      defaultBgPath: background.path,
      imageUrl: '' // 清除自定义上传的图片URL
    };
    
    // 如果当前是纸条布局，可能需要稍后提示用户
    const needLayoutReminder = currentStyle.value.layout === 'paper';
    
    // 执行一次性更新，减少触发watch的次数
    updateStyle(updates);
    
    // 如果需要提示用户选择模板
    if (needLayoutReminder) {
      nextTick(() => {
        // 使用setTimeout延迟弹窗，避免阻塞渲染
        setTimeout(() => {
          alert('已选择默认背景，请在"模板"选项卡中选择合适的布局来显示背景图片');
          activeTab.value = 'layout';
        }, 100);
      });
    }
  }
}

function switchToDefaultBgs() {
  showDefaultBgs.value = true;
}

function switchToUploader() {
  showDefaultBgs.value = false;
}

// 添加新的防循环更新的标志
const isUpdatingBgId = ref(false);

// 简化的监听器，只在组件初始化时同步一次状态
watch(() => props.initialStyle.defaultBgId, (newBgId) => {
  if (newBgId && selectedDefaultBg.value !== newBgId) {
    selectedDefaultBg.value = newBgId;
  }
}, { immediate: true });

// 使用单一监听器监控selectedDefaultBg变化
watch(() => selectedDefaultBg.value, (newVal, oldVal) => {
  // 避免在组件初始化或导出时触发更新
  if (isExporting.value || isUpdatingBgId.value || newVal === oldVal) return;
  
  // 标记正在更新，避免循环
  isUpdatingBgId.value = true;
  
  // 如果清除了背景，更新currentStyle
  if (!newVal && currentStyle.value.defaultBgId) {
    updateStyle({ 
      defaultBgId: '', 
      defaultBgPath: '' 
    });
  }
  
  // 重置标记
  isUpdatingBgId.value = false;
}, { immediate: false });

// 切换显示图片选项
function toggleImageOptions() {
  showImageOptions.value = true;
  showDefaultBgs.value = true; // 默认先显示默认背景选项
}

// 重置图片选项显示状态
function resetImageOptions() {
  showImageOptions.value = false;
  showDefaultBgs.value = false;
}
</script>

<style scoped>
.style-customizer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.customizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.customizer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
}

.tabs-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn i {
  font-size: 16px;
  margin-bottom: var(--spacing-xs);
}

.tab-btn span {
  font-size: 12px;
}

.tab-btn.active {
  color: var(--primary-color);
  background-color: var(--card-bg);
  border-bottom: 2px solid var(--primary-color);
}

.tab-content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.tab-content h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: 16px;
  font-weight: 500;
}

/* 布局选项样式 */
.layout-tab {
  margin-bottom: var(--spacing-md);
}

/* 图片上传和设置样式 */
.image-upload-area {
  margin-bottom: var(--spacing-md);
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

/* 预览区域样式 */
.preview-toggle {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.preview-area {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  max-height: 600px;
  overflow: auto;
  margin-bottom: var(--spacing-md);
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.preview-scale-container {
  width: 375px; /* 移动端基准宽度 */
  min-width: 375px;
  transform-origin: top center;
  margin: 0 auto;
  background: var(--bg-color);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .preview-scale-container {
    transform: scale(0.85);
    margin: -20px auto;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .preview-scale-container {
    width: 480px;
    min-width: 480px;
    transform: scale(0.95);
    margin: -10px auto;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .preview-scale-container {
    width: 480px;
    min-width: 480px;
    transform: scale(1);
    margin: 0 auto;
  }
}

@media (min-width: 1025px) {
  .preview-scale-container {
    width: 540px;
    min-width: 540px;
    transform: scale(1);
    margin: 0 auto;
  }
}

/* 导出预览时的特殊样式 */
.preview-scale-container.export-mode {
  width: 375px !important;
  min-width: 375px !important;
  transform: none !important;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  gap: var(--spacing-sm);
}

.action-buttons .btn {
  flex: 1;
  justify-content: center;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  opacity: 0.8;
  padding: var(--spacing-sm) var(--spacing-md);
}

.btn-text:hover {
  color: var(--text-primary);
  opacity: 1;
  background-color: var(--bg-color);
}

.btn-success {
  background-color: #4CAF50;
  color: white;
}

.btn-success:hover {
  background-color: #45a049;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .action-buttons .btn {
    margin-bottom: var(--spacing-sm);
  }
  
  .btn-text {
    order: 2; /* 将重置按钮放到最后 */
  }
  
  .preview-scale-container {
    transform: scale(0.85);
    margin: -20px auto; /* 补偿缩放造成的空间 */
  }
}

/* 添加toast消息样式 */
.toast-message {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1100;
}

.toast-message.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* 图片选项样式 */
.image-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.image-section h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 16px;
  font-weight: 500;
}

.image-option-section {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  background-color: var(--bg-color);
}

.image-option-section h5 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.image-option-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-md);
}

.image-option-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.image-option-tab i {
  font-size: 16px;
}

.image-option-tab span {
  font-size: 12px;
}

.image-option-tab.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.default-bg-section, 
.upload-section {
  padding: var(--spacing-xs) 0;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .image-option-tabs {
    margin-bottom: var(--spacing-sm);
  }
  
  .image-option-tab i {
    font-size: 14px;
  }
  
  .image-option-tab span {
    font-size: 10px;
  }
  
  .image-option-section {
    padding: var(--spacing-sm);
  }
}

.option-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}

.option-actions .btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 模板信息提示样式 */
.template-info {
  background-color: #FFF8E1;
  border-left: 3px solid #FFB300;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-top: var(--spacing-md);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 13px;
  color: #7A5C00;
}

.template-info i {
  color: #FFB300;
  font-size: 16px;
  flex-shrink: 0;
}

/* 深色模式下的样式调整 */
:global(.dark-mode) .template-info {
  background-color: rgba(255, 179, 0, 0.15);
  border-left-color: #FFB300;
  color: #FFD180;
}

:global(.dark-mode) .template-info i {
  color: #FFD180;
}

@media (max-width: 480px) {
  .template-info {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 12px;
  }
  
  .template-info i {
    font-size: 14px;
  }
}
</style> 