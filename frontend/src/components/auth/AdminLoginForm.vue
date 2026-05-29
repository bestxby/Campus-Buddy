<template>
  <div class="admin-form-section">
    <!-- Password Input Field -->
    <div class="form-group" style="margin-top: 20px;">
      <div class="label-row">
        <label class="label-bold">
          <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px; color: var(--accent-cyan);">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          请输入管理员安全密码
        </label>
        
        <!-- Security Badge Indicator -->
        <div class="security-badge" :class="{ 'badge-locked': lockoutTime > 0 }">
          <span class="badge-icon" style="display: inline-flex; align-items: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </span>
          <span class="badge-text">{{ lockoutTime > 0 ? '安全锁定中' : '双因子认证' }}</span>
        </div>
      </div>
      
      <input
        type="password"
        v-model="adminPassword"
        placeholder="请输入管理员授权密钥..."
        required
        class="admin-password-input"
        @keyup.enter="handleAdminSubmit"
      />
    </div>

    <!-- Error/Warning Messages -->
    <div v-if="adminError" class="warning-text" style="margin-top: 10px;">
      <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <span v-if="lockoutTime > 0">密码错误次数过多！请在 {{ lockoutTime }} 秒后重试。</span>
      <span v-else>密钥校验失败，密码输入错误！</span>
    </div>

    <!-- Submit Button -->
    <button 
      @click="handleAdminSubmit" 
      :disabled="lockoutTime > 0"
      class="btn btn-secondary glow-cyan submit-btn" 
    >
      <span v-if="lockoutTime > 0" class="btn-content">
        <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -1px;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        安全锁定中 ({{ lockoutTime }}s)
      </span>
      <span v-else class="btn-content">
        <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -1px;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        验证并进入管理员面板
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { submitAdminLogin } from '@/composables/useAuth'

const emit = defineEmits<{ submitted: [] }>()

const adminPassword = ref('')
const adminError    = ref(false)
const failedAttempts = ref(0)
const lockoutTime   = ref(0)
let cooldownTimer: any = null

const handleAdminSubmit = async () => {
  if (lockoutTime.value > 0) return

  const success = await submitAdminLogin(adminPassword.value)
  if (success) {
    adminError.value = false
    failedAttempts.value = 0
    emit('submitted')
  } else {
    adminError.value = true
    failedAttempts.value++
    if (failedAttempts.value >= 3) {
      lockoutTime.value = 15
      if (cooldownTimer) clearInterval(cooldownTimer)
      cooldownTimer = setInterval(() => {
        lockoutTime.value--
        if (lockoutTime.value <= 0) {
          clearInterval(cooldownTimer)
          failedAttempts.value = 0
        }
      }, 1000)
    }
  }
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<style scoped>
.admin-form-section {
  text-align: left;
}
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.security-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(6, 182, 212, 0.05);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  color: #67e8f9;
  font-weight: 600;
  transition: all 0.3s ease;
}
.security-badge.badge-locked {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.25);
  color: #f87171;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
}
.label-bold {
  font-size: 12.5px;
  font-weight: bold;
  color: var(--text-primary);
}
.admin-password-input {
  background-color: rgba(0, 0, 0, 0.45);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0 14px;
  font-size: 13px;
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.admin-password-input:focus {
  outline: none !important;
  border-color: var(--accent-cyan) !important;
  background-color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.15);
}
.warning-text {
  color: #f87171;
  font-size: 11px;
  margin-bottom: 6px;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.submit-btn {
  width: 100%;
  padding: 12px;
  margin-top: 24px;
  font-weight: 700;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 13px;
}
.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
