<template>
  <div class="home-page" :class="{'savage-mode': params.savageMode}">
    <!-- 顶部栏保持不变 -->
    <header class="header">
      <button class="icon-btn" @click="goToSettings">
        <i class="fas fa-cog"></i>
      </button>
      <h1 class="app-title">星语心笺</h1>
      <button class="icon-btn" @click="goToSavedNotes">
        <i class="fas fa-bookmark"></i>
      </button>
    </header>
    
    <!-- 纸条展示区 -->
    <div class="note-container" ref="noteContainerRef">
      <!-- 替换原有的心情输入和运势选择器，使用统一的参数卡片 -->
      <div class="params-card">
        <div class="params-preview" @click="openParamsPanel">
          <!-- 修改这里，动态显示用户选择的表情或默认图标 -->
          <div class="params-item">
            <span v-if="params.mood" class="mood-emoji">{{ params.mood }}</span>
            <i v-else class="fas fa-smile"></i>
            <span>{{ params.mood ? '' : '添加心情...' }}</span>
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
      
      <!-- NoteCard 保持不变 -->
      <NoteCard 
        :content="noteContent" 
        :mood="params.mood"
        :background="currentBackground"
        :fontSize="fontSize"
        :animate="isAnimating"
        :animation-duration="animationDuration"
        ref="noteCardRef"
      />
      
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
    
    <!-- 控制区域保持不变 -->
    <div class="control-section">
      <LoadingIndicator 
        v-if="isGenerating" 
        :is-loading="isGenerating"
        :message="loadingMessage"
        :adaptive-time="estimatedResponseTime"
      />
      
      <button 
        class="btn btn-primary generate-btn" 
        @click="generateNote"
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
          <!-- 心情/场景选择器 -->
          <div class="panel-section">
            <h3>心情 / 场景</h3>
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
                :class="['emoji-item', { active: params.mood === emoji.symbol }]"
                @click="selectEmoji(emoji.symbol)"
                :title="emoji.name"
              >
                {{ emoji.symbol }}
              </div>
            </div>
            
            <div class="emoji-custom">
              <input 
                type="text" 
                v-model="params.mood" 
                class="mood-input"
                placeholder="自定义内容..."
              />
            </div>
          </div>
          
          <!-- 运势设置 -->
            <div class="panel-section">
            <div class="section-header">
              <h3>今日运势</h3>
              <div class="toggle-switch-container">
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
            </div>
            
            <div class="fortune-options" v-if="params.enableFortune">
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
        
        <div class="params-panel-footer">
          <button class="btn btn-secondary" @click="closeParamsPanel">取消</button>
          <button class="btn btn-primary" @click="saveAndClosePanel">确定</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import NoteCard from '../components/NoteCard.vue';
import LoadingIndicator from '../components/LoadingIndicator.vue';
import { generateNoteContent, generateLocalContent, getEstimatedResponseTime } from '../services/aiService';
import { saveUserPreferences, getUserPreferences, saveNote as saveNoteToStorage } from '../services/storageService';
import { useNoteExport } from '../composables/useNoteExport';

const router = useRouter();
const noteContainerRef = ref(null);
const noteCardRef = ref(null);

// 状态管理
const showParams = ref(false);
const showEmojiPicker = ref(false);
const currentEmojiCategory = ref(0);
const isGenerating = ref(false);
const isAnimating = ref(false);
const noteContent = ref('点击下方"生成心语"按钮，开始您的心灵之旅...');
const currentBackground = ref('paper-1');
const fontSize = ref(24);
const darkMode = ref(false);
const loadingMessage = ref(''); 

// 导出功能
const { exportAsImage, saveToDevice, shareImage } = useNoteExport();

// 用户参数
const params = reactive({
  zodiac: null,
  mbti: null,
  mood: '',
  language: 'zh',
  savageMode: false,
  enableFortune: false, // 新增：是否启用星座运势
  fortuneAspect: 'overall' // 新增：运势类型（整体/爱情/事业/财运）
});

// 运势类型选项
const fortuneAspects = [
  { label: '整体运势', value: 'overall', icon: 'fas fa-star' },
  { label: '爱情运势', value: 'love', icon: 'fas fa-heart' },
  { label: '事业运势', value: 'career', icon: 'fas fa-briefcase' },
  { label: '财运运势', value: 'wealth', icon: 'fas fa-coins' }
];

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
const loadingMessages = computed(() => {
  return params.savageMode ? savageLoadingMessages : normalLoadingMessages;
});

let loadingInterval = null;

// 动态计算响应时间和动画时长
const estimatedResponseTime = ref(3000); // 默认3秒
const animationDuration = computed(() => {
  // 根据响应时间动态调整动画时长，但最少1.5秒最多3秒
  const baseDuration = Math.min(Math.max(estimatedResponseTime.value / 3000, 1.5), 3);
  return baseDuration;
});


