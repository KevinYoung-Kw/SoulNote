<template>
  <div class="onboarding-page fixed-page-layout">
    <!-- 字体预加载元素 -->
    <FontPreloader ref="fontPreloader" />
    
    <!-- 进度条 -->
    <ProgressBar :current-step="currentStep" :total-steps="totalSteps" />
    
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

    <!-- 添加赛博朋克边缘行者彩蛋组件 -->
    <CyberpunkEdgerunnersEasterEgg
      :is-active="isCyberpunkMode"
      :current-step="currentStep"
      :target-step="9"
      @activate="activateCyberpunkMode"
      @update-suggestions="updateCyberpunkNameSuggestions"
      @update-note-content="updateCyberpunkNoteContent"
      @update-note-class="cyberpunkNoteClass = $event"
      ref="cyberpunkEasterEgg"
    />

    <div class="onboarding-content scrollable-content">
      <transition name="page-transition" mode="out-in">
        <!-- 步骤1: 使用须知 -->
        <TermsOfUseStep 
          v-if="currentStep === 1"
          @navigate="navigateTo"
          key="step-1"
        />

        <!-- 步骤2: 邀请码验证 -->
        <InviteCodeStep 
          v-else-if="currentStep === 2"
          :initial-invite-code="inviteCode"
          :initial-verified="inviteCodeVerified"
          :api-base-url="API_BASE_URL"
          @verify-success="handleInviteCodeSuccess"
          @verify-error="handleInviteCodeError"
          ref="inviteCodeStep"
          key="step-2"
        />

        <!-- 步骤3: 欢迎 -->
        <WelcomeStep v-else-if="currentStep === 3" key="step-3" />
        
        <!-- 步骤4: 性别选择 -->
        <GenderStep 
          v-else-if="currentStep === 4"
          v-model="userPreferences.gender"
          key="step-4"
        />
        
        <!-- 步骤5: 年龄选择 -->
        <AgeStep 
          v-else-if="currentStep === 5"
          v-model="userPreferences.age"
          key="step-5"
        />
        
        <!-- 步骤6: 婚恋状况 -->
        <RelationshipStep 
          v-else-if="currentStep === 6"
          v-model="userPreferences.relationship"
          key="step-6"
        />
        
        <!-- 步骤7: 星座选择 -->
        <ZodiacStep 
          v-else-if="currentStep === 7"
          v-model="userPreferences.zodiac"
          key="step-7"
        />
        
        <!-- 步骤8: MBTI选择 -->
        <MbtiStep 
          v-else-if="currentStep === 8"
          v-model="userPreferences.mbti"
          key="step-8"
        />

        <!-- 步骤9: 设置个人称呼 -->
        <NicknameStep 
          v-else-if="currentStep === 9"
                v-model="userPreferences.nickname" 
          :name-suggestions="nameSuggestions"
          :is-nolan-fan-mode="isNolanFanMode"
          :is-cyberpunk-mode="isCyberpunkMode"
          @refresh-suggestions="refreshSuggestions"
          @select-nickname="selectNickname"
          key="step-9"
        />
        
        <!-- 步骤10: 语言偏好 -->
        <LanguageStep 
          v-else-if="currentStep === 10"
          v-model="userPreferences.language"
          key="step-10"
        />
        
      <!-- 步骤11: 完成设置 -->
        <CompletionStep 
          v-else-if="currentStep === 11"
          :welcome-message="getWelcomeMessage()"
          :welcome-class="getWelcomeClass()"
          :note-content="getFinalNoteContent()"
          :note-class="getFinalNoteClass()"
          :is-nolan-fan-mode="isNolanFanMode"
          :is-cyberpunk-mode="isCyberpunkMode"
          key="step-11"
        />
      </transition>
    </div>

    <!-- 导航按钮 -->
    <NavigationButtons
      :current-step="currentStep"
      :total-steps="totalSteps"
      :show-back-button="true"
      :back-button-text="currentStep === 1 ? '返回' : '上一步'"
      :next-button-text="currentStep < totalSteps ? '下一步' : '开始使用'"
      :next-button-disabled="isNextButtonDisabled"
      @back="handleBackAction"
      @next="nextStep"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, nextTick, provide } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

