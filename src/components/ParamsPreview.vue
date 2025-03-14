<template>
  <div class="params-card">
    <div class="params-preview" @click="openParamsPanel">
      <!-- 修改心情参数预览，只显示第一个心情 -->
      <div class="params-item mood-container">
        <template v-if="params.moods && params.moods.length > 0">
          <!-- 只显示第一个emoji，但在后面添加提示点表示还有更多 -->
          <span class="mood-emoji">{{ params.moods[0] }}</span>
          <span v-if="params.moods.length > 1" class="mood-counter-preview">+{{ params.moods.length - 1 }}</span>
        </template>
        <template v-else>
          <i class="fas fa-smile"></i>
          <span>心情</span>
        </template>
      </div>
      <!-- 添加主题参数显示 -->
      <div class="params-item">
        <i :class="themeOptions.find(t => t.value === params.theme)?.icon || 'fas fa-comment-dots'"></i>
        <span>{{ themeOptions.find(t => t.value === params.theme)?.label || '聊天' }}</span>
      </div>
      <div class="params-item" v-if="params.enableFortune">
        <i :class="fortuneAspects.find(a => a.value === params.fortuneAspect)?.icon || 'fas fa-star'"></i>
        <span>{{ getFortuneAspectLabel() }}</span>
      </div>
      <button class="params-edit-btn">
        <i class="fas fa-sliders-h"></i>
        <span>设置</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  params: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['open-params-panel']);

// Data
const themeOptions = [
  { label: '聊天', value: 'chat', icon: 'fas fa-comment-dots' },
  { label: '箴言', value: 'aphorism', icon: 'fas fa-book-open' },
  { label: '诗歌', value: 'poetry', icon: 'fas fa-feather-alt' },
  { label: '俳句', value: 'haiku', icon: 'fas fa-leaf' }
];

const fortuneAspects = [
  { label: '整体', value: 'overall', icon: 'fas fa-star' },
  { label: '爱情', value: 'love', icon: 'fas fa-heart' },
  { label: '事业', value: 'career', icon: 'fas fa-briefcase' },
  { label: '财运', value: 'wealth', icon: 'fas fa-coins' }
];

// Methods
function openParamsPanel() {
  emit('open-params-panel');
}

function getFortuneAspectLabel() {
  const aspect = fortuneAspects.find(a => a.value === props.params.fortuneAspect);
  return aspect ? aspect.label : '整体';
}
</script>

<style scoped>
.params-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  margin: var(--spacing-md) 0;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.params-preview {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  position: relative;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.mood-emoji {
  font-size: 16px;
  line-height: 1;
  margin-right: var(--spacing-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.params-item {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-md);
  color: var(--text-color);
  background-color: rgba(123, 158, 137, 0.1);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.params-item i {
  margin-right: var(--spacing-xs);
  color: var(--primary-color);
  font-size: 14px;
}

.params-edit-btn {
  margin-left: auto;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.params-edit-btn i {
  margin-right: var(--spacing-xs);
}

.mood-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.mood-counter-preview {
  font-size: 12px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

/* 毒舌模式样式 */
:global(.savage-mode) .params-item i {
  color: var(--savage-primary-color, #ff5252);
}

:global(.savage-mode) .mood-counter-preview {
  background-color: var(--savage-primary-color, #ff5252);
}
</style>