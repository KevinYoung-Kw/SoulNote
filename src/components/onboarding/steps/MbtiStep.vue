<template>
  <OnboardingStep
    title="选择您的MBTI人格类型"
    description="了解您的思考与决策方式有助于我们创作更贴合您内心的文字"
  >
    <div class="mbti-selection">
      <div class="mbti-categories">
        <div 
          v-for="(group, index) in mbtiGroups" 
          :key="index"
          class="mbti-category"
          :class="{ 'active': activeCategoryIndex === index }"
          @click="activeCategoryIndex = index"
        >
          <div class="category-icon">
            <i :class="getCategoryIcon(index)"></i>
          </div>
          <div class="category-name">{{ group.title }}</div>
        </div>
      </div>

      <div class="mbti-types-container">
        <transition name="fade" mode="out-in">
          <div 
            class="mbti-types" 
            :key="activeCategoryIndex"
            :class="getCategoryClass(activeCategoryIndex)"
          >
            <h3 class="group-title">
              <i :class="getCategoryIcon(activeCategoryIndex)"></i>
              {{ mbtiGroups[activeCategoryIndex].title }}
            </h3>
            <div class="types-grid">
              <div 
                v-for="mbti in mbtiGroups[activeCategoryIndex].types"
                :key="mbti.value"
                class="mbti-card"
                :class="{ 'active': modelValue === mbti.value }"
                @click="$emit('update:modelValue', mbti.value)"
              >
                <div class="mbti-code">{{ mbti.value }}</div>
                <div class="mbti-name">{{ mbti.label }}</div>
                <div class="mbti-traits">{{ getTraits(mbti.value) }}</div>
                <div class="select-indicator">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
      
      <div class="mbti-guide">
        <i class="fas fa-question-circle"></i>
        <span>还不知道自己的MBTI？<a href="#" @click.prevent="openMBTITest">点击测试</a></span>
      </div>
    </div>
  </OnboardingStep>
</template>

<script setup>
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import OnboardingStep from '../OnboardingStep.vue';

defineProps({
  modelValue: {
    type: String,
    default: null
  }
});

defineEmits(['update:modelValue']);

const activeCategoryIndex = ref(0);

// MBTI分组
const mbtiGroups = [
  {
    title: '分析家型',
    types: [
      { value: 'INTJ', label: '建筑师' },
      { value: 'INTP', label: '逻辑学家' },
      { value: 'ENTJ', label: '指挥官' },
      { value: 'ENTP', label: '辩论家' }
    ]
  },
  {
    title: '外交家型',
    types: [
      { value: 'INFJ', label: '提倡者' },
      { value: 'INFP', label: '调停者' },
      { value: 'ENFJ', label: '主人公' },
      { value: 'ENFP', label: '活动家' }
    ]
  },
  {
    title: '哨兵型',
    types: [
      { value: 'ISTJ', label: '物流师' },
      { value: 'ISFJ', label: '守卫者' },
      { value: 'ESTJ', label: '总经理' },
      { value: 'ESFJ', label: '执政官' }
    ]
  },
  {
    title: '探险家型',
    types: [
      { value: 'ISTP', label: '鉴赏家' },
      { value: 'ISFP', label: '探险家' },
      { value: 'ESTP', label: '企业家' },
      { value: 'ESFP', label: '表演者' }
    ]
  }
];

// 获取分类图标
function getCategoryIcon(index) {
  const icons = [
    'fas fa-brain',           // 分析家型
    'fas fa-heart',           // 外交家型
    'fas fa-shield-alt',      // 哨兵型
    'fas fa-compass'          // 探险家型
  ];
  return icons[index] || 'fas fa-users';
}

// 获取分类样式类
function getCategoryClass(index) {
  const classes = [
    'analyst-category',       // 分析家型
    'diplomat-category',      // 外交家型
    'sentinel-category',      // 哨兵型
    'explorer-category'       // 探险家型
  ];
  return classes[index] || '';
}

