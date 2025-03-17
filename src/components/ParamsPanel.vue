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

            <div class="emoji-tabs" v-if="!emojiSearchQuery">
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
            
            <div class="emoji-search">
              <div class="search-input-container">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="emojiSearchQuery" 
                  class="search-input"
                  placeholder="全局搜索表情..."
                  @input="handleSearchInput"
                />
                <button 
                  v-if="emojiSearchQuery && isValidEmoji(emojiSearchQuery) && !isEmojiSelected(emojiSearchQuery)" 
                  class="add-emoji-btn" 
                  @click="addEmojiFromSearch"
                  title="添加这个表情"
                >
                  <i class="fas fa-plus"></i>
                </button>
                <button 
                  v-else-if="emojiSearchQuery" 
                  class="clear-search-btn" 
                  @click="clearSearch"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="emoji-list" :class="{'global-search': emojiSearchQuery}">
              <template v-if="emojiSearchQuery && filteredEmojis.length > 0">
                <div v-for="(group, categoryName) in groupedSearchResults" :key="categoryName" class="search-result-group">
                  <div class="search-category-label">
                    <i :class="getCategoryIcon(categoryName)"></i>
                    <span>{{ categoryName }}</span>
                  </div>
                  <div class="search-result-items">
                    <div 
                      v-for="emoji in group" 
                      :key="emoji.symbol"
                      :class="['emoji-item', { active: params.moods.includes(emoji.symbol) }]"
                      @click="toggleEmoji(emoji.symbol)"
                      :title="emoji.name"
                    >
                      {{ emoji.symbol }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div 
                  v-for="emoji in filteredEmojis" 
                  :key="emoji.symbol"
                  :class="['emoji-item', { active: params.moods.includes(emoji.symbol) }]"
                  @click="toggleEmoji(emoji.symbol)"
                  :title="emoji.name"
                >
                  {{ emoji.symbol }}
                </div>
                <div v-if="filteredEmojis.length === 0" class="no-results">
                  没有找到匹配的表情
                </div>
              </template>
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
            <i :class="[collapsedSections.fortune ? 'fas fa-chevron-down' : 'fas fa-chevron-up']"></i>
          </div>
          
          <div class="section-content" v-show="!collapsedSections.fortune">
            <div class="fortune-toggle" @click="toggleFortune">
              <i :class="params.enableFortune ? 'fas fa-check-circle' : 'far fa-circle'"></i>
              <span>{{ params.enableFortune ? '已启用' : '未启用' }}</span>
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
import { emojiCategories, themeOptions, fortuneAspects, getAllEmojis, isValidEmoji, isKnownEmoji } from '../data/emojiData';

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
const emojiSearchQuery = ref('');
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

// 添加情感关键词映射
const emotionKeywords = {
  '开心': ['高兴', '快乐', '欢喜', '欢乐', '喜悦', '兴奋', '愉快', '笑', '乐', '嘻嘻', '哈哈', '微笑', '大笑'],
  '难过': ['伤心', '悲伤', '悲痛', '哭', '哭泣', '痛苦', '忧伤', '忧郁', '沮丧', '难受', '不开心', '泪', '抑郁', '委屈'],
  '生气': ['愤怒', '恼火', '发火', '怒', '怒火', '火大', '暴怒', '发怒', '不爽', '恼怒', '气愤', '气死', '恨', '可恶'],
  '惊讶': ['震惊', '吃惊', '惊奇', '惊喜', '意外', '没想到', '惊', '吓', '吓一跳', '目瞪口呆'],
  '害怕': ['恐惧', '惊恐', '惧怕', '担心', '忧虑', '怕', '惊吓', '恐慌', '畏惧', '胆怯', '惊慌', '紧张', '不安'],
  '疲倦': ['累', '疲劳', '困', '困倦', '疲惫', '乏力', '无力', '精疲力竭', '困乏', '睡觉', '睡眠'],
  '爱': ['喜欢', '爱心', '热爱', '恋爱', '爱情', '暗恋', '宠爱', '钟爱', '疼爱', '爱慕', '心动'],
  '思考': ['想', '思考', '思索', '沉思', '冥想', '琢磨', '考虑', '反思', '深思', '思维', '想法'],
  '尴尬': ['难堪', '窘迫', '不好意思', '羞愧', '羞耻', '羞涩', '羞', '囧', '不自在', '局促'],
  '无奈': ['无语', '无可奈何', '叹气', '叹息', '摊手', '没办法', '没辙', '无计可施', '无力', '无助'],
  '期待': ['盼望', '希望', '等待', '渴望', '憧憬', '向往', '企盼', '巴望', '翘首以盼'],
  '自信': ['骄傲', '自豪', '得意', '满意', '满足', '成就感', '优越感', '傲娇', '志得意满'],
  '困惑': ['迷惑', '疑惑', '不解', '迷茫', '茫然', '不明白', '不懂', '费解', '困扰', '纠结'],
  '调皮': ['淘气', '顽皮', '捣蛋', '恶作剧', '坏笑', '狡猾', '鬼脸', '吐舌头', '顽皮'],
  '冷静': ['平静', '镇定', '沉着', '淡定', '安静', '从容', '不慌不忙', '稳重', '稳定'],
  '紧张': ['焦虑', '不安', '慌张', '慌乱', '急', '着急', '心慌', '惊慌', '惶恐', '惴惴不安'],
  '失望': ['绝望', '灰心', '丧气', '气馁', '泄气', '心灰意冷', '不抱希望', '心寒', '心凉'],
  '感动': ['触动', '动容', '感激', '感谢', '感恩', '感念', '感人', '动人', '催泪'],
  '疑问': ['问题', '疑问', '不解', '不明白', '不懂', '困惑', '迷惑', '疑惑', '不清楚'],
  '嫌弃': ['嫌恶', '厌恶', '讨厌', '不喜欢', '反感', '恶心', '恶意', '鄙视', '鄙夷', '不屑'],
  '无聊': ['无趣', '乏味', '枯燥', '单调', '无味', '索然无味', '百无聊赖', '闷', '闷闷不乐'],
  '病': ['生病', '不舒服', '难受', '头痛', '发烧', '感冒', '咳嗽', '恶心', '呕吐', '头晕', '晕'],
  '睡觉': ['睡眠', '睡', '困', '瞌睡', '打盹', '打瞌睡', '小憩', '休息', '躺', '躺下'],
  '吃': ['饮食', '饭', '美食', '食物', '饮料', '喝', '饮', '品尝', '享用', '大餐', '美味'],
  '运动': ['锻炼', '健身', '跑步', '游泳', '健康', '活动', '体育', '运动员', '比赛', '竞技'],
  '工作': ['职业', '事业', '办公', '忙碌', '加班', '劳动', '努力', '奋斗', '拼搏', '奋进'],
  '学习': ['读书', '知识', '学问', '研究', '探索', '思考', '思维', '智慧', '聪明', '才智'],
  '旅行': ['旅游', '出行', '游玩', '观光', '游览', '参观', '游历', '周游', '环游', '漫游'],
  '天气': ['晴天', '雨天', '阴天', '多云', '雪', '雷', '电', '风', '霜', '雾', '霾', '冷', '热'],
  '季节': ['春', '夏', '秋', '冬', '春天', '夏天', '秋天', '冬天', '四季', '时节'],
  '动物': ['宠物', '猫', '狗', '鸟', '鱼', '兔子', '熊', '狮子', '老虎', '大象', '猴子'],
  '植物': ['花', '草', '树', '叶', '果', '种子', '根', '茎', '花朵', '树木', '草地'],
  '自然': ['山', '水', '海', '河', '湖', '森林', '草原', '沙漠', '高山', '峡谷', '瀑布'],
  '城市': ['建筑', '街道', '道路', '交通', '车辆', '公园', '广场', '商场', '市场', '店铺'],
  '家': ['家庭', '亲人', '父母', '兄弟', '姐妹', '孩子', '儿女', '爷爷', '奶奶', '外公', '外婆'],
  '朋友': ['友谊', '伙伴', '同伴', '同学', '同事', '好友', '密友', '知己', '挚友', '闺蜜'],
  '爱情': ['恋爱', '情侣', '男友', '女友', '夫妻', '婚姻', '婚礼', '结婚', '爱人', '伴侣'],
  '节日': ['春节', '元宵', '清明', '端午', '中秋', '国庆', '元旦', '圣诞', '新年', '生日'],
  '文化': ['艺术', '音乐', '舞蹈', '绘画', '书法', '雕塑', '戏剧', '电影', '文学', '诗歌'],
  '科技': ['电脑', '手机', '网络', '互联网', '软件', '硬件', '程序', '编程', '代码', '算法'],
  '游戏': ['电子游戏', '网游', '手游', '单机', '多人', '竞技', '休闲', '益智', '策略', '角色'],
  '运势': ['命运', '命', '运气', '好运', '霉运', '吉祥', '不祥', '吉利', '不吉', '幸运']
};

// 添加情感与表情的映射关系，包含权重
const emotionToEmoji = {
  '开心': [
    { emoji: '😄', weight: 0.9 }, 
    { emoji: '😊', weight: 0.8 }, 
    { emoji: '😁', weight: 0.8 }, 
    { emoji: '🥰', weight: 0.7 }, 
    { emoji: '😀', weight: 0.7 }
  ],
  '难过': [
    { emoji: '😢', weight: 0.9 }, 
    { emoji: '😭', weight: 0.9 }, 
    { emoji: '😔', weight: 0.8 }, 
    { emoji: '😞', weight: 0.7 }, 
    { emoji: '🥺', weight: 0.7 }
  ],
  '生气': [
    { emoji: '😡', weight: 0.9 }, 
    { emoji: '😠', weight: 0.8 }, 
    { emoji: '🤬', weight: 0.8 }, 
    { emoji: '💢', weight: 0.7 }, 
    { emoji: '👿', weight: 0.6 }
  ],
  '惊讶': [
    { emoji: '😲', weight: 0.9 }, 
    { emoji: '😮', weight: 0.8 }, 
    { emoji: '😯', weight: 0.7 }, 
    { emoji: '😳', weight: 0.7 }, 
    { emoji: '🤯', weight: 0.6 }
  ],
  '害怕': [
    { emoji: '😨', weight: 0.9 }, 
    { emoji: '😱', weight: 0.9 }, 
    { emoji: '😰', weight: 0.8 }, 
    { emoji: '🥶', weight: 0.6 }, 
    { emoji: '😖', weight: 0.6 }
  ],
  '疲倦': [
    { emoji: '😴', weight: 0.9 }, 
    { emoji: '🥱', weight: 0.8 }, 
    { emoji: '😪', weight: 0.8 }, 
    { emoji: '😫', weight: 0.7 }, 
    { emoji: '🤤', weight: 0.6 }
  ],
  '爱': [
    { emoji: '❤️', weight: 0.9 }, 
    { emoji: '💕', weight: 0.8 }, 
    { emoji: '😍', weight: 0.8 }, 
    { emoji: '💘', weight: 0.7 }, 
    { emoji: '💓', weight: 0.7 }
  ],
  '思考': [
    { emoji: '🤔', weight: 0.9 }, 
    { emoji: '🧐', weight: 0.8 }, 
    { emoji: '💭', weight: 0.7 }, 
    { emoji: '🙄', weight: 0.6 }, 
    { emoji: '🤨', weight: 0.6 }
  ],
  '尴尬': [
    { emoji: '😅', weight: 0.9 }, 
    { emoji: '😬', weight: 0.8 }, 
    { emoji: '🫣', weight: 0.7 }, 
    { emoji: '😳', weight: 0.7 }, 
    { emoji: '🫢', weight: 0.6 }
  ],
  '无奈': [
    { emoji: '🤷', weight: 0.9 }, 
    { emoji: '😒', weight: 0.8 }, 
    { emoji: '😕', weight: 0.7 }, 
    { emoji: '😑', weight: 0.7 }, 
    { emoji: '😐', weight: 0.6 }
  ]
};

// 关键词直接映射到表情的权重表
const keywordToEmoji = {
  '可恶': [
    { emoji: '😡', weight: 0.95 },
    { emoji: '😠', weight: 0.85 },
    { emoji: '🤬', weight: 0.8 },
    { emoji: '💢', weight: 0.7 }
  ],
  '哭': [
    { emoji: '😭', weight: 0.95 },
    { emoji: '😢', weight: 0.9 },
    { emoji: '🥺', weight: 0.8 },
    { emoji: '😿', weight: 0.7 }
  ],
  '笑死': [
    { emoji: '🤣', weight: 0.95 },
    { emoji: '😂', weight: 0.9 },
    { emoji: '💀', weight: 0.8 },
    { emoji: '☠️', weight: 0.7 }
  ],
  '无语': [
    { emoji: '😑', weight: 0.95 },
    { emoji: '😶', weight: 0.9 },
    { emoji: '🙄', weight: 0.8 },
    { emoji: '😒', weight: 0.7 }
  ],
  '害羞': [
    { emoji: '😳', weight: 0.95 },
    { emoji: '🫣', weight: 0.9 },
    { emoji: '😊', weight: 0.8 },
    { emoji: '☺️', weight: 0.7 }
  ],
  '厉害': [
    { emoji: '👍', weight: 0.95 },
    { emoji: '💪', weight: 0.9 },
    { emoji: '🔥', weight: 0.8 },
    { emoji: '👏', weight: 0.7 }
  ],
  '爱你': [
    { emoji: '❤️', weight: 0.95 },
    { emoji: '😘', weight: 0.9 },
    { emoji: '🥰', weight: 0.8 },
    { emoji: '💕', weight: 0.7 }
  ]
};

// 根据搜索查询过滤表情
const filteredEmojis = computed(() => {
  // 如果没有搜索查询，显示当前分类的表情
  if (!emojiSearchQuery.value) {
    return emojiCategories[currentEmojiCategory.value].emojis;
  }
  
  const query = emojiSearchQuery.value.toLowerCase().trim();
  
  // 如果有搜索查询，在所有分类中搜索
  if (query) {
    // 创建一个结果数组，包含表情和相关性分数
    let scoredResults = [];
    
    // 1. 直接匹配关键词到表情
    if (keywordToEmoji[query]) {
      keywordToEmoji[query].forEach(item => {
        const allEmojis = getAllEmojis();
        const emojiObj = allEmojis.find(e => e === item.emoji) || 
                         emojiCategories.flatMap(c => c.emojis).find(e => e.symbol === item.emoji);
        
        if (emojiObj) {
          scoredResults.push({
            emoji: typeof emojiObj === 'string' ? { symbol: emojiObj, name: emojiObj } : emojiObj,
            score: item.weight * 100
          });
        }
      });
    }
    
    // 2. 查找相关的情感关键词
    let matchedEmotions = [];
    let keywordMatches = [];
    
    // 检查是否有相关的情感关键词
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      // 检查查询是否直接匹配情感
      if (emotion.includes(query) || query.includes(emotion)) {
        matchedEmotions.push({ emotion, score: query === emotion ? 1.0 : 0.8 });
      }
      
      // 检查查询是否匹配任何关键词
      keywords.forEach(keyword => {
        if (keyword.includes(query) || query.includes(keyword)) {
          const matchScore = query === keyword ? 0.9 : 
                            keyword.startsWith(query) ? 0.8 :
                            query.startsWith(keyword) ? 0.7 : 0.6;
          keywordMatches.push({ emotion, keyword, score: matchScore });
        }
      });
    }
    
    // 3. 根据匹配的情感添加表情
    matchedEmotions.forEach(({ emotion, score }) => {
      if (emotionToEmoji[emotion]) {
        emotionToEmoji[emotion].forEach(item => {
          const allEmojis = getAllEmojis();
          const emojiObj = allEmojis.find(e => e === item.emoji) || 
                          emojiCategories.flatMap(c => c.emojis).find(e => e.symbol === item.emoji);
          
          if (emojiObj) {
            scoredResults.push({
              emoji: typeof emojiObj === 'string' ? { symbol: emojiObj, name: emojiObj } : emojiObj,
              score: item.weight * score * 100
            });
          }
        });
      }
    });
    
    // 4. 根据匹配的关键词添加表情
    keywordMatches.forEach(({ emotion, score }) => {
      if (emotionToEmoji[emotion]) {
        emotionToEmoji[emotion].forEach(item => {
          const allEmojis = getAllEmojis();
          const emojiObj = allEmojis.find(e => e === item.emoji) || 
                          emojiCategories.flatMap(c => c.emojis).find(e => e.symbol === item.emoji);
          
          if (emojiObj) {
            scoredResults.push({
              emoji: typeof emojiObj === 'string' ? { symbol: emojiObj, name: emojiObj } : emojiObj,
              score: item.weight * score * 90
            });
          }
        });
      }
    });
    
    // 5. 搜索所有表情名称
    for (const category of emojiCategories) {
      category.emojis.forEach(emoji => {
        const nameScore = calculateStringMatchScore(emoji.name.toLowerCase(), query);
        if (nameScore > 0) {
          scoredResults.push({
            emoji,
            score: nameScore * 80 // 名称匹配的权重稍低
          });
        }
      });
    }
    
    // 6. 去重并按分数排序
    const uniqueResults = [];
    const seenSymbols = new Set();
    
    // 合并相同表情的分数
    scoredResults.forEach(item => {
      if (!seenSymbols.has(item.emoji.symbol)) {
        seenSymbols.add(item.emoji.symbol);
        uniqueResults.push(item);
      } else {
        // 如果已存在，取最高分
        const existingItem = uniqueResults.find(r => r.emoji.symbol === item.emoji.symbol);
        if (existingItem && item.score > existingItem.score) {
          existingItem.score = item.score;
        }
      }
    });
    
    // 按分数排序
    uniqueResults.sort((a, b) => b.score - a.score);
    
    // 返回排序后的表情列表
    return uniqueResults.map(item => item.emoji);
  }
  
  // 默认返回当前分类
  return emojiCategories[currentEmojiCategory.value].emojis;
});

