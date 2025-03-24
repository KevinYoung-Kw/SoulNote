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
      :isNoteFavorited="isCurrentNoteFavorited"
      :noteId="currentNoteId"
      @generate="generateNoteContent"
      @regenerate="regenerateNote"
      @toggle-favorite="toggleFavoriteStatus"
      @check-favorite-status="checkFavoriteStatus"
      @customize="openStyleCustomizer"
      @openAISettings="openAISettings"
    />
    
    <!-- 参数设置面板 -->
    <ParamsPanel
      v-model:visible="showParamsPanel"
      :initialParams="params"
      :hasGeneratedContent="hasGeneratedContent"
      @save-params="updateParams"
      @clear-content="clearGeneratedContent"
    />
    
    <!-- 社区提示 -->
    <CommunityPrompt
      v-model:visible="showCommunityPrompt"
      :title="communityPromptData.title"
      :message="communityPromptData.message"
      :qrcodeUrl="communityPromptData.qrcodeUrl"
      :compact="communityPromptData.reason === 'generation_threshold'"
      :updateLogs="communityPromptData.updateLogs"
      :activeTab="communityPromptData.activeTab || 'community'"
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
          :external-font-size="fontSize"
          @close="showStyleCustomizer = false"
          @update:style="updateCustomStyle"
        />
      </div>
    </div>

    <!-- AI 设置面板 -->
    <AISetting
      v-model:visible="showAISettings"
      @update:apiSettings="updateAPISettings"
    />

    <!-- 用户引导组件 -->
    <UserGuide
      v-if="showUserGuide"
      :visible="showUserGuide"
      @close="showUserGuide = false"
      @finished="handleGuideFinished"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getDefaultFontSize } from '../config/style';

// 导入组件
import HeaderComponent from '../components/ui/HeaderComponent.vue';
import FooterNavigation from '../components/ui/FooterNavigation.vue';
import ParamsPreview from '../components/customization/ParamsPreview.vue';
import ParamsPanel from '../components/customization/ParamsPanel.vue';
import NoteDisplay from '../components/note/NoteDisplay.vue';
import AppreciationBanner from '../components/ui/AppreciationBanner.vue';
import CommunityPrompt from '../components/community/CommunityPrompt.vue';
import NoteStyleCustomizer from '../components/customization/NoteStyleCustomizer.vue';
import AISetting from '../components/ai-settings/AISetting.vue';
import UserGuide from '../components/common/UserGuide.vue';

