<template>
  <div class="settings-page" :class="{'savage-mode': preferences.savageMode}">
    <header class="header">
      <button class="icon-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">设置</h1>
      <div class="placeholder"></div>
    </header>
    
    <div class="settings-content">
      <section class="settings-section">
        <h2 class="section-title">个人设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">星座</label>
          <div class="setting-value" @click="showZodiacSelector = true">
            {{ getZodiacLabel(preferences.zodiac) }}
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">MBTI人格</label>
          <div class="setting-value" @click="showMbtiSelector = true">
            {{ preferences.mbti || '未设置' }}
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">语言偏好</label>
          <div class="toggle-switch">
            <span 
              :class="{ active: preferences.language === 'zh' }" 
              @click="updatePreference('language', 'zh')"
            >
              中文
            </span>
            <span 
              :class="{ active: preferences.language === 'en-zh' }" 
              @click="updatePreference('language', 'en-zh')"
            >
              中英双语
            </span>
          </div>
        </div>
      </section>
      
      <section class="settings-section">
        <h2 class="section-title">应用设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">暗黑模式</label>
          <div class="setting-switch">
            <input 
              type="checkbox" 
              id="darkModeSwitch" 
              v-model="isDarkMode"
              @change="toggleDarkMode"
            />
            <label for="darkModeSwitch" class="switch-label"></label>
          </div>
        </div>
        
        <!-- 添加毒舌模式切换选项 -->
        <div class="setting-item savage-mode-setting">
          <label class="setting-label">毒舌模式</label>
          <div class="setting-switch">
            <input 
              type="checkbox" 
              id="savageModeSwitch" 
              v-model="isSavageMode"
              @change="toggleSavageMode"
            />
            <label for="savageModeSwitch" class="switch-label"></label>
          </div>
        </div>
        <div class="savage-mode-description" v-if="preferences.savageMode">
          <p>已开启毒舌模式 - 请做好被扎心的准备！</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">默认字号</label>
          <div class="font-size-control">
            <button class="icon-btn" @click="decreaseFontSize">
              <i class="fas fa-font"></i>-
            </button>
            <span class="font-size-indicator">{{ preferences.fontSize }}px</span>
            <button class="icon-btn" @click="increaseFontSize">
              <i class="fas fa-font"></i>+
            </button>
          </div>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">默认背景</label>
          <div class="bg-selector">
            <div 
              class="bg-option"
              v-for="bg in backgrounds"
              :key="bg.value"
              :class="{ active: preferences.background === bg.value }"
              :style="{ background: getBgStyle(bg.value) }"
              @click="updatePreference('background', bg.value)"
            ></div>
          </div>
        </div>
      </section>
      
      <section class="settings-section">
        <h2 class="section-title">关于</h2>
        
        <div class="setting-item">
          <label class="setting-label">隐私政策</label>
          <div class="setting-value" @click="openPrivacyPolicy">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">关于我们</label>
          <div class="setting-value" @click="openAboutUs">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div class="app-version">
          版本: 1.0.0
        </div>
      </section>
      
      <!-- 添加数据与隐私部分 -->
      <section class="settings-section">
        <h2 class="section-title">数据与隐私</h2>
        
        <div class="setting-item">
          <label class="setting-label">数据存储</label>
          <div class="setting-value">
            <span class="badge">本地</span>
          </div>
        </div>
        
        <div class="setting-item reset-app-item">
          <label class="setting-label">重置应用</label>
          <button class="btn btn-danger reset-btn" @click="showResetConfirm = true">
            <i class="fas fa-exclamation-triangle"></i> 重置
          </button>
        </div>
      </section>
    </div>
    
    <!-- 星座选择弹窗 -->
    <div class="modal" v-if="showZodiacSelector" @click="showZodiacSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择星座</h3>
          <button class="icon-btn" @click="showZodiacSelector = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="zodiac-grid">
            <div 
              v-for="zodiac in zodiacs" 
              :key="zodiac.value"
              class="zodiac-item"
              :class="{ active: preferences.zodiac === zodiac.value }"
              @click="selectZodiac(zodiac.value)"
            >
              <i :class="zodiac.icon"></i>
              <span>{{ zodiac.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- MBTI选择弹窗 -->
    <div class="modal" v-if="showMbtiSelector" @click="showMbtiSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择MBTI人格类型</h3>
          <button class="icon-btn" @click="showMbtiSelector = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="mbti-selection">
            <div class="mbti-group" v-for="(group, index) in mbtiGroups" :key="index">
              <h4 class="group-title">{{ group.title }}</h4>
              <div class="mbti-buttons">
                <button
                  v-for="mbti in group.types"
                  :key="mbti.value"
                  class="mbti-button"
                  :class="{ active: preferences.mbti === mbti.value }"
                  @click="selectMbti(mbti.value)"
                >
                  <span class="mbti-code">{{ mbti.value }}</span>
                  <span class="mbti-name">{{ mbti.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 重置确认弹窗 -->
    <div class="modal reset-confirm-modal" v-if="showResetConfirm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>确认重置</h3>
        </div>
        
        <div class="modal-body">
          <div class="warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="reset-warning">此操作将清除所有应用数据，包括：</p>
          <ul class="reset-list">
            <li>所有收藏的纸条</li>
            <li>个人偏好设置</li>
            <li>应用配置</li>
          </ul>
          <p class="reset-note">重置后，应用将返回到首次安装状态，此操作无法撤销。</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showResetConfirm = false">取消</button>
          <button 
            class="btn btn-danger" 
            @click="resetApplication"
            :disabled="isResetting"
          >
            {{ isResetting ? '重置中...' : '确认重置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUserPreferences, saveUserPreferences, resetUserData } from '../services/storageService';

const router = useRouter();
const showZodiacSelector = ref(false);
const showMbtiSelector = ref(false);
const isDarkMode = ref(false);
const isSavageMode = ref(false); // 添加毒舌模式状态
const showResetConfirm = ref(false);
const isResetting = ref(false);

// 使用reactive创建一个空对象，稍后填充数据
const preferences = reactive({
  zodiac: null,
  mbti: null,
  language: 'zh',
  theme: 'light',
  fontSize: 24,
  background: 'paper-1',
  savageMode: false // 添加毒舌模式参数
});

// 星座数据
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

const backgrounds = [
  { value: 'paper-1', label: '米白色' },
  { value: 'paper-2', label: '淡粉色' },
  { value: 'paper-3', label: '淡蓝色' },
  { value: 'paper-4', label: '淡绿色' }
];

function getZodiacLabel(value) {
  if (!value) return '未设置';
  const zodiac = zodiacs.find(z => z.value === value);
  return zodiac ? zodiac.label : '未设置';
}

function getBgStyle(value) {
  const backgroundMap = {
    'paper-1': 'linear-gradient(to right bottom, #FFFFFF, #F9F3E5)',
    'paper-2': 'linear-gradient(to right bottom, #FFF9F9, #FFE8E8)',
    'paper-3': 'linear-gradient(to right bottom, #F0F8FF, #E6F0F9)',
    'paper-4': 'linear-gradient(to right bottom, #F5FFF5, #E6F9E6)'
  };
  
  return backgroundMap[value] || backgroundMap['paper-1'];
}

function selectZodiac(value) {
  preferences.zodiac = value;
  showZodiacSelector.value = false;
  savePreferences();
}

function selectMbti(value) {
  preferences.mbti = value;
  showMbtiSelector.value = false;
  savePreferences();
}

function updatePreference(key, value) {
  preferences[key] = value;
  savePreferences();
}

function toggleDarkMode() {
  preferences.theme = isDarkMode.value ? 'dark' : 'light';
  document.body.classList.toggle('dark-mode', isDarkMode.value);
  savePreferences();
}

// 改进毒舌模式切换函数
function toggleSavageMode() {
  preferences.savageMode = isSavageMode.value;
  document.body.classList.toggle('savage-mode', isSavageMode.value);
  console.log('Savage mode toggled:', preferences.savageMode);
  savePreferences();
}

function increaseFontSize() {
  if (preferences.fontSize < 36) {
    preferences.fontSize += 2;
    savePreferences();
    console.log('Settings page increased font size to:', preferences.fontSize);
  }
}

function decreaseFontSize() {
  if (preferences.fontSize > 16) {
    preferences.fontSize -= 2;
    savePreferences();
    console.log('Settings page decreased font size to:', preferences.fontSize);
  }
}

async function savePreferences() {
  try {
    await saveUserPreferences(preferences);
    // 通知应用字体大小已经更新
    document.dispatchEvent(new CustomEvent('preferences-updated', {
      detail: { fontSize: preferences.fontSize }
    }));
  } catch (error) {
    console.error('保存偏好设置失败:', error);
    alert('保存设置失败，请重试');
  }
}

function goBack() {
  router.back();
}

function openPrivacyPolicy() {
  alert('隐私政策页面暂未实现');
}

function openAboutUs() {
  alert('关于我们页面暂未实现');
}

/**
 * 重置应用
 * 清除所有用户数据并重定向到欢迎页面
 */
async function resetApplication() {
  try {
    isResetting.value = true;
    
    // 执行重置操作
    const success = await resetUserData();
    
    if (success) {
      // 显示成功提示
      alert('应用已成功重置！');
      
      // 重定向到欢迎页面
      router.push('/');
      
      // 刷新页面以确保所有状态都被清除
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      throw new Error('重置失败，请重试');
    }
  } catch (error) {
    console.error('重置应用失败:', error);
    alert(error.message || '重置应用失败，请重试');
  } finally {
    isResetting.value = false;
    showResetConfirm.value = false;
  }
}

// 生命周期
onMounted(async () => {
  try {
    // 获取用户偏好
    const userPrefs = await getUserPreferences();
    
    // 更新本地响应式对象
    Object.assign(preferences, userPrefs);
    
    // 设置暗黑模式
    isDarkMode.value = preferences.theme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode.value);
    
    // 设置毒舌模式
    isSavageMode.value = preferences.savageMode || false;
    document.body.classList.toggle('savage-mode', isSavageMode.value);
    
    // 检查并打印当前激活的模式
    console.log('Current modes:', {
      darkMode: isDarkMode.value,
      savageMode: isSavageMode.value
    });
    console.log('Body classes:', document.body.classList);
  } catch (error) {
    console.error('加载用户偏好失败:', error);
  }
});

// 监听偏好变化自动保存
watch(preferences, () => {
  savePreferences();
}, { deep: true });
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
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

.settings-content {
  padding: var(--spacing-md);
}

.settings-section {
  margin-bottom: var(--spacing-xl);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.setting-label {
  font-size: 16px;
}

.setting-value {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  cursor: pointer;
}

.setting-value i {
  margin-left: var(--spacing-sm);
}

.toggle-switch {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-switch span {
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-switch span.active {
  background-color: var(--primary-color);
  color: white;
}

.setting-switch {
  position: relative;
}

.setting-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-label {
  display: block;
  width: 48px;
  height: 24px;
  background-color: var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  position: relative;
}

.switch-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  transition: transform var(--transition-fast);
}

input:checked + .switch-label {
  background-color: var(--primary-color);
}

input:checked + .switch-label::after {
  transform: translateX(24px);
}

.font-size-control {
  display: flex;
  align-items: center;
}

.font-size-indicator {
  margin: 0 var(--spacing-md);
  color: var(--text-secondary);
}

.bg-selector {
  display: flex;
  gap: var(--spacing-sm);
}

.bg-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.bg-option.active {
  transform: scale(1.2);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(123, 158, 137, 0.3);
}

.app-version {
  text-align: center;
  margin-top: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 14px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
}

.modal-body {
  padding: var(--spacing-md);
  overflow-y: auto;
}

.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  max-width: 100%;
}

.zodiac-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.zodiac-item i {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.zodiac-item.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.zodiac-item.active i {
  color: white;
}

.mbti-selection {
  max-width: 100%;
}

.mbti-group {
  margin-bottom: var(--spacing-lg);
}

.group-title {
  font-size: 16px;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.mbti-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.mbti-button {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
}

.mbti-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var (--primary-color);
}

.mbti-code {
  font-weight: 600;
}

.mbti-name {
  font-size: 14px;
}

@media (max-width: 480px) {
  .zodiac-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mbti-buttons {
    grid-template-columns: 1fr;
  }
}

/* 重置确认弹窗样式 */
.reset-confirm-modal .modal-content {
  max-width: 400px;
}

.warning-icon {
  font-size: 48px;
  color: #e74c3c;
  text-align: center;
  margin: var(--spacing-md) 0;
}

.reset-warning {
  font-weight: 500;
  margin-bottom: var(--spacing-md);
}

.reset-list {
  margin-bottom: var(--spacing-md);
  padding-left: var(--spacing-xl);
}

.reset-list li {
  margin-bottom: var(--spacing-xs);
}

.reset-note {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-danger:disabled {
  background-color: #e57373;
  cursor: not-allowed;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: var(--primary-color);
  color: white;
  font-size: 12px;
}

/* 确保重置按钮样式正确 */
.reset-app-item {
  align-items: center;
}

.reset-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 14px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
}

.reset-btn i {
  margin-right: var(--spacing-xs);
  font-size: 16px;
}

/* 确保modal显示正确 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  gap: var(--spacing-md);
}

/* 添加毒舌模式相关样式 */
.savage-mode-setting {
  position: relative;
}

.savage-mode-description {
  font-size: 14px;
  color: var(--savage-primary-color, #ff5252);
  margin-top: -10px;
  padding-bottom: var(--spacing-md);
  font-style: italic;
}

/* 毒舌模式下的全局样式变量 */
:global(body.savage-mode) {
  --bg-color: #1a1a1a;
  --card-bg: #2c2c2c;
  --text-color: #e0e0e0;
  --text-secondary: #9e9e9e;
  --border-color: #3a3a3a;
  --primary-color: #ff5252;
  --savage-primary-color: #ff5252;
  --savage-card-bg: #2c2c2c;
  --savage-text-color: #e0e0e0;
  --savage-text-secondary: #9e9e9e;
  
  /* 信笺相关样式变量 */
  --savage-note-bg-1: linear-gradient(to right bottom, #3c2a2a, #4c3636);
  --savage-note-bg-2: linear-gradient(to right bottom, #4a2a2c, #5c3638);
  --savage-note-bg-3: linear-gradient(to right bottom, #2a2a3c, #36364c);
  --savage-note-bg-4: linear-gradient(to right bottom, #2a3c2e, #364c3a);
  --savage-note-text: #ff9e9e;
  --savage-note-shadow: 0 4px 12px rgba(255, 82, 82, 0.25);
}

/* 改进毒舌模式的视觉提示 */
.savage-mode .savage-mode-description p {
  color: var(--primary-color);
  font-weight: bold;
}

.savage-mode .section-title {
  color: var(--primary-color);
  text-shadow: 0 0 3px rgba(255, 82, 82, 0.3);
}

/* 毒舌模式下的开关样式 */
.savage-mode input:checked + .switch-label {
  background-color: var(--primary-color);
  box-shadow: 0 0 5px rgba(255, 82, 82, 0.5);
}
</style>
