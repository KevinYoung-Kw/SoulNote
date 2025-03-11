<template>
    <transition name="fade">
      <div v-if="visible" class="community-modal" @click.self="handleOutsideClick">
        <div class="community-container" :class="{ 'compact': compact }">
          <div class="community-header">
            <h3>{{ title || '加入星语心笺社群' }}</h3>
            <button class="close-btn" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="community-content">
            <div class="community-message">
              <p v-if="message" class="main-message">{{ message }}</p>
              <p v-else class="main-message">
                作为一名独立开发者，每一位用户的反馈对我都非常重要。加入社群，您可以：
              </p>
              
              <ul class="benefit-list">
                <li><i class="fas fa-star"></i> 第一时间获取新功能通知</li>
                <li><i class="fas fa-lightbulb"></i> 提出建议直接影响产品迭代</li>
                <li><i class="fas fa-comments"></i> 与其他用户交流使用心得</li>
              </ul>
            </div>
            
            <div class="qrcode-container">
              <div class="qrcode-wrap">
                <img :src="qrcodeUrl" alt="社群二维码" class="qrcode-image" />
              </div>
              <p class="qrcode-tip">扫码加入{{ title || '星语心笺社群' }}</p>
            </div>
            
            <div class="action-area" v-if="!compact">
              <button class="remind-later-btn" @click="remindLater">稍后提醒</button>
              <button class="close-btn-text" @click="neverRemind">不再提醒</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits, onMounted } from 'vue';
  import { saveUserPreferences } from '../services/storageService';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    qrcodeUrl: {
      type: String,
      default: '/assets/community-qr.png'
    },
    compact: {
      type: Boolean,
      default: false
    },
    allowClose: {
      type: Boolean,
      default: true
    }
  });
  
  const emit = defineEmits(['close', 'later', 'never']);
  
  function close() {
    if (props.allowClose) {
      emit('close');
    }
  }
  
  function remindLater() {
    // 设置7天后再次提醒
    const nextRemindDate = new Date();
    nextRemindDate.setDate(nextRemindDate.getDate() + 7);
    
    saveUserPreferences({
      communityRemindAt: nextRemindDate.toISOString()
    });
    
    emit('later');
  }
  
  function neverRemind() {
    saveUserPreferences({
      neverRemindCommunity: true
    });
    
    emit('never');
  }
  
  function handleOutsideClick() {
    if (props.allowClose) {
      close();
    }
  }
  </script>
  
  <style scoped>
  .community-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
  }
  
  .community-container {
    background-color: var(--bg-color);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 460px;
    overflow: hidden;
    animation: slide-up 0.3s ease;
  }
  
  .community-container.compact {
    max-width: 360px;
  }
  
  .community-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .community-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--primary-color);
  }
  
  .close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
  }
  
  .close-btn:hover {
    background-color: var(--hover-color);
    color: var(--text-color);
  }
  
  .community-content {
    padding: var(--spacing-lg);
  }
  
  .community-message {
    margin-bottom: var(--spacing-lg);
  }
  
  .main-message {
    font-size: 15px;
    line-height: 1.5;
    margin-top: 0;
    margin-bottom: var(--spacing-md);
  }
  
  .benefit-list {
    padding-left: var(--spacing-lg);
    margin: var(--spacing-md) 0;
  }
  
  .benefit-list li {
    margin-bottom: var(--spacing-sm);
    font-size: 14px;
  }
  
  .benefit-list i {
    color: var(--primary-color);
    margin-right: var(--spacing-xs);
  }
  
  .qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: var(--spacing-lg) 0;
  }
  
  .qrcode-wrap {
    background-color: white;
    padding: 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
  }
  
  .qrcode-image {
    width: 160px;
    height: 160px;
    object-fit: contain;
  }
  
  .compact .qrcode-image {
    width: 140px;
    height: 140px;
  }
  
  .qrcode-tip {
    margin-top: var(--spacing-md);
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .action-area {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-lg);
  }
  
  .remind-later-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    font-size: 14px;
    cursor: pointer;
  }
  
  .close-btn-text {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  @keyframes slide-up {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    .community-container {
      max-width: 100%;
    }
    
    .qrcode-image {
      width: 140px;
      height: 140px;
    }
  }
  </style>