// 导入服务和工具
import { generateNote, getEstimatedResponseTime } from '../services/aiService';
import { 
  saveUserPreferences, 
  getUserPreferences, 
  saveNote as saveNoteToStorage, 
  isNoteFavorited, 
  deleteNote
} from '../services/storageService';
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
const fontSize = ref(getDefaultFontSize());
const darkMode = ref(false);
const loadingMessage = ref(''); 
const hasGeneratedContent = ref(false);
const errorMessage = ref('');
const showAppreciation = ref(true);
const headerCollapsed = ref(false);
const showParamsPanel = ref(false);
const showCommunityPrompt = ref(false);
const showStyleCustomizer = ref(false);
const showAISettings = ref(false);
const showUserGuide = ref(false);
const customStyle = ref({});
const apiSettings = ref(null);
const currentNoteId = ref(''); // 当前笔记ID
const isCurrentNoteFavorited = ref(false); // 当前笔记是否已收藏

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
  updateLogs: [],
  activeTab: 'community' // 默认选中标签
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
  
  // 重置当前笔记ID和收藏状态，防止旧笔记参数混入新生成内容
  currentNoteId.value = '';
  isCurrentNoteFavorited.value = false;
  
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
  }, 2000);
  
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
      fortuneAspect: params.fortuneAspect,
      // 添加自定义 API 设置
      apiSettings: apiSettings.value
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
                message: '内容生成成功！喜欢这种体验吗？加入社群获取更多创作技巧～',
                activeTab: 'community' // 确保生成内容后显示社群标签页
              });
              showCommunityPrompt.value = true;
            }
          }, 1500);
        }
      } catch (socialError) {
        // 社交功能失败不应影响主要功能
        logger.error('SOCIAL', '社群功能调用失败:', socialError);
      }

      // 当生成新内容时，重置收藏状态和ID
      currentNoteId.value = '';
      isCurrentNoteFavorited.value = false;
      // 清除永久存储中的笔记ID
      localStorage.removeItem('soulnote_current_note_id');
      logger.info('FAVORITE', '生成新内容，清除之前的收藏状态');
    } else {
      // 处理API返回数据格式不正确的情况
      throw new Error('服务器返回数据格式不正确，请稍后重试');
    }
  } catch (error) {
    logger.error('REQUEST', '生成请求失败', error);
    
    // 处理特定错误消息，提供更友好的提示
    if (error.message.includes('内容不完整') || error.message.includes('格式不正确') || error.message.includes('服务过载')) {
      errorMessage.value = '生成纸条内容不完整，可能是因为服务器访问高峰期。请稍后重试。';
    } else if (error.message.includes('API密钥未设置')) {
      errorMessage.value = 'API密钥未正确配置，请前往设置页面检查API配置。';
    } else {
      errorMessage.value = error.message || '生成失败，请稍后重试';
    }
    
    // 在出错时显示错误消息
    loadingMessage.value = errorMessage.value;
    
    // 显示错误弹窗，通过Toast或其他方式提醒用户
    if (typeof window.showToast === 'function') {
      window.showToast(errorMessage.value, 'error');
    } else {
      alert(errorMessage.value);
    }
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
  console.log('弹窗关闭');
  showCommunityPrompt.value = false;
  
  // 延迟重置 activeTab，确保下次打开时能根据需要设置正确的标签页
  setTimeout(() => {
    communityPromptData.activeTab = 'community'; // 重置为默认标签
  }, 500);
  
  // 更新 communityShownBefore 标记，但不修改其他弹窗设置
  getUserPreferences().then(prefs => {
    saveUserPreferences({
      ...prefs,
      communityShownBefore: true // 标记弹窗已经显示过
    }).catch(err => {
      console.error('更新弹窗显示状态失败:', err);
    });
  }).catch(err => {
    console.error('获取用户偏好设置失败:', err);
  });
}

function regenerateNote() {
  if (!isGenerating.value) {
    generateNoteContent();
  }
}

async function saveNote() {
  if (!noteContent.value) return;
  
  try {
    loadingMessage.value = '正在保存...';
    isGenerating.value = true;
    
    // 创建一个可序列化的参数对象
    const serializableParams = JSON.parse(JSON.stringify(params));
    
    const note = {
      content: noteContent.value,
      background: currentBackground.value,
      fontSize: fontSize.value,
      customStyle: customStyle.value || {},
      params: serializableParams,
      createdAt: new Date().toISOString(),
      mood: params.moods && params.moods.length > 0 ? params.moods.join('') : ''
    };
    
    // 如果已有ID，使用现有ID以避免重复收藏
    if (currentNoteId.value) {
      note.id = currentNoteId.value;
    }
    
    const savedNote = await saveNoteToStorage(note);
    isGenerating.value = false;
    
    if (savedNote) {
      // 更新当前笔记ID和收藏状态
      currentNoteId.value = savedNote.id;
      isCurrentNoteFavorited.value = true;
      
      // 使用localStorage直接保存当前笔记ID，避免依赖缓存机制
      localStorage.setItem('soulnote_current_note_id', savedNote.id);
      
      // 成功保存后显示确认信息
      showSaveConfirmation('收藏成功！');
      
      // 更新统计
      incrementGenerationCount();
      
      // 记录日志
      logger.info('SAVE', '保存笔记成功', { noteId: savedNote.id });
      
      // 延迟后提示访问收藏页
      setTimeout(() => {
        if (!showCommunityPrompt.value && !showParamsPanel.value) {
          showCollectionReminder();
        }
      }, 2000);
    } else {
      // 保存失败时尝试降级保存方式
      logger.warn('SAVE', '使用主要存储保存失败，尝试备份方法');
      
      try {
        // 备用方法：尝试序列化保存到sessionStorage
        const backupKey = `soul-note-backup-${Date.now()}`;
        sessionStorage.setItem(backupKey, JSON.stringify(note));
        showSaveConfirmation('临时保存成功！请立即导出或复制内容', 'warning');
        logger.info('SAVE', '使用备份存储方式保存成功', { backupKey });
      } catch (backupError) {
        // 备份也失败，显示更详细的错误
        logger.error('SAVE', '所有保存方式均失败', backupError);
        showSaveConfirmation('保存失败，请尝试截图保存或复制内容', 'error');
      }
    }
  } catch (error) {
    isGenerating.value = false;
    logger.error('SAVE', '保存笔记出错:', error);
    showSaveConfirmation('保存出错，请重试', 'error');
  }
}

