<template>
  <div class="privacy-page fixed-page-layout">
    <header class="header fixed-header">
      <button class="icon-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">隐私政策</h1>
      <div class="placeholder"></div>
    </header>
    
    <div class="privacy-content scrollable-content">
      <div class="privacy-section">
        <h2>数据存储</h2>
        <p>星语心笺非常重视您的隐私保护。我们的应用设计遵循极简原则：</p>
        <ul>
          <li>所有个人偏好数据（如星座、MBTI类型、性别、年龄等）仅储存于您的设备本地</li>
          <li>收藏的纸条内容同样仅保存在本地存储中</li>
          <li>我们采用浏览器指纹技术进行无感用户识别，无需注册账号即可保存您的个人设置</li>
          <li>我们不会将您的任何个人数据上传至云端服务器</li>
        </ul>
      </div>
      
      <div class="privacy-section">
        <h2>运势数据</h2>
        <p>应用中的星座运势信息通过公开API获取当日运势数据，这些数据：</p>
        <ul>
          <li>仅作为参考信息呈现，不构成任何决策建议</li>
          <li>我们不会记录您查看运势的历史记录</li>
          <li>运势数据缓存在本地，减少不必要的网络请求</li>
        </ul>
      </div>
      
      <div class="privacy-section">
        <h2>AI内容生成</h2>
        <p>我们的心灵纸条内容通过调用阿里百炼大模型平台API生成：</p>
        <ul>
          <li>生成请求中仅包含必要的参数（星座、MBTI类型、心情表达等）</li>
          <li>我们不会永久存储您的生成记录</li>
          <li>AI生成服务的使用完全符合相关法律法规要求</li>
          <li>所有生成内容均为即时原创，不存在侵犯版权的问题</li>
        </ul>
      </div>
      
      <div class="privacy-section">
        <h2>网络权限</h2>
        <p>本应用仅使用网络进行以下操作：</p>
        <ul>
          <li>调用AI内容生成API</li>
          <li>获取星座运势数据</li>
          <li>我们不会进行任何形式的用户行为追踪或分析</li>
        </ul>
      </div>
      
      <div class="privacy-section">
        <h2>更新与变更</h2>
        <p>我们可能会不时更新本隐私政策，更新后会在应用内进行通知。继续使用我们的应用将视为您接受更新后的隐私政策。</p>
      </div>
      
      <div class="privacy-section">
        <h2>联系我们</h2>
        <p>如果您对我们的隐私政策有任何疑问，请通过"关于我们"页面提供的联系方式与我们联系。</p>
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
.privacy-page {
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

.privacy-content {
  padding: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.privacy-section {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.privacy-section h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
  font-weight: 600;
}

.privacy-section p {
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.privacy-section ul {
  padding-left: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.privacy-section li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}
</style>
