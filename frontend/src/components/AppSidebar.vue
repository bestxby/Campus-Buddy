<template>
  <aside class="sidebar" :style="{ width: props.width + 'px' }">
    <!-- Logo Banner -->
    <a href="https://github.com/bestxby/Campus-Buddy" target="_blank" rel="noopener" class="sidebar-logo-banner" title="访问 GitHub 项目仓库">
      <div class="sidebar-logo-icon">🧭</div>
      <div class="sidebar-logo-text">
        <div class="sidebar-logo-title">Campus Buddy</div>
        <div class="sidebar-logo-sub">校园社交智能推荐系统</div>
        <div v-if="currentUserRole === 'admin'" class="admin-dashboard-title-badge">
          <span class="pulse-dot">📡</span>
          <span>系统大数据中心化管理看板</span>
        </div>
      </div>
    </a>

    <!-- Profile Card Component -->
    <SidebarProfile @logout="emit('logout')" />

    <!-- Stats Grid Component (compact) - Admin Only -->
    <SidebarStats v-if="currentUserRole === 'admin'" />

    <!-- Admin Control & Search Panel (Admin Only) -->
    <SidebarAdminControl 
      v-if="currentUserRole === 'admin'"
      @logout="emit('logout')"
      @open-graph="(forceGlobal) => emit('open-graph', forceGlobal)"
      @create-activity="emit('create-activity')"
    />

    <!-- Student Only Panels -->
    <template v-if="currentUserRole !== 'admin'">
      <SidebarInterests />
      <SidebarIcebreaker />
      <SidebarTimeline />
    </template>

    <!-- Footer: Author info -->
    <a href="https://github.com/bestxby" target="_blank" rel="noopener" class="sidebar-footer" title="访问作者 GitHub 主页">
      <div class="footer-content">
        <div class="footer-icon-wrap">
          <svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </div>
        <div class="footer-info">
          <div class="name-val">bestxby</div>
          <div class="author-sub">GitHub 开发者主页 →</div>
        </div>
      </div>
    </a>
  </aside>
</template>

<script setup lang="ts">
import { currentUserRole } from '@/composables/useAuth'
import SidebarProfile from '@/components/sidebar/SidebarProfile.vue'
import SidebarAdminControl from '@/components/sidebar/SidebarAdminControl.vue'
import SidebarStats from '@/components/sidebar/SidebarStats.vue'
import SidebarTimeline from '@/components/sidebar/SidebarTimeline.vue'
import SidebarInterests from '@/components/sidebar/SidebarInterests.vue'
import SidebarIcebreaker from '@/components/sidebar/SidebarIcebreaker.vue'

const props = defineProps<{ width: number }>()
const emit  = defineEmits<{ 
  logout: [],
  'open-graph': [forceGlobal?: boolean],
  'create-activity': []
}>()
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #0e1422 0%, #0b0f19 100%);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  box-sizing: border-box; overflow-y: auto;
  flex-shrink: 0;
  height: 100%;
}

/* ─── Logo Banner ─────────────────────────────────────────── */
.sidebar-logo-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(253,151,31,0.12) 0%, rgba(6,182,212,0.06) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: relative; overflow: hidden; flex-shrink: 0;
  text-decoration: none;
  transition: background 0.3s ease;
}
.sidebar-logo-banner:hover {
  background: linear-gradient(135deg, rgba(253,151,31,0.18) 0%, rgba(6,182,212,0.1) 100%);
}
.sidebar-logo-banner::before {
  content: ''; position: absolute; top: -30px; right: -20px;
  width: 80px; height: 80px;
  background: radial-gradient(circle, rgba(253,151,31,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.sidebar-logo-icon { font-size: 28px; filter: drop-shadow(0 0 10px rgba(253,151,31,0.5)); animation: floatIcon 3s ease-in-out infinite; }
@keyframes floatIcon { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.sidebar-logo-title { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; background: linear-gradient(90deg, #ffb74d, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.sidebar-logo-sub { font-size: 9px; color: rgba(255,255,255,0.35); margin-top: 2px; letter-spacing: 0.3px; }
.admin-dashboard-title-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  padding: 3px 6px;
  background: rgba(253, 151, 31, 0.08);
  border: 1px solid rgba(253, 151, 31, 0.25);
  border-radius: 4px;
  color: #ffb74d;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2px;
  animation: borderGlow 3s infinite ease-in-out;
  text-align: left;
}
.pulse-dot {
  font-size: 10px;
  display: inline-block;
  animation: pulseScale 2s infinite ease-in-out;
}
@keyframes borderGlow {
  0%, 100% {
    border-color: rgba(253, 151, 31, 0.2);
    box-shadow: 0 0 4px rgba(253, 151, 31, 0.05);
  }
  50% {
    border-color: rgba(253, 151, 31, 0.4);
    box-shadow: 0 0 10px rgba(253, 151, 31, 0.15);
  }
}
@keyframes pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* ─── Footer ──────────────────────────────────────────────── */
.sidebar-footer {
  margin: 10px;
  flex-shrink: 0;
  padding: 12px 10px;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.02) 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: block;
  text-decoration: none;
}

.sidebar-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(253,151,31,0.03), rgba(6,182,212,0.03));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-footer:hover {
  border-color: rgba(253,151,31,0.25);
  background: linear-gradient(135deg, rgba(253,151,31,0.04) 0%, rgba(253,151,31,0.01) 100%);
  box-shadow: 0 4px 14px rgba(253,151,31,0.06);
}

.sidebar-footer:hover::before {
  opacity: 1;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.footer-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.github-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.name-val {
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 700;
  font-family: Georgia, serif;
  transition: color 0.3s ease;
  letter-spacing: -0.2px;
  text-align: left;
}

.author-sub {
  color: rgba(255,255,255,0.45);
  font-size: 9.5px;
  transition: color 0.3s ease;
  text-align: left;
  letter-spacing: 0.1px;
}

/* Hover interactions */
.sidebar-footer:hover .footer-icon-wrap {
  background: rgba(253,151,31,0.08);
  border-color: rgba(253,151,31,0.25);
  color: #ffb74d;
  box-shadow: 0 0 8px rgba(253,151,31,0.15);
}

.sidebar-footer:hover .github-icon {
  transform: rotate(360deg);
}

.sidebar-footer:hover .name-val {
  color: #ffb74d;
}

.sidebar-footer:hover .author-sub {
  color: rgba(255,255,255,0.7);
}
</style>
