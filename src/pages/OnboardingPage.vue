<template>
  <div class="onboarding-page fixed-page-layout">
    <!-- 字体预加载元素 -->
    <div class="font-preload">楷体预加载</div>
    
    <div class="progress-bar fixed-header">
      <div class="progress" :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
    </div>
    
    <!-- 添加诺兰粉丝彩蛋组件 -->
    <NolanFanEasterEgg
      :is-active="isNolanFanMode"
      :current-step="currentStep"
      :target-step="9"
      @activate="activateNolanMode"
      @update-suggestions="updateNolanNameSuggestions"
      @update-movie="currentNolanMovie = $event"
      @update-note-content="updateNolanNoteContent"
      @update-note-class="nolanNoteClass = $event"
      ref="nolanEasterEgg"
    />
    
    <div class="onboarding-content scrollable-content">
      <!-- 步骤1: 使用须知 (原步骤3) -->
      <div class="onboarding-step" v-if="currentStep === 1">
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

      <!-- 步骤2: 邀请码验证 -->
      <div class="onboarding-step" v-else-if="currentStep === 2">
        <h1 class="step-title">欢迎内测</h1>
        <p class="step-desc">请输入您的邀请码继续使用</p>
        
        <div class="invite-code-container">
          <div class="invite-code-input">
            <input 
              type="text" 
              v-model="inviteCode" 
              placeholder="请输入邀请码"
              :class="{ 'error': inviteCodeError, 'verified': inviteCodeVerified }"
              :disabled="inviteCodeVerified"
            />
            <p class="error-message" v-if="inviteCodeError">{{ inviteCodeErrorMessage }}</p>
            <p class="success-message" v-if="inviteCodeVerified">邀请码已验证 ✓</p>
          </div>
          <button 
            v-if="!inviteCodeVerified"
            class="btn verify-btn" 
            :class="{ 'btn-primary': !isVerifying, 'btn-disabled': isVerifying }" 
            @click="verifyInviteCode"
            :disabled="isVerifying || !inviteCode"
          >
            <span v-if="!isVerifying">验证</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i></span>
          </button>
          <button 
            v-else
            class="btn btn-success verify-btn"
            disabled
          >
            <i class="fas fa-check"></i> 已验证
          </button>
        </div>
        
        <div class="invite-code-info">
          <p>
            <i class="fas fa-info-circle"></i> 
            内测期间需要邀请码才能使用本应用。如需获取邀请码，请点赞我们的社交媒体账号：小红书@水的离子积（AIGC产品），点赞并收藏第一条内容，私信获得邀请码～
          </p>
        </div>
      </div>

      <!-- 步骤3: 欢迎 (原步骤1) -->
      <div class="onboarding-step" v-else-if="currentStep === 3">
        <h1 class="step-title">欢迎使用星语心笺</h1>
        <p class="step-desc">让我们完成简单设置，为您提供更个性化的体验</p>
        
        <div class="step-image">
          <img :src="welcomeSvg" alt="Welcome" />
        </div>
      </div>

      <!-- 步骤4: 性别选择 (原步骤4) -->
      <div class="onboarding-step" v-else-if="currentStep === 4">
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
      
      <!-- 步骤3: 年龄选择 (现在是步骤5) -->
      <div class="onboarding-step" v-else-if="currentStep === 5">
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
      
      <!-- 步骤4: 婚恋状况 (现在是步骤6) -->
      <div class="onboarding-step" v-else-if="currentStep === 6">
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
      
      <!-- 步骤5: 星座选择 (现在是步骤7) -->
      <div class="onboarding-step" v-else-if="currentStep === 7">
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
      
      <!-- 步骤6: MBTI选择 (现在是步骤8) -->
      <div class="onboarding-step" v-else-if="currentStep === 8">
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

      <!-- 新增步骤: 设置个人称呼 (新增为步骤9) -->
      <div class="onboarding-step" v-if="currentStep === 9">
        <h1 class="step-title">您希望如何被称呼？</h1>
        <p class="step-desc">设置一个专属称呼，让心语纸条更有温度</p>
        
        <div class="nickname-container" :class="{ 'nolan-fan-mode': isNolanFanMode }">
          <div class="nickname-input">
            <input 
              type="text" 
              v-model="userPreferences.nickname" 
              placeholder="请输入您喜欢的称呼"
              maxlength="12"
            />
            <p class="input-desc">最多12个字符</p>
          </div>

          <p class="suggestion-title">
            <i class="fas fa-lightbulb"></i> 称呼建议
          </p>
          
          <div class="nickname-suggestions">
            <button 
              v-for="(name, index) in nameSuggestions" 
              :key="index"
              class="nickname-suggestion"
              :class="{ active: userPreferences.nickname === name }"
              @click="selectNickname(name)"
            >
              {{ name }}
            </button>
            
            <button 
              class="nickname-suggestion refresh-btn"
              @click="refreshSuggestions"
            >
              <i class="fas fa-sync-alt"></i> 换一批
            </button>
          </div>
        </div>
      </div>
      
      <!-- 步骤7: 语言偏好 (现在是步骤10) -->
      <div class="onboarding-step" v-else-if="currentStep === 10">
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
      
      <!-- 步骤8: 完成设置 (现在是步骤11) -->
      <div class="onboarding-step" v-else-if="currentStep === 11">
        <h1 class="step-title">设置完成！</h1>
        <p class="step-desc" :class="{ [nolanWelcomeClass]: isNolanFanMode }">
          {{ isNolanFanMode ? '你的星际之旅即将开始' : '现在开始享受您的专属心灵纸条吧' }}
        </p>
        
        <div class="completion-image">
          <img :src="completeSvg" alt="Complete" />
          <div class="sample-note" :class="{ [nolanNoteClass]: isNolanFanMode }">
            <p>{{ isNolanFanMode ? nolanNoteContent : sanitizedSampleNote }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="onboarding-actions fixed-footer">
      <button 
        class="btn btn-secondary" 
        @click="goToWelcomePage" 
        v-if="currentStep === 1"
      >
        返回
      </button>
      <button 
        class="btn btn-secondary" 
        @click="prevStep" 
        v-else-if="currentStep > 1"
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
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { saveUserPreferences, setOnboardingCompleted, getInviteCodeVerified, setInviteCodeVerified } from '../services/storageService';
import { sanitizeContent } from '../utils/contentUtils';
import { generateRandomNames, generatePersonalizedName } from '../utils/nameGeneratorUtil';
import welcomeSvg from '../assets/onboarding-welcome.svg';
import completeSvg from '../assets/onboarding-complete.svg';
import axios from 'axios';
// 导入诺兰粉丝彩蛋组件
import NolanFanEasterEgg from '../components/easterEggs/NolanFanEasterEgg.vue';

// 预加载字体
const fontPreloaded = ref(false);

// 邀请码相关状态
const inviteCode = ref('');
const inviteCodeVerified = ref(false);
const isVerifying = ref(false);
const inviteCodeError = ref(false);
const inviteCodeErrorMessage = ref('');
// 诺兰彩蛋相关状态 - 只保留必要的状态变量
const isNolanFanMode = ref(false);
const currentNolanMovie = ref(''); // 当前选中的诺兰电影类型
const nolanNoteContent = ref(''); // 诺兰风格下的纸条内容
const nolanNoteClass = ref(''); // 诺兰风格下的纸条样式类
const nolanWelcomeClass = ref(''); // 诺兰风格下的欢迎信息样式类

const errorMessage = ref(''); // 添加这一行到其他ref变量附近

// 后端API URL - 应该从环境变量获取
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// 彩蛋组件引用
const nolanEasterEgg = ref(null);

onMounted(async () => {
  // 检查是否已存在验证过的邀请码
  const hasVerified = await checkExistingInviteCode();

  // 如果是邀请码步骤且已经验证过，可以自动前进
  if (currentStep.value === 2 && hasVerified) {
    console.log('邀请码已验证，自动跳到下一步');
  }

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
      fontPreloaded.value = true;
    });
  } else {
    console.warn('浏览器不支持字体API，跳过字体预加载');
    fontPreloaded.value = true;
  }

  // 检查已存在的邀请码
  checkExistingInviteCode();
});

