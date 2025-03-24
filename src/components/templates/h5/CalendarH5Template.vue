<template>
  <div 
    class="calendar-h5-template" 
    :class="{ 'preview-mode': isPreview }"
    :style="templateStyle"
  >
    <!-- 日历背景 -->
    <div class="calendar-bg" :style="backgroundStyle"></div>
    
    <!-- 日历头部 -->
    <div class="calendar-header">
      <div class="month">{{ monthName }}</div>
      <div class="day">{{ day }}</div>
    </div>
    
    <!-- 日期信息 -->
    <div class="date-info">
      <div class="weekday">{{ weekdayName }}</div>
      <div class="lunar-date">{{ lunarDate }}</div>
      <div class="solar-term">{{ solarTerm }}</div>
    </div>
    
    <!-- 表情区域 -->
    <div class="emoji-container" v-if="showEmojiBubble && moods.length > 0">
      <span 
        v-for="(mood, index) in moods" 
        :key="index" 
        class="emoji-item"
      >{{ mood }}</span>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-area" :style="computedContentStyle">
      <p class="content-text">{{ content }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import H5BaseTemplate from './H5BaseTemplate.vue';
import { getCurrentDateInfo, getMonthName, getWeekdayName } from '../../../utils/dateUtils';

// 尝试使用 lunar-javascript 库（如果可用）
let Lunar, Solar;
try {
  const lunarJS = window.LunarJS || {};
  Lunar = lunarJS.Lunar;
  Solar = lunarJS.Solar;
} catch (error) {
  console.warn('无法加载 LunarJS 库，将使用简化的时间处理');
}

const props = defineProps({
  // 内容
  content: {
    type: String,
    default: '春天的第一天到来时，我会回到这儿来，在你的窗下吹口哨。一年很快就会过去。'
  },
  // 表情数组
  moods: {
    type: Array,
    default: () => ['🌹', '😍', '🌹', '💎']
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({})
  },
  // 内容样式
  contentStyle: {
    type: Object,
    default: () => ({})
  },
  // 表情容器样式
  moodContainerStyle: {
    type: Object,
    default: () => ({})
  },
  // 图片层样式
  imageLayerStyle: {
    type: Object,
    default: () => ({})
  },
  // 其他属性
  hasCustomImage: {
    type: Boolean,
    default: false
  },
  // 预览模式
  isPreview: {
    type: Boolean,
    default: false
  },
  // 是否激活
  active: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 日期信息（可选），如果不提供则使用当前日期
  dateInfo: {
    type: Object,
    default: () => null
  }
});

// 计算是否显示表情气泡
const showEmojiBubble = computed(() => {
  return props.customStyle?.showEmojiBubble !== false;
});

// 当前日期状态
const currentDateInfo = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  day: new Date().getDate(),
  weekday: new Date().getDay(),
  lunarDate: '',
  solarTerm: '',
  animal: ''
});

// 加载状态
const isLoading = ref(false);

// 获取完整的日期信息
async function fetchCurrentDateInfo() {
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    // 使用dateUtils获取日期信息
    const dateInfo = await getCurrentDateInfo();
    
    // 更新日期信息
    currentDateInfo.value = {
      year: dateInfo.year || new Date().getFullYear(),
      month: dateInfo.month || new Date().getMonth() + 1,
      day: dateInfo.day || new Date().getDate(),
      weekday: dateInfo.weekday || new Date().getDay(),
      lunarDate: dateInfo.lunarDate || '',
      solarTerm: dateInfo.solarTerm || '',
      animal: dateInfo.animal || ''
    };
    
    console.log('成功获取日期信息:', currentDateInfo.value);
  } catch (error) {
    console.error('获取日期信息失败:', error);
  } finally {
    isLoading.value = false;
  }
}

// 获取日期信息
const dateObj = computed(() => {
  // 如果提供了自定义日期信息，与当前信息合并
  if (props.dateInfo) {
    // 保留自定义日期的基本信息，但使用当前获取的农历信息
    return {
      // 基本日期信息优先使用传入的
      year: props.dateInfo.year || currentDateInfo.value.year,
      month: props.dateInfo.month || currentDateInfo.value.month,
      day: props.dateInfo.day || currentDateInfo.value.day,
      weekday: props.dateInfo.weekday || currentDateInfo.value.weekday,
      
      // 农历信息优先使用当前获取的，因为更准确
      lunarDate: currentDateInfo.value.lunarDate || props.dateInfo.lunarDate || '',
      solarTerm: currentDateInfo.value.solarTerm || props.dateInfo.solarTerm || '',
      animal: currentDateInfo.value.animal || props.dateInfo.animal || ''
    };
  }
  
  // 否则使用当前获取的日期信息
  return currentDateInfo.value;
});

// 月份名称
const monthName = computed(() => {
  return getMonthName(dateObj.value.month);
});

// 日期数字
const day = computed(() => {
  return dateObj.value.day;
});

// 星期名称
const weekdayName = computed(() => {
  return getWeekdayName(dateObj.value.weekday);
});

// 农历日期
const lunarDate = computed(() => {
  return dateObj.value.lunarDate || '农历日期';
});

// 节气信息
const solarTerm = computed(() => {
  return dateObj.value.solarTerm || '';
});

