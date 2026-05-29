<template>
  <div class="login-overlay fade-in">
    <!-- Loading animation (shown after submit, before dashboard) -->
    <LoginLoadingScreen
      v-if="loadingPayload"
      :name="loadingPayload.name"
      :avatar="loadingPayload.avatar"
      :interests="loadingPayload.interests"
      :is-admin="loadingPayload.isAdmin"
      @done="onLoadingDone"
    />

    <!-- Normal login card (hidden during loading) -->
    <div
      v-show="!loadingPayload"
      class="login-card card"
      :class="activeTab === 'student' ? 'glow-orange student-card-width' : 'glow-cyan admin-card-width'"
    >
      <!-- Redesigned Premium Logo Banner -->
      <div class="login-logo-banner">
        <div class="logo-main-group">
          <div class="login-logo-icon">
            <svg class="icon-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" stroke="var(--accent-neon-cyan)" stroke-width="1.5"></circle>
              <!-- Needle split into two halves for a premium 3D neon compass effect -->
              <polygon points="12,12 16.24,7.76 14.12,14.12" fill="var(--accent-neon-pink)" stroke="var(--accent-neon-pink)" stroke-width="0.5"></polygon>
              <polygon points="12,12 16.24,7.76 9.88,9.88" fill="#b30059" stroke="#b30059" stroke-width="0.5"></polygon>
              <polygon points="12,12 7.76,16.24 9.88,9.88" fill="var(--accent-neon-cyan)" stroke="var(--accent-neon-cyan)" stroke-width="0.5"></polygon>
              <polygon points="12,12 7.76,16.24 14.12,14.12" fill="#0099ab" stroke="#0099ab" stroke-width="0.5"></polygon>
              <circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="none"></circle>
            </svg>
          </div>
          <div class="login-logo-text-wrap">
            <div class="login-logo-title">Campus Buddy</div>
            <div class="login-logo-sub">{{ activeTab === 'student' ? '校园社交智能推荐系统' : '管理端安全认证' }}</div>
          </div>
        </div>
      </div>

      <!-- Role Tab Toggles -->
      <div class="login-tabs" role="tablist">
        <button
          type="button"
          class="login-tab-btn"
          role="tab"
          :aria-selected="activeTab === 'student'"
          :class="{ 'tab-active': activeTab === 'student' }"
          @click="activeTab = 'student'"
        >
          👤 学生登录入口
        </button>
        <button
          type="button"
          class="login-tab-btn"
          role="tab"
          :aria-selected="activeTab === 'admin'"
          :class="{ 'tab-active-admin': activeTab === 'admin' }"
          @click="activeTab = 'admin'"
        >
          🔐 管理员控制台
        </button>
      </div>

      <!-- Forms wrapper -->
      <StudentLoginForm v-if="activeTab === 'student'" @loading-start="onLoadingStart" />
      <AdminLoginForm v-else @submitted="handleSubmitted" />

      <!-- Redesigned GitHub Developer Profile Card -->
      <div class="login-github-card">
        <a href="https://github.com/bestxby/Campus-Buddy" target="_blank" rel="noopener" class="login-github-item repo-link" title="访问 GitHub 项目仓库">
          <div class="git-icon-wrap">
            <svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true" width="13" height="13">
              <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </div>
          <div class="git-info">
            <span class="git-title">Campus-Buddy</span>
            <span class="git-desc">开源项目仓库 ➔</span>
          </div>
        </a>
        
        <div class="git-divider"></div>
        
        <a href="https://github.com/bestxby" target="_blank" rel="noopener" class="login-github-item author-link" title="访问作者 GitHub 主页">
          <img :src="'/avatar_developer.png'" class="git-avatar-img" alt="bestxby avatar" />
          <div class="git-info">
            <span class="git-title">bestxby</span>
            <span class="git-desc">开发者主页 ➔</span>
          </div>
        </a>
      </div>
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

interface LoadingPayload { name: string; avatar: string; interests: string[]; isAdmin?: boolean }
const loadingPayload = ref<LoadingPayload | null>(null)

const onLoadingStart = (payload: { name: string; avatar: string; interests: string[] }) => {
  loadingPayload.value = {
    ...payload,
    isAdmin: false
  }
  submitRegistration()
}

const onLoadingDone = () => {
  loadingPayload.value = null
  emit('submitted')
}

const handleSubmitted = () => {
  loadingPayload.value = {
    name: '系统管理员',
    avatar: '🤖',
    interests: [],
    isAdmin: true
  }
}
</script>


<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background-color: #020617; /* Solid dark color to prevent background leak/transparency */
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
/* Redesigned Premium Logo Banner */
.login-logo-banner {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: linear-gradient(145deg, #09090e 0%, #110e20 50%, #030712 100%);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 240, 255, 0.05);
}
.login-logo-banner::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -15px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}
.logo-main-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.login-logo-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 8px #00f0ff) drop-shadow(0 0 15px rgba(255, 0, 127, 0.2));
  animation: floatIcon 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.login-logo-text-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.login-logo-title {
  font-size: 16px;
  font-weight: 950;
  letter-spacing: -0.3px;
  background: linear-gradient(90deg, #ff007f 0%, #ff7f00 45%, #00f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.2);
  line-height: 1.2;
}
.login-logo-sub {
  font-size: 10.5px;
  color: #93c5fd;
  margin-top: 3px;
  letter-spacing: 0.2px;
  font-weight: 600;
  text-shadow: 0 0 4px rgba(147, 197, 253, 0.2);
  line-height: 1.2;
}

/* GitHub Card in Login Page */
.login-github-card {
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.login-github-item {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 8px 12px;
  border-radius: 8px;
  flex: 1;
  min-width: 160px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}
.login-github-item:hover {
  background: rgba(253, 151, 31, 0.04);
  border-color: rgba(253, 151, 31, 0.25);
  box-shadow: 0 4px 12px rgba(253, 151, 31, 0.06);
}
.login-github-item.author-link:hover {
  background: rgba(6, 182, 212, 0.04);
  border-color: rgba(6, 182, 212, 0.25);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.06);
}
.git-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(253, 151, 31, 0.05);
  border: 1px solid rgba(253, 151, 31, 0.2);
  color: #ffb74d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
  box-shadow: 0 0 6px rgba(253, 151, 31, 0.15);
}
.git-avatar-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.15);
  flex-shrink: 0;
  transition: all 0.25s ease;
  box-sizing: border-box;
}
.github-icon {
  fill: currentColor;
  width: 14px;
  height: 14px;
  transition: transform 0.4s ease;
}
.login-github-item.repo-link:hover .git-icon-wrap {
  background: rgba(253, 151, 31, 0.15);
  border-color: #ffb74d;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(253, 151, 31, 0.4);
  transform: scale(1.08);
}
.login-github-item:hover .github-icon {
  transform: rotate(360deg);
}
.login-github-item.author-link:hover .git-avatar-img {
  border-color: #22d3ee;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
  transform: scale(1.08);
}
.git-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}
.git-title {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  transition: color 0.25s ease;
}
.login-github-item:hover .git-title {
  color: #ffb74d;
}
.login-github-item.author-link:hover .git-title {
  color: #22d3ee;
}
.git-desc {
  color: var(--text-secondary);
  font-size: 10px;
}
.git-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
@media (max-width: 480px) {
  .git-divider {
    display: none;
  }
}
</style>