// 在组件卸载前清理事件监听和音频
// 在组件卸载前清理
onBeforeUnmount(() => {
  // 如果彩蛋模式处于激活状态，执行清理
  if (isNolanFanMode.value && nolanEasterEgg.value) {
    nolanEasterEgg.value.deactivateNolanFanMode();
    isNolanFanMode.value = false;
  }
});

const currentStep = ref(1); // 保持初始步骤为1
const totalSteps = 11; // 增加为11，因为新增了称呼设置步骤

// 名字推荐列表
const nameSuggestions = ref([]);

const router = useRouter();

const userPreferences = reactive({
  gender: null,
  age: null,
  relationship: null,
  zodiac: null,
  mbti: null,
  nickname: '', // 新增称呼字段
  language: 'zh',
  theme: 'light',
  fontSize: 24,
  background: 'paper-1'
});

// 监听星座和MBTI变化，尝试生成个性化名字建议
watch([
  () => userPreferences.gender, 
  () => userPreferences.age,
  () => userPreferences.zodiac,
  () => userPreferences.mbti
], () => {
  // 只有当必要信息齐全时，才尝试生成个性化名字
  if (userPreferences.gender && userPreferences.age) {
    updateNameSuggestions();
  }
});

// 激活诺兰粉丝模式的处理函数
function activateNolanMode(activated) {
  isNolanFanMode.value = activated;
  console.log('诺兰粉丝模式已激活:', activated);
  
  // 如果激活，并且引用可用，获取欢迎信息样式类
  if (activated && nolanEasterEgg.value) {
    nolanWelcomeClass.value = nolanEasterEgg.value.getWelcomeClass();
  }
}

