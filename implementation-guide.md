# "星语心笺" 技术实现指南

## 技术栈选择

### 前端框架
- **Vue.js 3** + **Composition API**
  - 轻量级，适合单页面应用
  - 响应式系统便于状态管理
  - 丰富的生态系统

### UI组件库
- **Naive UI** / **Element Plus**
  - 提供丰富的基础组件
  - 支持主题定制
  - 可按需引入减少体积

### 动画库
- **GSAP** (GreenSock Animation Platform)
  - 高性能动画支持
  - 易于实现复杂动画序列
  - 良好的浏览器兼容性

### 图标库
- **Font Awesome 6**
  - 丰富的图标资源
  - 支持SVG和Web Font两种方式

### HTTP请求
- **Axios**
  - 拦截器功能便于统一处理请求/响应
  - 支持Promise API

## 项目结构

```
src/
├── assets/         # 静态资源
│   ├── backgrounds/ # 纸条背景
│   ├── fonts/      # 字体文件
│   └── icons/      # 自定义图标
├── components/     # 组件
│   ├── common/     # 通用组件
│   ├── notes/      # 纸条相关组件
│   └── settings/   # 设置相关组件
├── composables/    # 组合式函数
├── layouts/        # 布局组件
├── pages/          # 页面组件
├── router/         # 路由配置
├── services/       # API服务
├── store/          # 状态管理
├── styles/         # 样式文件
└── utils/          # 工具函数
```

## 关键功能实现

### 1. AI内容生成

```javascript
// services/aiService.js
import axios from 'axios';
import { API_URL, API_KEY } from '@/config';

export async function generateNoteContent(params) {
  try {
    const response = await axios.post(`${API_URL}/generate`, {
      model: "text-davinci-003",
      prompt: buildPrompt(params),
      max_tokens: 150,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('生成内容失败:', error);
    throw error;
  }
}

function buildPrompt(params) {
  const { zodiac, mbti, mood, timeOfDay } = params;
  
  return `生成一段温暖正能量的短文，内容符合以下条件：
  - 适合${zodiac}星座和${mbti}性格的人
  - 表达${mood}的情绪
  - 适合在${timeOfDay}阅读
  - 长度在20-50字之间
  - 风格温暖治愈，语言简洁有力
  - 不要使用陈词滥调`;
}
```

### 2. 纸条生成动画

```javascript
// composables/useNoteAnimation.js
import { ref } from 'vue';
import { gsap } from 'gsap';

export function useNoteAnimation() {
  const noteRef = ref(null);
  const isAnimating = ref(false);
  
  function playGenerateAnimation() {
    if (!noteRef.value) return;
    
    isAnimating.value = true;
    
    // 重置初始状态
    gsap.set(noteRef.value, {
      filter: 'blur(15px)',
      opacity: 0,
      scale: 0.95
    });
    
    // 创建动画序列
    const timeline = gsap.timeline({
      onComplete: () => {
        isAnimating.value = false;
      }
    });
    
    // 1. 淡入模糊状态
    timeline.to(noteRef.value, {
      opacity: 0.7,
      duration: 0.5,
      ease: 'power2.inOut'
    });
    
    // 2. 逐渐清晰
    timeline.to(noteRef.value, {
      filter: 'blur(0px)',
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out'
    });
    
    // 3. 添加辉光效果
    timeline.fromTo(
      '.note-glow',
      { opacity: 0 },
      { opacity: 0.7, duration: 0.5, ease: 'power2.inOut' },
      '-=0.8'
    );
    
    return timeline;
  }
  
  return {
    noteRef,
    isAnimating,
    playGenerateAnimation
  };
}
```

### 3. 图片导出功能

```javascript
// composables/useNoteExport.js
import { ref } from 'vue';
import html2canvas from 'html2canvas';

export function useNoteExport() {
  const exportStatus = ref('idle'); // idle, exporting, success, error
  
  async function exportAsImage(elementRef) {
    if (!elementRef) return null;
    
    try {
      exportStatus.value = 'exporting';
      
      // 配置html2canvas选项
      const options = {
        scale: 3, // 提高导出图片质量
        useCORS: true, // 允许加载跨域图片
        allowTaint: true,
        backgroundColor: null // 透明背景
      };
      
      // 生成canvas
      const canvas = await html2canvas(elementRef, options);
      
      // 转换为图片URL
      const imageUrl = canvas.toDataURL('image/png');
      
      exportStatus.value = 'success';
      return imageUrl;
      
    } catch (error) {
      console.error('导出图片失败:', error);
      exportStatus.value = 'error';
      throw error;
    }
  }
  
  async function saveToDevice(imageUrl, filename = 'soul-note.png') {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  }
  
  return {
    exportStatus,
    exportAsImage,
    saveToDevice
  };
}
```

