import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getDefaultFontSize } from '../../config/style';

// 导入组件
import HeaderComponent from '../ui/HeaderComponent.vue';
import FooterNavigation from '../ui/FooterNavigation.vue';
import ParamsPreview from '../customization/ParamsPreview.vue';
import ParamsPanel from '../customization/ParamsPanel.vue';
import NoteDisplay from '../note/NoteDisplay.vue';
import AppreciationBanner from '../ui/AppreciationBanner.vue';
import CommunityPrompt from '../community/CommunityPrompt.vue';
import NoteStyleCustomizer from '../customization/NoteStyleCustomizer.vue';
import AISetting from '../ai-settings/AISetting.vue';

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
const customStyle = ref({});
const apiSettings = ref(null);

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
  </div>
</template>

<script setup>
function openStore() {
  showAISettings.value = true;
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

// 修改生成笔记的方法
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
    
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}

// 生命周期钩子
onMounted(async () => {
  // 加载用户偏好设置
  try {
    const preferences = await getUserPreferences();
    
    // 加载 AI 设置
    const savedAISettings = localStorage.getItem('aiSettings');
    if (savedAISettings) {
      apiSettings.value = JSON.parse(savedAISettings);
    }
    
    // ... existing code ...
  } catch (error) {
    logger.error('PREFERENCES', '加载用户偏好设置失败:', error);
  }
});
</script> 