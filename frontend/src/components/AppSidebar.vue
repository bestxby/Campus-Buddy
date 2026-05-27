<template>
  <aside class="sidebar" :style="{ width: props.width + 'px' }">
    <!-- Logo Banner (Horizontal Layout) -->
    <a href="https://github.com/bestxby/Campus-Buddy" target="_blank" rel="noopener" class="sidebar-logo-banner" title="访问 GitHub 项目仓库">
      <div class="logo-main-group">
        <div class="sidebar-logo-icon">🧭</div>
        <div class="sidebar-logo-text-wrap">
          <div class="sidebar-logo-title">Campus Buddy</div>
          <div class="sidebar-logo-sub">校园社交智能推荐系统</div>
        </div>
      </div>
      <div v-if="currentUserRole === 'admin'" class="admin-dashboard-title-badge">
        <span class="pulse-dot">📡</span>
        <span>管理端</span>
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
      @create-interest="emit('create-interest')"
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
  'create-activity': [],
  'create-interest': []
}>()
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #0e1422 0%, #0b0f19 100%);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  box-sizing: border-box; 
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  height: 100%;
}

/* ─── Logo Banner ─────────────────────────────────────────── */
.sidebar-logo-banner {
  margin: 10px 10px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(145deg, #09090e 0%, #110e20 50%, #030712 100%) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.6), inset 0 0 10px rgba(0, 240, 255, 0.05);
}
.sidebar-logo-banner:hover {
  border-color: rgba(255, 0, 127, 0.5) !important;
  background: linear-gradient(145deg, #110e20 0%, #09090e 50%, #1a0b2e 100%) !important;
  box-shadow: 0 6px 20px rgba(255, 0, 127, 0.15), inset 0 0 10px rgba(0, 240, 255, 0.08) !important;
  transform: translateY(-1px);
}
.sidebar-logo-banner::before {
  content: ''; position: absolute; top: -20px; right: -15px;
  width: 60px; height: 60px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%);
  pointer-events: none;
}
.logo-main-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.sidebar-logo-text-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.sidebar-logo-icon {
  font-size: 22px;
  filter: drop-shadow(0 0 8px #00f0ff) drop-shadow(0 0 15px rgba(255,0,127,0.3));
  animation: floatIcon 3s ease-in-out infinite;
  user-select: none;
  flex-shrink: 0;
}
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.sidebar-logo-title {
  font-size: 15px;
  font-weight: 950;
  letter-spacing: -0.2px;
  background: linear-gradient(90deg, #ff007f 0%, #ff7f00 45%, #00f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 6px rgba(0,240,255,0.3);
  line-height: 1.2;
}
.sidebar-logo-sub {
  font-size: 9px;
  color: #93c5fd;
  margin-top: 1px;
  letter-spacing: 0.3px;
  font-weight: 600;
  text-shadow: 0 0 4px rgba(147,197,253,0.25);
  line-height: 1.1;
}
.admin-dashboard-title-badge,
.student-dashboard-title-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}
.admin-dashboard-title-badge {
  background: rgba(255, 0, 127, 0.05) !important;
  border: 1px solid #ff007f !important;
  color: #ff007f;
  box-shadow: 0 0 6px rgba(255, 0, 127, 0.25);
  animation: neonMagentaGlow 2.5s infinite ease-in-out;
}
.student-dashboard-title-badge {
  background: rgba(0, 240, 255, 0.05) !important;
  border: 1px solid #00f0ff !important;
  color: #00f0ff;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.25);
  animation: neonCyanGlow 2.5s infinite ease-in-out;
}
@keyframes neonCyanGlow {
  0%, 100% {
    border-color: rgba(0, 240, 255, 0.3);
    box-shadow: 0 0 4px rgba(0, 240, 255, 0.2);
  }
  50% {
    border-color: rgba(0, 240, 255, 0.85);
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.45);
  }
}
@keyframes neonMagentaGlow {
  0%, 100% {
    border-color: rgba(255, 0, 127, 0.3);
    box-shadow: 0 0 4px rgba(255, 0, 127, 0.2);
  }
  50% {
    border-color: rgba(255, 0, 127, 0.85);
    box-shadow: 0 0 10px rgba(255, 0, 127, 0.45);
  }
}
.pulse-dot {
  font-size: 9px;
  display: inline-block;
  animation: pulseScale 2s infinite ease-in-out;
}
@keyframes pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* ─── Footer ──────────────────────────────────────────────── */
.sidebar-footer {
  margin: 10px;
  margin-top: auto;
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

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 500;
    width: 280px !important;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-right: 1px solid rgba(253, 151, 31, 0.25);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(253, 151, 31, 0.05);
  }
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
}
</style>