// 计算字符串匹配分数
function calculateStringMatchScore(str, query) {
  if (str === query) return 1.0; // 完全匹配
  if (str.includes(query)) return 0.8; // 包含查询
  if (query.includes(str)) return 0.7; // 查询包含字符串
  
  // 计算编辑距离的相似度
  const distance = levenshteinDistance(str, query);
  const maxLength = Math.max(str.length, query.length);
  const similarity = 1 - distance / maxLength;
  
  return similarity > 0.5 ? similarity * 0.6 : 0; // 只返回相似度大于0.5的结果
}

// 计算编辑距离
function levenshteinDistance(a, b) {
  const matrix = [];
  
  // 初始化矩阵
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // 填充矩阵
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j] + 1      // 删除
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// 将搜索结果按分类分组
const groupedSearchResults = computed(() => {
  if (!emojiSearchQuery.value) return {};
  
  const query = emojiSearchQuery.value.toLowerCase().trim();
  const groups = {};
  
  // 创建一个结果数组，包含表情、分类和相关性分数
  let scoredResults = [];
  
  // 1. 直接匹配关键词到表情
  if (keywordToEmoji[query]) {
    keywordToEmoji[query].forEach(item => {
      for (const category of emojiCategories) {
        const emojiObj = category.emojis.find(e => e.symbol === item.emoji);
        if (emojiObj) {
          scoredResults.push({
            emoji: emojiObj,
            category: category.name,
            score: item.weight * 100
          });
          break;
        }
      }
    });
  }
  
  // 2. 查找相关的情感关键词
  let matchedEmotions = [];
  let keywordMatches = [];
  
  // 检查是否有相关的情感关键词
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    // 检查查询是否直接匹配情感
    if (emotion.includes(query) || query.includes(emotion)) {
      matchedEmotions.push({ emotion, score: query === emotion ? 1.0 : 0.8 });
    }
    
    // 检查查询是否匹配任何关键词
    keywords.forEach(keyword => {
      if (keyword.includes(query) || query.includes(keyword)) {
        const matchScore = query === keyword ? 0.9 : 
                          keyword.startsWith(query) ? 0.8 :
                          query.startsWith(keyword) ? 0.7 : 0.6;
        keywordMatches.push({ emotion, keyword, score: matchScore });
      }
    });
  }
  
  // 3. 根据匹配的情感添加表情
  matchedEmotions.forEach(({ emotion, score }) => {
    if (emotionToEmoji[emotion]) {
      emotionToEmoji[emotion].forEach(item => {
        for (const category of emojiCategories) {
          const emojiObj = category.emojis.find(e => e.symbol === item.emoji);
          if (emojiObj) {
            scoredResults.push({
              emoji: emojiObj,
              category: category.name,
              score: item.weight * score * 100
            });
            break;
          }
        }
      });
    }
  });
  
  // 4. 根据匹配的关键词添加表情
  keywordMatches.forEach(({ emotion, score }) => {
    if (emotionToEmoji[emotion]) {
      emotionToEmoji[emotion].forEach(item => {
        for (const category of emojiCategories) {
          const emojiObj = category.emojis.find(e => e.symbol === item.emoji);
          if (emojiObj) {
            scoredResults.push({
              emoji: emojiObj,
              category: category.name,
              score: item.weight * score * 90
            });
            break;
          }
        }
      });
    }
  });
  
  // 5. 搜索所有表情名称
  for (const category of emojiCategories) {
    category.emojis.forEach(emoji => {
      const nameScore = calculateStringMatchScore(emoji.name.toLowerCase(), query);
      if (nameScore > 0) {
        scoredResults.push({
          emoji,
          category: category.name,
          score: nameScore * 80 // 名称匹配的权重稍低
        });
      }
    });
  }
  
  // 6. 去重并按分数排序
  const uniqueResults = [];
  const seenSymbols = new Set();
  
  // 合并相同表情的分数，保留最高分
  scoredResults.forEach(item => {
    const key = `${item.emoji.symbol}-${item.category}`;
    if (!seenSymbols.has(key)) {
      seenSymbols.add(key);
      uniqueResults.push(item);
    } else {
      // 如果已存在，取最高分
      const existingItem = uniqueResults.find(r => 
        r.emoji.symbol === item.emoji.symbol && r.category === item.category
      );
      if (existingItem && item.score > existingItem.score) {
        existingItem.score = item.score;
      }
    }
  });
  
  // 按分数排序
  uniqueResults.sort((a, b) => b.score - a.score);
  
  // 按分类分组
  uniqueResults.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item.emoji);
  });
  
  return groups;
});

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

