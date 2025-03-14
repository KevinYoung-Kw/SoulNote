<template>
  <div class="home-page fixed-page-layout" :class="{'savage-mode': params.savageMode}">
    <!-- 固定在顶部的页眉 -->
    <HeaderComponent 
      :hasGeneratedContent="hasGeneratedContent"
      @clear-content="clearGeneratedContent"
      @header-toggle="handleHeaderToggle"
    />
    
    <!-- 可滚动的主内容区 -->
    <div class="scrollable-content" :class="{'header-collapsed-content': headerCollapsed}">
      <!-- 纸条展示区 -->
      <div class="content-container">
        <!-- 参数预览卡片 -->
        <ParamsPreview 
          :params="params"
          @open-params-panel="openParamsPanel"
        />

        <!-- 感谢文本 -->
        <AppreciationBanner :initialShow="showAppreciation" />
        
        <!-- 笔记显示区域 -->
        <NoteDisplay
          :content="noteContent"
          :mood="params.moods && params.moods.length > 0 ? params.moods.join('') : ''"
          :isAnimating="isGenerating"
          :animationDuration="animationDuration"
          :initialBackground="currentBackground"
          :initialFontSize="fontSize"
          @update:fontSize="fontSize = $event"
          @update:background="currentBackground = $event"
          @update:customStyle="customStyle = $event"
          @export="handleExport"
          ref="noteDisplayRef"
        />
      </div>
    </div>
    
    <!-- 固定在底部的控制区域 -->
    <FooterNavigation
      :isGenerating="isGenerating"
      :loadingMessage="loadingMessage"
      :estimatedResponseTime="estimatedResponseTime"
      :noteContent="noteContent"
      :savageMode="params.savageMode"
      @generate="generateNoteContent"
      @regenerate="regenerateNote"
      @save="saveNote"
      @customize="openStyleCustomizer"
      @export="exportNote"
      @share="shareNote"
    />
    
    <!-- 参数设置面板 -->
    <ParamsPanel
      v-model:visible="showParamsPanel"
      :initialParams="params"
      @save-params="updateParams"
    />
    
    <!-- 图片预览模态框 -->
    <transition name="fade">
      <ImagePreviewModel
        v-if="showImagePreview"
        :imageUrl="previewImageUrl"
        :onDownload="handleDownload"
        :onShare="handleShare"
        :export-options="exportOptions"
        @close="closeImagePreview"
        @customize="showStyleCustomizer = true; showImagePreview = false"
        @export="updateExportOptions"
      />
    </transition>
    
    <!-- 社区提示 -->
    <CommunityPrompt
      v-model:visible="showCommunityPrompt"
      :title="communityPromptData.title"
      :message="communityPromptData.message"
      :qrcodeUrl="communityPromptData.qrcodeUrl"
      :compact="communityPromptData.reason === 'generation_threshold'"
      :updateLogs="communityPromptData.updateLogs"
      @close="handleCommunityPromptClose"
      @later="handleCommunityPromptClose"
      @never="handleCommunityPromptClose"
    />
    
    <!-- 样式定制器弹窗 -->
    <div class="style-customizer-modal" v-if="showStyleCustomizer">
      <div class="modal-overlay" @click="showStyleCustomizer = false"></div>
      <div class="modal-content">
        <NoteStyleCustomizer 
          :note-content="noteContent"
          :note-mood="params.moods && params.moods.length > 0 ? params.moods.join('') : ''"
          :initial-style="customStyle"
          @close="showStyleCustomizer = false"
          @update:style="updateCustomStyle"
          @export="handleExport"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';

// 导入组件
import HeaderComponent from '../components/HeaderComponent.vue';
import FooterNavigation from '../components/FooterNavigation.vue';
import ParamsPreview from '../components/ParamsPreview.vue';
import ParamsPanel from '../components/ParamsPanel.vue';
import NoteDisplay from '../components/NoteDisplay.vue';
import AppreciationBanner from '../components/AppreciationBanner.vue';
import ImagePreviewModel from '../components/ImagePreviewModel.vue';
import CommunityPrompt from '../components/CommunityPrompt.vue';
import NoteStyleCustomizer from '../components/NoteStyleCustomizer.vue';