### 4. 参数选择器组件

```javascript
// components/settings/ZodiacSelector.vue
<template>
  <div class="zodiac-selector">
    <h3 class="selector-title">
      <i class="fas fa-star"></i> 选择你的星座
    </h3>
    
    <swiper
      :slides-per-view="3.2"
      :space-between="12"
      :centered-slides="true"
      @swiper="setSwiper"
      @slide-change="handleSlideChange"
    >
      <swiper-slide 
        v-for="zodiac in zodiacs" 
        :key="zodiac.value"
        :class="{ active: modelValue === zodiac.value }"
        @click="$emit('update:modelValue', zodiac.value)"
      >
        <div class="zodiac-card">
          <div class="zodiac-icon">
            <i :class="zodiac.icon"></i>
          </div>
          <div class="zodiac-name">{{ zodiac.label }}</div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(['update:modelValue']);

const swiper = ref(null);
const setSwiper = (swiperInstance) => {
  swiper.value = swiperInstance;
};

const zodiacs = [
  { label: '白羊座', value: 'aries', icon: 'fas fa-fire' },
  { label: '金牛座', value: 'taurus', icon: 'fas fa-chess-rook' },
  { label: '双子座', value: 'gemini', icon: 'fas fa-user-friends' },
  { label: '巨蟹座', value: 'cancer', icon: 'fas fa-moon' },
  { label: '狮子座', value: 'leo', icon: 'fas fa-crown' },
  { label: '处女座', value: 'virgo', icon: 'fas fa-leaf' },
  { label: '天秤座', value: 'libra', icon: 'fas fa-balance-scale' },
  { label: '天蝎座', value: 'scorpio', icon: 'fas fa-skull' },
  { label: '射手座', value: 'sagittarius', icon: 'fas fa-arrow-alt-circle-right' },
  { label: '摩羯座', value: 'capricorn', icon: 'fas fa-mountain' },
  { label: '水瓶座', value: 'aquarius', icon: 'fas fa-tint' },
  { label: '双鱼座', value: 'pisces', icon: 'fas fa-fish' }
];

const handleSlideChange = () => {
  if (!swiper.value) return;
  const activeIndex = swiper.value.activeIndex;
  emit('update:modelValue', zodiacs[activeIndex].value);
};

// 当外部更新modelValue时，更新swiper位置
watch(() => props.modelValue, (newValue) => {
  if (!swiper.value || !newValue) return;
  const index = zodiacs.findIndex(z => z.value === newValue);
  if (index !== -1 && swiper.value.activeIndex !== index) {
    swiper.value.slideTo(index);
  }
});
</script>
```

## 本地存储方案

```javascript
// services/storageService.js
const STORAGE_KEYS = {
  USER_PREFERENCES: 'soul-note-preferences',
  SAVED_NOTES: 'soul-note-saved-notes'
};

export function saveUserPreferences(preferences) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES, 
      JSON.stringify(preferences)
    );
    return true;
  } catch (error) {
    console.error('保存偏好设置失败:', error);
    return false;
  }
}

export function getUserPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取偏好设置失败:', error);
    return null;
  }
}

export function saveNote(note) {
  try {
    const savedNotes = getSavedNotes() || [];
    // 添加ID和保存时间戳
    const noteWithMeta = {
      ...note,
      id: Date.now().toString(),
      savedAt: new Date().toISOString()
    };
    
    savedNotes.unshift(noteWithMeta);
    localStorage.setItem(STORAGE_KEYS.SAVED_NOTES, JSON.stringify(savedNotes));
    return noteWithMeta;
  } catch (error) {
    console.error('保存纸条失败:', error);
    return null;
  }
}

export function getSavedNotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_NOTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取保存纸条失败:', error);
    return [];
  }
}

export function deleteNote(noteId) {
  try {
    let savedNotes = getSavedNotes();
    savedNotes = savedNotes.filter(note => note.id !== noteId);
    localStorage.setItem(STORAGE_KEYS.SAVED_NOTES, JSON.stringify(savedNotes));
    return true;
  } catch (error) {
    console.error('删除纸条失败:', error);
    return false;
  }
}
```

## 部署建议

1. **构建优化**
   - 启用生产模式构建压缩资源
   - 使用路由懒加载减少初始加载时间
   - 配置适当的缓存策略

2. **API密钥安全**
   - 不要在前端直接包含API密钥
   - 使用简单的后端API代理服务
   - 或使用Serverless Functions中转API请求

3. **性能监控**
   - 集成简单的分析工具监控性能指标
   - 关注首屏加载时间和API响应时间
