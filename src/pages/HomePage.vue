<template>
  <div class="home-page fixed-page-layout" :class="{'savage-mode': params.savageMode}">
    <!-- 固定在顶部的页眉 -->
    <header class="header fixed-header">
      <button class="icon-btn" @click="goToSettings">
        <i class="fas fa-cog"></i>
      </button>
      <h1 class="app-title">星语心笺</h1>
      <div class="header-right">
        <!-- 添加清除按钮 -->
        <button class="icon-btn" @click="clearGeneratedContent" v-if="hasGeneratedContent">
          <i class="fas fa-times"></i>
        </button>
        <button class="icon-btn" @click="goToSavedNotes">
          <i class="fas fa-bookmark"></i>
        </button>
      </div>
    </header>
    
    <!-- 可滚动的主内容区 -->
    <div class="scrollable-content">
      <!-- 纸条展示区 -->
      <div class="note-container" ref="noteContainerRef">
        <!-- 替换原有的心情输入和运势选择器，使用统一的参数卡片 -->
        <div class="params-card">
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
            <div class="params-item">
              <i :class="themeOptions.find(t => t.value === params.theme)?.icon || 'fas fa-comment-dots'"></i>
              <span>{{ themeOptions.find(t => t.value === params.theme)?.label || '聊天' }}</span>
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
        
        <!-- NoteCard 修改传入的mood参数 -->
        <NoteCard 
          :content="noteContent" 
          :mood="params.moods && params.moods.length > 0 ? params.moods.join('') : ''"
          :background="currentBackground"
          :fontSize="fontSize"
          :animate="isAnimating"
          :animation-duration="animationDuration"
          ref="noteCardRef"
        />

        <!-- 添加可关闭的感谢文本，移到HomePage中 -->
        <div class="appreciation-container" v-if="showAppreciation">
          <div class="appreciation-text">
            <p>
              喜欢这个应用？
              <a href="#" @click.prevent="navigateToAbout">请作者喝杯咖啡</a>
              支持独立开发者 ☕️
            </p>
          </div>
          <button class="close-appreciation" @click="hideAppreciation">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 背景选择器和字号调整保持不变 -->
        <div class="background-selector">
          <span 
            v-for="(bg, index) in backgrounds" 
            :key="bg.value" 
            :class="['bg-dot', { active: currentBackground === bg.value }]"
            @click="currentBackground = bg.value"
          ></span>
        </div>
        
        <div class="font-size-control">
          <button class="icon-btn" @click="decreaseFontSize">
            <i class="fas fa-font"></i>-
          </button>
          <span class="font-size-indicator">{{ fontSize }}px</span>
          <button class="icon-btn" @click="increaseFontSize">
            <i class="fas fa-font"></i>+
          </button>
        </div>
      </div>
    </div>
    
    <!-- 固定在底部的控制区域 -->
    <div class="control-section fixed-footer">
      <LoadingIndicator 
        v-if="isGenerating" 
        :is-loading="isGenerating"
        :message="loadingMessage"
        :adaptive-time="estimatedResponseTime"
      />
      
      <button 
        class="btn btn-primary generate-btn" 
        @click="generateNoteContent"
        :disabled="isGenerating"
      >
        <i class="fas fa-magic"></i>
        <span>{{ isGenerating ? '生成中...' : '生成心语' }}</span>
      </button>
      
      <div class="action-buttons">
        <button class="icon-btn action-btn" @click="regenerateNote" :disabled="isGenerating">
          <i class="fas fa-redo"></i>
        </button>
        <button class="icon-btn action-btn" @click="saveNote" :disabled="!noteContent || isGenerating">
          <i class="fas fa-heart"></i>
        </button>
        <button class="icon-btn action-btn" @click="exportNote" :disabled="!noteContent || isGenerating">
          <i class="fas fa-download"></i>
        </button>
        <button class="icon-btn action-btn" @click="shareNote" :disabled="!noteContent || isGenerating">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
    </div>
    
  <!-- 参数设置面板 (模态弹窗) -->
  <div class="modal-overlay" v-if="showParamsPanel" @click="closeParamsPanel"></div>
  <transition name="slide-up">
    <div class="params-panel" v-if="showParamsPanel">
      <div class="params-panel-header">
        <h2>心语参数设置</h2>
        <button class="icon-btn close-btn" @click="closeParamsPanel">
          <i class="fas fa-times"></i>
        </button>
      </div>

        <div class="params-panel-content">
          <!-- 心情/场景选择器 - 添加折叠功能 -->
          <div class="panel-section">
            <div class="section-header collapsible" @click="toggleSection('moods')">
              <h3>心情 / 场景</h3>
              <div class="section-controls">
                <div class="mood-counter" v-if="!collapsedSections.moods">
                  <span>{{ params.moods.length }}/5</span>
                  <button v-if="params.moods.length > 0" 
                          class="icon-btn clear-btn" 
                          @click.stop="clearMoods">
                    <i class="fas fa-times-circle"></i>
                  </button>
                </div>
                <i :class="[collapsedSections.moods ? 'fas fa-chevron-down' : 'fas fa-chevron-up']"></i>
              </div>
            </div>

            <div class="section-content" v-show="!collapsedSections.moods">
              <!-- 显示已选择的表情 -->
              <div class="selected-emojis" v-if="params.moods.length > 0">
                <div class="selected-emojis-wrapper">
                  <div v-for="(emoji, index) in params.moods" 
                      :key="`selected-${index}`" 
                      class="selected-emoji-item">
                    {{ emoji }}
                    <button class="remove-emoji-btn" @click="removeEmoji(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="emoji-tabs">
                <div 
                  v-for="(category, idx) in emojiCategories" 
                  :key="idx" 
                  :class="['emoji-tab', {active: currentEmojiCategory === idx}]"
                  @click="currentEmojiCategory = idx"
                >
                  <i :class="category.icon"></i>
                  <small>{{ category.name }}</small>
                </div>
              </div>

              <div class="emoji-list">
                <div 
                  v-for="emoji in emojiCategories[currentEmojiCategory].emojis" 
                  :key="emoji.symbol"
                  :class="['emoji-item', { active: params.moods.includes(emoji.symbol) }]"
                  @click="toggleEmoji(emoji.symbol)"
                  :title="emoji.name"
                >
                  {{ emoji.symbol }}
                </div>
              </div>
              
              <div class="emoji-custom">
                <input 
                  type="text" 
                  v-model="customMood" 
                  class="mood-input"
                  placeholder="自定义内容..."
                  maxlength="5"
                />
                <button class="btn btn-small" @click="addCustomEmoji" :disabled="!customMood.trim()">
                  添加
                </button>
              </div>
            </div>
          </div>

          <!-- 新增主题选择 - 添加折叠功能 -->
          <div class="panel-section">
            <div class="section-header collapsible" @click="toggleSection('theme')">
              <h3>内容主题</h3>
              <i :class="[collapsedSections.theme ? 'fas fa-chevron-down' : 'fas fa-chevron-up']"></i>
            </div>
            
            <div class="section-content" v-show="!collapsedSections.theme">
              <div class="theme-options">
                <div 
                  v-for="theme in themeOptions" 
                  :key="theme.value"
                  :class="['theme-option', {active: params.theme === theme.value}]"
                  @click="params.theme = theme.value"
                >
                  <i :class="theme.icon"></i>
                  <span>{{ theme.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 情感风格选择 - 添加折叠功能 -->
          <div class="panel-section">
            <div class="section-header collapsible" @click="toggleSection('style')">
              <h3>情感风格</h3>
              <i :class="[collapsedSections.style ? 'fas fa-chevron-down' : 'fas fa-chevron-up']"></i>
            </div>
            
            <div class="section-content" v-show="!collapsedSections.style">
              <div class="style-toggle">
                <div 
                  class="style-option"
                  :class="{active: !params.savageMode}"
                  @click="params.savageMode = false"
                >
                  <i class="fas fa-smile"></i>
                  <span>暖心</span>
                </div>
                <div 
                  class="style-option"
                  :class="{active: params.savageMode}"
                  @click="params.savageMode = true"
                >
                  <i class="fas fa-fire"></i>
                  <span>毒舌</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 运势设置 - 添加折叠功能 -->
          <div class="panel-section">
            <div class="section-header collapsible" @click="toggleSection('fortune')">
              <h3>今日运势</h3>
              <div class="section-controls">
                <div class="toggle-switch-container" @click.stop>
                  <input 
                    type="checkbox" 
                    id="fortuneSwitchPanel" 
                    v-model="params.enableFortune"
                    class="toggle-checkbox"
                  />
                  <label for="fortuneSwitchPanel" class="toggle-label">
                    <span class="toggle-inner"></span>
                    <span class="toggle-switch"></span>
                  </label>
                </div>
                <i :class="[collapsedSections.fortune ? 'fas fa-chevron-down' : 'fas fa-chevron-up']"></i>
              </div>
            </div>
            
            <div class="section-content" v-show="!collapsedSections.fortune && params.enableFortune">
              <div class="fortune-options">
                <div 
                  v-for="aspect in fortuneAspects" 
                  :key="aspect.value"
                  :class="['fortune-option', {active: params.fortuneAspect === aspect.value}]"
                  @click="params.fortuneAspect = aspect.value"
                >
                  <i :class="aspect.icon"></i>
                  <span>{{ aspect.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      <div class="params-panel-footer">
        <button class="btn btn-secondary" @click="closeParamsPanel">取消</button>
        <button class="btn btn-random" @click="randomizeParams">
          <i class="fas fa-dice"></i> 随机
        </button>
        <button class="btn btn-primary" @click="saveAndClosePanel">确定</button>
      </div>
      </div>
    </transition>
      <div>
        <transition name="fade">
          <ImagePreviewModel
            v-if="showImagePreview"
            :imageUrl="previewImageUrl"
            :onDownload="saveToDevice"
            :onShare="handleSystemShare"
            @close="closeImagePreview"
        />
        </transition>
      </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import NoteCard from '../components/NoteCard.vue';
import LoadingIndicator from '../components/LoadingIndicator.vue';
import ImagePreviewModel from '../components/ImagePreviewModel.vue';
import CommunityPrompt from '../components/CommunityPrompt.vue';
// 修改回原来的导入方式，确保代码可以正常运行
import { generateNote, getEstimatedResponseTime } from '../services/aiService';
import { saveUserPreferences, getUserPreferences, saveNote as saveNoteToStorage } from '../services/storageService';
import { useNoteExport } from '../composables/useNoteExport';
import { communityService } from '../services/communityService';
// 导入日志工具
import logger from '../utils/logger';


const router = useRouter();
const noteContainerRef = ref(null);
const noteCardRef = ref(null);

// 状态管理
const showParams = ref(false);
const showEmojiPicker = ref(false);
const currentEmojiCategory = ref(0);
const isGenerating = ref(false);
const isAnimating = ref(false);
const isLoading = ref(false);
const noteContent = ref('点击下方"生成心语"按钮，开始您的心灵之旅...');
const currentBackground = ref('paper-1');
const fontSize = ref(24);
const darkMode = ref(false);
const loadingMessage = ref(''); 
const hasGeneratedContent = ref(false); // 添加判断是否已生成内容的状态
const errorMessage = ref(''); // 添加错误消息状态
const showAppreciation = ref(true);

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
  theme: 'chat' // 新增主题参数，默认为聊天
});

// 主题选项
const themeOptions = [
  { label: '聊天', value: 'chat', icon: 'fas fa-comment-dots' },
  { label: '箴言', value: 'aphorism', icon: 'fas fa-book-open' },
  { label: '诗歌', value: 'poetry', icon: 'fas fa-feather-alt' },
  { label: '俳句', value: 'haiku', icon: 'fas fa-leaf' }
];

// 用于自定义表情输入
const customMood = ref('');

// 运势类型选项
const fortuneAspects = [
  { label: '整体', value: 'overall', icon: 'fas fa-star' },
  { label: '爱情', value: 'love', icon: 'fas fa-heart' },
  { label: '事业', value: 'career', icon: 'fas fa-briefcase' },
  { label: '财运', value: 'wealth', icon: 'fas fa-coins' }
];

const showImagePreview = ref(false);
const previewImageUrl = ref('');

// 数据源
const zodiacs = [
  { label: '白羊座', value: 'aries' },
  { label: '金牛座', value: 'taurus' },
  { label: '双子座', value: 'gemini' },
  { label: '巨蟹座', value: 'cancer' },
  { label: '狮子座', value: 'leo' },
  { label: '处女座', value: 'virgo' },
  { label: '天秤座', value: 'libra' },
  { label: '天蝎座', value: 'scorpio' },
  { label: '射手座', value: 'sagittarius' },
  { label: '摩羯座', value: 'capricorn' },
  { label: '水瓶座', value: 'aquarius' },
  { label: '双鱼座', value: 'pisces' }
];

const mbtiTypes = [
  { label: 'INTJ - 建筑师', value: 'INTJ' },
  { label: 'INTP - 逻辑学家', value: 'INTP' },
  { label: 'ENTJ - 指挥官', value: 'ENTJ' },
  { label: 'ENTP - 辩论家', value: 'ENTP' },
  { label: 'INFJ - 提倡者', value: 'INFJ' },
  { label: 'INFP - 调停者', value: 'INFP' },
  { label: 'ENFJ - 主人公', value: 'ENFJ' },
  { label: 'ENFP - 活动家', value: 'ENFP' },
  { label: 'ISTJ - 物流师', value: 'ISTJ' },
  { label: 'ISFJ - 守卫者', value: 'ISFJ' },
  { label: 'ESTJ - 总经理', value: 'ESTJ' },
  { label: 'ESFJ - 执政官', value: 'ESFJ' },
  { label: 'ISTP - 鉴赏家', value: 'ISTP' },
  { label: 'ISFP - 探险家', value: 'ISFP' },
  { label: 'ESTP - 企业家', value: 'ESTP' },
  { label: 'ESFP - 表演者', value: 'ESFP' }
];

const backgrounds = [
  { value: 'paper-1', label: '米白色' },
  { value: 'paper-2', label: '淡粉色' },
  { value: 'paper-3', label: '淡蓝色' },
  { value: 'paper-4', label: '淡绿色' }
];

// 大幅扩充Emoji分类数据
const emojiCategories = [
  {
    name: '心情',
    icon: 'fas fa-smile',
    emojis: [
      { symbol: '😊', name: '开心' },
      { symbol: '😄', name: '笑' },
      { symbol: '😁', name: '大笑' },
      { symbol: '🥰', name: '爱' },
      { symbol: '😍', name: '喜欢' },
      { symbol: '🤗', name: '拥抱' },
      { symbol: '😌', name: '放松' },
      { symbol: '😏', name: '得意' },
      { symbol: '😇', name: '天使' },
      { symbol: '🙂', name: '微笑' },
      { symbol: '🤔', name: '思考' },
      { symbol: '🧐', name: '疑惑' },
      { symbol: '🤨', name: '怀疑' },
      { symbol: '😮', name: '惊讶' },
      { symbol: '😲', name: '震惊' },
      { symbol: '😳', name: '羞涩' },
      { symbol: '😢', name: '伤心' },
      { symbol: '😭', name: '大哭' },
      { symbol: '😞', name: '失望' },
      { symbol: '😔', name: '郁闷' },
      { symbol: '😟', name: '担忧' },
      { symbol: '😤', name: '坚定' },
      { symbol: '😠', name: '生气' },
      { symbol: '😡', name: '愤怒' },
      { symbol: '😱', name: '害怕' },
      { symbol: '😴', name: '疲倦' },
      { symbol: '😪', name: '困倦' },
      { symbol: '🤢', name: '恶心' },
      { symbol: '🤒', name: '生病' },
      { symbol: '😵', name: '晕' },
      { symbol: '🥴', name: '迷糊' },
      { symbol: '😎', name: '酷' },
      { symbol: '🤩', name: '激动' },
      { symbol: '🥳', name: '庆祝' },
      { symbol: '😘', name: '飞吻' },
      { symbol: '🥺', name: '请求' },
      { symbol: '🙄', name: '无语' },
      { symbol: '😬', name: '尴尬' },
      { symbol: '😑', name: '无表情' },
      { symbol: '😶', name: '沉默' },
      { symbol: '🤐', name: '闭嘴' },
      { symbol: '🤫', name: '嘘' },
      { symbol: '🤭', name: '偷笑' },
      { symbol: '😷', name: '口罩' },
      { symbol: '🤕', name: '受伤' },
      { symbol: '😈', name: '恶魔' },
      { symbol: '🤯', name: '爆炸' },
      { symbol: '🥵', name: '热' },
      { symbol: '🥶', name: '冷' },
      { symbol: '🤮', name: '呕吐' }
    ]
  },
  {
    name: '场景',
    icon: 'fas fa-map-marker-alt',
    emojis: [
      { symbol: '🏠', name: '家' },
      { symbol: '🏡', name: '别墅' },
      { symbol: '🏢', name: '办公楼' },
      { symbol: '🏬', name: '商场' },
      { symbol: '🏫', name: '学校' },
      { symbol: '🏛️', name: '古建筑' },
      { symbol: '⛪', name: '教堂' },
      { symbol: '🕌', name: '清真寺' },
      { symbol: '🏥', name: '医院' },
      { symbol: '🏨', name: '酒店' },
      { symbol: '🏭', name: '工厂' },
      { symbol: '🏚️', name: '老房子' },
      { symbol: '🏙️', name: '城市' },
      { symbol: '🌆', name: '黄昏城市' },
      { symbol: '🌃', name: '夜晚城市' },
      { symbol: '🌉', name: '夜桥' },
      { symbol: '🎭', name: '剧院' },
      { symbol: '🎪', name: '马戏团' },
      { symbol: '🎡', name: '摩天轮' },
      { symbol: '🎢', name: '过山车' },
      { symbol: '🏟️', name: '体育场' },
      { symbol: '🏝️', name: '孤岛' },
      { symbol: '🏖️', name: '海滩' },
      { symbol: '⛱️', name: '沙滩伞' },
      { symbol: '🏞️', name: '户外' },
      { symbol: '🗻', name: '富士山' },
      { symbol: '🌋', name: '火山' },
      { symbol: '⛰️', name: '山' },
      { symbol: '🏔️', name: '雪山' },
      { symbol: '🌄', name: '日出山' },
      { symbol: '🌅', name: '日出海' },
      { symbol: '🌇', name: '日落' },
      { symbol: '🌊', name: '海浪' },
      { symbol: '🏜️', name: '沙漠' },
      { symbol: '🏕️', name: '野营' },
      { symbol: '☕', name: '咖啡厅' },
      { symbol: '🍽️', name: '餐厅' },
      { symbol: '🍷', name: '酒吧' },
      { symbol: '🌁', name: '雾城' },
      { symbol: '🌌', name: '银河' },
      { symbol: '🚗', name: '路上' },
      { symbol: '🚅', name: '高铁' },
      { symbol: '✈️', name: '旅行' },
      { symbol: '🏦', name: '银行' },
      { symbol: '🛒', name: '购物' },
      { symbol: '🎮', name: '游戏厅' },
      { symbol: '📱', name: '网上' },
      { symbol: '🛋️', name: '客厅' },
      { symbol: '🛌', name: '卧室' },
      { symbol: '🚿', name: '浴室' }
    ]
  },
  {
    name: '活动',
    icon: 'fas fa-running',
    emojis: [
      { symbol: '📚', name: '阅读' },
      { symbol: '✍️', name: '写作' },
      { symbol: '🎮', name: '游戏' },
      { symbol: '🎯', name: '目标' },
      { symbol: '🎨', name: '绘画' },
      { symbol: '🎭', name: '表演' },
      { symbol: '🎬', name: '拍摄' },
      { symbol: '🎤', name: '唱歌' },
      { symbol: '🎧', name: '听音乐' },
      { symbol: '🎵', name: '音乐' },
      { symbol: '🎹', name: '弹琴' },
      { symbol: '🎸', name: '吉他' },
      { symbol: '🥁', name: '打鼓' },
      { symbol: '🎻', name: '小提琴' },
      { symbol: '💃', name: '跳舞' },
      { symbol: '🕺', name: '跳舞' },
      { symbol: '🏃', name: '跑步' },
      { symbol: '🚶', name: '散步' },
      { symbol: '🧘', name: '冥想' },
      { symbol: '🧗', name: '攀岩' },
      { symbol: '🏊', name: '游泳' },
      { symbol: '🚴', name: '骑车' },
      { symbol: '⛹️', name: '打球' },
      { symbol: '🏋️', name: '健身' },
      { symbol: '🤸', name: '体操' },
      { symbol: '🏄', name: '冲浪' },
      { symbol: '🏂', name: '滑雪' },
      { symbol: '🧠', name: '思考' },
      { symbol: '🍳', name: '烹饪' },
      { symbol: '🍽️', name: '用餐' },
      { symbol: '🍻', name: '聚会' },
      { symbol: '🎂', name: '庆生' },
      { symbol: '🎁', name: '送礼' },
      { symbol: '📱', name: '刷手机' },
      { symbol: '💻', name: '工作' },
      { symbol: '🛌', name: '休息' },
      { symbol: '💤', name: '睡觉' },
      { symbol: '🛀', name: '泡澡' },
      { symbol: '🚿', name: '淋浴' },
      { symbol: '🧹', name: '打扫' },
      { symbol: '🛒', name: '购物' },
      { symbol: '💼', name: '上班' },
      { symbol: '🧳', name: '旅行' },
      { symbol: '🌱', name: '种植' },
      { symbol: '🐕', name: '遛狗' },
      { symbol: '📸', name: '拍照' },
      { symbol: '🎣', name: '钓鱼' },
      { symbol: '🧩', name: '拼图' },
      { symbol: '🎲', name: '桌游' },
      { symbol: '🎰', name: '赌博' }
    ]
  },
  {
    name: '天气',
    icon: 'fas fa-cloud-sun',
    emojis: [
      { symbol: '☀️', name: '晴天' },
      { symbol: '🌤️', name: '多云' },
      { symbol: '⛅', name: '晴间多云' },
      { symbol: '🌥️', name: '大部多云' },
      { symbol: '☁️', name: '阴天' },
      { symbol: '🌦️', name: '阵雨' },
      { symbol: '🌧️', name: '下雨' },
      { symbol: '⛈️', name: '雷雨' },
      { symbol: '🌩️', name: '雷电' },
      { symbol: '🌨️', name: '雪' },
      { symbol: '❄️', name: '雪花' },
      { symbol: '☃️', name: '雪人' },
      { symbol: '⛄', name: '雪人' },
      { symbol: '🌬️', name: '吹风' },
      { symbol: '💨', name: '大风' },
      { symbol: '🌪️', name: '龙卷风' },
      { symbol: '🌫️', name: '雾' },
      { symbol: '🌈', name: '彩虹' },
      { symbol: '☔', name: '雨伞' },
      { symbol: '⚡', name: '高压电' },
      { symbol: '❄️', name: '冰冻' },
      { symbol: '🔥', name: '火' },
      { symbol: '💧', name: '水滴' },
      { symbol: '🌊', name: '海浪' },
      { symbol: '🌀', name: '台风' },
      { symbol: '🌞', name: '热太阳' },
      { symbol: '🌝', name: '满月' },
      { symbol: '🌚', name: '新月' },
      { symbol: '🌑', name: '新月' },
      { symbol: '🌒', name: '眉月' },
      { symbol: '🌓', name: '上弦月' },
      { symbol: '🌔', name: '盈凸月' },
      { symbol: '🌕', name: '满月' },
      { symbol: '🌖', name: '亏凸月' },
      { symbol: '🌗', name: '下弦月' },
      { symbol: '🌘', name: '残月' },
      { symbol: '🌙', name: '弯月' },
      { symbol: '🌛', name: '月亮脸' },
      { symbol: '🌜', name: '睡月' },
      { symbol: '☄️', name: '彗星' },
      { symbol: '✨', name: '闪烁' },
      { symbol: '⚡', name: '闪电' },
      { symbol: '💦', name: '水滴' },
      { symbol: '🧊', name: '冰块' },
      { symbol: '🌡️', name: '温度计' },
      { symbol: '🌠', name: '流星' },
      { symbol: '🔭', name: '观星' },
      { symbol: '⏱️', name: '计时' },
      { symbol: '🌃', name: '夜晚' },
      { symbol: '🌄', name: '日出' }
    ]
  },
  {
    name: '季节',
    icon: 'fas fa-leaf',
    emojis: [
      { symbol: '🌱', name: '发芽' },
      { symbol: '🌿', name: '草药' },
      { symbol: '☘️', name: '三叶草' },
      { symbol: '🍀', name: '四叶草' },
      { symbol: '🌸', name: '樱花' },
      { symbol: '💮', name: '白花' },
      { symbol: '🏵️', name: '玫瑰花' },
      { symbol: '🌹', name: '玫瑰' },
      { symbol: '🌺', name: '芙蓉' },
      { symbol: '🌻', name: '向日葵' },
      { symbol: '🌼', name: '花' },
      { symbol: '🌷', name: '郁金香' },
      { symbol: '🍃', name: '风中树叶' },
      { symbol: '🌳', name: '落叶树' },
      { symbol: '🌲', name: '常青树' },
      { symbol: '🌴', name: '棕榈树' },
      { symbol: '🌵', name: '仙人掌' },
      { symbol: '🍂', name: '落叶' },
      { symbol: '🍁', name: '枫叶' },
      { symbol: '🍄', name: '蘑菇' },
      { symbol: '🌾', name: '稻穗' },
      { symbol: '🥀', name: '枯萎的花' },
      { symbol: '🪴', name: '盆栽' },
      { symbol: '🌰', name: '栗子' },
      { symbol: '🍇', name: '葡萄' },
      { symbol: '🍓', name: '草莓' },
      { symbol: '🍉', name: '西瓜' },
      { symbol: '🍊', name: '橘子' },
      { symbol: '🍎', name: '红苹果' },
      { symbol: '🍏', name: '青苹果' },
      { symbol: '🍐', name: '梨' },
      { symbol: '🍑', name: '桃子' },
      { symbol: '🌽', name: '玉米' },
      { symbol: '🥕', name: '胡萝卜' },
      { symbol: '🍅', name: '西红柿' },
      { symbol: '❄️', name: '雪花' },
      { symbol: '☃️', name: '雪人' },
      { symbol: '🧣', name: '围巾' },
      { symbol: '🧤', name: '手套' },
      { symbol: '🧥', name: '大衣' },
      { symbol: '☀️', name: '夏日' },
      { symbol: '🍦', name: '冰淇淋' },
      { symbol: '🏄', name: '冲浪' },
      { symbol: '🏝️', name: '沙滩岛' },
      { symbol: '👓', name: '眼镜' },
      { symbol: '👒', name: '夏帽' },
      { symbol: '🎑', name: '赏月' },
      { symbol: '🎍', name: '新年竹' },
      { symbol: '🎋', name: '许愿树' },
      { symbol: '🎄', name: '圣诞树' }
    ]
  }
];

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
loadingMessage.value = '正在生成中...';

// 动态计算响应时间和动画时长
const estimatedResponseTime = ref(3000); // 默认3秒
const animationDuration = computed(() => {
  // 根据响应时间动态调整动画时长，但最少1.5秒最多3秒
  const baseDuration = Math.min(Math.max(estimatedResponseTime.value / 3000, 1.5), 3);
  return baseDuration;
});

const showCommunityPrompt = ref(false);
const communityPromptData = reactive({
  title: '星语心笺社群',
  message: '',
  qrcodeUrl: '/assets/community-qr.png',
  reason: '',
  updateLogs: [
    {
      number: '1.4.0',
      date: '2025-03-12T01:50:00',
      updates: [
      {
        type: 'feature',
        items: [
          '添加了超级好玩的随机生成参数按钮 🎲',
          '新增社群功能，方便用户交流讨论',
          '添加更新日志面板，实时跟踪应用变化',
          '支持多种表情符号组合，丰富表达方式',
          '加入开发者支持选项，可请作者喝咖啡'
        ]
      },
      {
        type: 'improvement',
        items: [
          '优化移动端页面显示，特别针对小屏设备',
          '改进页脚高度设计，提升操作舒适度',
          '增强社区弹窗交互，支持标签切换',
          '调整感谢文本样式与位置，体验更佳'
        ]
      },
      {
        type: 'fix',
        items: [
          '修复二维码图片路径问题',
          '解决API配置加载失败问题',
          '修正部分组件在小屏幕上的显示异常'
        ]
      }
    ]
  },
  {
    number: '1.3.1',
    date: '2025-03-11T18:45:00',
    updates: [
      {
        type: 'feature',
        items: [
          '新增社群入口，连接用户与开发者',
          '实现笔记卡片尺寸优化，适配更多设备'
        ]
      },
      {
        type: 'improvement',
        items: [
          '优化加载指示器样式，提升用户体验',
          '完善页面布局结构，解决样式冲突'
        ]
      },
      {
        type: 'fix',
        items: [
          '修复笔记卡片在iPhone SE上的显示问题',
          '解决字体加载延迟导致的布局抖动'
        ]
      }
    ]
  },
  {
    number: '1.3.0',
    date: '2025-03-09T10:15:00',
    updates: [
      {
        type: 'feature',
        items: [
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
      }
      ]
    },
    // 更多版本...
  ]
});

const collapsedSections = reactive({
  moods: false,
  theme: true,  // 默认折叠主题
  style: true,  // 默认折叠风格
  fortune: true // 默认折叠运势
});

// 切换区域的折叠状态
function toggleSection(section) {
  collapsedSections[section] = !collapsedSections[section];
}

// 添加随机参数生成功能
function randomizeParams() {
  // 1. 随机选择1-5个表情
  const randomEmojiCount = Math.floor(Math.random() * 5) + 1; // 生成1到5的随机数
  const allEmojis = emojiCategories.flatMap(category => category.emojis.map(emoji => emoji.symbol));
  
  // 清空当前表情
  params.moods = [];
  
  // 添加随机表情
  const shuffledEmojis = [...allEmojis].sort(() => 0.5 - Math.random());
  for (let i = 0; i < randomEmojiCount; i++) {
    if (i < shuffledEmojis.length) {
      params.moods.push(shuffledEmojis[i]);
    }
  }
  
  // 2. 随机选择主题
  const randomThemeIndex = Math.floor(Math.random() * themeOptions.length);
  params.theme = themeOptions[randomThemeIndex].value;
  
  // 3. 随机选择情感风格 (暖心/毒舌)
  params.savageMode = Math.random() > 0.5;
  
  // 4. 随机运势设置
  params.enableFortune = Math.random() > 0.3; // 70%概率启用运势
  if (params.enableFortune) {
    const randomFortuneIndex = Math.floor(Math.random() * fortuneAspects.length);
    params.fortuneAspect = fortuneAspects[randomFortuneIndex].value;
  }
  
  // 提示用户参数已随机生成
  const message = `已随机生成：
    • ${params.moods.length}个表情
    • 主题：${themeOptions.find(t => t.value === params.theme).label}
    • 情感风格：${params.savageMode ? '毒舌' : '暖心'}
    • 运势：${params.enableFortune ? fortuneAspects.find(a => a.value === params.fortuneAspect).label : '已关闭'}
  `;
  
  // 使用Toast提示而不是alert，避免阻塞UI
  // 如果没有Toast组件，可以用alert或console.log
  console.log(message);
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
    
    // 修复：检查正确的返回数据结构 - 直接检查result.content而非result.data.content
    if (result && result.content) {
      // 更新笔记内容
      noteContent.value = result.content;
      
      // 保存到历史记录
      await cacheGeneratedContent();
      
      // 更新UI状态
      hasGeneratedContent.value = true;
      isAnimating.value = true;
      
      // ===== 新增部分：记录生成次数并可能显示社群提示 =====
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
      // ===== 新增部分结束 =====
      
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
  if (!noteCardRef.value || !noteContent.value) return;
  
  // 先检测是否是微信浏览器
  if (isWechatBrowser()) {
    const confirmed = confirm('检测到您正在使用微信浏览器，微信限制了保存图片功能。\n\n建议您：\n1. 点击右上角"..."，选择"在浏览器中打开"\n2. 或使用Chrome/Safari等系统浏览器访问');
    
    if (!confirmed) return;
  }
  
  try {
    isLoading.value = true;
    loadingMessage.value = "正在准备图片...";
    
    // 确保在导出前DOM已完全渲染
    await nextTick();
    
    // 获取实际DOM元素
    const element = noteCardRef.value.$el;
    console.log("获取导出元素:", element); // 添加调试信息
    
    if (!element) {
      throw new Error("找不到要导出的DOM元素");
    }
    
    const imageUrl = await exportAsImage(element);
    if (imageUrl) {
      try {
        await saveToDevice(imageUrl, `心语_${new Date().toISOString().slice(0,10)}.png`);
        console.log("导出成功"); // 添加调试信息
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
  } finally {
    isLoading.value = false;
  }
}

// 修改shareNote方法
async function shareNote() {
  if (!noteCardRef.value || !noteContent.value) return;
  
  try {
    isLoading.value = true;
    loadingMessage.value = "正在准备分享...";
    
    // 确保在导出前DOM已完全渲染
    await nextTick();
    
    // 获取实际DOM元素
    const element = noteCardRef.value.$el;
    console.log("获取分享元素:", element); // 添加调试信息
    
    if (!element) {
      throw new Error("找不到要导出的DOM元素");
    }
    
    const imageUrl = await exportAsImage(element);
    if (imageUrl) {
      // 设置预览图片URL并显示预览模态框
      previewImageUrl.value = imageUrl;
      showImagePreview.value = true;
      console.log("分享图片准备完成"); // 添加调试信息
    } else {
      throw new Error("导出图片URL为空");
    }
  } catch (error) {
    console.error('分享失败:', error);
    alert('准备分享图片失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
}

function goToSavedNotes() {
  router.push('/saved');
}


// 导航到设置页
function goToSettings() {
  router.push('/settings');
}

// 修复字体大小调整功能
function increaseFontSize() {
  if (fontSize.value < 36) {
    // 先更新状态
    fontSize.value += 2;
    // 立即应用到组件
    applyFontSize();
    // 将变更保存到本地
    updateLocalPreferences();
    logger.info('FONT_SIZE', 'Increased font size to:', fontSize.value);
  }
}

function decreaseFontSize() {
  if (fontSize.value > 16) {
    // 先更新状态
    fontSize.value -= 2;
    // 立即应用到组件
    applyFontSize();
    // 将变更保存到本地
    updateLocalPreferences();
    logger.info('FONT_SIZE', 'Decreased font size to:', fontSize.value);
  }
}

// 新增一个安全的应用字体大小的函数
function applyFontSize() {
  nextTick(() => {
    try {
      if (noteCardRef.value && noteCardRef.value.$el) {
        const contentEl = noteCardRef.value.$el.querySelector('.note-content');
        if (contentEl) {
          contentEl.style.fontSize = `${fontSize.value}px`;
          logger.info('FONT_SIZE', '直接通过DOM更新字体大小:', fontSize.value);
        }
      }
    } catch (error) {
      logger.error('FONT_SIZE', '应用字体大小失败:', error);
    }
  });
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
      theme: params.theme,           // 正确保存主题参数
      darkMode: darkMode.value,      // 单独保存暗黑模式设置
      enableFortune: params.enableFortune,
      fortuneAspect: params.fortuneAspect,
      moods: params.moods            // 确保保存表情数组
    });
    
    // 强制NoteCard组件更新
    if (noteCardRef.value) {
      noteCardRef.value.$forceUpdate();
    }
  } catch (error) {
    logger.error('PREFERENCES', '更新本地偏好设置失败:', error);
  }
}

// 监听字体大小变化，确保视图更新
watch(fontSize, (newSize) => {
  logger.info('FONT_SIZE', 'Font size changed in HomePage:', newSize);
  // 使用更安全的方法应用字体大小
  nextTick(() => {
    applyFontSize();
  });
}, { immediate: false });  // 移除immediate参数，避免组件未加载时执行

// 选择emoji
function selectEmoji(symbol) {
  params.mood = symbol;
  showEmojiPicker.value = false;
}

// 切换表情选择
function toggleEmoji(symbol) {
  const index = params.moods.indexOf(symbol);
  
  // 如果已经选择了这个表情，则移除它
  if (index !== -1) {
    params.moods.splice(index, 1);
  } 
  // 如果未选择并且未达到上限，则添加
  else if (params.moods.length < 5) {
    params.moods.push(symbol);
  } else {
    // 已达到上限，可以显示提示
    alert('最多只能选择5个表情');
  }
}

// 添加自定义表情
function addCustomEmoji() {
  if (!customMood.value.trim()) return;
  
  // 如果已达到上限，则提示用户
  if (params.moods.length >= 5) {
    alert('最多只能选择5个表情');
    return;
  }
  
  // 添加自定义表情并清空输入
  params.moods.push(customMood.value.trim());
  customMood.value = '';
}

// 移除特定位置的表情
function removeEmoji(index) {
  params.moods.splice(index, 1);
}

// 清空所有表情
function clearMoods() {
  params.moods = [];
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

// 生命周期
onMounted(async () => {
  // 加载用户偏好设置
  try {
    const preferences = await getUserPreferences();
    if (preferences) {
      params.zodiac = preferences.zodiac;
      params.mbti = preferences.mbti;
      params.language = preferences.language || 'zh';
      
      // 修复：分开处理 darkMode 和 theme 参数
      // darkMode 是控制界面暗色模式的
      darkMode.value = preferences.darkMode === true;
      
      // 而 theme 是控制内容生成主题的，默认为 'chat'
      params.theme = preferences.theme || 'chat';
      
      fontSize.value = preferences.fontSize || 24;
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

      const appVersion = '1.3.0'; // 当前应用版本，实际中可从环境变量获取
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

onBeforeUnmount(() => {
  // 清除任何可能存在的定时器
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
});

// 监听暗黑模式变化 - 仍然需要处理本页面的深色模式状态
watch(darkMode, (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);
  // 如果需要在暗黑模式变化时重新渲染纸条，可以在这里添加逻辑
  noteCardRef.value?.$forceUpdate();
});

// 监听毒舌模式变化
watch(() => params.savageMode, (isSavage) => {
  document.body.classList.toggle('savage-mode', isSavage);
  // 强制重新渲染纸条以应用新样式
  noteCardRef.value?.$forceUpdate();
}, { immediate: true });

// 监听运势开关变化
watch(() => params.enableFortune, () => {
  updateLocalPreferences();
});

// 监听运势类型变化
watch(() => params.fortuneAspect, () => {
  if (params.enableFortune) {
    updateLocalPreferences();
  }
});

// 修改主题监听器，确保主题改变时保存设置
watch(() => params.theme, (newTheme) => {
  logger.info('THEME', '主题已更改为:', newTheme);
  updateLocalPreferences();
});

// 监听内容、表情、背景和字体大小的变化，更新缓存
watch([noteContent, () => params.moods, currentBackground, fontSize], () => {
  if (noteContent.value && noteContent.value !== '点击下方"生成心语"按钮，开始您的心灵之旅...') {
    cacheGeneratedContent();
  }
}, { deep: true });

// 新增参数面板状态管理
const showParamsPanel = ref(false);
const tempParams = reactive({});

// 打开参数面板
function openParamsPanel() {
  // 复制当前参数到临时参数，以便用户取消时可以恢复
  Object.assign(tempParams, params);
  // 对于数组，需要深度复制
  tempParams.moods = [...params.moods];
  showParamsPanel.value = true;
}

// 关闭参数面板不保存
function closeParamsPanel() {
  // 恢复参数到打开前的状态
  Object.assign(params, tempParams);
  // 对于数组，需要深度复制
  params.moods = [...tempParams.moods];
  showParamsPanel.value = false;
}

// 保存并关闭面板
function saveAndClosePanel() {
  // 已经修改了params，不需要重新赋值
  showParamsPanel.value = false;
  // 保存到本地存储
  updateLocalPreferences();
}

// 获取当前运势类型的显示文本
function getFortuneAspectLabel() {
  const aspect = fortuneAspects.find(a => a.value === params.fortuneAspect);
  return aspect ? aspect.label : '整体';
}

// Inside your script setup section, add or update these functions:
function closeImagePreview() {
  showImagePreview.value = false;
  previewImageUrl.value = '';
}


function handleSystemShare(imageUrl) {
  if (shareImage) {
    shareImage(imageUrl);
  }
}

// 跳转到关于页面
function navigateToAbout() {
  router.push('/about-us');
}

// 隐藏感谢文本并记住用户选择
async function hideAppreciation() {
  showAppreciation.value = false;
  
  // 保存用户偏好，记住用户选择隐藏感谢文本
  try {
    const userPrefs = await getUserPreferences();
    await saveUserPreferences({
      ...userPrefs,
      hideAppreciation: true
    });
  } catch (error) {
    console.error('保存用户偏好失败:', error);
  }
}

</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  padding-bottom: 0; /* 删除底部内边距，因为我们现在有固定的footer */
  background-color: var(--bg-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
}

/* 添加右侧按钮组样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.app-title {
  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.1);
}

.params-section {
  margin: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.params-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 16px;
}

.toggle-switch {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-switch span {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-switch span.active {
  background-color: var(--primary-color);
  color: white;
}

.note-container {
  margin: var(--spacing-md);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: visible; /* 允许内容溢出，以支持动态高度的纸条 */
  min-height: auto; /* 移除最小高度限制，让容器自然扩展 */
}

.background-selector {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.bg-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--border-color);
  margin: 0 var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bg-dot.active {
  background-color: var(--primary-color);
  transform: scale(1.2);
}

.font-size-control {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.font-size-indicator {
  margin: 0 var(--spacing-md);
  font-size: 14px;
  color: var(--text-secondary);
}

.control-section {
  margin: 0; /* 移除margin，使其贴合底部 */
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  position: relative; /* 确保相对定位，为加载指示器提供定位基础 */
}

/* 调整生成按钮上方间距，为加载指示器留出空间 */
.generate-btn {
  width: 100%;
  padding: var(--spacing-sm) 0; /* 减小上下内边距 */
  font-size: 16px; /* 略微减小字体大小 */
  margin-bottom: var(--spacing-sm); /* 减小下边距 */
  position: relative; /* 添加相对定位 */
  z-index: 1; /* 确保按钮在上层 */
  min-height: 42px; /* 设置最小高度确保按钮不会太小 */
}

.generate-btn i {
  margin-right: var(--spacing-sm);
}

.action-buttons {
  display: flex;
  justify-content: space-around;
}

.action-btn {
  font-size: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 移除设置模态框相关的CSS */

/* 暗黑模式样式 */
:global(.dark-mode) {
  --bg-color: #1a1a1a;
  --card-bg: #2c2c2c;
  --text-color: #f0f0f0;
  --text-secondary: #b0b0b0;
  --border-color: #3a3a3a;
  --primary-color: #8DB39E;
}

@media (max-width: 480px) {
  .action-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}

/* 参数面板媒体查询优化 */
@media (min-width: 768px) {
  .params-panel {
    max-width: 600px;
    width: 80%;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    border-radius: var(--radius-lg);
    top: 10%;
    bottom: auto;
    max-height: 80vh;
  }
  
  .emoji-list {
    grid-template-columns: repeat(6, 1fr);
    max-height: 350px;
  }
}

/* 大屏幕进一步优化 */
@media (min-width: 1200px) {
  .params-panel {
    max-width: 700px;
    width: 60%;
    top: 15%;
  }
}

/* 心情输入样式 */
.mood-input-container {
  position: relative;
  margin: var(--spacing-md) 0;
}

.mood-toggle {
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  margin-bottom: var(--spacing-sm);
}

.mood-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
}

.mood-value {
  flex: 1;
  font-size: 16px;
}

.emoji-picker {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  margin-top: var(--spacing-xs);
  max-height: 300px;
}

.emoji-tabs {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xs);
  border-bottom: 1px solid var(--border-color);
}

.emoji-tab {
  flex: 1;
  text-align: center;
  padding: var(--spacing-xs);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.emoji-tab.active {
  background-color: var(--primary-color);
  color: white;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: var(--spacing-sm);
  gap: var(--spacing-xs);
  max-height: 180px;
  overflow-y: auto;
}


.emoji-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.emoji-custom {
  display: flex;
  padding: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.mood-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-right: var(--spacing-sm);
}

.btn-small {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 5;
}

/* 调整主容器上边距，给心情控件腾出空间 */
.note-container {
  margin-top: 0;
}

/* 当毒舌模式开启时，可以添加一些视觉提示 */
.savage-mode .app-title {
  color: var(--primary-color);
}

/* 调整纸条容器上边距，给毒舌模式开关腾出空间 */
.note-container {
  margin-top: 0;
}

/* 毒舌模式的样式覆盖 */
.savage-mode .app-title {
  color: var(--savage-primary-color, #ff5252);
  text-shadow: 0 0 5px rgba(255, 82, 82, 0.2);
}

.savage-mode .generate-btn {
  background-color: var(--savage-primary-color, #ff5252);
  border-color: var(--savage-accent-color, #8a0000);
}

.savage-mode .generate-btn:hover {
  background-color: var(--savage-accent-color, #8a0000);
}

.savage-mode .action-btn {
  background-color: #333333;
}

.savage-mode .action-btn:hover {
  background-color: #444444;
  color: var(--savage-primary-color, #ff5252);
}

/* 添加一个额外的样式来确保长内容可以正常显示 */
.note-container {
  margin: 0 var(--spacing-md);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: visible; /* 允许内容溢出，以支持动态高度的纸条 */
  min-height: 400px; /* 确保有足够的最小高度 */
}

/* 运势选择器样式 */
.fortune-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  margin: var(--spacing-md) 0;
  box-shadow: var(--shadow-sm);
}

.fortune-toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.fortune-selector {
  margin: var(--spacing-md) 0;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fortune-options {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.fortune-option {
  flex: 1;
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.fortune-option i {
  font-size: 18px;
  margin-bottom: var(--spacing-xs);
}

.fortune-option span {
  font-size: 12px;
  text-align: center;
}

.fortune-option.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 毒舌模式下的运势选择器样式 */
.savage-mode .fortune-option.active {
  background-color: var(--savage-primary-color, #ff5252);
  border-color: var(--savage-primary-color, #ff5252);
}

/* 参数卡片样式 */
.params-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  margin: var(--spacing-md) 0;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

/* 修改参数预览容器，优化布局 */
.params-preview {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md); /* 调整内边距 */
  cursor: pointer;
  position: relative;
  flex-wrap: wrap; /* 允许在窄屏下换行 */
  gap: var(--spacing-sm); /* 添加间隙使元素之间有空间 */
}

/* 为表情添加样式，调整大小使其与运势文本协调 */
.mood-emoji {
  font-size: 16px; /* 减小字体大小，与运势图标保持一致 */
  line-height: 1;
  margin-right: var(--spacing-xs);
  display: inline-flex; /* 改为inline-flex以更好地对齐 */
  align-items: center;
  justify-content: center;
  vertical-align: middle; /* 确保垂直对齐 */
}

/* 调整参数项样式，保持一致性 */
.params-item {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-md);
  color: var(--text-color);
  background-color: rgba(123, 158, 137, 0.1);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 14px; /* 统一字体大小 */
}

.params-item i {
  margin-right: var(--spacing-xs);
  color: var(--primary-color);
  font-size: 14px; /* 确保图标大小与文字一致 */
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

/* 模态弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  backdrop-filter: blur(4px);
}

/* 修改参数面板样式，确保有正确的z-index */
.params-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 101;
  background-color: var(--card-bg);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.params-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background-color: var(--card-bg);
  z-index: 103;
}

.params-panel-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  font-size: 20px;
}

.params-panel-content {
  padding: var(--spacing-md);
}

.panel-section {
  margin-bottom: var(--spacing-lg);
}

.panel-section h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: 16px;
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
}

.section-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 修改情绪计数器，防止点击穿透 */
.mood-counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--text-secondary);
}

.section-header h3 {
  margin: 0;
}

.params-panel-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  position: sticky;
  bottom: 0;
  background-color: var(--card-bg);
  gap: var(--spacing-md);
  z-index: 103;
}

/* Emoji选择器样式修改 */
.emoji-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: var(--spacing-xs);
}

.emoji-tabs::-webkit-scrollbar {
  height: 4px;
}

.emoji-tabs::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
}

.emoji-tab {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  background-color: var(--bg-color);
  transition: all var(--transition-fast);
  cursor: pointer;
  min-width: 60px;  /* 确保标签有足够的宽度 */
}

.emoji-tab i {
  font-size: 22px;  /* 增大图标尺寸 */
  margin-bottom: var(--spacing-xs);
}

.emoji-tab small {
  font-size: 12px;
  white-space: nowrap;
}

.emoji-tab.active {
  background-color: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  max-height: 120px;  /* 限制高度，启用滚动 */
  overflow-y: auto;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  background-color: rgba(0, 0, 0, 0.02);
}

.emoji-list::-webkit-scrollbar {
  width: 6px;
}

.emoji-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.emoji-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;  /* 大幅增大表情尺寸 */
  height: 64px;      /* 增加高度与宽度匹配 */
  border-radius: var(--radius-md);
  background-color: var(--bg-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-xs);
}

.emoji-item:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
  z-index: 1;
}

.emoji-item.active {
  background-color: var(--primary-color);
  color: white;
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
  z-index: 2;
}

/* ...existing code... */

/* 媒体查询优化 */
@media (max-width: 480px) {
  .emoji-list {
    grid-template-columns: repeat(4, 1fr);  /* 移动设备减少列数 */
    gap: var(--spacing-sm);
  }
  
  .emoji-item {
    font-size: 22px;  /* 移动设备稍微减小字体 */
    height: 36px;
  }
}

@media (min-width: 768px) {
  .params-panel {
    max-width: 600px;  /* 增加面板宽度以适应更大的emoji */
    /* ...existing code... */
  }
  
  .emoji-list {
    grid-template-columns: repeat(6, 1fr);
    max-height: 350px;  /* 桌面版增加高度 */
  }
}

.mood-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.mood-emoji-group {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
}

.mood-emoji {
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.mood-counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--text-secondary);
}

.clear-btn {
  color: var(--text-secondary);
  font-size: 16px;
  padding: 0;
}

.clear-btn:hover {
  color: var(--primary-color);
}

/* 修改已选表情布局，使其以横排方式显示 */
.selected-emojis {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: var(--radius-md);
}

.selected-emojis-wrapper {
  display: flex;
  flex-direction: row; /* 明确指定为行方向 */
  flex-wrap: wrap; /* 允许在需要时换行 */
  justify-content: center;
  align-items: center;
  gap: 12px; /* 增加表情之间的间距 */
  padding: 8px;
}

/* 调整表情项样式，确保有足够的空间且不会挤在一起 */
.selected-emoji-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  width: 48px;
  height: 48px;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin: 4px; /* 添加外边距，确保项目之间有空间 */
  transition: transform 0.2s ease;
}

/* 改进删除按钮样式，确保其完全可见 */
.remove-emoji-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--border-color);
  color: var(--card-bg);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  opacity: 0.8;
  transition: all var(--transition-fast);
  z-index: 2; /* 确保按钮在上层 */
}

.remove-emoji-btn:hover {
  opacity: 1;
  background-color: var(--primary-color);
}

/* 响应式处理 */
@media (max-width: 480px) {
  .selected-emoji-item {
    font-size: 20px;
    width: 40px;
    height: 40px;
  }
}

/* 主题选项样式 */
.theme-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  height: 80px;
}

.theme-option i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.theme-option span {
  font-size: 14px;
  font-weight: 500;
}

.theme-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.theme-option.active i {
  color: white;
}

/* 情感风格选择器样式 */
.style-toggle {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.style-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  height: 80px;
}

.style-option i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.style-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.style-option:last-child.active {
  background-color: var(--savage-primary-color, #ff5252);
}

.style-option.active i {
  color: white;
}

/* 媒体查询，适配移动设备 */
@media (max-width: 480px) {
  .theme-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .theme-option, .style-option {
    height: 60px;
    padding: var(--spacing-sm);
  }
}

.collapsible {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.collapsible:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* 在<style>部分末尾添加 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 随机按钮样式 */
.btn-random {
  background-color: #8e44ad; /* 紫色 - 代表随机/神秘 */
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.btn-random:hover {
  background-color: #9b59b6;
  transform: scale(1.05);
}

.btn-random i {
  font-size: 16px;
}

/* 调整按钮组布局 */
.params-panel-footer {
  gap: var(--spacing-sm); /* 减小按钮间隔 */
  justify-content: space-between; /* 平均分配空间 */
}

.params-panel-footer button {
  flex: 1; /* 按钮平均分配空间 */
  max-width: 33%; /* 限制最大宽度 */
}

@media (max-width: 480px) {
  .btn-random {
    font-size: 13px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

/* 感谢文本样式 */
.appreciation-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-sm) auto; /* 上下间距减小，左右居中 */
  max-width: 90%; /* 限制最大宽度 */
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(123, 158, 137, 0.05); /* 与主题色协调的浅色背景 */
  border-radius: var(--radius-md);
}

.appreciation-text {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.9;
}

.appreciation-text p {
  margin: 0;
}

.appreciation-text a {
  color: var(--primary-color);
  text-decoration: underline;
  text-decoration-style: dotted;
  font-weight: 500;
  transition: color 0.2s ease;
}

.appreciation-text a:hover {
  color: var(--primary-color-dark);
}

.close-appreciation {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  opacity: 0.6;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.close-appreciation:hover {
  opacity: 1;
}

/* 毒舌模式下的感谢文本 */
.savage-mode .appreciation-container {
  background-color: rgba(255, 82, 82, 0.05);
}

.savage-mode .appreciation-text a {
  color: var(--savage-primary-color, #ff5252);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .appreciation-container {
    margin: var(--spacing-xs) auto;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .appreciation-text {
    font-size: 12px;
  }
  
  .close-appreciation {
    padding: 3px;
  }
}

/* ...existing code... */
</style>