// 显示保存确认信息
function showSaveConfirmation(message, type = 'success') {
  let icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'error') icon = '❌';
  
  alert(`${icon} ${message}`);
}

// 显示收藏提醒
function showCollectionReminder() {
  const shouldShow = Math.random() > 0.9; // 10%概率显示
  
  if (shouldShow) {
    const confirmed = confirm('心语已保存到收藏！现在要查看吗？');
    if (confirmed) {
      router.push('/saved');
    }
  }
}

// 增加生成计数
function incrementGenerationCount() {
  try {
    const countKey = 'soul-note-generation-count';
    const currentCount = parseInt(localStorage.getItem(countKey) || '0', 10);
    localStorage.setItem(countKey, (currentCount + 1).toString());
  } catch (error) {
    // 静默处理计数错误
    logger.warn('STATS', '更新计数失败', error);
  }
}

// 添加商店功能（暂时为空）
function openStore() {
  // 商店功能待实现
  console.log('商店功能开发中...');
}

// 添加一个方法来缓存生成的内容
async function cacheGeneratedContent() {
  // 确保不缓存默认内容或空内容
  const defaultMessage = '点击下方"生成心语"按钮，开始您的心灵之旅...';
  if (!noteContent.value || noteContent.value === defaultMessage) {
    return;
  }
  
  try {
    // 获取当前偏好
    const currentPrefs = await getUserPreferences();
    
    // 构建缓存数据
    const cachedContent = {
      content: noteContent.value,
      moods: params.moods,
      background: currentBackground.value,
      fontSize: fontSize.value,
      theme: params.theme,
      savageMode: params.savageMode,
      enableFortune: params.enableFortune,
      fortuneAspect: params.fortuneAspect,
      timestamp: new Date().toISOString()
    };
    
    // 更新本地保存的设置，添加缓存的内容
    await saveUserPreferences({
      ...currentPrefs,
      // 明确保存当前毒舌模式设置到用户偏好
      savageMode: params.savageMode,
      cachedContent,
      // 同时保存当前笔记ID
      cachedNoteId: currentNoteId.value
    });
    
    hasGeneratedContent.value = true;
    logger.info('CACHE', '已缓存生成的内容:', cachedContent);
  } catch (error) {
    logger.error('CACHE', '缓存生成内容失败:', error);
  }
}

// 添加清除内容方法
function clearGeneratedContent() {
  // 无需确认，直接清除内容
  // 重置内容
  noteContent.value = '点击下方"生成心语"按钮，开始您的心灵之旅...';
  
  // 重置生成状态
  hasGeneratedContent.value = false;
  
  // 清除缓存内容，但保留用户参数设置
  clearCachedContentOnly();
  
  // 重置收藏状态和ID
  currentNoteId.value = '';
  isCurrentNoteFavorited.value = false;
}

async function clearCachedContentOnly() {
  try {
    // 获取当前偏好设置
    const currentPrefs = await getUserPreferences();
    
    // 确保清除缓存内容和缓存纸条ID
    if (currentPrefs.cachedContent) {
      delete currentPrefs.cachedContent;
    }
    
    if (currentPrefs.cachedNoteId) {
      delete currentPrefs.cachedNoteId;
    }
    
    if (currentPrefs.lastGeneratedNoteId) {
      delete currentPrefs.lastGeneratedNoteId;
    }
    
    // 清除本地存储中的临时笔记ID
    localStorage.removeItem('soulnote_current_note_id');
    
    // 保存更新的偏好设置
    await saveUserPreferences(currentPrefs);
    
    // 确保重置当前状态变量
    currentNoteId.value = '';
    isCurrentNoteFavorited.value = false;
    
    logger.info('CACHE', '已清除缓存内容和临时笔记ID');
  } catch (error) {
    logger.error('CACHE', '清除缓存内容失败:', error);
  }
}

