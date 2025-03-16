<template>
  <div class="modal-overlay" v-if="visible" @click="closePanel"></div>
  <transition name="slide-up">
    <div class="params-panel" v-if="visible" :class="{'savage-panel': params.savageMode}">
      <div class="params-panel-header">
        <h2>心语参数设置</h2>
        <button class="icon-btn close-btn" @click="closePanel">
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
                v-for="theme in filteredThemeOptions" 
                :key="theme.value"
                :class="['theme-option', {active: params.theme === theme.value}]"
                @click="params.theme = theme.value"
              >
                <i :class="theme.icon"></i>
                <span>{{ theme.label }}</span>
              </div>
            </div>
            
            <div v-if="!supportsPoetry || !supportsHaiku" class="feature-notice">
              <i class="fas fa-info-circle"></i>
              <span>当前使用的是 {{ currentModel }} 模型，部分创作类型不可用。如需使用全部功能，请在AI设置中选择Plus或Max模型。</span>
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
                @click="setSavageMode(false)"
              >
                <i class="fas fa-smile"></i>
                <span>暖心</span>
              </div>
              <div 
                class="style-option"
                :class="{active: params.savageMode}"
                @click="setSavageMode(true)"
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
        <button class="btn btn-secondary" @click="closePanel">取消</button>
        <button class="btn btn-random" @click="randomizeParams">
          <i class="fas fa-dice"></i> 随机
        </button>
        <button class="btn btn-primary" @click="saveAndClosePanel">确定</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { saveUserPreferences, getApiSettings } from '../services/storageService';
import { isFeatureSupported } from '../services/aiService';
import logger from '../utils/logger';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialParams: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:visible', 'save-params']);

// State
const params = reactive({ ...props.initialParams });
const customMood = ref('');
const currentEmojiCategory = ref(0);
const collapsedSections = reactive({
  moods: false,
  theme: true,
  style: true,
  fortune: true
});
const supportsPoetry = ref(true);
const supportsHaiku = ref(true);
const currentModel = ref('qwen-turbo');
const apiSettingsChangeListener = ref(null);

// Computed
const isPanelSavageMode = computed(() => params.savageMode);

// 过滤后的主题选项，根据当前模型支持的功能
const filteredThemeOptions = computed(() => {
  return themeOptions.filter(theme => {
    if (theme.value === 'poetry') return supportsPoetry.value;
    if (theme.value === 'haiku') return supportsHaiku.value;
    return true;
  });
});

// Data
const themeOptions = [
  { label: '聊天', value: 'chat', icon: 'fas fa-comment-dots' },
  { label: '箴言', value: 'aphorism', icon: 'fas fa-book-open' },
  { label: '诗歌', value: 'poetry', icon: 'fas fa-feather-alt' },
  { label: '俳句', value: 'haiku', icon: 'fas fa-leaf' }
];