// 更新诺兰角色名称建议
function updateNolanNameSuggestions(characters) {
  nameSuggestions.value = characters;
  console.log('更新诺兰角色名称建议:', characters);
}

// 更新诺兰纸条内容
function updateNolanNoteContent(content) {
  nolanNoteContent.value = content;
  console.log('更新诺兰纸条内容:', content);
}

function updateNameSuggestions() {
  // 如果已经激活诺兰粉丝模式，则不更新普通名字建议
  if (isNolanFanMode.value) return;
  
  // 基于性别和年龄生成随机名字
  const randomNames = generateRandomNames(
    userPreferences.gender, 
    userPreferences.age
  );

  // 如果有星座和MBTI，则添加一个个性化名字
  if (userPreferences.zodiac && userPreferences.mbti) {
    const personalizedName = generatePersonalizedName(
      userPreferences.zodiac, 
      userPreferences.mbti
    );
    randomNames.unshift(personalizedName); // 将个性化名字放在首位
  }
  
  // 更新名字建议列表
  nameSuggestions.value = [...new Set(randomNames)].slice(0, 4); // 去重并保留最多4个
}

// 刷新名字建议
function refreshSuggestions() {
  // 如果是诺兰粉丝模式，使用彩蛋组件刷新
  if (isNolanFanMode.value && nolanEasterEgg.value) {
    // 重新激活诺兰模式以刷新名字，但不播放音乐
    nolanEasterEgg.value.activateNolanFanMode(false);
  } else {
    updateNameSuggestions();
  }
}

// 选择昵称处理函数
function selectNickname(name) {
  userPreferences.nickname = name;
  
  // 如果是诺兰粉丝模式，则调用彩蛋组件的角色信息显示函数
  if (isNolanFanMode.value && nolanEasterEgg.value) {
    nolanEasterEgg.value.showCharacterInfo(name);
  }
}

// 性别选择函数
function selectGender(value) {
  userPreferences.gender = value;
}

function goToWelcomePage() {
  router.push('/');
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

// 示例纸条内容 - 更新为使用新昵称
const sampleNote = computed(() => {
  // 如果设置了昵称，就直接使用
  if (userPreferences.nickname) {
    return `亲爱的${userPreferences.nickname}，你内心的宁静是最强大的力量源泉。今天，尝试放下担忧，拥抱自己的独特，你将发现生命中最美好的可能性。`;
  } 
  
  // 否则回退到之前的生成方式
  const zodiacLabel = zodiacs.find(z => z.value === userPreferences.zodiac)?.label || '星座';
  const mbtiLabel = mbtiGroups.flatMap(g => g.types).find(m => m.value === userPreferences.mbti)?.value || 'MBTI';
  const genderLabel = userPreferences.gender === 'male' ? '先生' : 
                     userPreferences.gender === 'female' ? '女士' : '';
  
  return `亲爱的${zodiacLabel}${mbtiLabel}${genderLabel}，你内心的宁静是最强大的力量源泉。今天，尝试放下担忧，拥抱自己的独特，你将发现生命中最美好的可能性。`;
});

// 添加经过清理的示例笔记内容
const sanitizedSampleNote = computed(() => sanitizeContent(sampleNote.value));

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
    // 如果是邀请码验证步骤，验证邀请码
    if (currentStep.value === 2) {
      // 如果已验证过邀请码，直接进入下一步
      if (inviteCodeVerified.value) {
        currentStep.value++;
        return;
      } else if (!inviteCode.value) {
        // 提示用户输入邀请码
        alert('请输入邀请码');
        return;
      } else {
        // 尝试验证邀请码
        verifyInviteCode();
        return;
      }
    }
    
    // 验证当前步骤是否已完成
    if (currentStep.value === 4 && !userPreferences.gender) {
      alert('请选择您的性别');
      return;
    }
    
    if (currentStep.value === 5 && !userPreferences.age) {
      alert('请选择您的年龄段');
      return;
    }
    
    if (currentStep.value === 6 && !userPreferences.relationship) {
      alert('请选择您的感情状况');
      return;
    }
    
    if (currentStep.value === 7 && !userPreferences.zodiac) {
      alert('请选择一个星座');
      return;
    }
    
    if (currentStep.value === 8 && !userPreferences.mbti) {
      alert('请选择一个MBTI人格类型');
      return;
    }
    
    // 如果是称呼步骤，检查是否设置了称呼
    if (currentStep.value === 9) {
      // 当用户进入到这一步时，如果还没有名字建议，则生成
      if (nameSuggestions.value.length === 0 && userPreferences.gender && userPreferences.age) {
        updateNameSuggestions();
      }
      
      // 如果没有填写昵称，继续进入下一步，但不强制要求
      // 这里可以选择不做强制验证，让用户自愿填写
    }
    
    currentStep.value++;
  } else {
    completeOnboarding();
  }
}