// 从缓存恢复内容
async function restoreFromCache() {
  try {
    const preferences = await getUserPreferences();
    
    // 检查是否存在缓存内容且缓存内容不为null
    if (preferences && preferences.cachedContent && preferences.cachedContent !== null) {
      const { content, moods, background, fontSize: cachedFontSize, theme, savageMode, enableFortune, fortuneAspect, timestamp } = preferences.cachedContent;
      
      // 添加时间戳检查，如果超过24小时则不恢复
      if (timestamp) {
        const cacheTime = new Date(timestamp);
        const now = new Date();
        const cacheAgeHours = (now - cacheTime) / (1000 * 60 * 60);
        
        if (cacheAgeHours > 24) {
          logger.info('CACHE', '缓存内容已过期，不恢复');
          await clearCachedContentOnly();
          params.savageMode = false;
          document.body.classList.remove('savage-mode');
          return;
        }
      }
      
      // 检查内容是否有效
      const defaultMessage = '点击下方"生成心语"按钮，开始您的心灵之旅...';
      if (!content || content === defaultMessage || content.trim() === '') {
        logger.info('CACHE', '缓存内容无效，不恢复');
        await clearContentCache();
        // 确保清除毒舌模式状态
        params.savageMode = false;
        document.body.classList.remove('savage-mode');
        return;
      }
      
      // 恢复内容
      if (content && content !== defaultMessage) {
        noteContent.value = content;
        hasGeneratedContent.value = true;
      }
      
      // 恢复表情
      if (moods && Array.isArray(moods) && moods.length > 0) {
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
      
      // 恢复主题
      if (theme) {
        params.theme = theme;
      }
      
      // 恢复毒舌模式 - 只在当前页面应用
      if (savageMode !== undefined) {
        params.savageMode = savageMode === true;
        // 确保应用毒舌模式class
        document.body.classList.toggle('savage-mode', params.savageMode);
        logger.info('CACHE', '恢复毒舌模式状态:', params.savageMode);
      }
      
      // 恢复运势参数
      if (enableFortune !== undefined) {
        params.enableFortune = enableFortune === true;
      }
      
      if (fortuneAspect) {
        params.fortuneAspect = fortuneAspect;
      }
      
      // 恢复收藏的笔记ID，但仅当ID有效且不为空时
      if (preferences.cachedNoteId && typeof preferences.cachedNoteId === 'string' && preferences.cachedNoteId.trim() !== '') {
        // 先验证此笔记ID是否存在于已保存的笔记中
        const isValid = await isNoteFavorited(preferences.cachedNoteId);
        if (isValid) {
          currentNoteId.value = preferences.cachedNoteId;
          isCurrentNoteFavorited.value = true;
          // 更新localStorage中的笔记ID
          localStorage.setItem('soulnote_current_note_id', preferences.cachedNoteId);
          logger.info('CACHE', '恢复有效的笔记ID:', preferences.cachedNoteId);
        } else {
          // 如果ID无效，清除它
          currentNoteId.value = '';
          isCurrentNoteFavorited.value = false;
          localStorage.removeItem('soulnote_current_note_id');
          logger.info('CACHE', '缓存的笔记ID无效，已清除:', preferences.cachedNoteId);
          
          // 从用户偏好中也删除无效的ID
          const updatedPrefs = await getUserPreferences();
          if (updatedPrefs.cachedNoteId) {
            delete updatedPrefs.cachedNoteId;
            await saveUserPreferences(updatedPrefs);
          }
        }
      }
      
      logger.info('CACHE', '从缓存恢复内容成功');
    } else {
      logger.info('CACHE', '没有找到有效的缓存内容');
      // 确保没有缓存内容时，毒舌模式被关闭
      params.savageMode = false;
      document.body.classList.remove('savage-mode');
    }
  } catch (error) {
    logger.error('CACHE', '恢复缓存内容失败:', error);
    // 出错时确保毒舌模式被关闭
    params.savageMode = false;
    document.body.classList.remove('savage-mode');
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
      moods: params.moods,
      // 添加其他参数
      gender: params.gender,
      age: params.age,
      relationship: params.relationship,
      zodiac: params.zodiac,
      mbti: params.mbti,
      language: params.language
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
  // 从新样式中解构出字体大小，其他样式属性保持不变
  const { fontSize: newFontSize, ...otherStyles } = newStyle;
  customStyle.value = otherStyles;
}

// 更新 API 设置
function updateAPISettings(settings) {
  apiSettings.value = settings;
  // 保存到本地存储
  if (settings) {
    localStorage.setItem('aiSettings', JSON.stringify(settings));
  } else {
    localStorage.removeItem('aiSettings');
  }
}

// 打开 AI 设置面板
function openAISettings() {
  showAISettings.value = true;
}

// 添加切换收藏状态的函数
async function toggleFavoriteStatus(data) {
  if (!noteContent.value) return;
  
  try {
    loadingMessage.value = isCurrentNoteFavorited.value ? '正在取消收藏...' : '正在收藏...';
    isGenerating.value = true;
    
    if (isCurrentNoteFavorited.value) {
      // 如果已收藏，则取消收藏
      if (currentNoteId.value) {
        await deleteNote(currentNoteId.value);
        currentNoteId.value = ''; // 清空当前笔记ID
        isCurrentNoteFavorited.value = false;
        // 清除LocalStorage中保存的笔记ID
        localStorage.removeItem('soulnote_current_note_id');
        showSaveConfirmation('已取消收藏');
        logger.info('FAVORITE', '取消收藏笔记成功', { noteId: data.id });
      }
    } else {
      // 如果未收藏，则收藏
      await saveNote();
      // saveNote函数执行完后会更新currentNoteId和isCurrentNoteFavorited
    }
    
    isGenerating.value = false;
  } catch (error) {
    isGenerating.value = false;
    logger.error('FAVORITE', '切换收藏状态失败:', error);
    showSaveConfirmation('操作失败，请重试', 'error');
  }
}

// 检查笔记收藏状态的函数
async function checkFavoriteStatus(noteId) {
  if (!noteId && !currentNoteId.value) return;
  
  try {
    const id = noteId || currentNoteId.value;
    isCurrentNoteFavorited.value = await isNoteFavorited(id);
    logger.info('FAVORITE', '检查收藏状态', { noteId: id, isFavorited: isCurrentNoteFavorited.value });
  } catch (error) {
    logger.error('FAVORITE', '检查收藏状态失败:', error);
  }
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
      params.savageMode = preferences.savageMode === true;

      // 显示感谢文本
      showAppreciation.value = !preferences.hideAppreciation;
      
      // 加载运势偏好
      if (preferences.mood) {
        params.moods = [preferences.mood];
      } else if (preferences.moods && Array.isArray(preferences.moods)) {
        params.moods = [...preferences.moods];
      }
      params.enableFortune = preferences.enableFortune === true;
      params.fortuneAspect = preferences.fortuneAspect || 'overall';
      
      // 加载新增的个人信息
      params.gender = preferences.gender;
      params.age = preferences.age;
      params.relationship = preferences.relationship;

      // 确保毒舌模式的样式正确应用
      document.body.classList.toggle('savage-mode', params.savageMode);

      // 检查是否需要显示用户引导
      const isFirstLogin = preferences.isFirstLogin === true;
      const guideTaken = preferences.guideTaken === true;
      
      // 如果是首次登录或未完成引导，显示用户引导
      if (isFirstLogin || !guideTaken) {
        // 延迟显示引导，确保页面完全加载
        setTimeout(() => {
          showUserGuide.value = true;
        }, 1500);
        
        // 更新首次登录标记
        if (isFirstLogin) {
          saveUserPreferences({
            ...preferences,
            isFirstLogin: false
          });
        }
      }

      // 检查弹窗显示逻辑，按优先级检查：版本更新 > 首次登录 > 其他提示
      const appVersion = APP_VERSION;
      
      // 如果用户明确选择了不再提醒并且版本号匹配当前版本，则跳过所有弹窗检查
      if (preferences.neverRemindCommunity && preferences.lastSeenVersion === appVersion) {
        logger.info('COMMUNITY', '用户设置了本版本不再提醒，跳过弹窗检查');
        // 恢复缓存内容并继续
        await restoreFromCache();
        return;
      }
      
      // 如果设置了下次提醒时间，检查是否已到时间
      if (preferences.communityRemindAt) {
        const nextRemindTime = new Date(preferences.communityRemindAt);
        if (nextRemindTime > new Date()) {
          logger.info('COMMUNITY', '未到下次提醒时间，跳过弹窗检查');
          // 恢复缓存内容并继续
          await restoreFromCache();
          return;
        }
      }

      // 首选检查是否需要强制显示弹窗（从未显示过）
      const neverShownBefore = !preferences.communityShownBefore;
      
      if (neverShownBefore) {
        logger.info('COMMUNITY', '从未显示过弹窗，强制显示');
        
        // 如果是首次显示，优先检查是否有版本更新
        const updatePrompt = await communityService.checkUpdatePrompt(appVersion);
        if (updatePrompt.show) {
          // 获取更新日志
          try {
            // 从API获取更新日志或使用默认日志
            const config = await communityService.getConfig();
            if (config.updateLogs && Array.isArray(config.updateLogs)) {
              updatePrompt.updateLogs = config.updateLogs;
            }
          } catch (error) {
            console.error('获取更新日志失败:', error);
          }
          
          // 明确设置 activeTab 为 'updates'，确保版本更新时显示更新日志
          Object.assign(communityPromptData, updatePrompt, { 
            activeTab: updatePrompt.reason === 'version_update' ? 'updates' : (updatePrompt.activeTab || 'community') 
          });
          
          setTimeout(() => {
            showCommunityPrompt.value = true;
          }, 1000);
          
          // 恢复缓存内容并返回
          await restoreFromCache();
          return;
        }
      }
      
      // 如果不是强制显示的情况，按常规逻辑检查
      // 1. 首先检查版本更新
      const updatePrompt = await communityService.checkUpdatePrompt(appVersion);     
      if (updatePrompt.show) {
        // 获取更新日志
        try {
          // 从API获取更新日志或使用默认日志
          const config = await communityService.getConfig();
          if (config.updateLogs && Array.isArray(config.updateLogs)) {
            updatePrompt.updateLogs = config.updateLogs;
          }
        } catch (error) {
          console.error('获取更新日志失败:', error);
        }
        
        // 明确设置 activeTab 为 'updates'，确保版本更新时显示更新日志
        Object.assign(communityPromptData, updatePrompt, { 
          activeTab: updatePrompt.reason === 'version_update' ? 'updates' : (updatePrompt.activeTab || 'community') 
        });
        
        setTimeout(() => {
          showCommunityPrompt.value = true;
        }, 1000); // 页面加载1秒后显示
        
        // 恢复缓存内容并返回
        await restoreFromCache();
        return;
      }
      
      // 2. 然后检查是否是其他提醒
      const shouldShow = await communityService.shouldShowPrompt();
      if (shouldShow.show) {
        Object.assign(communityPromptData, shouldShow);
        setTimeout(() => {
          showCommunityPrompt.value = true;
        }, 1000); // 页面加载1秒后显示
      }

      // 恢复缓存内容
      await restoreFromCache();

      // 加载 AI 设置
      const savedApiSettings = localStorage.getItem('aiSettings');
      if (savedApiSettings) {
        try {
          apiSettings.value = JSON.parse(savedApiSettings);
        } catch (e) {
          console.error('解析API设置失败:', e);
        }
      }
      
      // 记录加载的参数
      logger.info('PREFERENCES', '已加载用户偏好设置:', {
        theme: params.theme,
        savageMode: params.savageMode,
        enableFortune: params.enableFortune,
        fortuneAspect: params.fortuneAspect,
        moods: params.moods
      });
    }

    // 检查是否应该显示社群提示
    checkCommunityPrompt();

    // 加载缓存的内容
    await loadContentFromCache();
    
    // 使用路由事件监听页面激活
    router.afterEach((to, from) => {
      // 如果路由到首页，检查收藏状态
      if (to.name === 'home' || to.name === 'Home') {
        logger.info('ROUTE', '返回首页，检查收藏状态');
        nextTick(() => {
          // 尝试加载保存在localStorage中的当前笔记ID
          const savedNoteId = localStorage.getItem('soulnote_current_note_id');
          if (savedNoteId) {
            if (currentNoteId.value !== savedNoteId) {
              // 如果ID不匹配，更新为存储的ID
              currentNoteId.value = savedNoteId;
            }
            // 无论如何都重新检查收藏状态
            checkFavoriteStatus(savedNoteId).then(() => {
              logger.info('FAVORITE', '路由返回首页，收藏状态已更新', { 
                noteId: savedNoteId, 
                isFavorited: isCurrentNoteFavorited.value 
              });
            });
          } else if (currentNoteId.value) {
            // 如果localStorage中没有ID但当前有ID，检查这个ID
            checkFavoriteStatus(currentNoteId.value);
          }
        });
      } else if (from.name === 'home' || from.name === 'Home') {
        // 当离开首页时，清除localStorage中的笔记ID，避免返回时加载
        logger.info('ROUTE', '离开首页，清除临时笔记ID');
        localStorage.removeItem('soulnote_current_note_id');
      }
    });
    
    // 立即检查localStorage中保存的笔记ID
    const savedNoteId = localStorage.getItem('soulnote_current_note_id');
    if (savedNoteId) {
      currentNoteId.value = savedNoteId;
      // 检查收藏状态
      checkFavoriteStatus(savedNoteId);
      logger.info('PAGE', '从永久存储恢复笔记ID:', savedNoteId);
    }
    
  } catch (error) {
    logger.error('PREFERENCES', '加载用户偏好失败', error);
  }
});

