<template>
  <div class="admin-form-section">
    <div class="form-group" style="margin-top: 15px;">
      <label class="label-bold">🔑 请输入管理员安全密码</label>
      <input
        type="password"
        v-model="adminPassword"
        placeholder="请输入管理员授权密钥..."
        required
        style="width: 100%; margin-top: 10px;"
      />
    </div>
    <div v-if="adminError" class="warning-text" style="margin-top: 10px;">
      <span v-if="lockoutTime > 0">⚠️ 密码错误次数过多！请在 {{ lockoutTime }} 秒后重试。</span>
      <span v-else>⚠️ 密钥校验失败，密码输入错误！</span>
    </div>
    <button 
      @click="handleAdminSubmit" 
      :disabled="lockoutTime > 0"
      class="btn btn-secondary glow-cyan" 
      style="width: 100%; padding: 12px; margin-top: 24px; font-weight: 700;"
    >
      <span v-if="lockoutTime > 0">🔐 安全锁定中 ({{ lockoutTime }}s)</span>
      <span v-else>✅ 验证并进入管理员面板</span>
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
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.label-bold { font-size: 12.5px; font-weight: bold; }
.form-group input {
  background-color: rgba(0,0,0,0.3); border: 1px solid var(--border-color);
  color: var(--text-primary); border-radius: 6px; padding: 8px 12px; font-size: 13px;
  box-sizing: border-box;
}
.form-group input:focus { outline: none; border-color: var(--accent-cyan); }
.warning-text { color: #f87171; font-size: 11px; margin-bottom: 6px; font-weight: bold; }
</style>