// 导入服务和工具
import { saveUserPreferences, setOnboardingCompleted, getInviteCodeVerified } from '../services/storageService';
import { sanitizeContent } from '../utils/contentUtils';
import { generateRandomNames, generatePersonalizedName } from '../utils/nameGeneratorUtil';

// 导入彩蛋组件
import NolanFanEasterEgg from '../components/easterEggs/NolanFanEasterEgg.vue';
import CyberpunkEdgerunnersEasterEgg from '../components/easterEggs/CyberpunkEdgerunnersEasterEgg.vue';

// 导入基础组件
import FontPreloader from '../components/onboarding/FontPreloader.vue';
import ProgressBar from '../components/onboarding/ProgressBar.vue';
import NavigationButtons from '../components/onboarding/NavigationButtons.vue';

// 导入步骤组件
import {
  TermsOfUseStep,
  InviteCodeStep,
  WelcomeStep,
  GenderStep,
  AgeStep,
  RelationshipStep,
  ZodiacStep,
  MbtiStep,
  NicknameStep,
  LanguageStep,
  CompletionStep
} from '../components/onboarding/steps';

// 后端API URL - 应该从环境变量获取
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const props = defineProps({
  inviteCode: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const route = useRoute();
const fontPreloader = ref(null);

// 步骤控制
const currentStep = ref(1);
const totalSteps = 11;

// 邀请码相关状态
const inviteCode = ref('');
const inviteCodeVerified = ref(false);
const inviteCodeStep = ref(null);

// 错误信息
const errorMessage = ref('');

// 诺兰彩蛋相关状态
const isNolanFanMode = ref(false);
const currentNolanMovie = ref('');
const nolanNoteContent = ref('');
const nolanNoteClass = ref('');
const nolanWelcomeClass = ref('');
const nolanEasterEgg = ref(null);

// 赛博朋克彩蛋相关状态
const isCyberpunkMode = ref(false);
const cyberpunkNoteContent = ref('');
const cyberpunkNoteClass = ref('');
const cyberpunkEasterEgg = ref(null);

// 名字推荐列表
const nameSuggestions = ref([]);

// 用户偏好设置
const userPreferences = reactive({
  gender: null,
  age: null,
  relationship: null,
  zodiac: null,
  mbti: null,
  nickname: '',
  language: 'zh',
  theme: 'light',
  fontSize: 24,
  background: 'paper-1'
});

// 创建事件总线对象，用于子组件和父组件通信
const eventBus = reactive({
  autoAdvanceEnabled: true, // 是否启用自动前进
  autoAdvance: () => {
    // 只有在启用的情况下才自动前进
    if (eventBus.autoAdvanceEnabled && !isNextButtonDisabled.value) {
      nextStep();
    }
  }
});

// 提供事件总线给所有子组件
provide('onboardingBus', eventBus);

// 计算下一步按钮是否应该禁用
const isNextButtonDisabled = computed(() => {
  // 如果是邀请码步骤且未验证，则禁用下一步按钮
  if (currentStep.value === 2 && !inviteCodeVerified.value) {
    return true;
  }
  return false;
});

// 示例纸条内容
const sampleNote = computed(() => {
  // 如果设置了昵称，就直接使用
  if (userPreferences.nickname) {
    return `亲爱的${userPreferences.nickname}，你内心的宁静是最强大的力量源泉。今天，尝试放下担忧，拥抱自己的独特，你将发现生命中最美好的可能性。`;
  } 
  
  // 否则回退到基于其他信息生成
  const zodiacLabel = userPreferences.zodiac ? getZodiacLabel(userPreferences.zodiac) : '星座';
  const mbtiLabel = userPreferences.mbti || 'MBTI';
  const genderLabel = userPreferences.gender === 'male' ? '先生' : 
                     userPreferences.gender === 'female' ? '女士' : '';
  
  return `亲爱的${zodiacLabel}${mbtiLabel}${genderLabel}，你内心的宁静是最强大的力量源泉。今天，尝试放下担忧，拥抱自己的独特，你将发现生命中最美好的可能性。`;
});

// 清理后的示例笔记内容
const sanitizedSampleNote = computed(() => sanitizeContent(sampleNote.value));

// 初始化页面
onMounted(async () => {
  try {
    // 检查是否是从欢迎页进入的
    const fromWelcome = sessionStorage.getItem('from_welcome') === 'true';
    
    // 设置邀请码 - 优先级：
    // 1. 从props获取
    // 2. 从URL查询参数获取
    // 3. 从sessionStorage获取
    if (props.inviteCode) {
      inviteCode.value = props.inviteCode;
      console.log('从props接收到邀请码:', inviteCode.value);
    } else if (route.query.invitecode) {
      inviteCode.value = route.query.invitecode.toString();
      console.log('从URL查询参数接收到邀请码:', inviteCode.value);
    } else {
      // 尝试从sessionStorage获取
      const savedInviteCode = sessionStorage.getItem('invite_code');
      if (savedInviteCode) {
        inviteCode.value = savedInviteCode;
        console.log('从sessionStorage获取到邀请码:', inviteCode.value);
        // 使用后清除
        sessionStorage.removeItem('invite_code');
      }
    }
    
    // 如果不是从欢迎页进入且没有邀请码，重定向回欢迎页
    if (!fromWelcome && route.name === 'Onboarding' && !inviteCode.value) {
      console.log('未经欢迎页直接访问引导页且无邀请码，重定向到欢迎页');
      router.replace('/');
      return;
    }
    
    // 清除会话标记，避免重复使用
    sessionStorage.removeItem('from_welcome');
    
    // 尝试恢复之前的步骤
    restoreCurrentStep();
    
    // 如果有邀请码，检查是否已验证过
    if (inviteCode.value) {
      const inviteResult = await getInviteCodeVerified();
      if (inviteResult.verified) {
        console.log('邀请码已验证过，自动跳过验证步骤');
        inviteCodeVerified.value = true;
        
        // 如果当前在邀请码步骤且已验证，自动前进到下一步
        if (currentStep.value === 2) {
          console.log('在邀请码步骤发现预验证码，自动前进');
          nextTick(() => nextStep());
        }
      }
    } else {
      // 检查是否已存在其他验证过的邀请码
      await checkExistingInviteCode();
    }
    
    // 预加载字体
    if (fontPreloader.value && fontPreloader.value.preloadFonts) {
      try {
        await fontPreloader.value.preloadFonts();
        console.log('字体预加载成功完成');
      } catch (error) {
        console.warn('字体预加载过程中出现错误，但不影响后续流程', error);
      }
    }
    
    nextTick(() => {
      applyCyberpunkTextEffects();
    });
    
    // 添加页面可见性变化的监听
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
  } catch (error) {
    console.error('引导页初始化错误:', error);
  }
});

// 处理页面可见性变化
function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    // 用户切出应用，保存当前状态
    saveCurrentStep();
  } else if (document.visibilityState === 'visible') {
    // 用户回到应用，状态已经保存，可以在这里做一些额外处理
    console.log('用户回到了引导页面');
  }
}

