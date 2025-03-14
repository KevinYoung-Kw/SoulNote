<template>
  <OnboardingStep
    title="欢迎内测"
    description="请输入您的邀请码继续使用"
  >
    <div class="invite-code-container">
      <div class="invite-code-input">
        <input 
          type="text" 
          v-model="inviteCode" 
          placeholder="请输入邀请码"
          :class="{ 'error': inviteCodeError, 'verified': inviteCodeVerified }"
          :disabled="inviteCodeVerified"
        />
        <p class="error-message" v-if="inviteCodeError">{{ inviteCodeErrorMessage }}</p>
        <p class="success-message" v-if="inviteCodeVerified">邀请码已验证 ✓</p>
      </div>
      <button 
        v-if="!inviteCodeVerified"
        class="btn verify-btn" 
        :class="{ 'btn-primary': !isVerifying, 'btn-disabled': isVerifying }" 
        @click="verifyInviteCode"
        :disabled="isVerifying || !inviteCode"
      >
        <span v-if="!isVerifying">验证</span>
        <span v-else><i class="fas fa-spinner fa-spin"></i></span>
      </button>
      <button 
        v-else
        class="btn btn-success verify-btn"
        disabled
      >
        <i class="fas fa-check"></i> 已验证
      </button>
    </div>
    
    <div class="invite-code-info">
      <p>
        <i class="fas fa-info-circle"></i> 
        内测期间需要邀请码才能使用本应用。如需获取邀请码，请点赞我们的社交媒体账号：小红书@水的离子积（AIGC产品），点赞并收藏第一条内容，私信获得邀请码～
      </p>
    </div>
  </OnboardingStep>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import OnboardingStep from '../OnboardingStep.vue';
import { setInviteCodeVerified } from '../../../services/storageService';

const props = defineProps({
  initialInviteCode: {
    type: String,
    default: ''
  },
  initialVerified: {
    type: Boolean,
    default: false
  },
  apiBaseUrl: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['verify-success', 'verify-error']);

const inviteCode = ref(props.initialInviteCode);
const inviteCodeVerified = ref(props.initialVerified);
const isVerifying = ref(false);
const inviteCodeError = ref(false);
const inviteCodeErrorMessage = ref('');

async function verifyInviteCode() {
  if (!inviteCode.value || isVerifying.value) return;
  
  try {
    isVerifying.value = true;
    inviteCodeError.value = false;
    
    // 获取客户端IP (可选，如果后端能获取，则不需要这一步)
    let clientIP = '';
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIP = ipResponse.data.ip;
    } catch (error) {
      console.warn('无法获取客户端IP:', error);
    }
    
    // 调用验证API
    const response = await axios.post(`${props.apiBaseUrl}/api/verify-invite-code`, {
      inviteCode: inviteCode.value,
      clientIP
    });
    
    if (response.data.valid) {
      // 设置验证状态
      await setInviteCodeVerified(inviteCode.value, true);
      inviteCodeVerified.value = true;
      emit('verify-success');
    } else {
      inviteCodeError.value = true;
      inviteCodeErrorMessage.value = response.data.message || '邀请码无效或已过期';
      emit('verify-error', inviteCodeErrorMessage.value);
    }
  } catch (error) {
    console.error('验证邀请码失败:', error);
    inviteCodeError.value = true;
    inviteCodeErrorMessage.value = '网络错误，请稍后再试';
    emit('verify-error', inviteCodeErrorMessage.value);
  } finally {
    isVerifying.value = false;
  }
}

defineExpose({
  inviteCodeVerified,
  inviteCode,
  verifyInviteCode
});
</script>

<style scoped>
.invite-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  width: 100%;
}

.invite-code-input {
  width: 100%;
  position: relative;
}

.invite-code-input input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  letter-spacing: 2px;
  font-family: monospace;
  transition: border-color var(--transition-fast);
}

.invite-code-input input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.invite-code-input input.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 14px;
  margin-top: var(--spacing-sm);
  text-align: center;
}

.verify-btn {
  width: 100%;
  margin-top: var(--spacing-sm);
}

.btn-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.invite-code-info {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-md);
  background-color: rgba(123, 158, 137, 0.1);
  border-radius: var(--radius-md);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.invite-code-info p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
}

.invite-code-info i {
  color: var(--primary-color);
  margin-right: var(--spacing-sm);
  margin-top: 3px;
}

.invite-code-input input.verified {
  border-color: var(--success-color);
  background-color: rgba(76, 175, 80, 0.05);
}

.success-message {
  color: var(--success-color);
  font-size: 14px;
  margin-top: var(--spacing-xs);
}

@media (max-width: 480px) {
  .invite-code-container {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .invite-code-input input {
    font-size: 16px;
    padding: var(--spacing-sm);
    letter-spacing: 1px;
  }
  
  .invite-code-info {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-sm);
  }
  
  .invite-code-info p {
    font-size: 13px;
  }
}
</style> 