// 检查是否已验证过邀请码
async function checkExistingInviteCode() {
  // 从服务获取验证状态
  inviteCodeVerified.value = await getInviteCodeVerified();
  
  if (inviteCodeVerified.value) {
    // 获取存储的邀请码
    const storedCode = localStorage.getItem('soul-note-invite-code');
    if (storedCode) {
      inviteCode.value = storedCode;
      console.log('已存在验证过的邀请码:', storedCode);
    }
  }
  
  return inviteCodeVerified.value;
}

async function verifyInviteCode() {
  if (!inviteCode.value || isVerifying.value) return;
  
  try {
    isVerifying.value = true;
    inviteCodeError.value = false;
    
    // 获取客户端IP (可选，如果后端能获取，则不需要这一步)
    let clientIP = '';
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIP = ipResponse.data.ip;
    } catch (error) {
      console.warn('无法获取客户端IP:', error);
    }
    
    // 调用验证API
    const response = await axios.post(`${API_BASE_URL}/api/verify-invite-code`, {
      inviteCode: inviteCode.value,
      clientIP
    });
    
    if (response.data.valid) {
      // 设置验证状态
      await setInviteCodeVerified(inviteCode.value, true);
      inviteCodeVerified.value = true;
      
      // 进入下一步
      currentStep.value++;
    } else {
      inviteCodeError.value = true;
      inviteCodeErrorMessage.value = response.data.message || '邀请码无效或已过期';
    }
  } catch (error) {
    console.error('验证邀请码失败:', error);
    inviteCodeError.value = true;
    inviteCodeErrorMessage.value = '网络错误，请稍后再试';
  } finally {
    isVerifying.value = false;
  }
}

// 完成引导设置
async function completeOnboarding() {
  try {
    // 保存用户偏好设置，添加nickname字段
    const prefsToSave = {
      zodiac: userPreferences.zodiac,
      mbti: userPreferences.mbti,
      moods: ['😊'], // 默认心情
      theme: 'chat',
      savageMode: false,
      gender: userPreferences.gender,
      age: userPreferences.age,
      relationship: userPreferences.relationship,
      nickname: userPreferences.nickname || '', // 添加称呼字段
      language: userPreferences.language || 'zh',
      fontSize: userPreferences.fontSize || 24,
      background: userPreferences.background || 'paper-1',
      enableFortune: false, // 默认不启用运势
      fortuneAspect: 'overall' // 默认运势方面
    };
    
    // 保存用户偏好
    await saveUserPreferences(prefsToSave);
    
    // 设置引导完成标志
    await setOnboardingCompleted(true);



    // 导航到主页
    console.log('引导完成，导航到主页');
    router.push('/');

    // 如果诺兰彩蛋模式已激活，先结束彩蛋
    if (isNolanFanMode.value && nolanEasterEgg.value) {
      // 调用彩蛋组件的结束函数
      nolanEasterEgg.value.deactivateNolanFanMode();
      // 保留诺兰主题的昵称，但清除其他诺兰效果
      isNolanFanMode.value = false;
    }

  } catch (error) {
    console.error('Could not complete onboarding:', error);
    errorMessage.value = '设置过程中出现错误，请重试';
    // 显示错误信息给用户
    alert('无法完成设置: ' + error.message);
  }
}

