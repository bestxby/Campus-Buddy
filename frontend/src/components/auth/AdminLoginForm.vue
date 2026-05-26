<template>
  <div class="admin-form-section">
    <div class="form-group" style="margin-top: 15px;">
      <label class="label-bold">🛡️ 请输入管理员安全密码</label>
      <input
        type="password"
        v-model="adminPassword"
        placeholder="请输入管理员授权密钥..."
        required
        style="width: 100%; margin-top: 10px;"
      />
    </div>
    <div v-if="adminError" class="warning-text" style="margin-top: 10px;">
      ⚠️ 密钥校验失败，密码输入错误！
    </div>
    <button 
      @click="handleAdminSubmit" 
      class="btn btn-secondary glow-cyan" 
      style="width: 100%; padding: 12px; margin-top: 24px; font-weight: 700;"
    >
      ✅ 验证并进入管理员面板
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { submitAdminLogin } from '@/composables/useAuth'

const emit = defineEmits<{ submitted: [] }>()

const adminPassword = ref('')
const adminError    = ref(false)

const handleAdminSubmit = async () => {
  const success = await submitAdminLogin(adminPassword.value)
  if (success) {
    adminError.value = false
    emit('submitted')
  } else {
    adminError.value = true
  }
}
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