// 定义handleResize为组件级别的变量
const handleResize = () => {
  fontSize.value = getDefaultFontSize();
};

onBeforeUnmount(() => {
  // 组件卸载前，保存用户偏好
  updateLocalPreferences();
  
  // 确保缓存当前内容
  if (hasGeneratedContent.value) {
    cacheGeneratedContent();
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize);
  
  // 不再移除毒舌模式，而是依赖localStorage中的状态来控制
  // document.body.classList.remove('savage-mode');
  
  // 清除localStorage中的临时笔记ID，防止在页面间切换时产生不必要的状态保留
  localStorage.removeItem('soulnote_current_note_id');
  logger.info('UNMOUNT', '组件卸载，已清除临时笔记ID');
});

// 监听暗黑模式变化
watch(darkMode, (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);
});

// 监听毒舌模式变化
watch(() => params.savageMode, (isSavage) => {
  document.body.classList.toggle('savage-mode', isSavage);
  // 更新localStorage中的毒舌模式状态，确保所有页面都能立即识别
  if (isSavage) {
    localStorage.setItem('soulnote_savage_mode', 'true');
  } else {
    localStorage.removeItem('soulnote_savage_mode');
  }
}, { immediate: true });

// 监听内容、表情、背景和字体大小的变化，更新缓存
watch([noteContent, () => params.moods, currentBackground, fontSize], () => {
  const defaultMessage = '点击下方"生成心语"按钮，开始您的心灵之旅...';
  if (noteContent.value && noteContent.value !== defaultMessage && hasGeneratedContent.value) {
    cacheGeneratedContent();
  }
}, { deep: true });