// 导入服务和工具
import { generateNote, getEstimatedResponseTime } from '../services/aiService';
import { saveUserPreferences, getUserPreferences, saveNote as saveNoteToStorage } from '../services/storageService';
import { useNoteExport } from '../composables/useNoteExport';
import { communityService } from '../services/communityService';
import logger from '../utils/logger';
import { APP_VERSION } from '../config/version';

const router = useRouter();
const noteDisplayRef = ref(null);

// 状态管理
const isGenerating = ref(false);
const isAnimating = ref(false);
const noteContent = ref('点击下方"生成心语"按钮，开始您的心灵之旅...');
const currentBackground = ref('paper-1');
const fontSize = ref(24);
const darkMode = ref(false);
const loadingMessage = ref(''); 
const hasGeneratedContent = ref(false);
const errorMessage = ref('');
const showAppreciation = ref(true);
const headerCollapsed = ref(false);
const showParamsPanel = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref('');
const showCommunityPrompt = ref(false);
const showStyleCustomizer = ref(false);
const customStyle = ref({});
const exportOptions = ref({
  format: 'png',
  quality: 0.9,
  transparentBg: false
});

// 导出功能
const { exportAsImage, saveToDevice, shareImage } = useNoteExport();

// 用户参数
const params = reactive({
  zodiac: null,
  mbti: null,
  moods: [], 
  language: 'zh',
  savageMode: false,
  enableFortune: false,
  fortuneAspect: 'overall',
  gender: null,
  age: null,
  relationship: null,
  theme: 'chat'
});

// 社区提示数据
const communityPromptData = reactive({
  title: '星语心笺社群',
  message: '',
  qrcodeUrl: '/assets/community-qr.png',
  reason: '',
  updateLogs: []
});

// 动态计算响应时间和动画时长
const estimatedResponseTime = ref(3000);
const animationDuration = computed(() => {
  const baseDuration = Math.min(Math.max(estimatedResponseTime.value / 3000, 1.5), 3);
  return baseDuration;
});

// 加载状态 - 区分普通模式和毒舌模式
const normalLoadingMessages = [
  "正在收集灵感...",
  "正在编织文字...",
  "正在注入温暖...",
  "正在构思内容...",
  "正在校对文案..."
];

// 毒舌模式专用加载提示
const savageLoadingMessages = [
  "正在搜刮你的黑历史...",
  "正在翻你的老底...",
  "正在组织犀利语言...",
  "正在找你的软肋...",
  "正在磨刀霍霍...",
  "正在准备扎心内容...",
  "正在分析你的弱点...",
  "正在酝酿致命一击...",
  "正在挖掘你不愿面对的真相...",
  "正在研究怎么让你破防..."
];

// 根据模式选择加载信息
const loadingMessagesArray = computed(() => {
  return params.savageMode ? savageLoadingMessages : normalLoadingMessages;
});

// 修改为可旋转的消息文本
let loadingInterval = null;

// 方法
function handleHeaderToggle(isCollapsed) {
  headerCollapsed.value = isCollapsed;
  // 通知笔记显示组件重新渲染
  nextTick(() => {
    if (noteDisplayRef.value) {
      noteDisplayRef.value.applyFontSize();
    }
  });
}

function openParamsPanel() {
  showParamsPanel.value = true;
}

function updateParams(newParams) {
  // 更新参数
  Object.assign(params, newParams);
  // 保存到本地存储
  updateLocalPreferences();
  // 如果毒舌模式发生变化，更新body类
  document.body.classList.toggle('savage-mode', params.savageMode);
}

