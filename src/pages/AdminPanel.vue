<template>
  <div class="admin-panel fixed-page-layout">
    <div class="admin-header fixed-header">
      <div class="header-content">
        <h1>星语心笺管理面板</h1>
        <button v-if="isAuthenticated" class="btn btn-small btn-danger" @click="logout">
          <i class="fas fa-sign-out-alt"></i> 退出
        </button>
      </div>
    </div>
    
    <div class="admin-content scrollable-content">
      <!-- 未认证状态：登录表单 -->
      <div v-if="!isAuthenticated" class="login-container">
        <div class="login-box">
          <h2><i class="fas fa-lock"></i> 管理员登录</h2>
          <p class="login-subtitle">请输入管理密钥继续操作</p>
          
          <div class="form-group">
            <label for="adminKey">管理密钥</label>
            <input 
              type="password" 
              id="adminKey" 
              v-model="adminKey"
              placeholder="请输入管理密钥"
              :class="{ 'error': loginError }"
              @keyup.enter="authenticate"
            />
            <p class="error-message" v-if="loginError">{{ loginErrorMessage }}</p>
          </div>
          
          <button 
            class="btn btn-primary login-btn" 
            :class="{ 'btn-disabled': isAuthenticating }"
            :disabled="isAuthenticating || !adminKey"
            @click="authenticate"
          >
            <span v-if="!isAuthenticating">登录</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> 验证中</span>
          </button>
        </div>
      </div>
      
      <!-- 已认证状态：管理面板内容 -->
      <div v-else class="admin-panel-content">
        <!-- 数据概览卡片 -->
        <div class="stats-overview">
          <div class="stat-card">
            <h3>总验证次数</h3>
            <div class="stat-number">{{ systemStats.totalVerifications || 0 }}</div>
            <p class="stat-desc">邀请码验证总次数</p>
          </div>
          
          <div class="stat-card">
            <h3>唯一用户数</h3>
            <div class="stat-number">{{ systemStats.totalUniqueUsers || 0 }}</div>
            <p class="stat-desc">基于IP统计的唯一用户</p>
          </div>
          
          <div class="stat-card">
            <h3>邀请码数量</h3>
            <div class="stat-number">{{ inviteCodes.length }}</div>
            <p class="stat-desc">已创建的邀请码总数</p>
          </div>
        </div>
        
        <!-- 邀请码管理 -->
        <div class="panel-section">
          <div class="section-header">
            <h2>邀请码管理</h2>
            <button class="btn btn-success" @click="showCreateCodeModal = true">
              <i class="fas fa-plus"></i> 生成邀请码
            </button>
          </div>
          
          <div class="invite-codes-container">
            <div v-if="isLoading" class="loading-container">
              <i class="fas fa-spinner fa-spin"></i> 正在加载数据...
            </div>
            
            <div v-else-if="inviteCodes.length === 0" class="empty-state">
              <i class="fas fa-ticket-alt empty-icon"></i>
              <p>暂无邀请码数据</p>
              <button class="btn btn-primary" @click="showCreateCodeModal = true">
                生成第一个邀请码
              </button>
            </div>
            
            <table v-else class="data-table">
              <thead>
                <tr>
                  <th>邀请码</th>
                  <th>使用次数</th>
                  <th>使用上限</th>
                  <th>使用IP数</th>
                  <th>创建时间</th>
                  <th>最后使用</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="code in inviteCodes" :key="code.code">
                  <td>
                    <div class="code-value">{{ code.code }}</div>
                    <button 
                      class="btn-icon copy-btn" 
                      title="复制邀请码" 
                      @click="copyCode(code.code)"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </td>
                  <td>{{ code.usedCount }}</td>
                  <td>{{ code.maxUses }}</td>
                  <td>{{ code.uniqueIPs }}</td>
                  <td>{{ formatDate(code.createdAt) }}</td>
                  <td>{{ code.lastUsed ? formatDate(code.lastUsed) : '未使用' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 数据统计图表（可选，如果需要可以添加） -->
        <div class="panel-section">
          <h2>用户增长趋势</h2>
          <p class="coming-soon">图表功能即将上线</p>
          <!-- 这里可以使用Chart.js等库添加可视化图表 -->
        </div>

        <!-- 底部更新时间信息 -->
        <div class="last-updated">
          数据更新时间: {{ systemStats.lastUpdated ? formatDate(systemStats.lastUpdated, true) : '未知' }}
          <button class="refresh-btn" @click="fetchData">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 创建邀请码的模态窗口 -->
    <div v-if="showCreateCodeModal" class="modal-overlay" @click.self="showCreateCodeModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>生成新邀请码</h3>
          <button class="close-btn" @click="showCreateCodeModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="codePrefix">前缀 (可选)</label>
            <input type="text" id="codePrefix" v-model="newCodePrefix" placeholder="如: SOUL" />
            <p class="form-help">添加一个有意义的前缀，便于识别不同批次的邀请码</p>
          </div>
          
          <div class="form-group">
            <label for="maxUses">使用次数上限</label>
            <input type="number" id="maxUses" v-model="newCodeMaxUses" min="1" placeholder="默认: 100" />
            <p class="form-help">设置此邀请码最多可以被使用的次数</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateCodeModal = false">取消</button>
          <button 
            class="btn btn-primary"
            :class="{ 'btn-disabled': isGenerating }"
            :disabled="isGenerating"
            @click="generateInviteCode"
          >
            <span v-if="!isGenerating">生成邀请码</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> 生成中</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 成功提示 -->
    <div v-if="successMessage" class="toast-container">
      <div class="toast toast-success">
        <i class="fas fa-check-circle"></i>
        <span>{{ successMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';

// 获取API基础URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// 认证相关状态
const adminKey = ref('');
const isAuthenticated = ref(false);
const isAuthenticating = ref(false);
const loginError = ref(false);
const loginErrorMessage = ref('');

// 数据相关状态
const systemStats = reactive({
  totalVerifications: 0,
  totalUniqueUsers: 0,
  lastUpdated: null
});
const inviteCodes = ref([]);
const isLoading = ref(false);
const isRefreshing = ref(false);

// 创建邀请码相关状态
const showCreateCodeModal = ref(false);
const newCodePrefix = ref('');
const newCodeMaxUses = ref(100);
const isGenerating = ref(false);

// 提示消息状态
const successMessage = ref('');

// 在组件挂载时，检查是否已存在认证信息
onMounted(() => {
  const savedKey = localStorage.getItem('soul-note-admin-key');
  if (savedKey) {
    adminKey.value = savedKey;
    authenticate();
  }
});

// 认证函数
async function authenticate() {
  if (!adminKey.value) return;
  
  try {
    isAuthenticating.value = true;
    loginError.value = false;
    
    // 调用统计API验证管理密钥
    const response = await axios.get(`${API_BASE_URL}/api/stats?key=${adminKey.value}`);
    
    // 如果能成功获取数据，则认证成功
    if (response.data) {
      isAuthenticated.value = true;
      // 保存密钥到本地存储（仅为方便，实际应用中要谨慎考虑安全性）
      localStorage.setItem('soul-note-admin-key', adminKey.value);
      // 加载数据
      processStatsData(response.data);
    }
  } catch (error) {
    console.error('认证失败:', error);
    loginError.value = true;
    if (error.response && error.response.status === 401) {
      loginErrorMessage.value = '管理密钥无效';
    } else {
      loginErrorMessage.value = '网络错误，请稍后再试';
    }
  } finally {
    isAuthenticating.value = false;
  }
}

// 注销函数
function logout() {
  isAuthenticated.value = false;
  localStorage.removeItem('soul-note-admin-key');
  adminKey.value = '';
}

// 格式化日期函数
function formatDate(dateString, includeTime = false) {
  if (!dateString) return '未知';
  
  try {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
    }
    
    return new Intl.DateTimeFormat('zh-CN', options).format(date);
  } catch (error) {
    return dateString;
  }
}

// 处理统计数据
function processStatsData(data) {
  // 处理系统统计数据
  if (data.systemStats) {
    systemStats.totalVerifications = data.systemStats.totalVerifications || 0;
    systemStats.totalUniqueUsers = data.systemStats.totalUniqueUsers || 0;
    systemStats.lastUpdated = data.systemStats.lastUpdated;
  }
  
  // 处理邀请码数据
  if (data.inviteCodeStats) {
    inviteCodes.value = data.inviteCodeStats || [];
  }
}

// 获取数据函数
async function fetchData() {
  if (!isAuthenticated.value || !adminKey.value) return;
  
  try {
    isLoading.value = true;
    isRefreshing.value = true;
    
    const response = await axios.get(`${API_BASE_URL}/api/stats?key=${adminKey.value}`);
    processStatsData(response.data);
    
  } catch (error) {
    console.error('获取数据失败:', error);
    if (error.response && error.response.status === 401) {
      // 认证失效
      isAuthenticated.value = false;
      localStorage.removeItem('soul-note-admin-key');
    }
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
}

// 生成邀请码函数
async function generateInviteCode() {
  if (isGenerating.value || !adminKey.value) return;
  
  try {
    isGenerating.value = true;
    
    const response = await axios.post(`${API_BASE_URL}/api/generate-invite-code`, {
      adminKey: adminKey.value,
      maxUses: newCodeMaxUses.value,
      prefix: newCodePrefix.value || undefined
    });
    
    if (response.data && response.data.success) {
      // 生成成功，关闭模态框并刷新数据
      showCreateCodeModal.value = false;
      newCodePrefix.value = '';
      newCodeMaxUses.value = 100;
      
      // 显示成功消息
      successMessage.value = `邀请码 ${response.data.inviteCode} 生成成功`;
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
      
      // 刷新数据
      await fetchData();
    }
  } catch (error) {
    console.error('生成邀请码失败:', error);
  } finally {
    isGenerating.value = false;
  }
}

// 复制邀请码到剪贴板
function copyCode(code) {
  navigator.clipboard.writeText(code)
    .then(() => {
      successMessage.value = '邀请码已复制到剪贴板';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
}
</script>

<style scoped>
.admin-panel {
  background-color: var(--bg-color);
}

.admin-header {
  background-color: var(--primary-color);
  padding: var(--spacing-md) var(--spacing-lg);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.admin-content {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

/* 登录表单样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: var(--spacing-xl) var(--spacing-md);
}

.login-box {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.login-box h2 {
  margin-top: 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.login-subtitle {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group input.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 14px;
  margin-top: var(--spacing-sm);
}

.login-btn {
  width: 100%;
  margin-top: var(--spacing-md);
}

/* 管理面板内容样式 */
.admin-panel-content {
  margin-top: var(--spacing-lg);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-card h3 {
  margin-top: 0;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color);
  margin: var(--spacing-md) 0;
}

.stat-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 0;
}

.panel-section {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* 数据表格样式 */
.invite-codes-container {
  overflow-x: auto;
  margin-bottom: var(--spacing-md);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.02);
  color: var(--text-secondary);
}

.data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.code-value {
  font-family: monospace;
  font-weight: 600;
  display: inline-block;
  margin-right: var(--spacing-sm);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  color: var(--primary-color);
  background-color: rgba(0, 0, 0, 0.05);
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.3;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-secondary);
}

.loading-container i {
  margin-right: var(--spacing-sm);
}

/* 最后更新时间信息 */
.last-updated {
  text-align: right;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xl);
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-color);
  padding: 4px 8px;
  margin-left: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 模态窗口样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 50%;
  height: 30px;
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.form-help {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: var(--spacing-xs);
  margin-bottom: 0;
}

/* 提示消息样式 */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1001;
}

.toast {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  animation: slideIn 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
  max-width: 350px;
}

.toast-success {
  background-color: rgba(46, 204, 113, 0.9);
  color: white;
}

.coming-soon {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-xl);
  font-style: italic;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .panel-section {
    padding: var(--spacing-md);
  }
  
  .data-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: var(--spacing-sm);
  }
}
</style>
