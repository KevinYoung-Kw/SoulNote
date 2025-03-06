<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <div class="logo-container">
        <div class="app-logo">
          <i class="fas fa-star logo-icon"></i>
        </div>
        <h1 class="app-title">星语心笺</h1>
        <p class="app-slogan">心笺一瞬，暖意自生</p>
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
      
      <button class="btn btn-primary start-btn" @click="startExperience">
        开始体验
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>
    
    <div class="decoration-stars">
      <div class="star" v-for="i in 5" :key="i"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const features = [
  {
    icon: 'fas fa-magic',
    title: '一键生成心灵纸条',
    description: '根据您的星座与性格特点，智能创作专属的温暖文字'
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
  }
];

function startExperience() {
  router.push('/onboarding');
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
}

.app-logo {
  width: 80px;
  height: 80px;
  background-color: var(--primary-color);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  box-shadow: var(--shadow-md);
}

.logo-icon {
  font-size: 40px;
  color: white;
}

.app-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.app-slogan {
  color: var(--text-secondary);
  font-size: 16px;
}

.feature-slides {
  width: 100%;
  margin-bottom: var(--spacing-xl);
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
  width: 48px;
  height: 48px;
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

.start-btn {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-btn i {
  margin-left: var(--spacing-sm);
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
