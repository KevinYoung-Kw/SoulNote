<template>
  <div class="appreciation-container" v-if="showAppreciation">
    <div class="appreciation-text">
      <p>
        喜欢这个应用？
        <a href="#" @click.prevent="navigateToAbout">请作者喝杯咖啡☕️</a>
        支持一下！
      </p>
    </div>
    <button class="close-appreciation" @click="hideAppreciation">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';

const router = useRouter();

// Props
const props = defineProps({
  initialShow: {
    type: Boolean,
    default: true
  }
});

// State
const showAppreciation = ref(props.initialShow);

// Methods
function navigateToAbout() {
  router.push('/about-us');
}

async function hideAppreciation() {
  showAppreciation.value = false;
  
  // 保存用户偏好，记住用户选择隐藏感谢文本
  try {
    const userPrefs = await getUserPreferences();
    await saveUserPreferences({
      ...userPrefs,
      hideAppreciation: true
    });
  } catch (error) {
    console.error('保存用户偏好失败:', error);
  }
}
</script>

<style scoped>
.appreciation-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-sm) auto;
  max-width: 90%;
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: rgba(123, 158, 137, 0.05);
  border-radius: var(--radius-md);
}

.appreciation-text {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.9;
  padding-right: 16px;
}

.appreciation-text p {
  margin: 0;
}

.appreciation-text a {
  color: var(--primary-color);
  text-decoration: underline;
  text-decoration-style: dotted;
  font-weight: 500;
  transition: color 0.2s ease;
}

.appreciation-text a:hover {
  color: var(--primary-color-dark);
}

.close-appreciation {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  opacity: 0.6;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.close-appreciation:hover {
  opacity: 1;
}

/* 毒舌模式下的感谢文本 */
:global(.savage-mode) .appreciation-container {
  background-color: rgba(255, 82, 82, 0.05);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .appreciation-container {
    margin: var(--spacing-xs) auto;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .appreciation-text {
    font-size: 12px;
  }
  
  .close-appreciation {
    padding: 3px;
  }
}
</style> 