function navigateTo(path) {
  // 阻止导航完成onboarding的操作
  event.stopPropagation();
  router.push(path);
}

function openMBTITest() {
  window.open('https://www.16personalities.com/zh-hans/', '_blank');
}

// 监听步骤变化，当进入最后一步时确保诺兰样式准备好
watch(() => currentStep.value, (newStep) => {
  if (newStep === 11 && isNolanFanMode.value && nolanEasterEgg.value) {
    // 确保样式类已更新
    nolanWelcomeClass.value = nolanEasterEgg.value.getWelcomeClass();
    
    // 如果没有内容，获取默认内容
    if (!nolanNoteContent.value) {
      nolanNoteContent.value = nolanEasterEgg.value.getNoteContent();
    }
    
    // 如果没有样式类，获取默认样式类
    if (!nolanNoteClass.value) {
      nolanNoteClass.value = nolanEasterEgg.value.getNoteClass();
    }
  }
});
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
  transition: all 0.5s ease-in-out;
}

.sample-note p {
  margin: 0;
  transition: all 0.5s ease-in-out;
}

/* 确保诺兰风格的样式能覆盖原有样式 */
.sample-note[class*="nolan-"] p {
  line-height: 1.8;
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

/* 邀请码样式 */
.invite-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.invite-code-input {
  width: 100%;
  position: relative;
}

.invite-code-input input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  letter-spacing: 2px;
  font-family: monospace;
  transition: border-color var(--transition-fast);
}

.invite-code-input input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.invite-code-input input.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 14px;
  margin-top: var(--spacing-sm);
  text-align: center;
}

.verify-btn {
  width: 100%;
  margin-top: var(--spacing-sm);
}

.btn-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.invite-code-info {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-md);
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: var(--radius-md);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.invite-code-info p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
}

.invite-code-info i {
  color: var(--primary-color);
  margin-right: var(--spacing-sm);
  margin-top: 3px;
}

.invite-code-input input.verified {
  border-color: var(--success-color);
  background-color: rgba(76, 175, 80, 0.05);
}

.success-message {
  color: var(--success-color);
  font-size: 14px;
  margin-top: var (--spacing-xs);
}

.nickname-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  width: 100%; /* 确保充分利用最大宽度 */
}

.nickname-input {
  width: 100%;
  position: relative;
  margin-bottom: var(--spacing-md);
  text-align: center; /* 增加文本居中对齐 */
}


.nickname-input input {
  width: 100%;
  max-width: 320px; /* 限制输入框最大宽度，使其在更大屏幕上不会过宽 */
  margin: 0 auto; /* 输入框居中 */
  padding: var(--spacing-md);
  font-size: 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  transition: border-color var(--transition-fast);
  display: block; /* 确保块级显示以便应用margin */
}

.nickname-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}


.input-desc {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center; /* 改为居中对齐 */
  margin-top: var(--spacing-xs);
  width: 100%; /* 确保充分利用宽度 */
}

.suggestion-title {
  font-size: 16px;
  color: var(--text-secondary);
  margin: var(--spacing-lg) 0 var(--spacing-md); /* 调整上下间距 */
  display: flex;
  align-items: center;
  justify-content: center; /* 使图标和文字整体居中 */
  gap: var(--spacing-xs);
  width: 100%;
}


.nickname-suggestions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 360px; /* 限制最大宽度 */
  margin: 0 auto; /* 居中显示 */
}


.nickname-suggestion {
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 15px;
  text-align: center;
}

.nickname-suggestion:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.nickname-suggestion.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.refresh-btn {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  background-color: rgba(123, 158, 137, 0.1);
  color: var(--primary-color);
}

.refresh-btn:hover {
  background-color: rgba(123, 158, 137, 0.2);
}

/* 响应式调整优化 */
@media (max-width: 480px) {
  .nickname-container {
    padding: var(--spacing-md);
  }
  
  .nickname-input input {
    font-size: 16px;
    padding: var(--spacing-sm);
  }
  
  .nickname-suggestion {
    padding: var(--spacing-sm);
    font-size: 14px;
  }
  
  .nickname-suggestions {
    gap: var(--spacing-sm); /* 在小屏幕上减小间距 */
  }
}

/* 在极小屏幕上的额外优化 */
@media (max-width: 350px) {
  .nickname-suggestions {
    grid-template-columns: 1fr; /* 在非常小的屏幕上改为单列显示 */
  }
  
  .refresh-btn {
    grid-column: span 1; /* 调整为单列 */
  }
}



</style>