// 修改生成笔记函数，允许更长的内容
async function generateNote() {
  if (isGenerating.value) return;
  
  isGenerating.value = true;
  
  // 设置加载消息循环
  let messageIndex = 0;
  loadingMessage.value = loadingMessages.value[messageIndex];
  loadingInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.value.length;
    loadingMessage.value = loadingMessages.value[messageIndex];
  }, 2000);
  
  // 获取当前模型的预估响应时间
  estimatedResponseTime.value = getEstimatedResponseTime(import.meta.env.VITE_API_MODEL || 'default');
  
  try {
    // 验证必要参数
    if (!params.zodiac) params.zodiac = zodiacs[Math.floor(Math.random() * zodiacs.length)].value;
    if (!params.mbti) params.mbti = mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)].value;
    
    // 调用API生成内容
    const content = await generateNoteContent(params).catch(() => {
      // API调用失败时使用本地生成
      return generateLocalContent(params);
    });
    
    // 更新内容
    noteContent.value = content;
    
    // 清除加载消息循环
    clearInterval(loadingInterval);
    loadingInterval = null;
    
    // 加载完成后开始动画
    setTimeout(() => {
      isAnimating.value = true;
      isGenerating.value = false;
    }, 300); // 短暂延迟，让加载条完成到100%
    
    // 内容生成完成后，根据内容长度确保纸条可见
    setTimeout(() => {
      const noteContainer = noteContainerRef.value;
      if (noteContainer) {
        // 确保纸条在视口中可见
        noteContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 500);
    
  } catch (error) {
    console.error('生成失败:', error);
    noteContent.value = '内容生成失败，请稍后重试...';
    
    // 清除加载消息循环
    clearInterval(loadingInterval);
    loadingInterval = null;
    isGenerating.value = false;
  }}

function regenerateNote() {
  if (!isGenerating.value) {
    generateNote();
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

async function exportNote() {
  if (!noteCardRef.value || !noteContent.value) return;
  
  try {
    const imageUrl = await exportAsImage(noteCardRef.value.$el);
    if (imageUrl) {
      await saveToDevice(imageUrl, `心语_${new Date().toISOString().slice(0,10)}.png`);
    }
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出图片失败，请重试');
  }
}

async function shareNote() {
  if (!noteCardRef.value || !noteContent.value) return;
  
  try {
    const imageUrl = await exportAsImage(noteCardRef.value.$el);
    if (imageUrl) {
      const shared = await shareImage(imageUrl);
      if (!shared) {
        // 如果原生分享API不可用，提供备用方案
        await saveToDevice(imageUrl);
        alert('图片已保存，您可以手动分享');
      }
    }
  } catch (error) {
    console.error('分享失败:', error);
    alert('分享失败，请重试');
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
    if (noteCardRef.value) {
      // 通过$el.querySelector直接修改DOM元素，确保立即生效
      const contentEl = noteCardRef.value.$el.querySelector('.note-content');
      if (contentEl) {
        contentEl.style.fontSize = `${fontSize.value}px`;
      }
    }
    // 将变更保存到本地
    updateLocalPreferences();
    console.log('Increased font size to:', fontSize.value);
  }
}

function decreaseFontSize() {
  if (fontSize.value > 16) {
    // 先更新状态
    fontSize.value -= 2;
    // 立即应用到组件
    if (noteCardRef.value) {
      // 通过$el.querySelector直接修改DOM元素，确保立即生效
      const contentEl = noteCardRef.value.$el.querySelector('.note-content');
      if (contentEl) {
        contentEl.style.fontSize = `${fontSize.value}px`;
      }
    }
    // 将变更保存到本地
    updateLocalPreferences();
    console.log('Decreased font size to:', fontSize.value);
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
      enableFortune: params.enableFortune,  // 保存运势启用状态
      fortuneAspect: params.fortuneAspect   // 保存运势类型选择
    });
    
    // 强制NoteCard组件更新
    if (noteCardRef.value) {
      noteCardRef.value.$forceUpdate();
    }
  } catch (error) {
    console.error('更新本地偏好设置失败:', error);
  }
}

// 监听字体大小变化，确保视图更新
watch(fontSize, (newSize) => {
  console.log('Font size changed in HomePage:', newSize);
  
  // 确保DOM更新，不仅仅依赖于组件刷新
  nextTick(() => {
    if (noteCardRef.value && noteCardRef.value.$el) {
      const contentEl = noteCardRef.value.$el.querySelector('.note-content');
      if (contentEl) {
        contentEl.style.fontSize = `${newSize}px`;
        console.log('直接通过DOM更新字体大小:', newSize);
      }
    }
  });
}, { immediate: true });

// 选择emoji
function selectEmoji(symbol) {
  params.mood = symbol;
  showEmojiPicker.value = false;
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
      darkMode.value = preferences.theme === 'dark';
      fontSize.value = preferences.fontSize || 24;
      currentBackground.value = preferences.background || 'paper-1';
      params.savageMode = preferences.savageMode || false;
      // 加载运势偏好
      params.enableFortune = preferences.enableFortune || false;
      params.fortuneAspect = preferences.fortuneAspect || 'overall';
    }
  } catch (error) {
    console.error('加载用户偏好设置失败:', error);
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

// 新增参数面板状态管理
const showParamsPanel = ref(false);
const tempParams = reactive({});

// 打开参数面板
function openParamsPanel() {
  // 复制当前参数到临时参数，以便用户取消时可以恢复
  Object.assign(tempParams, params);
  showParamsPanel.value = true;
}

// 关闭参数面板不保存
function closeParamsPanel() {
  // 恢复参数到打开前的状态
  Object.assign(params, tempParams);
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
  return aspect ? aspect.label : '整体运势';
}

</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: var(--spacing-lg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
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
  margin: 0 var(--spacing-md);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
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
  margin: var(--spacing-md);
  position: relative; /* 确保相对定位，为加载指示器提供定位基础 */
}

/* 调整生成按钮上方间距，为加载指示器留出空间 */
.generate-btn {
  width: 100%;
  padding: var(--spacing-md) 0;
  font-size: 18px;
  margin-bottom: var(--spacing-md);
  position: relative; /* 添加相对定位 */
  z-index: 1; /* 确保按钮在上层 */
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
  z-index: 2;
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

/* ...existing code... */
</style>
