<template>
  <div class="settings-page fixed-page-layout" :class="{'savage-mode': preferences.savageMode}">
    <header class="header fixed-header">
      <button class="icon-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">设置</h1>
      <div class="placeholder"></div>
    </header>
    
    <div class="settings-content scrollable-content">
      <section class="settings-section">
        <h2 class="section-title">个人设置</h2>
        
        <!-- 添加性别设置 -->
        <div class="setting-item">
          <label class="setting-label">性别</label>
          <div class="setting-value" @click="showGenderSelector = true">
            {{ getGenderLabel(preferences.gender) }}
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <!-- 添加年龄设置 -->
        <div class="setting-item">
          <label class="setting-label">年龄段</label>
          <div class="setting-value" @click="showAgeSelector = true">
            {{ getAgeLabel(preferences.age) }}
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <!-- 添加感情状况设置 -->
        <div class="setting-item">
          <label class="setting-label">感情状况</label>
          <div class="setting-value" @click="showRelationshipSelector = true">
            {{ getRelationshipLabel(preferences.relationship) }}
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
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
      </section>

      <!-- 在设置页面中添加数据管理部分 -->
      <div class="settings-section">
        <h2 class="section-title">数据管理</h2>
        
        <div class="settings-card">
          <div class="settings-item">
            <div class="settings-item-header">
              <h3>存储状态</h3>
              <button class="btn-icon" @click="checkStorage">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
            <div class="storage-status" v-if="storageHealth">
              <div class="status-item">
                <span class="status-label">IndexedDB:</span>
                <span class="status-value" :class="{'status-good': storageHealth.indexedDB.available && storageHealth.indexedDB.writable, 'status-bad': !storageHealth.indexedDB.available || !storageHealth.indexedDB.writable}">
                  {{ (storageHealth.indexedDB.available && storageHealth.indexedDB.writable) ? '正常' : '异常' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">本地存储:</span>
                <span class="status-value" :class="{'status-good': storageHealth.localStorage.available && storageHealth.localStorage.writable, 'status-bad': !storageHealth.localStorage.available || !storageHealth.localStorage.writable}">
                  {{ (storageHealth.localStorage.available && storageHealth.localStorage.writable) ? '正常' : '异常' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">数据存储位置:</span>
                <span class="status-value status-good">
                  <span>本地</span>
                </span>
              </div>
            </div>
          </div>
          
          <div class="settings-item" style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
            <div class="settings-item-header">
              <h3>数据操作</h3>
            </div>
            <p class="settings-desc">备份或恢复您的所有数据，包括个人设置和保存的笔记。</p>
            <div class="data-actions-row">
              <button class="btn btn-primary" @click="backupData">
                <i class="fas fa-download"></i>
                导出备份
              </button>
              <input 
                type="file" 
                ref="backupFileInput" 
                accept=".json" 
                style="display: none" 
                @change="handleBackupFileSelected"
              />
              <button class="btn btn-secondary" @click="$refs.backupFileInput.click()">
                <i class="fas fa-upload"></i>
                导入备份
              </button>
            </div>
          </div>
          
          <div class="settings-item danger-zone">
            <div class="settings-item-header">
              <h3>危险区域</h3>
            </div>
            <p class="settings-desc warning-text">以下操作将永久删除您的数据，请谨慎操作。</p>
            <div class="data-actions-row">
              <button class="btn btn-danger" @click="confirmReset">
                <i class="fas fa-trash-alt"></i>
                重置所有数据
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加确认对话框 -->
      <div class="modal" v-if="showResetConfirm">
        <div class="modal-overlay" @click="showResetConfirm = false"></div>
        <div class="modal-content">
          <h3>确认重置数据</h3>
          <p>此操作将永久删除您的所有数据，包括个人设置和保存的笔记。此操作无法撤销。</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showResetConfirm = false">取消</button>
            <button class="btn btn-danger" @click="resetApplication" :disabled="isResetting">
              {{ isResetting ? '重置中...' : '确认重置' }}
            </button>
          </div>
        </div>
      </div>
            
      <section class="settings-section">
        <h2 class="section-title">分享与邀请</h2>
        
        <div class="setting-item">
          <label class="setting-label">生成分享链接</label>
          <div class="setting-value" @click="generateShareLink">
            <span v-if="!isGeneratingLink">复制邀请链接</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i></span>
            <i class="fas fa-share-alt"></i>
          </div>
        </div>
        
        <!-- 添加复制成功提示 -->
        <div 
          class="copy-success-toast" 
          v-if="showCopySuccess"
          @animationend="showCopySuccess = false"
        >
          <i class="fas fa-check-circle"></i> 链接已复制到剪贴板
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
          <label class="setting-label">关于我们（赞助/社群）</label>
          <div class="setting-value" @click="openAboutUs">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        
        <div class="setting-item">
          <label class="setting-label">更新日志与社群</label>
          <div class="setting-value" @click="openCommunityPrompt">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <!-- 添加用户引导选项 -->
        <div class="setting-item">
          <label class="setting-label">用户引导</label>
          <div class="setting-value" @click="openUserGuide">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <div class="app-version">
          版本: {{ APP_VERSION }}
        </div>
      </section>
    </div>

    <!-- CommunityPrompt 组件 -->
    <CommunityPrompt
      v-if="showCommunityPrompt"
      :visible="showCommunityPrompt"
      :title="communityPromptData.title"
      :message="communityPromptData.message"
      :qrcodeUrl="communityPromptData.qrcodeUrl"
      :updateLogs="communityPromptData.updateLogs"
      :activeTab="communityPromptData.activeTab"
      @close="showCommunityPrompt = false"
      @later="showCommunityPrompt = false"
      @never="showCommunityPrompt = false"
    />

    <!-- 性别选择弹窗 -->
    <div class="modal" v-if="showGenderSelector" @click="showGenderSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择性别</h3>
          <button class="icon-btn" @click="showGenderSelector = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="gender-options">
            <div 
              v-for="gender in genders" 
              :key="gender.value"
              class="gender-option"
              :class="{ active: preferences.gender === gender.value }"
              @click="selectGender(gender.value)"
            >
              <i :class="gender.icon"></i>
              <span>{{ gender.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 年龄选择弹窗 -->
    <div class="modal" v-if="showAgeSelector" @click="showAgeSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择年龄段</h3>
          <button class="icon-btn" @click="showAgeSelector = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="age-options">
            <div 
              v-for="ageGroup in ageGroups" 
              :key="ageGroup.value"
              class="age-option"
              :class="{ active: preferences.age === ageGroup.value }"
              @click="selectAge(ageGroup.value)"
            >
              <span>{{ ageGroup.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 感情状况选择弹窗 -->
    <div class="modal" v-if="showRelationshipSelector" @click="showRelationshipSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择感情状况</h3>
          <button class="icon-btn" @click="showRelationshipSelector = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="relationship-options">
            <div 
              v-for="status in relationshipStatuses" 
              :key="status.value"
              class="relationship-option"
              :class="{ active: preferences.relationship === status.value }"
              @click="selectRelationship(status.value)"
            >
              <i :class="status.icon"></i>
              <span>{{ status.label }}</span>
            </div>
          </div>
        </div>
      </div>
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

    <!-- UserGuide 组件 -->
    <UserGuide
      v-if="showUserGuide"
      :visible="showUserGuide"
      @close="showUserGuide = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onErrorCaptured, watch, computed, inject, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { 
  getUserPreferences, 
  saveUserPreferences, 
  resetUserData, 
  checkStorageHealth, 
  backupUserData, 
  restoreUserData, 
  getInviteCodeVerified 
} from '../services/storageService';
import { communityService } from '../services/communityService';
import CommunityPrompt from '../components/CommunityPrompt.vue';
import UserGuide from '../components/UserGuide.vue'; // 导入用户引导组件
import logger from '../utils/logger';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '开发版本';

const showZodiacSelector = ref(false);
const showMbtiSelector = ref(false);
const showGenderSelector = ref(false); // 添加性别选择器状态
const showAgeSelector = ref(false); // 添加年龄选择器状态
const showRelationshipSelector = ref(false); // 添加感情状况选择器状态
const isDarkMode = ref(false);
const isSavageMode = ref(false); // 添加毒舌模式状态
const isResetting = ref(false);

const showCommunityPrompt = ref(false); // 社群弹窗显示状态
const showUserGuide = ref(false); // 用户引导显示状态
const communityPromptData = reactive({
  title: '星语心笺社群',
  message: '',
  qrcodeUrl: '/assets/community-qr.png',
  activeTab: 'updates',
  updateLogs: []
});

// 状态变量
const storageHealth = ref(null);
const showResetConfirm = ref(false);
const backupFileInput = ref(null);
const router = useRouter();
const errorMessage = ref('');

// 使用reactive创建一个空对象，稍后填充数据
const preferences = reactive({
  gender: null,
  age: null,
  relationship: null,
  zodiac: null,
  mbti: null,
  language: 'zh',
  theme: 'light',
  fontSize: 24,
  background: 'paper-1',
  savageMode: false // 添加毒舌模式参数
});

// 性别数据
const genders = [
  { label: '男性', value: 'male', icon: 'fas fa-mars' },
  { label: '女性', value: 'female', icon: 'fas fa-venus' },
  { label: '其他', value: 'other', icon: 'fas fa-cat' }
];

// 年龄段数据
const ageGroups = [
  { label: '18岁以下', value: 'under18' },
  { label: '18-24岁', value: '18-24' },
  { label: '25-34岁', value: '25-34' },
  { label: '35-44岁', value: '35-44' },
  { label: '45-54岁', value: '45-54' },
  { label: '55岁以上', value: 'above55' }
];

// 婚恋状况数据
const relationshipStatuses = [
  { label: '单身', value: 'single', icon: 'fas fa-user' },
  { label: '有心仪对象', value: 'crushing', icon: 'fas fa-heart' },
  { label: '恋爱中', value: 'relationship', icon: 'fas fa-people-arrows' },
  { label: '已婚', value: 'married', icon: 'fas fa-ring' }
];

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

// 注入分享链接生成函数
const getShareLinkWithInviteCode = inject('getShareLinkWithInviteCode');

// 分享链接相关状态
const isGeneratingLink = ref(false);
const showCopySuccess = ref(false);
const currentInviteCode = ref('');

function getGenderLabel(value) {
  if (!value) return '未设置';
  const gender = genders.find(g => g.value === value);
  return gender ? gender.label : '未设置';
}

function getAgeLabel(value) {
  if (!value) return '未设置';
  const ageGroup = ageGroups.find(a => a.value === value);
  return ageGroup ? ageGroup.label : '未设置';
}

function getRelationshipLabel(value) {
  if (!value) return '未设置';
  const status = relationshipStatuses.find(s => s.value === value);
  return status ? status.label : '未设置';
}

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

function selectGender(value) {
  preferences.gender = value;
  showGenderSelector.value = false;
  savePreferences();
}

function selectAge(value) {
  preferences.age = value;
  showAgeSelector.value = false;
  savePreferences();
}

function selectRelationship(value) {
  preferences.relationship = value;
  showRelationshipSelector.value = false;
  savePreferences();
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
  
  // 同步更新localStorage中的毒舌模式状态，确保所有页面立即应用样式
  if (isSavageMode.value) {
    localStorage.setItem('soulnote_savage_mode', 'true');
  } else {
    localStorage.removeItem('soulnote_savage_mode');
  }
  
  logger.info('SETTINGS', '毒舌模式已切换为:', preferences.savageMode);
  savePreferences();
}

async function savePreferences() {
  try {
    // 调试：检查偏好设置对象中的数组
    console.log('保存偏好设置前检查:', preferences);
    
    // 保存前确保body的class与当前设置同步
    document.body.classList.toggle('savage-mode', preferences.savageMode);
    
    await saveUserPreferences(preferences);
    // 通知应用字体大小已经更新
    document.dispatchEvent(new CustomEvent('preferences-updated', {
      detail: { 
        fontSize: preferences.fontSize,
        savageMode: preferences.savageMode // 添加毒舌模式状态到事件
      }
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
  router.push('/privacy-policy');
}


function openAboutUs() {
  router.push('/about-us');
}

async function openCommunityPrompt() {
  try {
    // 获取社群配置
    const config = await communityService.getConfig();
    
    // 检查是否有更新日志
    if (config.updateLogs && Array.isArray(config.updateLogs)) {
      communityPromptData.updateLogs = config.updateLogs;
    }
    
    // 更新社群信息
    if (config.community) {
      communityPromptData.title = config.community.title || '星语心笺社群';
      communityPromptData.message = config.community.description || '';
      communityPromptData.qrcodeUrl = config.community.qrcode || '/assets/community-qr.png';
    }
    
    // 显示社群弹窗，默认显示更新日志标签页
    communityPromptData.activeTab = 'updates';
    showCommunityPrompt.value = true;
  } catch (error) {
    console.error('获取社群信息失败:', error);
    // 即使出错也显示弹窗，使用默认值
    showCommunityPrompt.value = true;
  }
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

// 错误捕获处理
onErrorCaptured((err, instance, info) => {
  logger.error('SETTINGS', `Error in settings page: ${err.toString()}, Info: ${info}`);
  errorMessage.value = '操作过程中发生错误，请稍后再试';
  return false; // 阻止错误继续传播
});

// 检查存储健康状态
async function checkStorage() {
  try {
    storageHealth.value = await checkStorageHealth();
  } catch (error) {
    logger.error('SETTINGS', '检查存储状态失败:', error);
    errorMessage.value = '检查存储状态失败';
  }
}

// 触发文件选择
function triggerFileInput() {
  if (backupFileInput.value) {
    backupFileInput.value.click();
  }
}

// 备份数据
async function backupData() {
  try {
    const backup = await backupUserData();
    if (backup) {
      // 创建并下载备份文件
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileName = `soul-note-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    }
  } catch (error) {
    logger.error('SETTINGS', '备份数据失败:', error);
    errorMessage.value = '备份数据失败';
  }
}

// 处理选择的备份文件
function handleBackupFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      restoreUserData(backup)
        .then(success => {
          if (success) {
            alert('数据恢复成功，将刷新页面应用更改。');
            window.location.reload();
          } else {
            alert('数据恢复失败，请检查备份文件是否有效。');
          }
        })
        .catch(error => {
          logger.error('SETTINGS', '恢复数据失败:', error);
          alert('恢复数据失败，请稍后再试。');
        });
    } catch (parseError) {
      logger.error('SETTINGS', '解析备份文件失败:', parseError);
      alert('无法解析备份文件，请确保文件格式正确。');
    }
  };
  
  reader.onerror = (error) => {
    logger.error('SETTINGS', '读取备份文件失败:', error);
    alert('读取备份文件失败，请稍后再试。');
  };
  
  reader.readAsText(file);
}

// 显示重置确认对话框
function confirmReset() {
  showResetConfirm.value = true;
}

// 重置所有数据
function resetData() {
  resetUserData()
    .then(success => {
      if (success) {
        showResetConfirm.value = false;
        alert('数据已重置，将返回首页。');
        router.push('/').catch(err => {
          logger.error('SETTINGS', '导航到首页失败:', err);
        });
      } else {
        alert('重置数据失败，请稍后再试。');
      }
    })
    .catch(error => {
      logger.error('SETTINGS', '重置数据失败:', error);
      alert('重置数据失败，请稍后再试。');
    });
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
    
    checkStorage().catch(error => {
      logger.error('SETTINGS', '挂载时检查存储状态失败:', error);
    });

    // 初始化社群弹窗数据
    try {
      const config = await communityService.getConfig();
      if (config.updateLogs && Array.isArray(config.updateLogs)) {
        communityPromptData.updateLogs = config.updateLogs;
      }
      if (config.community) {
        communityPromptData.qrcodeUrl = config.community.qrcode || '/assets/community-qr.png';
      }
    } catch (error) {
      logger.error('SETTINGS', '初始化社群数据失败:', error);
    }
    
    // 检查并打印当前激活的模式
    logger.info('SETTINGS', '当前模式设置', {
      darkMode: isDarkMode.value,
      savageMode: isSavageMode.value
    });
    logger.info('DOM', 'Body classes:', document.body.classList);

    // 在组件挂载时获取当前用户已验证的邀请码
    try {
      // 尝试获取已验证的邀请码
      const inviteResult = await getInviteCodeVerified();
      if (inviteResult.verified && inviteResult.code) {
        currentInviteCode.value = inviteResult.code;
      }
    } catch (error) {
      console.error('获取邀请码失败:', error);
    }
  } catch (error) {
    logger.error('SETTINGS', '加载用户偏好失败', error);
  }
});

// 添加新的onBeforeUnmount钩子
onBeforeUnmount(() => {
  // 在组件销毁时清除页面上的毒舌模式class，避免影响其他页面
  if (document.body.classList.contains('savage-mode') && !preferences.savageMode) {
    document.body.classList.remove('savage-mode');
    logger.info('SETTINGS', '组件卸载时移除毒舌模式class');
  }
});

// 监听偏好变化自动保存
watch(preferences, () => {
  savePreferences();
}, { deep: true });

// 生成并复制分享链接
async function generateShareLink() {
  if (isGeneratingLink.value) return;
  
  try {
    isGeneratingLink.value = true;
    
    // 如果没有当前邀请码，尝试获取
    if (!currentInviteCode.value) {
      const inviteResult = await getInviteCodeVerified();
      if (inviteResult.verified && inviteResult.code) {
        currentInviteCode.value = inviteResult.code;
      }
    }
    
    // 获取分享链接
    let shareLink;
    
    if (currentInviteCode.value) {
      shareLink = await getShareLinkWithInviteCode(currentInviteCode.value);
    } else {
      // 没有邀请码，使用默认链接
      shareLink = await getShareLinkWithInviteCode();
      console.log('未找到验证过的邀请码，使用默认分享链接');
    }
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(shareLink);
    
    // 显示成功提示
    showCopySuccess.value = true;
    
    console.log('成功复制分享链接:', shareLink);
  } catch (error) {
    console.error('复制分享链接失败:', error);
    alert('复制链接失败，请重试');
  } finally {
    isGeneratingLink.value = false;
  }
}

// 打开用户引导
function openUserGuide() {
  showUserGuide.value = true;
}
</script>

<style scoped>
.settings-page {
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
  position: relative;
  z-index: 10;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
  letter-spacing: 0.5px;
}

.placeholder {
  width: 24px;
}

.settings-content {
  padding: var(--spacing-md);
  background-color: var(--bg-color);
  overflow-y: auto;
}

.settings-section {
  margin-bottom: var(--spacing-xl);
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.settings-section:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.section-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  color: var(--primary-color);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  transition: all 0.2s ease;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.setting-item:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

.setting-label {
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
}

.setting-value {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.setting-value:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.setting-value i {
  margin-left: var(--spacing-sm);
  transition: transform 0.2s ease;
}

.setting-value:hover i {
  transform: translateX(2px);
}

.toggle-switch {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch span {
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
}

.toggle-switch span.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* 存储状态卡片 */
.storage-status {
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.storage-status:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 状态项目 */
.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
}

.status-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.status-label {
  color: var(--text-secondary);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.status-label i {
  margin-right: var(--spacing-xs);
  font-size: 1rem;
}

.status-value {
  font-weight: 600;
  font-size: 0.95rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.status-good {
  color: var(--success-color, #4caf50);
  background-color: rgba(76, 175, 80, 0.1);
}

.status-bad {
  color: var(--error-color, #f44336);
  background-color: rgba(244, 67, 54, 0.1);
}

/* 数据操作按钮行 */
.data-actions-row {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.data-actions-row .btn {
  flex: 1;
  min-width: 120px;
  justify-content: center;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.data-actions-row .btn-primary {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.data-actions-row .btn-primary:hover {
  background-color: var(--primary-dark, #5a7a68);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.data-actions-row .btn-secondary {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.data-actions-row .btn-secondary:hover {
  background-color: var(--border-color);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-actions-row .btn-danger {
  background-color: white;
  color: var(--error-color, #f44336);
  border-color: var(--error-color, #f44336);
}

.data-actions-row .btn-danger:hover {
  background-color: var(--error-color, #f44336);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .settings-section {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
  
  .data-actions-row {
    flex-direction: column;
  }
  
  .data-actions-row .btn {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
  
  .modal-content {
    padding: var(--spacing-md);
    width: 95%;
    max-height: 85vh;
  }
  
  .modal-body {
    max-height: 65vh;
  }
  
  .status-label, .status-value {
    font-size: 0.85rem;
  }
  
  .settings-item-header h3 {
    font-size: 1rem;
  }
  
  .settings-desc {
    font-size: 0.85rem;
  }
  
  .data-action-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .setting-item {
    padding: var(--spacing-sm) 0;
  }
  
  .setting-label {
    font-size: 14px;
  }
  
  .zodiac-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mbti-buttons {
    grid-template-columns: 1fr;
  }
  
  .relationship-options {
    grid-template-columns: 1fr;
  }
  
  .gender-options {
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .gender-option {
    width: 70px;
    margin-bottom: var(--spacing-sm);
  }
  
  .age-options {
    grid-template-columns: 1fr;
  }
}

/* 平板设备适配 */
@media (min-width: 481px) and (max-width: 768px) {
  .modal-content {
    max-width: 400px;
  }
  
  .modal-body {
    max-height: 70vh;
  }
  
  .zodiac-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .gender-options {
    flex-wrap: wrap;
  }
}

/* 确保滚动条样式美观 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 危险区域 */
.danger-zone {
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  position: relative;
}

.danger-zone::before {
  content: "⚠️";
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--card-bg);
  padding: 0 var(--spacing-sm);
  font-size: 1.2rem;
}

.warning-text {
  color: var(--error-color, #f44336);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(244, 67, 54, 0.05);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--error-color, #f44336);
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.modal-content {
  position: relative;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
}

.modal-body {
  overflow-y: auto;
  padding: 0 var(--spacing-sm) var(--spacing-sm) var(--spacing-sm);
  flex: 1;
  max-height: 60vh;
}

.modal-content h3 {
  margin-top: 0;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.modal-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

/* 按钮样式 */
.btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  color: var(--primary-color);
  background-color: rgba(123, 158, 137, 0.15);
  transform: rotate(15deg);
}

.btn-icon:active {
  transform: scale(0.95) rotate(15deg);
}

/* 设置项标题 */
.settings-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.settings-item-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.settings-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: 14px;
  line-height: 1.6;
}

/* 错误消息 */
.error-message {
  background-color: var(--error-bg, #ffebee);
  color: var(--error-color, #f44336);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.15);
  animation: shake 0.5s ease;
  border-left: 4px solid var(--error-color, #f44336);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.close-btn {
  background: none;
  border: none;
  color: var(--error-color, #f44336);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
  transform: scale(1.1);
}

/* 统一所有选项的字体样式 */
.gender-option span,
.age-option span,
.relationship-option span,
.zodiac-item span,
.mbti-code,
.mbti-name,
.modal-content p,
.modal-header h3,
.modal-content h3,
.group-title {
  font-size: 14px;
  line-height: 1.5;
}

.gender-option span,
.age-option span,
.relationship-option span,
.zodiac-item span,
.mbti-code {
  font-weight: 500;
}

.mbti-name {
  font-size: 12px;
  font-weight: 400;
}

.modal-header h3,
.modal-content h3,
.group-title {
  font-weight: 600;
}

/* 图标大小统一 */
.gender-option i,
.relationship-option i,
.zodiac-item i {
  font-size: 20px;
}

/* 性别选择样式 */
.gender-options {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  max-width: 100%;
  margin: 0 auto;
}

.gender-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 80px;
  height: 80px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.gender-option i {
  font-size: 20px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.gender-option span {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.gender-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.gender-option.active i {
  color: white;
}

.gender-option:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 年龄选择样式 */
.age-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  max-width: 100%;
  margin: 0 auto;
}

.age-option {
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.age-option span {
  font-size: 14px;
  font-weight: 500;
}

.age-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.age-option:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 婚恋状况选择样式 */
.relationship-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  max-width: 100%;
  margin: 0 auto;
}

.relationship-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 80px;
}

.relationship-option i {
  font-size: 20px;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.relationship-option span {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.relationship-option.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.relationship-option.active i {
  color: white;
}

.relationship-option:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 星座选择样式 */
.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  max-width: 100%;
}

.zodiac-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  height: 80px;
}

.zodiac-item i {
  font-size: 20px;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.zodiac-item span {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.zodiac-item.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.zodiac-item.active i {
  color: white;
}

.zodiac-item:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* MBTI选择样式 */
.mbti-selection {
  max-width: 100%;
}

.mbti-group {
  margin-bottom: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.02);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
}

.group-title {
  font-size: 14px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-xs);
}

.mbti-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xs);
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
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 70px;
}

.mbti-code {
  font-weight: 600;
  font-size: 14px;
}

.mbti-name {
  font-size: 12px;
  margin-top: var(--spacing-xs);
  font-weight: 400;
}

.mbti-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mbti-button:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.app-version {
  text-align: center;
  margin-top: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 14px;
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-md);
}

/* 设置开关样式 */
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
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
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
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .switch-label {
  background-color: var(--primary-color);
}

input:checked + .switch-label::after {
  transform: translateX(24px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@media (max-width: 480px) {
  .zodiac-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mbti-buttons {
    grid-template-columns: 1fr;
  }
  
  .relationship-options {
    grid-template-columns: 1fr;
  }
  
  .gender-options {
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .gender-option, .relationship-option, .zodiac-item {
    height: 70px;
  }
  
  .age-option {
    height: 40px;
  }
  
  .mbti-button {
    height: 60px;
  }
}

/* 平板设备适配 */
@media (min-width: 481px) and (max-width: 768px) {
  .modal-content {
    max-width: 450px;
  }
  
  .modal-body {
    max-height: 70vh;
  }
}

/* 复制成功提示样式 */
.copy-success-toast {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--success-color-light);
  color: var(--success-color);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 1000;
  display: flex;
  align-items: center;
  animation: toast-fade 3s ease-in-out;
}

.copy-success-toast i {
  margin-right: 8px;
}

@keyframes toast-fade {
  0%, 20% {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  30%, 70% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
}
</style>
