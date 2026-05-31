<template>
  <div class="login-overlay fade-in">
    <!-- Glowing background blobs for premium aurora effect -->
    <div class="login-bg-glow blob-1"></div>
    <div class="login-bg-glow blob-2"></div>

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
              <circle cx="12" cy="12" r="10" stroke="var(--accent-cyan)" stroke-width="1.5"></circle>
              <!-- Needle split into two halves for a premium 3D neon compass effect -->
              <polygon points="12,12 16.24,7.76 14.12,14.12" fill="var(--color-accent)" stroke="var(--color-accent)" stroke-width="0.5"></polygon>
              <polygon points="12,12 16.24,7.76 9.88,9.88" fill="#b35a00" stroke="#b35a00" stroke-width="0.5"></polygon>
              <polygon points="12,12 7.76,16.24 9.88,9.88" fill="var(--accent-cyan)" stroke="var(--accent-cyan)" stroke-width="0.5"></polygon>
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
          <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          学生登录入口
        </button>
        <button
          type="button"
          class="login-tab-btn"
          role="tab"
          :aria-selected="activeTab === 'admin'"
          :class="{ 'tab-active-admin': activeTab === 'admin' }"
          @click="activeTab = 'admin'"
        >
          <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          管理员控制台
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
          <img :src="avatarDeveloper" class="git-avatar-img" alt="bestxby avatar" />
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
import avatarDeveloper from '@/assets/avatar_developer.png'
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
  background-color: var(--color-bg); /* Use adaptive theme background */
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden; /* Prevent scrolls from background blobs */
}
.login-bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}
.blob-1 {
  width: 400px;
  height: 400px;
  background: var(--color-accent);
  top: -100px;
  left: -100px;
  animation: float-blob-1 20s infinite alternate ease-in-out;
}
.blob-2 {
  width: 500px;
  height: 500px;
  background: var(--accent-cyan);
  bottom: -150px;
  right: -100px;
  animation: float-blob-2 25s infinite alternate ease-in-out;
}
@keyframes float-blob-1 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(100px, 80px) scale(1.1); }
  100% { transform: translate(-50px, 120px) scale(0.95); }
}
@keyframes float-blob-2 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-120px, -50px) scale(0.9); }
  100% { transform: translate(80px, -100px) scale(1.15); }
}
.login-card {
  max-width: 100%;
  padding: 18px 32px;
  background: var(--color-surface); /* Adaptive card background */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border); /* Adaptive border */
  box-shadow: var(--shadow-xl); /* Adaptive premium shadow */
  max-height: 95vh;
  overflow-y: auto;
  transition: width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.35s ease, border-color 0.35s ease, background-color var(--transition-slow);
  border-radius: 12px;
  z-index: 1;
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
  margin-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
}
.login-tab-btn {
  flex: 1;
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-subtext);
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
}
.login-tab-btn:hover {
  background-color: var(--color-muted);
  color: var(--color-text);
}
.tab-active {
  background-color: var(--color-social-active-bg) !important;
  border-color: var(--color-social-active-border) !important;
  color: var(--color-social-active-text) !important;
  box-shadow: 0 0 10px var(--color-social-active-bg);
}
.tab-active-admin {
  background-color: var(--color-admin-active-bg) !important;
  border-color: var(--color-admin-active-border) !important;
  color: var(--color-admin-active-text) !important;
  box-shadow: 0 0 10px var(--color-admin-active-bg);
}
/* Redesigned Premium Logo Banner */
.login-logo-banner {
  margin-bottom: 10px;
  padding: 10px 16px;
  background: var(--color-surface-2); /* Adaptive banner background */
  border: 1px solid var(--color-border);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.login-logo-banner::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -15px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, var(--color-accent-orange-glow) 0%, transparent 70%);
  pointer-events: none;
}
.logo-main-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.login-logo-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
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
  color: var(--color-text);
  line-height: 1.2;
}
.login-logo-sub {
  font-size: 10.5px;
  color: var(--color-subtext);
  margin-top: 3px;
  letter-spacing: 0.2px;
  font-weight: 600;
  line-height: 1.2;
}

/* GitHub Card in Login Page */
.login-github-card {
  margin-top: 12px;
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}
.login-github-item {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  border-radius: 8px;
  flex: 1;
  min-width: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}
.login-github-item:hover {
  background: var(--color-social-active-bg);
  border-color: var(--color-social-active-border);
  box-shadow: 0 4px 12px var(--color-social-active-bg);
}
.login-github-item.author-link:hover {
  background: var(--color-admin-active-bg);
  border-color: var(--color-admin-active-border);
  box-shadow: 0 4px 12px var(--color-admin-active-bg);
}
.git-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-social-active-bg);
  border: 1px solid var(--color-social-active-border);
  color: var(--color-social-active-text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
  box-shadow: 0 0 6px var(--color-social-active-bg);
}
.git-avatar-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--color-admin-active-border);
  box-shadow: 0 0 6px var(--color-admin-active-border);
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
  background: var(--color-social-active-text);
  border-color: var(--color-social-active-text);
  color: var(--color-surface);
  box-shadow: 0 0 10px var(--color-social-active-border);
  transform: scale(1.08);
}
.login-github-item:hover .github-icon {
  transform: rotate(360deg);
}
.login-github-item.author-link:hover .git-avatar-img {
  border-color: var(--color-admin-active-text);
  box-shadow: 0 0 10px var(--color-admin-active-border);
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
  color: var(--color-text);
  font-size: 12px;
  font-weight: 700;
  transition: color 0.25s ease;
}
.login-github-item:hover .git-title {
  color: var(--color-social-active-text);
}
.login-github-item.author-link:hover .git-title {
  color: var(--color-admin-active-text);
}
.git-desc {
  color: var(--color-subtext);
  font-size: 10px;
}
.git-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
  flex-shrink: 0;
}
@media (max-width: 480px) {
  .git-divider {
    display: none;
  }
  .login-github-card {
    flex-wrap: wrap;
  }
  .login-github-item {
    min-width: 100%;
  }
}
</style>
