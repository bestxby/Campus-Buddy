<template>
  <!-- Profile Card -->
  <div class="profile-card" :class="{ 'admin-card-border': currentUserRole === 'admin' }">
    <div class="profile-card-top">
      <div class="profile-avatar-wrap">
        <span class="profile-avatar-big">{{ currentUserAvatar || '🧭' }}</span>
        <div class="profile-avatar-ring"></div>
      </div>
      <div class="profile-card-meta">
        <div class="profile-name">{{ currentUser }}</div>
        <div class="profile-persona-badge" :class="personaBadgeClass">{{ userPersona }}</div>
      </div>
      <button @click="handleLogout" class="logout-btn" title="注销">⏻</button>
    </div>

    <!-- All interest tags or admin Root access badge -->
    <div v-if="currentUserRole === 'admin'" class="admin-access-badge">
      <span class="pulse-dot"></span>
      <span class="badge-text">最高系统管理权限 (Root Access)</span>
    </div>
    <template v-else>
      <div class="profile-interests-strip" v-if="userInterestTags.length">
        <span v-for="tag in userInterestTags" :key="tag" class="profile-interest-chip"># {{ tag }}</span>
      </div>
      <div v-else class="interests-empty">暂无兴趣标签</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { currentUser, currentUserAvatar, userPersona, personaBadgeClass,
         userInterestTags, logout, currentUserRole } from '@/composables/useAuth'

const emit = defineEmits<{
  logout: []
}>()

const handleLogout = async () => {
  await logout()
  emit('logout')
}
</script>

<style scoped>
.profile-card {
  margin: 10px 10px 0;
  background: linear-gradient(135deg, rgba(253,151,31,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(253,151,31,0.2); border-radius: 12px; padding: 10px;
  position: relative; overflow: hidden; flex-shrink: 0;
}
.profile-card::after { content: ''; position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: radial-gradient(circle, rgba(253,151,31,0.1) 0%, transparent 70%); pointer-events: none; }
.profile-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.profile-avatar-wrap { position: relative; flex-shrink: 0; }
.profile-avatar-big { font-size: 30px; line-height: 1; display: block; filter: drop-shadow(0 0 8px rgba(253,151,31,0.4)); }
.profile-avatar-ring { position: absolute; inset: -3px; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(135deg, rgba(253,151,31,0.6), rgba(6,182,212,0.4)) border-box; -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0); -webkit-mask-composite: destination-out; mask-composite: exclude; animation: spinRing 4s linear infinite; }
@keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.profile-card-meta { flex: 1; min-width: 0; }
.profile-name { font-size: 14px; font-weight: 700; color: #ffb74d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.profile-persona-badge { display: inline-block; margin-top: 3px; font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 20px; letter-spacing: 0.3px; }
.logout-btn { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: rgba(239,68,68,0.6); border-radius: 6px; width: 26px; height: 26px; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
.logout-btn:hover { background: rgba(239,68,68,0.18); color: #ef4444; border-color: rgba(239,68,68,0.5); box-shadow: 0 0 8px rgba(239,68,68,0.2); }

.profile-interests-strip { display: flex; flex-wrap: wrap; gap: 4px; }
.profile-interest-chip { font-size: 10px; padding: 2px 8px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); transition: all 0.2s; }
.profile-interest-chip:hover { background: rgba(253,151,31,0.1); border-color: rgba(253,151,31,0.3); color: #ffb74d; }
.interests-empty { font-size: 10px; color: rgba(255,255,255,0.25); font-style: italic; }

.admin-card-border {
  border-color: rgba(6, 182, 212, 0.3) !important;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%) !important;
}
.admin-access-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(6, 182, 212, 0.05);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 6px;
  padding: 6px 10px;
  margin-top: 4px;
}
.admin-access-badge .pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #22d3ee;
  box-shadow: 0 0 6px #22d3ee;
  animation: adminPulse 2s infinite;
}
@keyframes adminPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.admin-access-badge .badge-text {
  font-size: 9.5px;
  font-weight: bold;
  color: #67e8f9;
}
</style>
