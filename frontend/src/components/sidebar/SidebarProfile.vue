<template>
  <div class="profile-card" :class="{ 'admin-card-border': currentUserRole === 'admin' }">

    <!-- TOP ROW: Avatar + Name/Persona + Logout button -->
    <div class="profile-top-row">

      <!-- Avatar -->
      <div class="profile-avatar-wrap">
        <span class="profile-avatar-big">{{ currentUserAvatar || '🧭' }}</span>
        <div class="profile-avatar-ring"></div>
        <div v-if="isPrivateMode && currentUserRole !== 'admin'" class="avatar-private-overlay">🔒</div>
        <div v-if="isSocialMode && currentUserRole !== 'admin'" class="avatar-social-overlay">🌟</div>
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
          <span class="mode-icon">{{ isPrivateMode ? '🔒' : '🔓' }}</span>
          <span class="mode-label">{{ isPrivateMode ? '隐身中' : '隐身模式' }}</span>
        </button>

        <!-- Social active mode: turning on disables privacy -->
        <button
          class="mode-btn"
          :class="isSocialMode ? 'mode-btn-active-social' : 'mode-btn-inactive'"
          @click="toggleSocial"
          :title="isSocialMode ? '达人模式开启中，点击关闭' : '开启达人模式（优先被推荐给有共同活动的同学）'"
        >
          <span class="mode-icon">{{ isSocialMode ? '🌟' : '🌑' }}</span>
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

<style scoped>
.profile-card {
  margin: 10px 10px 0;
  background: linear-gradient(135deg, rgba(253,151,31,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(253,151,31,0.2);
  border-radius: 12px;
  padding: 12px 12px 10px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.profile-card::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 60px; height: 60px;
  background: radial-gradient(circle, rgba(253,151,31,0.1) 0%, transparent 70%);
  pointer-events: none;
}

/* ── TOP ROW ──────────────────────────────────── */
.profile-top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

/* Avatar */
.profile-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.profile-avatar-big {
  font-size: 32px;
  line-height: 1;
  display: block;
  filter: drop-shadow(0 0 8px rgba(253,151,31,0.4));
}
.profile-avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, rgba(253,151,31,0.6), rgba(6,182,212,0.4)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  animation: spinRing 4s linear infinite;
}
.avatar-private-overlay {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 12px;
  filter: drop-shadow(0 0 4px rgba(168,85,247,0.8));
  animation: privPulse 2s ease-in-out infinite;
}
@keyframes privPulse {
  0%,100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
.avatar-social-overlay {
  position: absolute;
  bottom: -4px;
  left: -4px;
  font-size: 12px;
  filter: drop-shadow(0 0 4px rgba(253, 151, 31, 0.8));
  animation: socialPulse 2s ease-in-out infinite;
}
@keyframes socialPulse {
  0%,100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Identity: name + persona on same row */
.profile-identity {
  flex: 1;
  min-width: 0;
}
.identity-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.profile-name {
  font-size: 13px;
  font-weight: 700;
  color: #ffb74d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}
.profile-persona-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.2px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Logout: icon-only pill */
.logout-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(239,68,68,0.07);
  border: 1px solid rgba(239,68,68,0.2);
  color: rgba(255,255,255,0.55);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.logout-btn:hover {
  background: rgba(239,68,68,0.18);
  color: #ef4444;
  border-color: rgba(239,68,68,0.55);
  box-shadow: 0 0 8px rgba(239,68,68,0.2);
}
.logout-icon { line-height: 1; }

/* ── MODE TOGGLE ROW ──────────────────────────── */
.mode-toggle-row {
  display: flex;
  gap: 7px;
}
.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 6px;
  border-radius: 6px;
  font-size: 9.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  font-family: inherit;
  white-space: nowrap;
}
.mode-btn-inactive {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.45);
}
.mode-btn-inactive:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.7);
}
.mode-btn-active-private {
  background: rgba(168,85,247,0.12);
  border-color: rgba(168,85,247,0.3);
  color: #c084fc;
  box-shadow: 0 0 8px rgba(168,85,247,0.15);
}
.mode-btn-active-private:hover {
  background: rgba(168,85,247,0.2);
  border-color: rgba(168,85,247,0.5);
}
.mode-btn-active-social {
  background: rgba(253,151,31,0.12);
  border-color: rgba(253,151,31,0.3);
  color: #ffb74d;
  box-shadow: 0 0 8px rgba(253,151,31,0.15);
}
.mode-btn-active-social:hover {
  background: rgba(253,151,31,0.2);
  border-color: rgba(253,151,31,0.5);
}
.mode-icon { font-size: 10px; line-height: 1; }
.mode-label { line-height: 1; }

/* ── PRIVACY STATUS BAR ───────────────────────── */
.privacy-status-bar {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(168,85,247,0.06);
  border: 1px solid rgba(168,85,247,0.18);
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 9px;
  color: rgba(192,132,252,0.9);
  letter-spacing: 0.2px;
}
.privacy-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #a855f7;
  box-shadow: 0 0 5px rgba(168,85,247,0.7);
  flex-shrink: 0;
  animation: privDotPulse 2s ease-in-out infinite;
}
@keyframes privDotPulse {
  0%,100% { opacity: 0.6; box-shadow: 0 0 4px rgba(168,85,247,0.5); }
  50% { opacity: 1; box-shadow: 0 0 8px rgba(168,85,247,0.9); }
}

/* ── SOCIAL STATUS BAR ────────────────────────── */
.social-status-bar {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(253,151,31,0.06);
  border: 1px solid rgba(253,151,31,0.18);
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 9px;
  color: rgba(255,183,77,0.9);
  letter-spacing: 0.2px;
}
.social-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fd971f;
  box-shadow: 0 0 5px rgba(253,151,31,0.7);
  flex-shrink: 0;
  animation: socialDotPulse 2s ease-in-out infinite;
}
@keyframes socialDotPulse {
  0%,100% { opacity: 0.6; box-shadow: 0 0 4px rgba(253,151,31,0.5); }
  50% { opacity: 1; box-shadow: 0 0 8px rgba(253,151,31,0.9); }
}

/* ── ADMIN STYLES ─────────────────────────────── */
.admin-card-border {
  border-color: rgba(6, 182, 212, 0.3) !important;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%) !important;
}
.admin-access-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(6, 182, 212, 0.05);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 6px;
  padding: 5px 8px;
}
.admin-access-badge .pulse-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 6px #22d3ee;
  animation: adminPulse 2s infinite;
  flex-shrink: 0;
}
@keyframes adminPulse {
  0%, 100% { opacity: 0.5; } 50% { opacity: 1; }
}
.admin-access-badge .badge-text {
  font-size: 9px;
  font-weight: bold;
  color: #67e8f9;
}
</style>
