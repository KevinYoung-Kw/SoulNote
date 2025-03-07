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
          <img src="../assets/logo.png" alt="星语心笺" class="app-logo" />
        </div>
        <h2 class="app-name">星语心笺</h2>
        <p class="app-slogan">心笺一瞬，暖意自生</p>
        <p class="app-version">版本: 1.1.0</p>
      </div>
      
      <div class="about-section description">
        <h3>项目简介</h3>
        <p>"星语心笺"是一款基于Web端的轻量级心灵纸条生成器。系统通过云服务API生成个性化正向文案，结合用户设置的星座、MBTI人格类型和心情，创造出独特且温暖的心灵文字。</p>
        <p>用户可观赏精美的生成动画，并能自由调整样式、保存和分享结果。我们希望通过这款应用，为您的日常带来一抹温暖与灵感。</p>
      </div>
      
      <div class="about-section contact">
        <h3>联系方式</h3>
        <div class="contact-item">
          <i class="fas fa-envelope"></i>
          <span>电子邮箱: kevinyoung0210@gmail.com</span>
        </div>
        <div class="contact-item">
          <i class="fab fa-github"></i>
          <span>GitHub: <a href="https://github.com/yourusername/SoulNote" target="_blank">github.com/yourusername/SoulNote</a></span>
        </div>
      </div>
      
      <div class="about-section copyright">
        <h3>版权声明</h3>
        <p>© 2023 星语心笺 保留所有权利</p>
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
</style>