// 在loadContentFromCache函数中，当加载缓存内容时，同时检查其收藏状态
async function loadContentFromCache() {
  try {
    // 获取当前偏好设置
    const preferences = await getUserPreferences();
    
    // 检查是否有缓存的内容
    if (preferences.cachedContent) {
      const { content, background, fontSize: cachedFontSize, moods, theme, savageMode, enableFortune, fortuneAspect, timestamp } = preferences.cachedContent;
      
      // 添加时间戳检查，如果超过24小时则不恢复
      if (timestamp) {
        const cacheTime = new Date(timestamp);
        const now = new Date();
        const cacheAgeHours = (now - cacheTime) / (1000 * 60 * 60);
        
        if (cacheAgeHours > 24) {
          logger.info('CACHE', '缓存内容已过期，不恢复');
          await clearCachedContentOnly();
          params.savageMode = false;
          document.body.classList.remove('savage-mode');
          return;
        }
      }
      
      // 确保缓存内容有效
      const defaultMessage = '点击下方"生成心语"按钮，开始您的心灵之旅...';
      if (!content || content === defaultMessage || content.trim() === '') {
        logger.info('CACHE', '缓存内容无效，不恢复');
        await clearCachedContentOnly();
        params.savageMode = false;
        document.body.classList.remove('savage-mode');
        return;
      }
      
      // 更新UI
      noteContent.value = content;
      currentBackground.value = background || 'paper-1';
      if (cachedFontSize) {
        fontSize.value = cachedFontSize;
      }
      
      // 更新参数
      if (moods && Array.isArray(moods)) {
        params.moods = moods;
      }
      
      if (theme) {
        params.theme = theme;
      }
      
      // 恢复毒舌模式 - 只在当前页面应用
      if (savageMode !== undefined) {
        params.savageMode = savageMode === true;
        // 确保应用毒舌模式class
        document.body.classList.toggle('savage-mode', params.savageMode);
        logger.info('CACHE', '恢复毒舌模式状态:', params.savageMode);
      }
      
      // 恢复运势参数
      if (enableFortune !== undefined) {
        params.enableFortune = enableFortune === true;
      }
      
      if (fortuneAspect) {
        params.fortuneAspect = fortuneAspect;
      }
      
      logger.info('CACHE', '从缓存恢复内容成功');

      // 恢复生成状态
      hasGeneratedContent.value = true;
      
      // 检查缓存内容的收藏状态
      if (preferences.cachedNoteId && typeof preferences.cachedNoteId === 'string' && preferences.cachedNoteId.trim() !== '') {
        // 验证ID有效性
        const isValid = await isNoteFavorited(preferences.cachedNoteId);
        if (isValid) {
          currentNoteId.value = preferences.cachedNoteId;
          isCurrentNoteFavorited.value = true;
          // 更新localStorage
          localStorage.setItem('soulnote_current_note_id', preferences.cachedNoteId);
          logger.info('CACHE', '恢复有效的笔记ID:', preferences.cachedNoteId);
        } else {
          // 无效ID，清除它
          currentNoteId.value = '';
          isCurrentNoteFavorited.value = false;
          localStorage.removeItem('soulnote_current_note_id');
          // 从用户偏好中移除
          const updatedPrefs = await getUserPreferences();
          if (updatedPrefs.cachedNoteId) {
            delete updatedPrefs.cachedNoteId;
            await saveUserPreferences(updatedPrefs);
          }
          logger.info('CACHE', '缓存的笔记ID无效，已清除');
        }
      }
    } else {
      // 确保没有缓存内容时，毒舌模式被关闭
      params.savageMode = false;
      document.body.classList.remove('savage-mode');
    }
  } catch (error) {
    logger.error('CACHE', '恢复缓存内容失败:', error);
    // 出错时确保毒舌模式被关闭
    params.savageMode = false;
    document.body.classList.remove('savage-mode');
  }
}