// 处理搜索输入
function handleSearchInput() {
  // 限制输入长度，防止输入过长的内容
  if (emojiSearchQuery.value.length > 2) {
    emojiSearchQuery.value = emojiSearchQuery.value.substring(0, 2);
  }
  
  // 如果输入的是单个表情符号，可以直接添加
  if (isValidEmoji(emojiSearchQuery.value) && !isEmojiSelected(emojiSearchQuery.value) && params.moods.length < 5) {
    // 检查是否是已知的表情符号
    const isKnown = emojiCategories.some(category => 
      category.emojis.some(emoji => emoji.symbol === emojiSearchQuery.value)
    );
    
    // 如果是已知的表情符号，可以高亮显示它
    if (isKnown && !emojiSearchQuery.value) {
      // 在所有分类中查找这个表情
      for (let i = 0; i < emojiCategories.length; i++) {
        const found = emojiCategories[i].emojis.find(e => e.symbol === emojiSearchQuery.value);
        if (found) {
          // 只有在没有搜索查询时才切换分类
          currentEmojiCategory.value = i;
          break;
        }
      }
    }
  }
}

// 从搜索框添加表情
function addEmojiFromSearch() {
  if (isValidEmoji(emojiSearchQuery.value)) {
    if (params.moods.length < 5) {
      params.moods.push(emojiSearchQuery.value);
      clearSearch();
    } else {
      alert('最多只能选择5个表情');
    }
  }
}

