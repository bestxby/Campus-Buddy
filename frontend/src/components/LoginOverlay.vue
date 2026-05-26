<template>
  <div class="login-overlay fade-in">
    <!-- Loading animation (shown after submit, before dashboard) -->
    <LoginLoadingScreen
      v-if="loadingPayload"
      :name="loadingPayload.name"
      :avatar="loadingPayload.avatar"
      :interests="loadingPayload.interests"
      @done="onLoadingDone"
    />

    <!-- Normal login card (hidden during loading) -->
    <div
      v-show="!loadingPayload"
      class="login-card card"
      :class="activeTab === 'student' ? 'glow-orange student-card-width' : 'glow-cyan admin-card-width'"
    >
      <div class="logo">
        <span class="icon">{{ activeTab === 'student' ? '🧭' : '🛡️' }}</span>
        <h1>{{ activeTab === 'student' ? 'Campus Buddy 校园社交图谱与活动搭子推荐' : '管理员安全认证' }}</h1>
      </div>

      <!-- Role Tab Toggles -->
      <div class="login-tabs">
        <button
          type="button"
          class="login-tab-btn"
          :class="{ 'tab-active': activeTab === 'student' }"
          @click="activeTab = 'student'"
        >
          👤 学生登录入口
        </button>
        <button
          type="button"
          class="login-tab-btn"
          :class="{ 'tab-active-admin': activeTab === 'admin' }"
          @click="activeTab = 'admin'"
        >
          🛡️ 管理员控制台
        </button>
      </div>

      <!-- Forms wrapper -->
      <StudentLoginForm v-if="activeTab === 'student'" @loading-start="onLoadingStart" />
      <AdminLoginForm v-else @submitted="handleSubmitted" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StudentLoginForm from '@/components/auth/StudentLoginForm.vue'
import AdminLoginForm from '@/components/auth/AdminLoginForm.vue'
import LoginLoadingScreen from '@/components/auth/LoginLoadingScreen.vue'
import { submitRegistration } from '@/composables/useAuth'

const emit = defineEmits<{ submitted: [] }>()

const activeTab = ref<'student' | 'admin'>('student')

interface LoadingPayload { name: string; avatar: string; interests: string[] }
const loadingPayload = ref<LoadingPayload | null>(null)

const onLoadingStart = (payload: LoadingPayload) => {
  loadingPayload.value = payload
}

const onLoadingDone = () => {
  // Animation finished — now commit auth state and proceed to dashboard
  submitRegistration()
  loadingPayload.value = null
  emit('submitted')
}

const handleSubmitted = () => {
  emit('submitted')
}
</script>


<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(11, 15, 25, 0.96);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.login-card {
  max-width: 100%;
  padding: 16px 24px;
  background-color: var(--panel-bg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  max-height: 95vh;
  overflow-y: auto;
  transition: width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.35s ease, border-color 0.35s ease;
  border-radius: 8px;
}
.student-card-width {
  width: 750px;
}
.admin-card-width {
  width: 400px;
}
.login-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}
.login-tab-btn {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
}
.login-tab-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
.tab-active {
  background-color: rgba(253, 151, 31, 0.1) !important;
  border-color: rgba(253, 151, 31, 0.4) !important;
  color: #ffb74d !important;
  box-shadow: 0 0 10px rgba(253, 151, 31, 0.1);
}
.tab-active-admin {
  background-color: rgba(6, 182, 212, 0.1) !important;
  border-color: rgba(6, 182, 212, 0.4) !important;
  color: #22d3ee !important;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
}
.logo { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.logo .icon { font-size: 24px; }
.logo h1 { font-size: 15px; font-weight: 800; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 10px; text-align: left; }
</style>
