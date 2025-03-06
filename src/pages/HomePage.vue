<template>
  <div class="home-page">
    <!-- 顶部栏 - 修改设置图标行为 -->
    <header class="header">
      <button class="icon-btn" @click="goToSettings">
        <i class="fas fa-cog"></i>
      </button>
      <h1 class="app-title">星语心笺</h1>
      <button class="icon-btn" @click="goToSavedNotes">
        <i class="fas fa-bookmark"></i>
      </button>
    </header>
    
    <!-- 参数区域 -->
    <div class="params-section" :class="{ 'expanded': showParams }">
      <div class="params-toggle" @click="showParams = !showParams">
        <span>参数设置</span>
        <i :class="['fas', showParams ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </div>
      
      <div class="params-content" v-show="showParams">
        <div class="param-item">
          <label>星座</label>
          <select v-model="params.zodiac" class="param-selector">
            <option v-for="zodiac in zodiacs" :key="zodiac.value" :value="zodiac.value">
              {{ zodiac.label }}
            </option>
          </select>
        </div>
        
        <div class="param-item">
          <label>MBTI性格</label>
          <select v-model="params.mbti" class="param-selector">
            <option v-for="mbti in mbtiTypes" :key="mbti.value" :value="mbti.value">
              {{ mbti.label }}
            </option>
          </select>
        </div>
        
        <div class="param-item">
          <label>语言</label>
          <div class="toggle-switch">
            <span :class="{ active: params.language === 'zh' }" @click="params.language = 'zh'">中文</span>
            <span :class="{ active: params.language === 'en-zh' }" @click="params.language = 'en-zh'">中英双语</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 纸条展示区 -->
    <div class="note-container" ref="noteContainerRef">
      <!-- 添加心情/场景输入 -->
      <div class="mood-input-container">
        <div class="mood-toggle" @click="showEmojiPicker = !showEmojiPicker">
          <span class="mood-label">心情 / 场景:</span>
          <span class="mood-value">{{ params.mood || '点击添加' }}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        
        <!-- Emoji类别选择器 -->
        <div class="emoji-picker" v-if="showEmojiPicker" @click.stop>
          <div class="emoji-tabs">
            <div 
              v-for="(category, idx) in emojiCategories" 
              :key="idx" 
              :class="['emoji-tab', {active: currentEmojiCategory === idx}]"
              @click="currentEmojiCategory = idx"
            >
              <i :class="category.icon"></i>
            </div>
          </div>
          <div class="emoji-list">
            <div 
              v-for="emoji in emojiCategories[currentEmojiCategory].emojis" 
              :key="emoji.symbol"
              class="emoji-item"
              @click="selectEmoji(emoji.symbol)"
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
              @keyup.enter="showEmojiPicker = false"
            />
            <button class="btn-small" @click="showEmojiPicker = false">确定</button>
          </div>
        </div>
      </div>
      
      <NoteCard 
        :content="noteContent" 
        :mood="params.mood"
        :background="currentBackground"
        :fontSize="fontSize"
        :animate="isAnimating"
        ref="noteCardRef"
      />
      
      <!-- 背景选择器 -->
      <div class="background-selector">
        <span 
          v-for="(bg, index) in backgrounds" 
          :key="bg.value" 
          :class="['bg-dot', { active: currentBackground === bg.value }]"
          @click="currentBackground = bg.value"
        ></span>
      </div>
      
      <!-- 字号调整 -->
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
    
    <!-- 控制区域 -->
    <div class="control-section">
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
    
    <!-- 点击外部关闭emoji选择器 -->
    <div class="overlay" v-if="showEmojiPicker" @click="showEmojiPicker = false"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import NoteCard from '../components/NoteCard.vue';
import { generateNoteContent, generateLocalContent } from '../services/aiService';
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

// 导出功能
const { exportAsImage, saveToDevice, shareImage } = useNoteExport();

// 用户参数
const params = reactive({
  zodiac: null,
  mbti: null,
  mood: '',
  language: 'zh'
});

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