async function generateNoteContent() {
  isGenerating.value = true;
  errorMessage.value = '';
  
  // 添加消息轮换功能
  let messageIndex = 0;
  loadingMessage.value = loadingMessagesArray.value[messageIndex];
  
  // 设置定时器轮换消息
  if (loadingInterval) {
    clearInterval(loadingInterval);
  }
  
  loadingInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessagesArray.value.length;
    loadingMessage.value = loadingMessagesArray.value[messageIndex];
  }, 2000); // 每2秒切换一次消息
  
  try {
    // 获取估计响应时间
    estimatedResponseTime.value = await getEstimatedResponseTime();
    
    // 使用正确的参数格式
    const requestParams = {
      zodiac: params.zodiac,
      mbti: params.mbti,
      moods: params.moods,
      theme: params.theme,
      savageMode: params.savageMode,
      language: params.language === 'en-zh' ? 'en-zh' : 'zh',
      gender: params.gender,
      age: params.age,
      relationship: params.relationship,
      enableFortune: params.enableFortune,
      fortuneAspect: params.fortuneAspect
    };
    
    logger.info('REQUEST', '发送生成请求, 请求参数:', requestParams);
    
    // 使用generateNote函数
    const result = await generateNote(requestParams);
    
    // 检查正确的返回数据结构
    if (result && result.content) {
      // 更新笔记内容
      noteContent.value = result.content;
      
      // 保存到历史记录
      await cacheGeneratedContent();
      
      // 更新UI状态
      hasGeneratedContent.value = true;
      isAnimating.value = true;
      
      // 记录生成次数并可能显示社群提示
      try {
        // 记录生成成功
        const generateCount = await communityService.recordGeneration();
        
        // 检查是否应该在生成成功后提示加入社群（30%几率，且生成次数达到3次以上）
        if (generateCount >= 3 && Math.random() < 0.3 && !showCommunityPrompt.value) {
          // 延迟检查以确保用户先看到生成的内容
          setTimeout(async () => {
            const shouldShow = await communityService.shouldShowPrompt();
            if (shouldShow.show) {
              Object.assign(communityPromptData, {
                ...shouldShow,
                message: '内容生成成功！喜欢这种体验吗？加入社群获取更多创作技巧～'
              });
              showCommunityPrompt.value = true;
            }
          }, 1500);
        }
      } catch (socialError) {
        // 社交功能失败不应影响主要功能
        logger.error('SOCIAL', '社群功能调用失败:', socialError);
      }
    } else {
      // 处理API返回数据格式不正确的情况
      throw new Error('服务器返回数据格式不正确，请稍后重试');
    }
  } catch (error) {
    logger.error('REQUEST', '生成请求失败', error);
    errorMessage.value = error.message || '生成失败，请稍后重试';
    // 在出错时显示错误消息
    loadingMessage.value = '生成失败，请稍后重试...';
  } finally {
    // 清除消息轮换计时器
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    isGenerating.value = false;
    
    // 动画结束后重置状态
    setTimeout(() => {
      isAnimating.value = false;
    }, animationDuration.value * 1000);
  }
}

// 添加社群提示关闭处理函数
function handleCommunityPromptClose() {
  showCommunityPrompt.value = false;
}

function regenerateNote() {
  if (!isGenerating.value) {
    generateNoteContent();
  }
}

async function saveNote() {
  if (!noteContent.value) return;
  
  const note = {
    content: noteContent.value,
    background: currentBackground.value,
    fontSize: fontSize.value,
    params: { ...params },
    createdAt: new Date().toISOString()
  };
  
  const savedNote = saveNoteToStorage(note);
  if (savedNote) {
    alert('保存成功！');
  } else {
    alert('保存失败，请重试');
  }
}

function isWechatBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
}

