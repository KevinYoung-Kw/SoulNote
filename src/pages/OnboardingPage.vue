<template>
  <div class="onboarding-page fixed-page-layout">
    <!-- 字体预加载元素 -->
    <div class="font-preload">楷体预加载</div>
    
    <div class="progress-bar fixed-header">
      <div class="progress" :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
    </div>
    
    <div class="onboarding-content scrollable-content">
      <!-- 步骤1: 欢迎 -->
      <div class="onboarding-step" v-if="currentStep === 1">
        <h1 class="step-title">欢迎使用星语心笺</h1>
        <p class="step-desc">让我们完成简单设置，为您提供更个性化的体验</p>
        
        <div class="step-image">
          <img :src="welcomeSvg" alt="Welcome" />
        </div>
      </div>

      <!-- 步骤2: 使用须知 -->
      <div class="onboarding-step" v-else-if="currentStep === 2">
        <h1 class="step-title">使用须知</h1>
        <p class="step-desc">开始使用前，请了解以下重要信息</p>
        
        <div class="announcement-section">
          <div class="announcement-box">
            <div class="announcement-content">
              <p><i class="fas fa-random announcement-icon"></i> 大模型生成的内容就像"抽卡"一样随机，每次体验会有不同惊喜。如对内容不满意，请多尝试几次！</p>
              <p><i class="fas fa-star announcement-icon"></i> 本应用的星座运势信息来源于台湾权威星座网站，仅供参考娱乐。</p>
              <p>
                <i class="fas fa-lock announcement-icon"></i> 
                <span class="announcement-text">
                  <span class="highlight-primary">关于数据</span>：所有数据都缓存在浏览器中，不会上传至服务器。
                  为确保<span class="highlight-primary">更好的用户体验</span>，请使用<span class="highlight-primary">浏览器</span>操作，详见隐私政策。
                </span>
              </p>
              <p><i class="fas fa-heart announcement-icon"></i> 如果想要加入产品体验群或者请作者喝杯咖啡，请点击"关于我们"。</p>
            </div>
            <div class="announcement-links">
              <button class="link-button" @click="navigateTo('/about-us')">
                <i class="fas fa-users"></i> 关于我们
              </button>
              <button class="link-button" @click="navigateTo('/privacy-policy')">
                <i class="fas fa-shield-alt"></i> 隐私政策
              </button>
            </div>
          </div>
        </div>
      </div>    

      <!-- 步骤2: 性别选择 -->
      <div class="onboarding-step" v-else-if="currentStep === 3">
        <h1 class="step-title">您的性别是？</h1>
        <p class="step-desc">让我们更好地了解您</p>
        
        <div class="gender-options">
          <div 
            class="gender-option"
            :class="{ active: userPreferences.gender === 'male' }"
            @click="selectGender('male')"
          >
            <i class="fas fa-mars"></i>
            <span>男性</span>
          </div>
          <div 
            class="gender-option"
            :class="{ active: userPreferences.gender === 'female' }"
            @click="selectGender('female')"
          >
            <i class="fas fa-venus"></i>
            <span>女性</span>
          </div>
          <div 
            class="gender-option"
            :class="{ active: userPreferences.gender === 'other' }"
            @click="selectGender('other')"
          >
            <i class="fas fa-cat"></i>
            <span>其他</span>
          </div>
        </div>
      </div>
      
      <!-- 步骤3: 年龄选择 -->
      <div class="onboarding-step" v-else-if="currentStep === 4">
        <h1 class="step-title">您的年龄段是？</h1>
        <p class="step-desc">我们将根据年龄特点提供更贴切的内容</p>
        
        <div class="age-options">
          <div 
            v-for="ageGroup in ageGroups" 
            :key="ageGroup.value"
            class="age-option"
            :class="{ active: userPreferences.age === ageGroup.value }"
            @click="selectAge(ageGroup.value)"
          >
            <span>{{ ageGroup.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 步骤4: 婚恋状况 -->
      <div class="onboarding-step" v-else-if="currentStep === 5">
        <h1 class="step-title">您的感情状况？</h1>
        <p class="step-desc">了解您的情感状态有助于我们创作更贴合您内心的文字</p>
        
        <div class="relationship-options">
          <div 
            v-for="status in relationshipStatuses" 
            :key="status.value"
            class="relationship-option"
            :class="{ active: userPreferences.relationship === status.value }"
            @click="selectRelationship(status.value)"
          >
            <i :class="status.icon"></i>
            <span>{{ status.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 步骤5: 星座选择 -->
      <div class="onboarding-step" v-else-if="currentStep === 6">
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
      
      <!-- 步骤6: MBTI选择 -->
      <div class="onboarding-step" v-else-if="currentStep === 7">
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
      
      <!-- 步骤7: 语言偏好 -->
      <div class="onboarding-step" v-else-if="currentStep === 8">
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
      
      <!-- 步骤8: 完成设置 -->
      <div class="onboarding-step" v-else-if="currentStep === 9">
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
    
    <div class="onboarding-actions fixed-footer">
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { saveUserPreferences, setOnboardingCompleted } from '../services/storageService';
import welcomeSvg from '../assets/onboarding-welcome.svg';
import completeSvg from '../assets/onboarding-complete.svg';

// 预加载字体
const fontPreloaded = ref(false);

onMounted(() => {
  // 尝试预加载字体
  if ('fonts' in document) {
    Promise.all([
      document.fonts.load('1em KaitiLocal'),
      document.fonts.load('1em var(--font-note)')
    ]).then(() => {
      console.log('字体已预加载');
      fontPreloaded.value = true;
    }).catch(err => {
      console.warn('字体预加载失败', err);
      // 失败后仍设置为true，不阻止应用继续
      fontPreloaded.value = true;
    });
  } else {
    console.warn('浏览器不支持字体API，跳过字体预加载');
    fontPreloaded.value = true;
  }
});

const router = useRouter();
const currentStep = ref(1);
const totalSteps = 8; // 增加总步骤数

const userPreferences = reactive({
  gender: null,
  age: null,
  relationship: null,
  zodiac: null,
  mbti: null,
  language: 'zh',
  theme: 'light',
  fontSize: 24,
  background: 'paper-1'
});

// 性别选择函数
function selectGender(value) {
  userPreferences.gender = value;
}

// 年龄段数据
const ageGroups = [
  { label: '18岁以下', value: 'under18' },
  { label: '18-24岁', value: '18-24' },
  { label: '25-34岁', value: '25-34' },
  { label: '35-44岁', value: '35-44' },
  { label: '45-54岁', value: '45-54' },
  { label: '55岁以上', value: 'above55' }
];

// 年龄选择函数
function selectAge(value) {
  userPreferences.age = value;
}

// 婚恋状况数据
const relationshipStatuses = [
  { label: '单身', value: 'single', icon: 'fas fa-user' },
  { label: '有心仪对象', value: 'crushing', icon: 'fas fa-heart' },
  { label: '恋爱中', value: 'relationship', icon: 'fas fa-people-arrows' },
  { label: '已婚', value: 'married', icon: 'fas fa-ring' }
];

// 婚恋状况选择函数
function selectRelationship(value) {
  userPreferences.relationship = value;
}

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
  const genderLabel = userPreferences.gender === 'male' ? '先生' : 
                     userPreferences.gender === 'female' ? '女士' : '';
  
  return `亲爱的${zodiacLabel}${mbtiLabel}${genderLabel}，你内心的宁静是最强大的力量源泉。今天，尝试放下担忧，拥抱自己的独特，你将发现生命中最美好的可能性。`;
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
    if (currentStep.value === 3 && !userPreferences.gender) {
      alert('请选择您的性别');
      return;
    }
    
    if (currentStep.value === 4 && !userPreferences.age) {
      alert('请选择您的年龄段');
      return;
    }
    
    if (currentStep.value === 5 && !userPreferences.relationship) {
      alert('请选择您的感情状况');
      return;
    }
    
    if (currentStep.value === 6 && !userPreferences.zodiac) {
      alert('请选择一个星座');
      return;
    }
    
    if (currentStep.value === 7 && !userPreferences.mbti) {
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

function navigateTo(path) {
  // 阻止导航完成onboarding的操作
  event.stopPropagation();
  router.push(path);
}
</script>

<style scoped>
.onboarding-page {
  background-color: var(--bg-color);
}

.progress-bar {
  height: 4px;
  background-color: var(--border-color);
  width: 100%;
}

.onboarding-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* Dynamic justification based on content height */
  justify-content: center;
  overflow-y: auto;
}


.onboarding-actions {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
}

.progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.onboarding-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Changed from center to flex-start */
  overflow-y: auto;
}

/* Add a min-height to the steps to ensure proper centering */
.onboarding-step {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  /* Add padding at the bottom to ensure there's space before the footer */
  padding-bottom: var(--spacing-xl);
  /* Make sure each step has room to be centered properly */
  min-height: min-content;
  /* Add auto margin-top to push content down when needed */
  margin-top: auto;
  margin-bottom: auto;
}

.step-title {
  font-size: 24px;
  margin-bottom: var(--spacing-md);
  /* Add padding at the top to ensure visibility on scroll */
  padding-top: var(--spacing-md);
}

.step-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg); /* Reduced from xl to lg */
}

.step-image, .completion-image {
  margin: var(--spacing-lg) 0; /* Reduced from xl to lg */
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

@media (max-width: 480px) {
  .zodiac-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mbti-buttons {
    grid-template-columns: 1fr;
  }
  
  .relationship-options {
    grid-template-columns: 1fr;
  }
  
  .gender-options {
    flex-direction: column;
    align-items: center;
  }
  
  .step-title {
    font-size: 20px;
    margin-bottom: var(--spacing-sm);
  }
  
  .step-desc {
    margin-bottom: var(--spacing-md);
  }
  
  /* Adjust padding for smaller screens */
  .onboarding-content {
    padding: var(--spacing-md);
    padding-top: var(--spacing-lg);
    padding-bottom: calc(var(--spacing-lg) + 60px); /* Extra space for footer */
  }
  
  /* More compact options for small screens */
  .gender-option {
    padding: var(--spacing-md);
  }
  
  .gender-option i {
    font-size: 24px;
    margin-bottom: var(--spacing-sm);
  }
  
  /* For very small screens like iPhone SE */
  @media (max-height: 667px) {
    .step-image, .completion-image {
      margin: var(--spacing-md) 0;
    }
    
    .zodiac-item, .relationship-option, .mbti-button {
      padding: var(--spacing-sm);
    }
    
    .zodiac-item i, .relationship-option i {
      font-size: 18px;
      margin-bottom: var(--spacing-xs);
    }
    
    .mbti-buttons {
      gap: var(--spacing-xs);
    }
    
    .mbti-group {
      margin-bottom: var(--spacing-md);
    }
  }
}

/* 性别选择样式 */
.gender-options {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
}

.gender-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100px;
}

.gender-option i {
  font-size: 32px;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.gender-option span {
  font-size: 14px;
}

.gender-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.gender-option.active i {
  color: white;
}

/* 年龄选择样式 */
.age-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
}

.age-option {
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
}

.age-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateX(8px);
  box-shadow: var(--shadow-md);
}

