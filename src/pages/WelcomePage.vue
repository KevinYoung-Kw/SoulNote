<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <div class="logo-container">
        <div class="app-logo">
          <img src="/assets/welcome-logo.svg" alt="星语心笺" class="logo-image" />
        </div>
        <h1 class="app-title">星语心笺</h1>
        <p class="app-slogan">心笺一瞬，暖意自生</p>
        
        <!-- 移动按钮到此处 -->
        <button class="btn btn-primary start-btn" @click="startExperience">
          开始体验
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="feature-slides">
        <div class="feature-slide" v-for="(feature, index) in features" :key="index">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <div class="feature-text">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="decoration-stars">
      <div class="star" v-for="i in 5" :key="i"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getOnboardingCompleted } from '../services/storageService';

const props = defineProps({
  inviteCode: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const hasCompletedOnboarding = ref(false);

// 在组件挂载时检查引导状态
onMounted(async () => {
  try {
    hasCompletedOnboarding.value = await getOnboardingCompleted();
    
    // 如果用户已完成引导，直接跳转到首页
    if (hasCompletedOnboarding.value) {
      console.log('用户已完成引导，自动跳转到首页');
      router.push('/home');
      return;
    }
    
    // 如果有邀请码参数，保存到sessionStorage但不自动跳转
    if (props.inviteCode) {
      console.log('检测到邀请码参数，保存到会话中:', props.inviteCode);
      sessionStorage.setItem('invite_code', props.inviteCode);
      // 不再自动跳转到引导页，而是让用户主动点击"开始体验"按钮
    }
  } catch (error) {
    console.error('检查引导状态失败:', error);
  }
});

const features = [
  {
    icon: 'fas fa-magic',
    title: '一键生成心灵纸条',
    description: '根据您的性别、年龄、感情状况、星座与性格特点，智能创作专属温暖文字'
  },
  {
    icon: 'fas fa-palette',
    title: '精美视觉呈现',
    description: '多种纸张样式与字体选择，打造视觉与心灵的双重享受'
  },
  {
    icon: 'fas fa-share-alt',
    title: '便捷分享',
    description: '轻松保存并分享给亲友，传递温暖与力量'
  },
  {
    icon: 'fas fa-user-cog',
    title: '个性化体验',
    description: '丰富的个人信息设置，让每一条心语都深入触动您的内心'
  }
];

function startExperience() {
  // 如果已完成引导，转到Home页面，否则转到引导页
  if (hasCompletedOnboarding.value) {
    router.push('/home');
  } else {
    // 设置一个会话标记，表示用户是从欢迎页进入的
    sessionStorage.setItem('from_welcome', 'true');
    
    // 从会话中获取保存的邀请码
    const savedInviteCode = sessionStorage.getItem('invite_code') || props.inviteCode;
    
    // 如果有邀请码，加入到query中
    if (savedInviteCode) {
      router.push({ 
        path: '/onboarding',
        query: { invitecode: savedInviteCode }
      });
    } else {
      router.push('/onboarding');
    }
  }
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-color);
  position: relative;
  overflow: hidden;
}

.welcome-content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-logo {
  width: 130px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  overflow: visible;
  position: relative;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.app-slogan {
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: var(--spacing-lg);
}

/* 优化后的按钮样式 */
.start-btn {
  width: 80%;
  max-width: 280px;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--shadow-md);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.start-btn i {
  margin-left: var(--spacing-sm);
}

.feature-slides {
  width: 100%;
  margin-top: var(--spacing-xl);
}

.feature-slide {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  background-color: rgba(123, 158, 137, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
}

.feature-icon i {
  font-size: 20px;
  color: var(--primary-color);
}

.feature-text h3 {
  font-size: 16px;
  margin-bottom: var(--spacing-xs);
}

.feature-text p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.decoration-stars {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: var(--accent-color);
  animation: twinkle 4s infinite ease-in-out;
  opacity: 0.8;
}

.star:nth-child(1) {
  top: 10%;
  right: 20%;
  width: 3px;
  height: 3px;
  animation-delay: 0.5s;
}

.star:nth-child(2) {
  top: 25%;
  left: 15%;
  width: 4px;
  height: 4px;
  animation-delay: 1.5s;
}

.star:nth-child(3) {
  bottom: 30%;
  right: 15%;
  animation-delay: 2.5s;
}

.star:nth-child(4) {
  bottom: 15%;
  left: 10%;
  width: 3px;
  height: 3px;
  animation-delay: 3s;
}

.star:nth-child(5) {
  top: 40%;
  right: 8%;
  width: 2px;
  height: 2px;
  animation-delay: 0s;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}
</style>