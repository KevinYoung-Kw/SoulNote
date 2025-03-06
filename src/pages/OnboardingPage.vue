<template>
  <div class="onboarding-page">
    <div class="progress-bar">
      <div class="progress" :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
    </div>
    
    <div class="onboarding-content">
      <!-- 步骤1: 欢迎 -->
      <div class="onboarding-step" v-if="currentStep === 1">
        <h1 class="step-title">欢迎使用星语心笺</h1>
        <p class="step-desc">让我们完成简单设置，为您提供更个性化的体验</p>
        
        <div class="step-image">
          <img :src="welcomeSvg" alt="Welcome" />
        </div>
      </div>
      
      <!-- 步骤2: 星座选择 -->
      <div class="onboarding-step" v-else-if="currentStep === 2">
        <h1 class="step-title">您的星座是？</h1>
        <p class="step-desc">我们将根据星座特质为您提供更契合的内容</p>
        
        <div class="zodiac-grid">
          <div 
            v-for="zodiac in zodiacs" 
            :key="zodiac.value"
            class="zodiac-item"
            :class="{ active: userPreferences.zodiac === zodiac.value }"
            @click="selectZodiac(zodiac.value)"
          >
            <i :class="zodiac.icon"></i>
            <span>{{ zodiac.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 步骤3: MBTI选择 -->
      <div class="onboarding-step" v-else-if="currentStep === 3">
        <h1 class="step-title">您的MBTI人格类型？</h1>
        <p class="step-desc">了解您的思考与决策方式有助于我们创作更贴合您内心的文字</p>
        
        <div class="mbti-selection">
          <div class="mbti-group" v-for="(group, index) in mbtiGroups" :key="index">
            <h3 class="group-title">{{ group.title }}</h3>
            <div class="mbti-buttons">
              <button
                v-for="mbti in group.types"
                :key="mbti.value"
                class="mbti-button"
                :class="{ active: userPreferences.mbti === mbti.value }"
                @click="userPreferences.mbti = mbti.value"
              >
                <span class="mbti-code">{{ mbti.value }}</span>
                <span class="mbti-name">{{ mbti.label }}</span>
              </button>
            </div>
          </div>
          
          <div class="mbti-guide">
            <p>还不知道自己的MBTI？<a href="#" @click.prevent="openMBTITest">点击测试</a></p>
          </div>
        </div>
      </div>
      
      <!-- 步骤4: 语言偏好 -->
      <div class="onboarding-step" v-else-if="currentStep === 4">
        <h1 class="step-title">语言偏好</h1>
        <p class="step-desc">选择您希望生成的心语纸条的语言类型</p>
        
        <div class="language-options">
          <div 
            class="language-option"
            :class="{ active: userPreferences.language === 'zh' }"
            @click="userPreferences.language = 'zh'"
          >
            <i class="fas fa-check-circle option-icon"></i>
            <div class="option-content">
              <h3>中文</h3>
              <p>纯中文表达，传统而温暖</p>
            </div>
          </div>
          
          <div 
            class="language-option"
            :class="{ active: userPreferences.language === 'en-zh' }"
            @click="userPreferences.language = 'en-zh'"
          >
            <i class="fas fa-check-circle option-icon"></i>
            <div class="option-content">
              <h3>中英双语</h3>
              <p>中英文结合，现代而国际化</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 步骤5: 完成设置 -->
      <div class="onboarding-step" v-else-if="currentStep === 5">
        <h1 class="step-title">设置完成！</h1>
        <p class="step-desc">现在开始享受您的专属心灵纸条吧</p>
        
        <div class="completion-image">
          <img :src="completeSvg" alt="Complete" />
          <div class="sample-note">
            <p>{{ sampleNote }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="onboarding-actions">
      <button 
        class="btn btn-secondary" 
        @click="prevStep" 
        v-if="currentStep > 1"
      >
        上一步
      </button>
      
      <button 
        class="btn btn-primary" 
        @click="nextStep"
      >
        {{ currentStep < totalSteps ? '下一步' : '开始使用' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { saveUserPreferences, setOnboardingCompleted } from '../services/storageService';
import welcomeSvg from '../assets/onboarding-welcome.svg';
import completeSvg from '../assets/onboarding-complete.svg';

const router = useRouter();
const currentStep = ref(1);
const totalSteps = 5;

const userPreferences = reactive({
  zodiac: null,
  mbti: null,
  language: 'zh',
  theme: 'light',
  fontSize: 24,
  background: 'paper-1'
});

// 星座数据
const zodiacs = [
  { label: '白羊座', value: 'aries', icon: 'fas fa-fire' },
  { label: '金牛座', value: 'taurus', icon: 'fas fa-chess-rook' },
  { label: '双子座', value: 'gemini', icon: 'fas fa-user-friends' },
  { label: '巨蟹座', value: 'cancer', icon: 'fas fa-moon' },
  { label: '狮子座', value: 'leo', icon: 'fas fa-crown' },
  { label: '处女座', value: 'virgo', icon: 'fas fa-leaf' },
  { label: '天秤座', value: 'libra', icon: 'fas fa-balance-scale' },
  { label: '天蝎座', value: 'scorpio', icon: 'fas fa-skull' },
  { label: '射手座', value: 'sagittarius', icon: 'fas fa-arrow-alt-circle-right' },
  { label: '摩羯座', value: 'capricorn', icon: 'fas fa-mountain' },
  { label: '水瓶座', value: 'aquarius', icon: 'fas fa-tint' },
  { label: '双鱼座', value: 'pisces', icon: 'fas fa-fish' }
];

// MBTI分组
const mbtiGroups = [
  {
    title: '分析家型',
    types: [
      { value: 'INTJ', label: '建筑师' },
      { value: 'INTP', label: '逻辑学家' },
      { value: 'ENTJ', label: '指挥官' },
      { value: 'ENTP', label: '辩论家' }
    ]
  },
  {
    title: '外交家型',
    types: [
      { value: 'INFJ', label: '提倡者' },
      { value: 'INFP', label: '调停者' },
      { value: 'ENFJ', label: '主人公' },
      { value: 'ENFP', label: '活动家' }
    ]
  },
  {
    title: '哨兵型',
    types: [
      { value: 'ISTJ', label: '物流师' },
      { value: 'ISFJ', label: '守卫者' },
      { value: 'ESTJ', label: '总经理' },
      { value: 'ESFJ', label: '执政官' }
    ]
  },
  {
    title: '探险家型',
    types: [
      { value: 'ISTP', label: '鉴赏家' },
      { value: 'ISFP', label: '探险家' },
      { value: 'ESTP', label: '企业家' },
      { value: 'ESFP', label: '表演者' }
    ]
  }
];

// 示例纸条内容
const sampleNote = computed(() => {
  const zodiacLabel = zodiacs.find(z => z.value === userPreferences.zodiac)?.label || '星座';
  const mbtiLabel = mbtiGroups.flatMap(g => g.types).find(m => m.value === userPreferences.mbti)?.value || 'MBTI';
  
  return `亲爱的${zodiacLabel}${mbtiLabel}，你内心的宁静是最强大的力量源泉。今天，尝试放下担忧，拥抱自己的独特，你将发现生命中最美好的可能性。`;
});

function selectZodiac(value) {
  userPreferences.zodiac = value;
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function nextStep() {
  if (currentStep.value < totalSteps) {
    // 验证当前步骤是否已完成
    if (currentStep.value === 2 && !userPreferences.zodiac) {
      alert('请选择一个星座');
      return;
    }
    
    if (currentStep.value === 3 && !userPreferences.mbti) {
      alert('请选择一个MBTI人格类型');
      return;
    }
    
    currentStep.value++;
  } else {
    completeOnboarding();
  }
}

async function completeOnboarding() {
  try {
    // 保存用户偏好
    await saveUserPreferences(userPreferences);
    
    // 标记完成引导流程
    await setOnboardingCompleted(true);
    
    // 导航到主页
    router.push('/home');
  } catch (error) {
    console.error('完成引导流程失败:', error);
    alert('设置保存失败，请重试');
  }
}

function openMBTITest() {
  window.open('https://www.16personalities.com/zh', '_blank');
}
</script>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.progress-bar {
  height: 4px;
  background-color: var(--border-color);
  width: 100%;
}

.progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.onboarding-content {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.onboarding-step {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.step-title {
  font-size: 24px;
  margin-bottom: var(--spacing-md);
}

.step-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.step-image, .completion-image {
  margin: var(--spacing-xl) 0;
}

.step-image img, .completion-image img {
  max-width: 100%;
  height: auto;
}

.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
}

.zodiac-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.zodiac-item i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.zodiac-item span {
  font-size: 14px;
}

.zodiac-item.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.zodiac-item.active i {
  color: white;
}

.mbti-selection {
  text-align: left;
}

.mbti-group {
  margin-bottom: var(--spacing-lg);
}

.group-title {
  font-size: 16px;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.mbti-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.mbti-button {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
}

.mbti-button:hover {
  border-color: var(--primary-color);
}

.mbti-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.mbti-code {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.mbti-name {
  font-size: 14px;
}

.mbti-guide {
  text-align: center;
  margin-top: var(--spacing-lg);
  font-size: 14px;
  color: var(--text-secondary);
}

.mbti-guide a {
  color: var(--primary-color);
  text-decoration: none;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
}

.language-option {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.language-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.language-option.active .option-content p {
  color: rgba(255, 255, 255, 0.8);
}

.option-icon {
  font-size: 20px;
  margin-right: var(--spacing-md);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.language-option.active .option-icon {
  opacity: 1;
}

.option-content h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: 16px;
}

.option-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.sample-note {
  background-color: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
  font-family: var(--font-decorative);
  font-size: 18px;
  line-height: 1.6;
  box-shadow: var(--shadow-md);
}

.onboarding-actions {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
}

.onboarding-actions button {
  padding: var(--spacing-sm) var(--spacing-xl);
}

@media (max-width: 480px) {
  .zodiac-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mbti-buttons {
    grid-template-columns: 1fr;
  }
  
  .step-title {
    font-size: 20px;
  }
}
</style>