/* 婚恋状况选择样式 */
.relationship-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
}

.relationship-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.relationship-option i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.relationship-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.relationship-option.active i {
  color: white;
}

/* 公告样式优化 */
.announcement-box {
  background-color: rgba(123, 158, 137, 0.1);
  border-left: 4px solid var(--primary-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.announcement-box h3 {
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
  border-bottom: 1px solid rgba(123, 158, 137, 0.2);
  padding-bottom: var(--spacing-sm);
}

.announcement-box h3 i {
  margin-right: var(--spacing-sm);
  font-size: 20px;
}

.announcement-content {
  margin-bottom: var(--spacing-md);
}

.announcement-content p {
  margin-bottom: var(--spacing-sm);
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-color);
  display: flex;
  align-items: flex-start;
}

.announcement-icon {
  color: var(--primary-color);
  margin-right: var(--spacing-sm);
  min-width: 20px;
  margin-top: 3px;
}

.announcement-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  border-top: 1px solid rgba(123, 158, 137, 0.2);
  padding-top: var(--spacing-md);
}

.link-button {
  display: flex;
  align-items: center;
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.link-button:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(123, 158, 137, 0.3);
}

.link-button i {
  margin-right: var(--spacing-sm);
}

/* 高亮文字样式 */
.highlight-primary {
  color: var(--primary-color);
  font-weight: 600;
}

.highlight-warning {
  color: #e67e22; /* 橙色警示色 */
  font-weight: 600;
}

.highlight-success {
  color: #27ae60; /* 绿色成功色 */
  font-weight: 600;
}

/* 添加字体预加载样式 */
.font-preload {
  position: absolute;
  visibility: hidden;
  width: 0;
  height: 0;
  overflow: hidden;
  font-family: var(--font-note);
}

</style>