async function exportNote() {
  if (!noteDisplayRef.value || !noteContent.value) return;
  
  // 先检测是否是微信浏览器
  if (isWechatBrowser()) {
    const confirmed = confirm('检测到您正在使用微信浏览器，微信限制了保存图片功能。\n\n建议您：\n1. 点击右上角"..."，选择"在浏览器中打开"\n2. 或使用Chrome/Safari等系统浏览器访问');
    
    if (!confirmed) return;
  }
  
  try {
    loadingMessage.value = "正在准备图片...";
    
    // 确保在导出前DOM已完全渲染
    await nextTick();
    
    // 获取实际DOM元素
    const element = noteDisplayRef.value.noteCardRef.$el;
    
    if (!element) {
      throw new Error("找不到要导出的DOM元素");
    }
    
    const imageUrl = await exportAsImage(element);
    if (imageUrl) {
      try {
        await saveToDevice(imageUrl, `心语_${new Date().toISOString().slice(0,10)}.png`);
      } catch (downloadError) {
        if (isWechatBrowser()) {
          alert('保存失败。由于微信浏览器限制，无法直接保存图片。\n\n请点击右上角"..."，选择"在浏览器中打开"后重试。');
        } else {
          alert('保存图片失败。您可以尝试右键点击图片，选择"图片另存为"保存。');
        }
        console.error('保存设备失败:', downloadError);
      }
    } else {
      throw new Error("导出图片URL为空");
    }
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出图片失败，请重试或尝试分享功能');
  }
}

async function shareNote() {
  if (!noteDisplayRef.value || !noteContent.value) return;
  
  try {
    loadingMessage.value = "正在准备分享...";
    
    // 确保在导出前DOM已完全渲染
    await nextTick();
    
    // 获取实际DOM元素
    const element = noteDisplayRef.value.noteCardRef.$el;
    
    if (!element) {
      throw new Error("找不到要导出的DOM元素");
    }
    
    const imageUrl = await exportAsImage(element);
    if (imageUrl) {
      // 设置预览图片URL并显示预览模态框
      previewImageUrl.value = imageUrl;
      showImagePreview.value = true;
    } else {
      throw new Error("导出图片URL为空");
    }
  } catch (error) {
    console.error('分享失败:', error);
    alert('准备分享图片失败，请稍后重试');
  }
}

function closeImagePreview() {
  showImagePreview.value = false;
  previewImageUrl.value = '';
}

function handleSystemShare(imageUrl) {
  if (shareImage) {
    shareImage(imageUrl);
  }
}

// 添加一个方法来缓存生成的内容
async function cacheGeneratedContent() {
  if (!noteContent.value || noteContent.value === '点击下方"生成心语"按钮，开始您的心灵之旅...') return;
  
  try {
    // 获取当前偏好
    const currentPrefs = await getUserPreferences();
    
    // 构建缓存数据
    const cachedContent = {
      content: noteContent.value,
      moods: params.moods,
      background: currentBackground.value,
      fontSize: fontSize.value,
      timestamp: new Date().toISOString()
    };
    
    // 更新本地保存的设置，添加缓存的内容
    await saveUserPreferences({
      ...currentPrefs,
      cachedContent
    });
    
    hasGeneratedContent.value = true;
    logger.info('CACHE', '已缓存生成的内容:', cachedContent);
  } catch (error) {
    logger.error('CACHE', '缓存生成内容失败:', error);
  }
}

// 添加清除内容方法
function clearGeneratedContent() {
  if (confirm('确定要清除当前内容吗？')) {
    noteContent.value = '点击下方"生成心语"按钮，开始您的心灵之旅...';
    params.moods = [];
    hasGeneratedContent.value = false;
    
    // 清除缓存
    clearContentCache();
  }
}

// 清除内容缓存
async function clearContentCache() {
  try {
    const currentPrefs = await getUserPreferences();
    if (currentPrefs.cachedContent) {
      delete currentPrefs.cachedContent;
      await saveUserPreferences(currentPrefs);
      logger.info('CACHE', '已清除缓存内容');
    }
  } catch (error) {
    logger.error('CACHE', '清除缓存失败:', error);
  }
}