// 计算模板样式
const templateStyle = computed(() => {
  const style = {
    backgroundColor: props.customStyle?.backgroundColor || '#ffffff',
    color: props.customStyle?.textColor || '#333333'
  };
  
  // 预览模式样式
  if (props.isPreview) {
    style.width = '100%';
    style.height = '100%';
    style.border = props.active ? '2px solid var(--primary-color)' : '2px solid var(--border-color)';
    style.opacity = props.disabled ? 0.5 : 1;
    style.transform = 'scale(0.95)';
  }
  
  return style;
});

// 计算背景样式
const backgroundStyle = computed(() => {
  if (props.hasCustomImage && props.imageLayerStyle?.backgroundImage) {
    return {
      backgroundImage: props.imageLayerStyle.backgroundImage,
      opacity: props.customStyle?.bgOpacity || 0.1
    };
  }
  return {};
});

// 计算内容样式
const computedContentStyle = computed(() => {
  return {
    fontFamily: props.customStyle?.fontFamily || "'KaitiLocal', 'Kaiti', '楷体', 'STKaiti', '华文楷体', sans-serif",
    fontSize: `${props.customStyle?.fontSize || 16}px`,
    color: props.customStyle?.textColor || '#333333',
    textAlign: props.customStyle?.textPosition || 'left',
    ...props.contentStyle
  };
});

// 在组件挂载时获取日期信息
onMounted(async () => {
  try {
    // 立即使用当前日期初始化基本信息
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = now.getDay();
    
    // 初始化日期信息
    currentDateInfo.value = {
      year,
      month,
      day,
      weekday,
      lunarDate: '农历日期',
      solarTerm: '',
      animal: ''
    };
    
    // 尝试使用lunar-javascript获取农历信息
    if (Solar && Lunar) {
      try {
        const solar = Solar.fromDate(now);
        const lunar = solar.getLunar();
        
        // 更新农历信息
        currentDateInfo.value.lunarDate = `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
        currentDateInfo.value.animal = lunar.getYearShengXiao();
        
        // 节气信息
        const jieqi = lunar.getJieQi();
        if (jieqi) {
          currentDateInfo.value.solarTerm = jieqi;
        }
        
        console.log('成功获取农历信息:', currentDateInfo.value);
      } catch (lunarError) {
        console.error('lunar-javascript解析失败:', lunarError);
      }
    } else {
      // 如果lunar-javascript不可用，尝试通过API获取
      fetchCurrentDateInfo();
    }
  } catch (error) {
    console.error('初始化日期信息失败:', error);
    
    // 如果获取农历信息失败，至少显示基本的日期
    const now = new Date();
    currentDateInfo.value = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      weekday: now.getDay(),
      lunarDate: '农历日期',
      solarTerm: '',
      animal: ''
    };
    
    // 尝试从API获取日期信息
    fetchCurrentDateInfo();
  }
  
  // 设置定时器，每小时更新一次日期信息
  const updateTimer = setInterval(() => {
    // 仅在日期变化时更新
    const now = new Date();
    if (now.getDate() !== currentDateInfo.value.day || 
        now.getMonth() + 1 !== currentDateInfo.value.month) {
      
      // 更新基本日期信息
      currentDateInfo.value.year = now.getFullYear();
      currentDateInfo.value.month = now.getMonth() + 1;
      currentDateInfo.value.day = now.getDate();
      currentDateInfo.value.weekday = now.getDay();
      
      // 如果lunar-javascript可用，直接更新农历信息
      if (Solar && Lunar) {
        try {
          const solar = Solar.fromDate(now);
          const lunar = solar.getLunar();
          
          // 更新农历信息
          currentDateInfo.value.lunarDate = `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
          currentDateInfo.value.animal = lunar.getYearShengXiao();
          
          // 节气信息
          const jieqi = lunar.getJieQi();
          if (jieqi) {
            currentDateInfo.value.solarTerm = jieqi;
          }
        } catch (error) {
          console.error('更新农历信息失败:', error);
          // 失败则尝试API
          fetchCurrentDateInfo();
        }
      } else {
        // 如果lunar-javascript不可用，通过API获取
        fetchCurrentDateInfo();
      }
    }
  }, 3600000); // 每小时检查一次
  
  // 组件卸载时清除定时器
  return () => {
    clearInterval(updateTimer);
  };
});
</script>

<style scoped>
.calendar-h5-template {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

.calendar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-size: cover;
  background-position: center;
  opacity: 0.05;
}

.calendar-header {
  padding: 24px 20px 0;
  z-index: 2;
}

.month {
  font-family: 'Times New Roman', serif;
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.day {
  font-family: 'Times New Roman', serif;
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  color: #000;
  margin-bottom: 8px;
}

.date-info {
  padding: 4px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 2;
}

.weekday {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.lunar-date, .solar-term {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.emoji-container {
  display: flex;
  justify-content: flex-end;
  padding: 8px 20px;
  gap: 4px;
  z-index: 2;
}

.emoji-item {
  font-size: 20px;
}

.content-area {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  margin: 0;
  color: #333;
}

/* 预览模式特殊样式 */
.preview-mode {
  transform: scale(0.95);
  transition: all 0.2s ease;
}

.preview-mode:hover {
  transform: scale(1);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .calendar-header {
    padding: 16px 16px 0;
  }
  
  .month {
    font-size: 24px;
  }
  
  .day {
    font-size: 100px;
  }
  
  .content-area {
    padding: 16px;
  }
}
</style> 