// Emoji分类数据
const emojiCategories = [
  {
    name: '心情',
    icon: 'fas fa-smile',
    emojis: [
      { symbol: '😊', name: '开心' },
      { symbol: '😄', name: '笑' },
      { symbol: '🥰', name: '爱' },
      { symbol: '😌', name: '放松' },
      { symbol: '🤔', name: '思考' },
      { symbol: '😢', name: '伤心' },
      { symbol: '😴', name: '疲倦' },
      { symbol: '😎', name: '酷' },
      { symbol: '🤩', name: '激动' },
      { symbol: '😤', name: '坚定' }
    ]
  },
  {
    name: '场景',
    icon: 'fas fa-map-marker-alt',
    emojis: [
      { symbol: '🏠', name: '家' },
      { symbol: '🏢', name: '工作' },
      { symbol: '🏫', name: '学校' },
      { symbol: '☕', name: '咖啡厅' },
      { symbol: '🏞️', name: '户外' },
      { symbol: '🏙️', name: '城市' },
      { symbol: '🌊', name: '海边' },
      { symbol: '🏔️', name: '山' },
      { symbol: '🚗', name: '路上' },
      { symbol: '✈️', name: '旅行' }
    ]
  },
  {
    name: '活动',
    icon: 'fas fa-running',
    emojis: [
      { symbol: '📚', name: '阅读' },
      { symbol: '🎮', name: '游戏' },
      { symbol: '🎵', name: '音乐' },
      { symbol: '🎬', name: '电影' },
      { symbol: '🍽️', name: '用餐' },
      { symbol: '🧘', name: '冥想' },
      { symbol: '🏃', name: '运动' },
      { symbol: '💻', name: '工作' },
      { symbol: '🛌', name: '休息' },
      { symbol: '🎨', name: '创作' }
    ]
  },
  {
    name: '天气',
    icon: 'fas fa-cloud-sun',
    emojis: [
      { symbol: '☀️', name: '晴天' },
      { symbol: '🌤️', name: '多云' },
      { symbol: '☁️', name: '阴天' },
      { symbol: '🌧️', name: '下雨' },
      { symbol: '⛈️', name: '雷雨' },
      { symbol: '❄️', name: '雪' },
      { symbol: '🌈', name: '彩虹' },
      { symbol: '🌙', name: '夜晚' },
      { symbol: '🌅', name: '日出' },
      { symbol: '🌇', name: '日落' }
    ]
  },
  {
    name: '季节',
    icon: 'fas fa-leaf',
    emojis: [
      { symbol: '🌸', name: '春天' },
      { symbol: '🌻', name: '夏天' },
      { symbol: '🍂', name: '秋天' },
      { symbol: '❄️', name: '冬天' },
      { symbol: '🌱', name: '发芽' },
      { symbol: '🌿', name: '成长' },
      { symbol: '🍁', name: '收获' },
      { symbol: '🎄', name: '节日' },
      { symbol: '🎋', name: '许愿' },
      { symbol: '🎑', name: '赏月' }
    ]
  }
];

// 方法
async function generateNote() {
  if (isGenerating.value) return;
  
  isGenerating.value = true;
  isAnimating.value = true;
  
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
  } catch (error) {
    console.error('生成失败:', error);
    noteContent.value = '内容生成失败，请稍后重试...';
  } finally {
    isGenerating.value = false;
  }
}

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
    fontSize.value += 2;
    // 将变更保存到本地，但无需更新远程设置
    updateLocalPreferences();
  }
}

function decreaseFontSize() {
  if (fontSize.value > 16) {
    fontSize.value -= 2;
    // 将变更保存到本地，但无需更新远程设置
    updateLocalPreferences();
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
      background: currentBackground.value
    });
  } catch (error) {
    console.error('更新本地偏好设置失败:', error);
  }
}

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
    }
  } catch (error) {
    console.error('加载用户偏好设置失败:', error);
  }
});

// 监听暗黑模式变化 - 仍然需要处理本页面的深色模式状态
watch(darkMode, (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);
  // 如果需要在暗黑模式变化时重新渲染纸条，可以在这里添加逻辑
  noteCardRef.value?.$forceUpdate();
});
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
  cursor: pointer;
}

.params-content {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.param-item {
  margin-bottom: var(--spacing-md);
}

.param-item label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: 14px;
}

.param-selector,
.param-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
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
}

.generate-btn {
  width: 100%;
  padding: var(--spacing-md) 0;
  font-size: 18px;
  margin-bottom: var(--spacing-md);
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

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  height: 40px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
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
</style>