// 检查表情是否已被选择
function isEmojiSelected(emoji) {
  return params.moods.includes(emoji);
}

// 获取分类图标
function getCategoryIcon(categoryName) {
  const category = emojiCategories.find(cat => cat.name === categoryName);
  return category ? category.icon : 'fas fa-smile';
}

// 清除搜索
function clearSearch() {
  emojiSearchQuery.value = '';
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
  const allEmojis = getAllEmojis();
  
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
  // 无论面板是否打开，都更新参数，确保清除操作能立即生效
  Object.assign(params, newParams);
  
  // 对于数组，需要深度复制
  if (newParams.moods) {
    params.moods = [...newParams.moods];
  } else {
    params.moods = [];
  }
  
  // 确保毒舌模式状态正确
  document.body.classList.toggle('savage-mode', params.savageMode);
}, { deep: true });

function toggleFortune() {
  params.enableFortune = !params.enableFortune;
}
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
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
}

.panel-section {
  margin-bottom: var(--spacing-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: rgba(0, 0, 0, 0.02);
}

.section-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-content {
  animation: fadeIn 0.3s ease;
  padding: 0 var(--spacing-xs);
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
  font-size: 13px;
  color: var(--text-secondary);
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.section-header h3::before {
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 14px;
  color: var(--primary-color);
}

.section-header:nth-child(1) h3::before {
  content: "\f118"; /* 心情/场景图标 */
}

.section-header:nth-child(3) h3::before {
  content: "\f02d"; /* 内容主题图标 */
}

.section-header:nth-child(5) h3::before {
  content: "\f0e7"; /* 情感风格图标 */
}

.section-header:nth-child(7) h3::before {
  content: "\f005"; /* 今日运势图标 */
}

.savage-panel .section-header h3::before {
  color: var(--savage-primary-color, #ff5252);
}

.params-panel-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-color);
  position: sticky;
  bottom: 0;
  background-color: var(--card-bg);
  gap: var(--spacing-md);
  z-index: 103;
}

/* 表情选择器样式 */
.emoji-tabs {
  display: flex;
  overflow-x: auto;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  scrollbar-width: thin;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-md);
}