const fortuneAspects = [
  { label: '整体', value: 'overall', icon: 'fas fa-star' },
  { label: '爱情', value: 'love', icon: 'fas fa-heart' },
  { label: '事业', value: 'career', icon: 'fas fa-briefcase' },
  { label: '财运', value: 'wealth', icon: 'fas fa-coins' }
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

// Methods
function toggleSection(section) {
  collapsedSections[section] = !collapsedSections[section];
}

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

function removeEmoji(index) {
  params.moods.splice(index, 1);
}

function clearMoods() {
  params.moods = [];
}

// 修改随机参数函数，考虑模型支持的功能
async function randomizeParams() {
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
  
  // 2. 随机选择主题，但排除不支持的主题
  const availableThemes = filteredThemeOptions.value;
  if (availableThemes.length > 0) {
    const randomThemeIndex = Math.floor(Math.random() * availableThemes.length);
    params.theme = availableThemes[randomThemeIndex].value;
  } else {
    // 如果没有可用主题（极端情况），默认使用聊天
    params.theme = 'chat';
  }
  
  // 3. 随机选择情感风格 (暖心/毒舌)
  const previousSavageMode = params.savageMode;
  params.savageMode = Math.random() > 0.5;
  
  // 如果毒舌模式状态改变，立即更新body类
  if (previousSavageMode !== params.savageMode) {
    document.body.classList.toggle('savage-mode', params.savageMode);
  }
  
  // 4. 随机运势设置
  params.enableFortune = Math.random() > 0.3; // 70%概率启用运势
  if (params.enableFortune) {
    const randomFortuneIndex = Math.floor(Math.random() * fortuneAspects.length);
    params.fortuneAspect = fortuneAspects[randomFortuneIndex].value;
  }
  
  // 提示用户参数已随机生成
  console.log(`已随机生成参数：${params.moods.length}个表情，主题：${params.theme}，风格：${params.savageMode ? '毒舌' : '暖心'}`);
}

function closePanel() {
  // 取消更改，恢复原始参数
  Object.assign(params, props.initialParams);
  emit('update:visible', false);
}

function saveAndClosePanel() {
  // 保存参数并关闭面板
  emit('save-params', { ...params });
  emit('update:visible', false);
  
  // 立即更新body类，确保样式立即生效
  document.body.classList.toggle('savage-mode', params.savageMode);
}

function setSavageMode(mode) {
  params.savageMode = mode;
  document.body.classList.toggle('savage-mode', mode);
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
    
    // 如果当前选择的主题不被支持，则切换到聊天
    if ((params.theme === 'poetry' && !supportsPoetry.value) || 
        (params.theme === 'haiku' && !supportsHaiku.value)) {
      params.theme = 'chat';
    }
    
    logger.info('PARAMS_PANEL', '模型功能支持检查', {
      model: currentModel.value,
      supportsPoetry: supportsPoetry.value,
      supportsHaiku: supportsHaiku.value
    });
  } catch (error) {
    logger.error('PARAMS_PANEL', '检查模型功能失败', error);
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

// 生命周期钩子
onMounted(async () => {
  await checkModelFeatures();
  setupApiSettingsChangeListener();
});

onBeforeUnmount(() => {
  removeApiSettingsChangeListener();
});

// 添加对visible的监听，当面板打开时重新检查模型功能
watch(() => props.visible, async (newVisible) => {
  if (newVisible) {
    // 复制初始参数到当前参数
    Object.assign(params, props.initialParams);
    // 对于数组，需要深度复制
    if (props.initialParams.moods) {
      params.moods = [...props.initialParams.moods];
    }
    
    // 确保面板打开时应用正确的savage模式样式
    document.body.classList.toggle('savage-mode', params.savageMode);
    
    // 重新检查模型功能
    await checkModelFeatures();
  }
});

// 监听initialParams变化
watch(() => props.initialParams, (newParams) => {
  if (!props.visible) {
    // 只有在面板关闭时才更新参数，避免编辑过程中被覆盖
    Object.assign(params, newParams);
    // 对于数组，需要深度复制
    if (newParams.moods) {
      params.moods = [...newParams.moods];
    }
  }
}, { deep: true });
</script>

<style scoped>
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

/* 参数面板样式 */
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

/* Emoji选择器样式 */
.emoji-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: var(--spacing-xs);
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-md);
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
  min-width: 60px;
}

.emoji-tab i {
  font-size: 22px;
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
  max-height: 120px;
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
  font-size: 32px;
  height: 64px;
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

/* 修改已选表情布局 */
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
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

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
  margin: 4px;
  transition: transform 0.2s ease;
}

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
  z-index: 2;
}

.remove-emoji-btn:hover {
  opacity: 1;
  background-color: var(--primary-color);
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

/* 运势选项样式 */
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

/* 随机按钮样式 */
.btn-random {
  background-color: #8e44ad;
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
  flex-shrink: 0;
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
  gap: var(--spacing-sm);
  justify-content: space-between;
}

.params-panel-footer button {
  flex: 1;
  max-width: 33%;
}

/* 折叠部分样式 */
.collapsible {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.collapsible:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* 滑动动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 媒体查询优化 */
@media (max-width: 480px) {
  .emoji-list {
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-xs);
  }
  
  .emoji-item {
    font-size: 18px;
    height: 32px;
  }
  
  .selected-emoji-item {
    font-size: 18px;
    width: 36px;
    height: 36px;
  }
  
  .theme-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .theme-option, .style-option {
    height: 60px;
    padding: var(--spacing-sm);
  }
  
  .btn-random {
    font-size: 13px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

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

@media (min-width: 1200px) {
  .params-panel {
    max-width: 700px;
    width: 60%;
    top: 15%;
  }
}

/* 毒舌模式样式 */
.savage-panel .style-option:last-child.active {
  background-color: var(--savage-primary-color, #ff5252);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.savage-panel .fortune-option.active {
  background-color: var(--savage-primary-color, #ff5252);
  border-color: var(--savage-primary-color, #ff5252);
}

/* 添加功能提示样式 */
.feature-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: rgba(255, 152, 0, 0.1);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-sm);
  font-size: 0.85rem;
  color: var(--warning-color, #ff9800);
}

.feature-notice i {
  font-size: 1rem;
  flex-shrink: 0;
}

/* 禁用的主题选项样式 */
.theme-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--border-color);
}
</style>