// 从缓存恢复内容
async function restoreFromCache() {
  try {
    const preferences = await getUserPreferences();
    if (preferences && preferences.cachedContent) {
      const { content, moods, background, fontSize: cachedFontSize } = preferences.cachedContent;
      
      // 恢复内容
      if (content && content !== '点击下方"生成心语"按钮，开始您的心灵之旅...') {
        noteContent.value = content;
        hasGeneratedContent.value = true;
      }
      
      // 恢复表情
      if (moods && Array.isArray(moods)) {
        params.moods = [...moods];
      }
      
      // 恢复背景
      if (background) {
        currentBackground.value = background;
      }
      
      // 恢复字体大小
      if (cachedFontSize) {
        fontSize.value = cachedFontSize;
      }
      
      logger.info('CACHE', '从缓存恢复内容成功');
    }
  } catch (error) {
    logger.error('CACHE', '恢复缓存内容失败:', error);
  }
}

// 添加一个方法来更新本地偏好设置
async function updateLocalPreferences() {
  try {
    // 获取当前偏好
    const currentPrefs = await getUserPreferences();
    
    // 更新本地保存的设置
    await saveUserPreferences({
      ...currentPrefs,
      fontSize: fontSize.value,
      background: currentBackground.value,
      savageMode: params.savageMode,
      theme: params.theme,
      darkMode: darkMode.value,
      enableFortune: params.enableFortune,
      fortuneAspect: params.fortuneAspect,
      moods: params.moods
    });
  } catch (error) {
    logger.error('PREFERENCES', '更新本地偏好设置失败:', error);
  }
}

// 打开样式定制器
function openStyleCustomizer() {
  showStyleCustomizer.value = true;
}

// 更新自定义样式
function updateCustomStyle(newStyle) {
  customStyle.value = { ...newStyle };
  // 可能需要保存到本地存储
}

// 处理导出
async function handleExport(options) {
  try {
    const element = options?.element || noteDisplayRef.value?.noteCardRef?.$el;
    if (!element) {
      console.error('找不到要导出的元素');
      return;
    }
    
    const exportOpts = {
      format: options?.style?.exportFormat || exportOptions.value.format,
      quality: options?.style?.exportQuality || exportOptions.value.quality,
      transparentBg: options?.style?.transparentBg || exportOptions.value.transparentBg
    };
    
    const imageUrl = await exportAsImage(element, exportOpts);
    if (imageUrl) {
      previewImageUrl.value = imageUrl;
      showImagePreview.value = true;
      showStyleCustomizer.value = false;
    }
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出图片失败，请重试');
  }
}

// 处理下载
async function handleDownload(imageUrl, options) {
  try {
    const format = options?.format || 'png';
    await saveToDevice(imageUrl, `心语_${new Date().toISOString().slice(0, 10)}.${format}`);
    return true;
  } catch (error) {
    console.error('下载失败:', error);
    return false;
  }
}

// 处理分享
async function handleShare(imageUrl) {
  try {
    const shared = await shareImage(imageUrl, {
      title: '分享心语',
      text: '我用星语心笺生成了一段心语',
      format: exportOptions.value.format
    });
    
    if (!shared) {
      await saveToDevice(imageUrl);
      alert('图片已保存，您可以手动分享');
    }
    return shared;
  } catch (error) {
    console.error('分享失败:', error);
    return false;
  }
}

// 更新导出选项
function updateExportOptions(options) {
  exportOptions.value = { ...options };
}