// 获取性格特质简述
function getTraits(mbtiType) {
  const traits = {
    'INTJ': '战略性思想家，有远见',
    'INTP': '创新者，追求知识',
    'ENTJ': '大胆领导者，果断决策',
    'ENTP': '聪明活跃，善于辩论',
    'INFJ': '有远见的理想主义者',
    'INFP': '富有想象力的和谐者',
    'ENFJ': '有魅力的领导者，鼓舞人心',
    'ENFP': '热情洋溢，充满创意',
    'ISTJ': '实际可靠，注重细节',
    'ISFJ': '保护者，忠诚奉献',
    'ESTJ': '有条理的管理者，负责任',
    'ESFJ': '关怀他人，重视和谐',
    'ISTP': '灵活独立，善于解决问题',
    'ISFP': '艺术家，和平使者',
    'ESTP': '冒险家，精力充沛',
    'ESFP': '表演者，热爱生活'
  };
  return traits[mbtiType] || '';
}

function openMBTITest() {
  window.open('https://www.16personalities.com/zh-hans/', '_blank');
}
</script>

<style scoped>
.mbti-selection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: 0 var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
}

/* 分类导航条 */
.mbti-categories {
  display: flex;
  justify-content: space-between;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  margin-top: var(--spacing-md);
}

.mbti-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  flex: 1;
  transition: all 0.3s ease;
}

.mbti-category:hover {
  background-color: rgba(123, 158, 137, 0.1);
}

.mbti-category.active {
  background-color: var(--primary-color);
  color: white;
}

.category-icon {
  font-size: 1.4rem;
  margin-bottom: var(--spacing-sm);
}

.category-name {
  font-size: 0.9rem;
  text-align: center;
}

/* MBTI类型卡片容器 */
.mbti-types-container {
  min-height: 400px;
  position: relative;
}

.mbti-types {
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.group-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.2rem;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* MBTI卡片 */
.mbti-card {
  position: relative;
  background-color: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
  overflow: hidden;
}

.mbti-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.mbti-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 5px 20px rgba(123, 158, 137, 0.2);
}

.mbti-code {
  font-weight: 700;
  font-size: 1.3rem;
  margin-bottom: var(--spacing-sm);
  color: var(--primary-color);
}

.mbti-name {
  font-weight: 500;
  font-size: 1.1rem;
  margin-bottom: var(--spacing-md);
}

.mbti-traits {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.select-indicator {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  color: var(--primary-color);
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 1.2rem;
}

.mbti-card.active .select-indicator {
  opacity: 1;
}

/* 类别颜色 */
.analyst-category {
  background-color: rgba(92, 95, 214, 0.05);
}

.diplomat-category {
  background-color: rgba(149, 91, 165, 0.05);
}

.sentinel-category {
  background-color: rgba(77, 120, 160, 0.05);
}

.explorer-category {
  background-color: rgba(230, 126, 34, 0.05);
}

/* MBTI测试链接 */
.mbti-guide {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: rgba(123, 158, 137, 0.05);
  border-radius: var(--radius-md);
}

.mbti-guide a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.mbti-guide a:hover {
  text-decoration: underline;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .mbti-selection {
    padding: 0 var(--spacing-xs);
    gap: var(--spacing-lg);
  }
  
  .mbti-categories {
    padding: var(--spacing-sm) var(--spacing-xs);
  }
  
  .mbti-category {
    padding: var(--spacing-sm);
  }
  
  .category-icon {
    font-size: 1.1rem;
  }
  
  .mbti-types {
    padding: var(--spacing-md);
  }
  
  .types-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .mbti-card {
    padding: var(--spacing-md);
  }
  
  .mbti-types-container {
    min-height: 320px;
  }
}

@media (max-height: 667px) {
  .mbti-types-container {
    min-height: 280px;
  }
  
  .mbti-card {
    padding: var(--spacing-xs);
  }
  
  .types-grid {
    gap: var(--spacing-xs);
  }
}
</style> 