// 添加一个单独的函数来缓存当前笔记ID
async function cacheCurrentNoteId(noteId) {
  if (!noteId) return;
  
  try {
    const currentPrefs = await getUserPreferences();
    await saveUserPreferences({
      ...currentPrefs,
      cachedNoteId: noteId
    });
    logger.info('CACHE', '缓存当前笔记ID成功:', noteId);
  } catch (error) {
    logger.error('CACHE', '缓存笔记ID失败:', error);
  }
}

// 定义checkCommunityPrompt函数，检查是否应该显示社区提示
function checkCommunityPrompt() {
  // 检查是否应该显示社区提示，这里保留现有逻辑
  communityService.shouldShowPrompt().then(shouldShow => {
    if (shouldShow.show) {
      Object.assign(communityPromptData, shouldShow);
      setTimeout(() => {
        showCommunityPrompt.value = true;
      }, 1000);
    }
  }).catch(error => {
    logger.error('COMMUNITY', '检查社区提示失败', error);
  });
}

// 处理引导完成事件
function handleGuideFinished() {
  showUserGuide.value = false;
  // 可以在这里添加引导完成后的特殊处理逻辑
}

// 添加一个清除所有内容缓存的函数
async function clearContentCache() {
  try {
    // 获取当前偏好
    const currentPrefs = await getUserPreferences();
    
    // 删除缓存相关的所有字段
    if (currentPrefs.cachedContent) {
      delete currentPrefs.cachedContent;
    }
    
    if (currentPrefs.cachedNoteId) {
      delete currentPrefs.cachedNoteId;
    }
    
    if (currentPrefs.lastGeneratedNoteId) {
      delete currentPrefs.lastGeneratedNoteId;
    }
    
    // 清除本地临时ID
    localStorage.removeItem('soulnote_current_note_id');
    
    // 保存更新后的偏好设置
    await saveUserPreferences(currentPrefs);
    
    // 重置本地状态
    currentNoteId.value = '';
    isCurrentNoteFavorited.value = false;
    hasGeneratedContent.value = false;
    noteContent.value = '点击下方"生成心语"按钮，开始您的心灵之旅...';
    
    logger.info('CACHE', '已完全清除所有内容缓存');
  } catch (error) {
    logger.error('CACHE', '清除内容缓存失败:', error);
  }
}
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