.emoji-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-xs);
}

.emoji-tab i {
  font-size: 16px;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.emoji-tab small {
  font-size: 12px;
  white-space: nowrap;
  text-align: center;
}

.emoji-tab.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.emoji-tab.active i {
  color: white;
}

.savage-panel .emoji-tab.active {
  background-color: var(--savage-primary-color, #ff5252);
}

/* 表情列表样式 */
.emoji-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: var(--spacing-sm);
  max-height: 200px;
  overflow-y: auto;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  background-color: rgba(0, 0, 0, 0.02);
  scrollbar-width: thin;
  margin-top: var(--spacing-sm);
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  font-size: 24px;
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-xs);
}

.emoji-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.emoji-item.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.savage-panel .emoji-item.active {
  background-color: var(--savage-primary-color, #ff5252);
  border-color: var(--savage-primary-color, #ff5252);
}

/* 已选择表情样式 */
.selected-emojis {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: var(--radius-md);
  overflow-x: auto;
  scrollbar-width: thin;
}

.selected-emojis-wrapper {
  display: flex;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  justify-content: center;
  flex-wrap: wrap;
}

.selected-emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 48px;
  height: 48px;
  font-size: 24px;
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.selected-emoji-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.remove-emoji-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  border-radius: 50%;
  border: none;
  font-size: 9px;
  cursor: pointer;
  opacity: 0.6;
  transition: all var(--transition-fast);
  z-index: 2;
}

.remove-emoji-btn:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.savage-panel .remove-emoji-btn:hover {
  background-color: rgba(255, 82, 82, 0.7);
}

/* 表情项悬停时显示删除按钮 */
.selected-emoji-item .remove-emoji-btn {
  opacity: 0;
}

.selected-emoji-item:hover .remove-emoji-btn {
  opacity: 0.6;
}

.selected-emoji-item:hover .remove-emoji-btn:hover {
  opacity: 1;
}

/* 主题选项样式 */
.theme-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  height: 60px;
  box-shadow: var(--shadow-xs);
}

