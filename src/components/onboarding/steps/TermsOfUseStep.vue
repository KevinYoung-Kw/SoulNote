<template>
  <OnboardingStep
    title="使用须知"
    description="开始使用前，请了解以下重要信息"
  >
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
          <button class="link-button" @click="$emit('navigate', '/about-us')">
            <i class="fas fa-users"></i> 关于我们
          </button>
          <button class="link-button" @click="$emit('navigate', '/privacy-policy')">
            <i class="fas fa-shield-alt"></i> 隐私政策
          </button>
        </div>
      </div>
    </div>
  </OnboardingStep>
</template>

<script setup>
import { defineEmits } from 'vue';
import OnboardingStep from '../OnboardingStep.vue';

defineEmits(['navigate']);
</script>

<style scoped>
.announcement-box {
  background-color: rgba(123, 158, 137, 0.1);
  border-left: 4px solid var(--primary-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-left: var(--spacing-xs);
  margin-right: var(--spacing-xs);
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

@media (max-width: 480px) {
  .announcement-box {
    padding: var(--spacing-md);
    margin-left: 0;
    margin-right: 0;
  }
  
  .announcement-content p {
    font-size: 14px;
  }
  
  .announcement-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .link-button {
    width: 100%;
    justify-content: center;
    padding: var(--spacing-sm);
    font-size: 14px;
  }
}
</style> 