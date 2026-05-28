<template>
  <div class="profile-card" :class="{ 'admin-card-border': currentUserRole === 'admin' }">

    <!-- TOP ROW: Avatar + Name/Persona + Logout button -->
    <div class="profile-top-row">

      <!-- Avatar -->
      <!-- Avatar -->
      <div class="profile-avatar-wrap">
        <span class="profile-avatar-big">
          <template v-if="currentUserAvatar">{{ currentUserAvatar }}</template>
          <svg v-else class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="var(--accent-orange)"></polygon>
          </svg>
        </span>
        <div class="profile-avatar-ring"></div>
        <div v-if="isPrivateMode && currentUserRole !== 'admin'" class="avatar-private-overlay">
          <svg class="icon-svg" viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div v-if="isSocialMode && currentUserRole !== 'admin'" class="avatar-social-overlay">
          <svg class="icon-svg" viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="currentColor" stroke-width="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
      </div>

      <!-- Name + Persona (same row) -->
      <div class="profile-identity">
        <div class="identity-row">
          <div class="profile-name">{{ currentUser }}</div>
          <div class="profile-persona-badge" :class="personaBadgeClass">{{ userPersona }}</div>
        </div>
      </div>

      <!-- Logout button (icon-only, top-right) -->
      <button @click="handleLogout" class="logout-btn" title="退出登录">
        <span class="logout-icon">⏻</span>
      </button>
    </div>

    <!-- BOTTOM ROW: Mode toggles (Student only) -->
    <template v-if="currentUserRole !== 'admin'">
      <div class="mode-toggle-row">
        <!-- Privacy mode: turning on disables social -->
        <button
          class="mode-btn"
          :class="isPrivateMode ? 'mode-btn-active-private' : 'mode-btn-inactive'"
          @click="togglePrivate"
          :title="isPrivateMode ? '隐身保护中，点击关闭' : '开启隐身模式（不被推荐给他人）'"
        >
          <span class="mode-icon">
            <svg v-if="isPrivateMode" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <svg v-else class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
          </span>
          <span class="mode-label">{{ isPrivateMode ? '隐身中' : '隐身模式' }}</span>
        </button>

        <!-- Social active mode: turning on disables privacy -->
        <button
          class="mode-btn"
          :class="isSocialMode ? 'mode-btn-active-social' : 'mode-btn-inactive'"
          @click="toggleSocial"
          :title="isSocialMode ? '达人模式开启中，点击关闭' : '开启达人模式（优先被推荐给有共同活动的同学）'"
        >
          <span class="mode-icon">
            <svg v-if="isSocialMode" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="currentColor" stroke-width="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <svg v-else class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </span>
          <span class="mode-label">{{ isSocialMode ? '达人中' : '达人模式' }}</span>
        </button>
      </div>
    </template>

    <!-- Admin badge row -->
    <template v-else>
      <div class="admin-access-badge">
        <span class="pulse-dot"></span>
        <span class="badge-text">Root Access · 全局管理员</span>
      </div>
    </template>

    <!-- Privacy status hint -->
    <div v-if="isPrivateMode && currentUserRole !== 'admin'" class="privacy-status-bar">
      <span class="privacy-status-dot"></span>
      <span>隐身保护中 · 您的社交关系已对他人隐藏</span>
    </div>

    <!-- Social status hint -->
    <div v-if="isSocialMode && currentUserRole !== 'admin'" class="social-status-bar">
      <span class="social-status-dot"></span>
      <span>社交达人中 · 您将被优先推荐给有共同兴趣的同学</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { currentUser, currentUserAvatar, userPersona, personaBadgeClass,
         logout, currentUserRole, isPrivateMode, togglePrivacyMode,
         isSocialMode, toggleSocialMode } from '@/composables/useAuth'

const emit = defineEmits<{
  logout: []
}>()

// Mutually exclusive behavior handled globally in store/composable
const togglePrivate = () => {
  togglePrivacyMode()
}

const toggleSocial = () => {
  toggleSocialMode()
}

const handleLogout = async () => {
  await logout()
  emit('logout')
}
</script>

<style scoped src="./SidebarProfile.css"></style>
