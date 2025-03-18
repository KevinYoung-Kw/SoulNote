<template>
  <div class="about-page fixed-page-layout">
    <header class="header fixed-header">
      <button class="icon-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">关于我们</h1>
      <div class="placeholder"></div>
    </header>
    
    <div class="about-content scrollable-content">
      <div class="about-section app-info">
        <div class="logo-container">
          <InlineSvg 
            src="../assets/welcome-logo.svg" 
            alt="星语心笺" 
            width="80px" 
            height="80px" 
            class="app-logo"
          />
        </div>
        <h2 class="app-name">星语心笺</h2>
        <p class="app-slogan">心笺一瞬，暖意自生</p>
        <p class="app-version">版本: {{ APP_VERSION }}</p>
        
        <!-- 新增支持卡片部分 -->
        <div class="support-card">
          <h3 class="support-title">支持我们</h3>
          <div class="qr-container">
            <div class="qr-item">
              <LazyImage 
                src="../assets/donate-qr.png" 
                alt="请作者喝杯咖啡" 
                class="qr-code"
                width="120px"
                height="120px"
                objectFit="contain"
              />
              <p class="qr-label">请作者喝杯咖啡</p>
            </div>
            <div class="qr-item">
              <LazyImage 
                src="../../public/assets/community-qr.png" 
                alt="加入体验群" 
                class="qr-code"
                width="120px"
                height="120px"
                objectFit="contain"
              />
              <p class="qr-label">扫码加入产品体验群</p>
            </div>
          </div>
          <p class="support-note">感谢您的支持，您的鼓励是我们前进的动力！</p>
        </div>
      </div>
      
      <div class="about-section description">
        <h3>项目简介</h3>
        <p>"星语心笺"是一款基于Web端的轻量级心灵纸条生成器。系统通过云服务API生成个性化正向文案，结合用户设置的星座、MBTI人格类型和心情，创造出独特且温暖的心灵文字。</p>
        <p>用户可观赏精美的生成动画，并能自由调整样式、保存和分享结果。我们希望通过这款应用，为您的日常带来一抹温暖与灵感。</p>
      </div>
      
      <!-- 其它部分保持原样 -->
      <div class="about-section contact">
        <h3>联系方式</h3>
        <div class="contact-item">
          <i class="fas fa-envelope"></i>
          <span>电子邮箱: kevinyoung0210@gmail.com</span>
        </div>
        <div class="contact-item">
          <i class="fab fa-github"></i>
          <span>个人简历: <a href="No Found" target="_blank">简历维护中，Wx: HNKevin2004</a></span>
        </div>
      </div>
      
      <div class="about-section copyright">
        <h3>版权声明</h3>
        <p>© 2025 星语心笺 保留所有权利</p>
        <p>本应用基于MIT许可证开放源代码，欢迎遵循许可条款进行使用和贡献。</p>
        <p>应用中生成的内容为AI原创，仅供个人使用和参考，不得用于商业用途。</p>
      </div>
      
      <div class="about-section credits">
        <h3>技术支持</h3>
        <p>AI服务由阿里百炼大模型平台提供支持</p>
        <p>图标来源: Font Awesome</p>
        <p>特别感谢阿里云平台还有我自己</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { APP_VERSION } from '../config/version';
import LazyImage from '../components/common/LazyImage.vue';
import InlineSvg from '../components/common/InlineSvg.vue';

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<style scoped>
.about-page {
  /* 删除min-height: 100vh; 因为fixed-page-layout已设置height: 100vh */
  background-color: var(--bg-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.placeholder {
  width: 24px;
}

.about-content {
  padding: var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
}

.about-section {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.about-section h3 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
  font-weight: 600;
}

.app-info {
  text-align: center;
}

.logo-container {
  margin-bottom: var(--spacing-md);
}

.app-logo {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  margin: var(--spacing-md) 0;
}

.app-slogan {
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.app-version {
  font-size: 14px;
  color: var(--text-secondary);
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.contact-item i {
  margin-right: var(--spacing-md);
  color: var(--primary-color);
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.contact-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.description p, .copyright p, .credits p {
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.credits p:last-child {
  margin-bottom: 0;
}

/* 支持卡片样式优化 */
.support-card {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: var(--radius-md);
  border: 1px dashed var(--primary-color);
}

.support-title {
  font-size: 18px;
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  font-weight: 600;
  text-align: center;
  position: relative;
}

.support-title::before,
.support-title::after {
  content: '♥';
  color: var(--primary-color);
  font-size: 14px;
  padding: 0 var(--spacing-sm);
}

.qr-container {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.qr-item {
  text-align: center;
  width: 130px; /* 固定宽度 */
}

.qr-code {
  width: 120px;
  height: 120px;
  object-fit: contain; /* 保持图片比例 */
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  padding: 4px;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.qr-code:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.qr-label {
  margin-top: var(--spacing-sm);
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
}

.support-note {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-md);
  font-style: italic;
}

/* 移动端响应式调整 */
@media (max-width: 480px) {
  .qr-container {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
  }
  
  .qr-item {
    width: 130px;
  }
}
</style>