// 生命周期
onMounted(async () => {
  // 加载用户偏好设置
  try {
    const preferences = await getUserPreferences();
    const isSmallScreen = window.innerWidth <= 375;

    // 添加屏幕大小变化监听
    // 将handleResize定义为组件级别的变量，而不是局部函数
    window.addEventListener('resize', handleResize);

    if (preferences) {
      params.zodiac = preferences.zodiac;
      params.mbti = preferences.mbti;
      params.language = preferences.language || 'zh';
      
      // 修复：分开处理 darkMode 和 theme 参数
      // darkMode 是控制界面暗色模式的
      darkMode.value = preferences.darkMode === true;
      
      // 加载页眉折叠状态
      headerCollapsed.value = preferences.headerCollapsed || false;
    
      // 小屏幕设备(≤375px)默认使用18px字体，除非用户显式设置了不同的大小
      if (isSmallScreen && (!preferences.fontSize || preferences.fontSize === 24)) {
        fontSize.value = 18;
      } else {
        fontSize.value = preferences.fontSize || 24;
      }

      // 而 theme 是控制内容生成主题的，默认为 'chat'
      params.theme = preferences.theme || 'chat';
      
      currentBackground.value = preferences.background || 'paper-1';
      params.savageMode = preferences.savageMode || false;

      // 显示感谢文本
      showAppreciation.value = !preferences.hideAppreciation;
      
      // 加载运势偏好
      if (preferences.mood) {
        params.moods = [preferences.mood];
      } else if (preferences.moods && Array.isArray(preferences.moods)) {
        params.moods = preferences.moods;
      }
      params.enableFortune = preferences.enableFortune || false;
      params.fortuneAspect = preferences.fortuneAspect || 'overall';
      
      // 加载新增的个人信息
      params.gender = preferences.gender;
      params.age = preferences.age;
      params.relationship = preferences.relationship;

      const appVersion = APP_VERSION; // 当前应用版本，实际中可从环境变量获取
      const updatePrompt = await communityService.checkUpdatePrompt(appVersion);     

      if (updatePrompt.show) {
        Object.assign(communityPromptData, updatePrompt);
        setTimeout(() => {
          showCommunityPrompt.value = true;
        }, 1000); // 页面加载1秒后显示
        return;
      }
      
      // 检查其他常规社群提示
      const shouldShow = await communityService.shouldShowPrompt();
      if (shouldShow.show) {
        Object.assign(communityPromptData, shouldShow);
        // 延迟显示，避免页面加载时立即弹出
        setTimeout(() => {
          showCommunityPrompt.value = true;
        }, 2000);
      }

      // 从缓存恢复生成的内容
      await restoreFromCache();
    }
  } catch (error) {
    logger.error('PREFERENCES', '加载用户偏好设置失败:', error);
  }
});

// 定义handleResize为组件级别的变量
const handleResize = () => {
  const isSmallScreen = window.innerWidth <= 375;
  const defaultSize = isSmallScreen ? 18 : 24;
  
  // 如果当前字体大小是默认值的情况下，根据屏幕大小自动调整
  if (fontSize.value === 24 || fontSize.value === 18) {
    fontSize.value = defaultSize;
    updateLocalPreferences();
  }
};

onBeforeUnmount(() => {
  // 清除任何可能存在的定时器
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize);
});

// 监听暗黑模式变化
watch(darkMode, (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);
});

// 监听毒舌模式变化
watch(() => params.savageMode, (isSavage) => {
  document.body.classList.toggle('savage-mode', isSavage);
}, { immediate: true });

// 监听内容、表情、背景和字体大小的变化，更新缓存
watch([noteContent, () => params.moods, currentBackground, fontSize], () => {
  if (noteContent.value && noteContent.value !== '点击下方"生成心语"按钮，开始您的心灵之旅...') {
    cacheGeneratedContent();
  }
}, { deep: true });
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  background-color: var(--bg-color);
  height: 100vh;
  overflow: hidden;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-top: var(--spacing-sm);
  transition: padding-top var(--transition-normal);
}

.header-collapsed-content {
  padding-top: var(--spacing-lg);
}

.content-container {
  padding: 0 var(--spacing-md);
}

/* 暗黑模式样式 */
:global(.dark-mode) {
  --bg-color: #1a1a1a;
  --card-bg: #2c2c2c;
  --text-color: #f0f0f0;
  --text-secondary: #b0b0b0;
  --border-color: #3a3a3a;
  --primary-color: #8DB39E;
}

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 媒体查询优化 */
@media (max-width: 480px) {
  .content-container {
    padding: 0 var(--spacing-sm);
  }
}

@media (max-width: 375px) {
  .content-container {
    padding: 0 var(--spacing-xs);
  }
}

/* 样式定制器弹窗样式 */
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
  height: 90%;
  max-height: 700px;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 1001;
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    height: 95%;
  }
}
</style>