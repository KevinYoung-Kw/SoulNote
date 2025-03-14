<template>
  <div class="premium-features">
    <div class="setting-group">
      <div class="coming-soon">
        <i class="fas fa-crown"></i>
        <h3>高级功能</h3>
        <p>解锁更多强大功能，提升您的创作体验。</p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <h4>更快的响应</h4>
            <p>优先使用高性能 API</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-brain"></i>
            </div>
            <h4>更智能的理解</h4>
            <p>深度上下文分析</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-palette"></i>
            </div>
            <h4>更多风格</h4>
            <p>解锁独特创作风格</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-history"></i>
            </div>
            <h4>历史记录</h4>
            <p>无限历史记录存储</p>
          </div>
        </div>

        <div class="coming-soon-badge">
          <i class="fas fa-rocket"></i>
          <span>即将推出</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 暂时不需要任何逻辑
</script>

<style scoped>
.premium-features {
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

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.feature-card {
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  text-align: center;
  transition: all var(--transition-fast);
}

.feature-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.1;
}

.feature-icon i {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.feature-card h4 {
  font-size: 0.95rem;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.feature-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
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
}

.coming-soon-badge i {
  font-size: 1rem;
  margin: 0;
}

@media (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