.theme-option i {
  font-size: 18px;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.theme-option span {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.theme-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.theme-option.active i {
  color: white;
}

/* 情感风格选择器样式 */
.style-toggle {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.style-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  height: 60px;
  box-shadow: var(--shadow-xs);
}

.style-option i {
  font-size: 18px;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.style-option span {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.style-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.style-option:last-child.active {
  background-color: var(--savage-primary-color, #ff5252);
}

.style-option.active i {
  color: white;
}

/* 运势选项样式 */
.fortune-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-sm);
}

.fortune-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.fortune-toggle i {
  font-size: 15px;
  color: var(--primary-color);
}

.savage-panel .fortune-toggle i {
  color: var(--savage-primary-color, #ff5252);
}

.fortune-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.fortune-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  height: 60px;
  box-shadow: var(--shadow-xs);
}

.fortune-option i {
  font-size: 18px;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.fortune-option span {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.fortune-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.fortune-option.active i {
  color: white;
}

/* 随机按钮样式 */
.btn-random {
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-md);
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
  font-size: 15px;
}

/* 调整按钮组布局 */
.params-panel-footer {
  gap: var(--spacing-sm);
  justify-content: space-between;
}

.params-panel-footer button {
  flex: 1;
  max-width: 33%;
  font-size: 14px;
  padding: var(--spacing-xs) var(--spacing-sm);
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
    font-size: 20px;
    height: 38px;
  }
  
  .selected-emoji-item {
    font-size: 20px;
    min-width: 38px;
    height: 38px;
  }
  
  .theme-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .theme-option, .style-option, .fortune-option {
    height: 50px;
    padding: var(--spacing-xs);
  }
  
  .theme-option i, .style-option i, .fortune-option i {
    font-size: 16px;
    margin-bottom: var(--spacing-xs);
  }
  
  .theme-option span, .style-option span, .fortune-option span {
    font-size: 12px;
  }
  
  .btn-random {
    font-size: 13px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .emoji-tab {
    min-width: 50px;
    padding: var(--spacing-xs);
  }
  
  .emoji-tab i {
    font-size: 14px;
  }
  
  .emoji-tab small {
    font-size: 10px;
  }
  
  .params-panel-footer button {
    font-size: 13px;
    padding: var(--spacing-xs) var(--spacing-xs);
  }
  
  .selected-emojis-wrapper {
    gap: var(--spacing-xs);
  }
  
  .search-result-items {
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-xs);
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
    grid-template-columns: repeat(7, 1fr);
    max-height: 350px;
  }
  
  .search-result-items {
    grid-template-columns: repeat(7, 1fr);
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
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.savage-panel .fortune-option.active {
  background-color: var(--savage-primary-color, #ff5252);
  border-color: var(--savage-primary-color, #ff5252);
}

.savage-panel .theme-option.active {
  background-color: var(--savage-primary-color, #ff5252);
  border-color: var(--savage-primary-color, #ff5252);
}

/* 添加功能提示样式 */
.feature-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.feature-notice i {
  font-size: 14px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.savage-panel .feature-notice i {
  color: var(--savage-primary-color, #ff5252);
}

/* 禁用的主题选项样式 */
.theme-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--border-color);
}

/* 搜索框样式 */
.emoji-search {
  display: flex;
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: 14px;
}

.search-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-xs) var(--spacing-xs) calc(var(--spacing-xs) * 2 + 14px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-color);
  font-size: 13px;
  transition: all var(--transition-fast);
  width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.savage-panel .search-input:focus {
  border-color: var(--savage-primary-color, #ff5252);
  box-shadow: 0 0 0 2px rgba(255, 82, 82, 0.2);
}

.add-emoji-btn,
.clear-search-btn {
  position: absolute;
  right: var(--spacing-xs);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.add-emoji-btn:hover {
  color: var(--primary-color);
}

.savage-panel .add-emoji-btn:hover {
  color: var(--savage-primary-color, #ff5252);
}

.clear-search-btn:hover {
  color: var(--danger-color, #f44336);
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-sm);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.no-results::before {
  content: "🔍";
  font-size: 24px;
  margin-bottom: var(--spacing-xs);
}

/* 全局搜索结果样式 */
.emoji-list.global-search {
  display: block;
  max-height: 300px;
  padding: var(--spacing-sm);
}

.search-result-group {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

.search-category-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px dashed var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.search-category-label i {
  font-size: 14px;
  color: var(--primary-color);
}

.savage-panel .search-category-label i {
  color: var(--savage-primary-color, #ff5252);
}

.search-result-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: var(--spacing-sm);
}

/* 滚动条样式 */
.emoji-list::-webkit-scrollbar,
.emoji-tabs::-webkit-scrollbar,
.selected-emojis::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.emoji-list::-webkit-scrollbar-thumb,
.emoji-tabs::-webkit-scrollbar-thumb,
.selected-emojis::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.emoji-list::-webkit-scrollbar-track,
.emoji-tabs::-webkit-scrollbar-track,
.selected-emojis::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>