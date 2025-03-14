<template>
  <div class="knowledge-base">
    <div class="setting-group">
      <div class="coming-soon">
        <i class="fas fa-book-open"></i>
        <h3>知识库设置</h3>
        <p>在这里，您可以管理自定义的知识库，让 AI 生成更符合您需求的内容。</p>
        <div class="feature-list">
          <div class="feature-item">
            <i class="fas fa-upload"></i>
            <span>上传文档</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-sync"></i>
            <span>同步数据</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-cog"></i>
            <span>偏好设置</span>
          </div>
        </div>
        <div class="coming-soon-badge">
          <i class="fas fa-tools"></i>
          <span>功能开发中</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 暂时不需要任何逻辑
</script>

<style scoped>
.knowledge-base {
  padding: var(--spacing-sm);
}

.setting-group {
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
}

.coming-soon {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-sm);
  color: var(--text-color);
}

.coming-soon i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.coming-soon h3 {
  font-size: 1.1rem;
  margin-bottom: var(--spacing-xs);
}

.coming-soon p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  transition: all var(--transition-fast);
}

.feature-item i {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.feature-item span {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.coming-soon-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: var(--spacing-lg);
}

.coming-soon-badge i {
  font-size: 1rem;
  margin: 0;
}

@media (max-width: 480px) {
  .feature-list {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .feature-item {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