// 在组件卸载前清理
onBeforeUnmount(() => {
  // 移除可见性监听
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  
  // 如果诺兰彩蛋模式处于激活状态，执行清理
  if (isNolanFanMode.value && nolanEasterEgg.value) {
    nolanEasterEgg.value.deactivateNolanFanMode();
    isNolanFanMode.value = false;
  }
  
  // 如果赛博朋克彩蛋模式处于激活状态，执行清理
  if (isCyberpunkMode.value && cyberpunkEasterEgg.value) {
    cyberpunkEasterEgg.value.deactivateCyberpunkMode();
    isCyberpunkMode.value = false;
  }
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

// 监听步骤变化
watch(() => currentStep.value, (newStep) => {
  // 如果进入称呼设置步骤(步骤9)，并且赛博朋克模式已激活，重新应用样式
  if (newStep === 9 && isCyberpunkMode.value && cyberpunkEasterEgg.value) {
    // 延迟一下，确保DOM已更新
    nextTick(() => {
      // 重新创建赛博朋克UI覆盖层
      cyberpunkEasterEgg.value.createCyberpunkOverlay();
    });
  }
  
  if (newStep === 11) {
    // 诺兰模式处理
  if (isNolanFanMode.value && nolanEasterEgg.value) {
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
    
    // 赛博朋克模式处理
    if (isCyberpunkMode.value && cyberpunkEasterEgg.value) {
      // 如果没有内容，获取默认内容
      if (!cyberpunkNoteContent.value) {
        cyberpunkNoteContent.value = cyberpunkEasterEgg.value.getNoteContent();
      }
      
      // 如果没有样式类，获取默认样式类
      if (!cyberpunkNoteClass.value) {
        cyberpunkNoteClass.value = cyberpunkEasterEgg.value.getNoteClass();
      }
    }
  }
});

// 方法
// 检查是否已验证过邀请码
async function checkExistingInviteCode() {
  // 从服务获取验证状态
  const result = await getInviteCodeVerified();
  inviteCodeVerified.value = result.verified;
  
  if (inviteCodeVerified.value && result.code) {
    // 使用返回的邀请码
    inviteCode.value = result.code;
    console.log('已存在验证过的邀请码:', result.code);
  }
  
  return inviteCodeVerified.value;
}

// 处理邀请码验证成功
function handleInviteCodeSuccess() {
  inviteCodeVerified.value = true;
  // 进入下一步
  currentStep.value++;
}

// 处理邀请码验证错误
function handleInviteCodeError(message) {
  console.error('邀请码验证失败:', message);
}

// 处理返回按钮动作
function handleBackAction() {
  if (currentStep.value === 1) {
    goToWelcomePage();
  } else {
    prevStep();
  }
}

// 返回欢迎页
function goToWelcomePage() {
  router.push('/');
}

// 上一步
function prevStep() {
  if (currentStep.value > 1) {
    // 如果当前是称呼设置步骤(步骤9)，并且赛博朋克模式已激活，
    // 则在返回上一步前临时清理样式，防止样式混乱
    if (currentStep.value === 9 && isCyberpunkMode.value && cyberpunkEasterEgg.value) {
      // 临时清理样式但不完全关闭赛博朋克模式
      cyberpunkEasterEgg.value.restoreOriginalTextStyles();
      
      // 移除可能添加的全局样式
      const globalStyles = document.querySelectorAll('.cyberpunk-global-style');
      globalStyles.forEach(style => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
      
      // 移除可能添加的效果元素
      const effectElements = document.querySelectorAll('.cp77-effect');
      effectElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    }
    
    currentStep.value--;
  }
}

// 下一步
function nextStep() {
  if (currentStep.value < totalSteps) {
    // 如果是邀请码验证步骤，验证邀请码
    if (currentStep.value === 2) {
      // 如果已验证过邀请码，直接进入下一步
      if (inviteCodeVerified.value) {
        currentStep.value++;
        return;
      } else if (inviteCodeStep.value) {
        // 尝试验证邀请码
        inviteCodeStep.value.verifyInviteCode();
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
      
      // 如果当前是称呼设置步骤(步骤9)，并且赛博朋克模式已激活，
      // 则在前进到下一步前临时清理样式，防止样式混乱
      if (isCyberpunkMode.value && cyberpunkEasterEgg.value) {
        // 临时清理样式但不完全关闭赛博朋克模式
        cyberpunkEasterEgg.value.restoreOriginalTextStyles();
        
        // 移除可能添加的全局样式
        const globalStyles = document.querySelectorAll('.cyberpunk-global-style');
        globalStyles.forEach(style => {
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        });
        
        // 移除可能添加的效果元素
        const effectElements = document.querySelectorAll('.cp77-effect');
        effectElements.forEach(element => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });
      }
    }
    
    currentStep.value++;
  } else {
    completeOnboarding();
  }
}

// 完成引导设置
async function completeOnboarding() {
  try {
    // 保存用户偏好设置
    const prefsToSave = {
      zodiac: userPreferences.zodiac,
      mbti: userPreferences.mbti,
      moods: ['😊'], // 默认心情
      theme: 'chat',
      savageMode: false,
      gender: userPreferences.gender,
      age: userPreferences.age,
      relationship: userPreferences.relationship,
      nickname: userPreferences.nickname || '',
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
    
    // 清理临时存储的引导状态
    clearOnboardingState();

    // 导航到主页
    console.log('引导完成，导航到主页');
    router.replace('/home');

    // 如果诺兰彩蛋模式已激活，先结束彩蛋
    if (isNolanFanMode.value && nolanEasterEgg.value) {
      nolanEasterEgg.value.deactivateNolanFanMode();
      isNolanFanMode.value = false;
    }
    
    // 如果赛博朋克彩蛋模式已激活，先结束彩蛋
    if (isCyberpunkMode.value && cyberpunkEasterEgg.value) {
      cyberpunkEasterEgg.value.deactivateCyberpunkMode();
      isCyberpunkMode.value = false;
    }

  } catch (error) {
    console.error('Could not complete onboarding:', error);
    errorMessage.value = '设置过程中出现错误，请重试';
    // 显示错误信息给用户
    alert('无法完成设置: ' + error.message);
  }
}

// 导航到指定路径
function navigateTo(path) {
  // 阻止导航完成onboarding的操作
  event.stopPropagation();
  router.push(path);
}

// 激活诺兰粉丝模式的处理函数
function activateNolanMode(activated) {
  isNolanFanMode.value = activated;
  console.log('诺兰粉丝模式已激活:', activated);
  
  if (activated && nolanEasterEgg.value) {
      nolanWelcomeClass.value = nolanEasterEgg.value.getWelcomeClass();
  }
}

// 激活赛博朋克模式的处理函数
function activateCyberpunkMode(activated) {
  isCyberpunkMode.value = activated;
  console.log('赛博朋克边缘行者模式已激活:', activated);
  
  // 如果诺兰模式已激活，先关闭它
  if (isNolanFanMode.value && nolanEasterEgg.value) {
    nolanEasterEgg.value.deactivateNolanFanMode();
    isNolanFanMode.value = false;
  }
}

// 更新诺兰角色名称建议
function updateNolanNameSuggestions(characters) {
  nameSuggestions.value = characters;
  console.log('更新诺兰角色名称建议:', characters);
}

// 更新赛博朋克角色名称建议
function updateCyberpunkNameSuggestions(characters) {
  nameSuggestions.value = characters;
  console.log('更新赛博朋克角色名称建议:', characters);
}

// 更新诺兰纸条内容
function updateNolanNoteContent(content) {
  nolanNoteContent.value = content;
  console.log('更新诺兰纸条内容:', content);
}

// 更新赛博朋克纸条内容
function updateCyberpunkNoteContent(content) {
  cyberpunkNoteContent.value = content;
  console.log('更新赛博朋克纸条内容:', content);
}

// 获取最终欢迎信息
function getWelcomeMessage() {
  if (isNolanFanMode.value) {
    // 根据当前选中的诺兰电影类型返回不同的欢迎消息
    switch(currentNolanMovie.value) {
      case 'interstellar':
        return '你的星际之旅即将开始';
      case 'inception':
        return '梦境与现实的边界已模糊';
      case 'batman':
        return '哥谭市需要你的守护';
      case 'tenet':
        return '时间的洪流等待着你';
      default:
        return '你的星际之旅即将开始'; // 默认使用星际穿越的欢迎语
    }
  } else if (isCyberpunkMode.value) {
    return '欢迎来到夜之城，传奇';
  } else {
    return '现在开始享受您的专属心灵纸条吧';
  }
}

// 获取欢迎信息样式类
function getWelcomeClass() {
  if (isNolanFanMode.value) {
    return nolanWelcomeClass.value;
  } else if (isCyberpunkMode.value) {
    return 'cyberpunk-welcome';
  }
  return '';
}

// 获取最终纸条内容
function getFinalNoteContent() {
  if (isNolanFanMode.value) {
    return nolanNoteContent.value;
  } else if (isCyberpunkMode.value) {
    return cyberpunkNoteContent.value;
  } else {
    return sanitizedSampleNote.value;
  }
}

// 获取最终纸条样式类
function getFinalNoteClass() {
  if (isNolanFanMode.value) {
    return nolanNoteClass.value;
  } else if (isCyberpunkMode.value) {
    return cyberpunkNoteClass.value;
  }
  return '';
}

// 更新名字建议
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
  } 
  // 如果是赛博朋克模式，使用赛博朋克彩蛋组件刷新
  else if (isCyberpunkMode.value && cyberpunkEasterEgg.value) {
    // 调用刷新赛博朋克角色函数
    cyberpunkEasterEgg.value.refreshCyberpunkCharacters();
  }
  else {
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
  
  // 如果是赛博朋克模式，则调用彩蛋组件的角色信息显示函数
  if (isCyberpunkMode.value && cyberpunkEasterEgg.value) {
    cyberpunkEasterEgg.value.showCharacterInfo(name);
  }
}

// 应用赛博朋克文本效果
function applyCyberpunkTextEffects() {
  if (isCyberpunkMode.value) {
    // 获取欢迎消息元素
    const welcomeElement = document.querySelector('.cyberpunk-welcome');
    if (welcomeElement) {
      // 保存原始文本
      const originalText = welcomeElement.textContent;
      // 设置data-text属性
      welcomeElement.setAttribute('data-text', originalText);
      
      // 添加故障文本效果
      addGlitchTextEffect(welcomeElement);
    }
  }
}

// 添加故障文本效果
function addGlitchTextEffect(element) {
  // 创建故障层
  const glitchLayers = document.createElement('div');
  glitchLayers.className = 'cp77-text-layers';
  
  // 创建前层
  const frontLayer = document.createElement('div');
  frontLayer.className = 'cp77-text-layer cp77-text-layer-front';
  frontLayer.textContent = element.textContent;
  
  // 创建中层
  const middleLayer = document.createElement('div');
  middleLayer.className = 'cp77-text-layer cp77-text-layer-middle';
  middleLayer.textContent = element.textContent;
  
  // 创建后层
  const backLayer = document.createElement('div');
  backLayer.className = 'cp77-text-layer cp77-text-layer-back';
  backLayer.textContent = element.textContent;
  
  // 组装层
  glitchLayers.appendChild(backLayer);
  glitchLayers.appendChild(middleLayer);
  glitchLayers.appendChild(frontLayer);
  
  // 清空原始内容并添加层
  element.textContent = '';
  element.appendChild(glitchLayers);
  
  // 添加动画
  animateGlitchText(element);
}

// 动画故障文本
function animateGlitchText(element) {
  // 随机触发故障效果
  setInterval(() => {
    if (Math.random() > 0.7 && isCyberpunkMode.value) {
      element.classList.add('cp77-text-glitching');
      setTimeout(() => {
        element.classList.remove('cp77-text-glitching');
      }, 200);
    }
  }, 2000);
}

// 获取星座标签
function getZodiacLabel(zodiacValue) {
  const zodiacMap = {
    'aries': '白羊座',
    'taurus': '金牛座',
    'gemini': '双子座',
    'cancer': '巨蟹座',
    'leo': '狮子座',
    'virgo': '处女座',
    'libra': '天秤座',
    'scorpio': '天蝎座',
    'sagittarius': '射手座',
    'capricorn': '摩羯座',
    'aquarius': '水瓶座',
    'pisces': '双鱼座'
  };
  
  return zodiacMap[zodiacValue] || zodiacValue;
}

// 添加用于保存当前步骤的方法
function saveCurrentStep() {
  try {
    // 保存当前引导状态到 localStorage
    localStorage.setItem('onboarding-current-step', currentStep.value.toString());
    
    // 保存当前的用户偏好数据
    localStorage.setItem('onboarding-user-prefs', JSON.stringify(userPreferences));
    
    // 保存特殊状态
    const specialStates = {
      inviteCodeVerified: inviteCodeVerified.value,
      isNolanFanMode: isNolanFanMode.value,
      isCyberpunkMode: isCyberpunkMode.value
    };
    localStorage.setItem('onboarding-special-states', JSON.stringify(specialStates));
    
    console.log('保存引导状态:', currentStep.value);
  } catch (error) {
    console.error('保存引导状态失败:', error);
  }
}

// 用于恢复步骤的方法
function restoreCurrentStep() {
  try {
    // 恢复当前步骤
    const savedStep = localStorage.getItem('onboarding-current-step');
    if (savedStep) {
      currentStep.value = parseInt(savedStep, 10);
      console.log('恢复到引导步骤:', currentStep.value);
    }
    
    // 恢复用户偏好数据
    const savedPrefs = localStorage.getItem('onboarding-user-prefs');
    if (savedPrefs) {
      const parsedPrefs = JSON.parse(savedPrefs);
      // 使用合并而不是直接替换，防止缺少新字段
      Object.assign(userPreferences, parsedPrefs);
      console.log('恢复用户偏好数据');
    }
    
    // 恢复特殊状态
    const savedSpecialStates = localStorage.getItem('onboarding-special-states');
    if (savedSpecialStates) {
      const states = JSON.parse(savedSpecialStates);
      if (states.inviteCodeVerified !== undefined) {
        inviteCodeVerified.value = states.inviteCodeVerified;
      }
      if (states.isNolanFanMode !== undefined && states.isNolanFanMode) {
        // 只在需要时重新激活模式
        activateNolanMode(states.isNolanFanMode);
      }
      if (states.isCyberpunkMode !== undefined && states.isCyberpunkMode) {
        // 只在需要时重新激活模式
        activateCyberpunkMode(states.isCyberpunkMode);
      }
      console.log('恢复特殊状态');
    }
  } catch (error) {
    console.error('恢复引导状态失败:', error);
  }
}

// 导出清理方法，供完成后使用
function clearOnboardingState() {
  localStorage.removeItem('onboarding-current-step');
  localStorage.removeItem('onboarding-user-prefs');
  localStorage.removeItem('onboarding-special-states');
  console.log('清理引导状态');
}
</script>

<style>
.onboarding-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
}

/* 赛博朋克2077文本效果 */
.cyberpunk-welcome {
  position: relative;
  display: inline-block;
  color: #ff0054;
  font-family: 'Rajdhani', sans-serif;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255, 0, 84, 0.7);
}

/* 页面过渡动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.cp77-text-layers {
  position: relative;
  display: inline-block;
}

.cp77-text-layer {
  position: absolute;
  top: 0;
  left: 0;
  color: #ff0054;
}

.cp77-text-layer-front {
  z-index: 3;
  color: #ff0054;
}

.cp77-text-layer-middle {
  z-index: 2;
  color: #00ffaa;
  opacity: 0.8;
}

.cp77-text-layer-back {
  z-index: 1;
  color: #ffffff;
  opacity: 0.5;
}

.cp77-text-glitching .cp77-text-layer-front {
  animation: cp77-text-glitch-front 0.2s steps(1) both;
}

.cp77-text-glitching .cp77-text-layer-middle {
  animation: cp77-text-glitch-middle 0.3s steps(1) both;
}

.cp77-text-glitching .cp77-text-layer-back {
  animation: cp77-text-glitch-back 0.25s steps(1) both;
}

@keyframes cp77-text-glitch-front {
  0% { transform: translate(0); }
  20% { transform: translate(-3px, 2px); }
  40% { transform: translate(3px, -2px); }
  60% { transform: translate(1px, 2px); }
  80% { transform: translate(-1px, -1px); }
  100% { transform: translate(0); }
}

@keyframes cp77-text-glitch-middle {
  0% { transform: translate(0); }
  20% { transform: translate(3px, -2px); }
  40% { transform: translate(-3px, 2px); }
  60% { transform: translate(-1px, -2px); }
  80% { transform: translate(1px, 1px); }
  100% { transform: translate(0); }
}

@keyframes cp77-text-glitch-back {
  0% { transform: translate(0); }
  20% { transform: translate(2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, -1px); }
  80% { transform: translate(-2px, 1px); }
  100% { transform: translate(0); }
}

/* 添加更多赛博朋克2077特效 */
.cyberpunk-mode .nickname-container {
  position: relative;
  overflow: visible;
}

.cyberpunk-mode .nickname-container::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(45deg, #ff0054, #00ffaa, #ff0054);
  background-size: 200% 200%;
  animation: cp77-border-animate 3s ease infinite;
  z-index: -1;
}

@keyframes cp77-border-animate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.cyberpunk-mode .nickname-suggestion {
  position: relative;
  overflow: hidden;
}

.cyberpunk-mode .nickname-suggestion::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 84, 0.2), transparent);
  animation: cp77-suggestion-scan 2s ease infinite;
}

@keyframes cp77-suggestion-scan {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>