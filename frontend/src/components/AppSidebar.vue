<template>
  <aside class="sidebar" :style="{ width: props.width + 'px' }">
    <!-- Logo Banner -->
    <a href="https://github.com/bestxby/Campus-Buddy" target="_blank" rel="noopener" class="sidebar-logo-banner" title="访问 GitHub 项目仓库">
      <div class="sidebar-logo-icon">🧭</div>
      <div class="sidebar-logo-text">
        <div class="sidebar-logo-title">Campus Buddy</div>
        <div class="sidebar-logo-sub">校园社交智能推荐系统</div>
      </div>
    </a>

    <!-- Profile Card -->
    <div class="profile-card">
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

      <!-- All interest tags (no limit) -->
      <div class="profile-interests-strip" v-if="userInterestTags.length">
        <span v-for="tag in userInterestTags" :key="tag" class="profile-interest-chip"># {{ tag }}</span>
      </div>
      <div v-else class="interests-empty">暂无兴趣标签</div>
    </div>

    <!-- Stats Grid (compact) -->
    <div class="stats-grid-panel">
      <div class="stats-grid-title">📡 图谱规模</div>
      <div class="stats-grid">
        <div class="stat-card" style="--stat-color: #ffb74d">
          <div class="stat-card-label">👥 学生节点</div>
          <div class="stat-card-val" style="color:#ffb74d">{{ stats.studentsCount }}</div>
        </div>
        <div class="stat-card" style="--stat-color: #22d3ee">
          <div class="stat-card-label">🏷️ 兴趣类型</div>
          <div class="stat-card-val" style="color:#22d3ee">{{ stats.interestsCount }}</div>
        </div>
        <div class="stat-card" style="--stat-color: #a78bfa">
          <div class="stat-card-label">🎉 活动数量</div>
          <div class="stat-card-val" style="color:#a78bfa">{{ stats.activitiesCount }}</div>
        </div>
        <div class="stat-card" style="--stat-color: #34d399">
          <div class="stat-card-label">🔗 连通社区</div>
          <div class="stat-card-val" style="color:#34d399">{{ stats.componentsCount }}</div>
        </div>
      </div>
    </div>

    <!-- Graph Insights Panel (Degree & Betweenness Centrality) (Admin Only) -->
    <div v-if="currentUserRole === 'admin'" class="stats-grid-panel insights-panel">
      <div class="stats-grid-title">📊 图谱图论洞察</div>
      
      <!-- Top Social Hubs (Degree Centrality) -->
      <div class="insight-section">
        <div class="insight-section-title">👑 校园社交达人 (度中心性)</div>
        <div class="insight-list">
          <div v-for="(item, idx) in topSocialStudents" :key="item.name" class="insight-item">
            <span class="insight-rank">#{{ idx + 1 }}</span>
            <span class="insight-name">👤 {{ item.name }}</span>
            <span class="insight-score">{{ item.score }} 个连结</span>
          </div>
        </div>
      </div>

      <!-- Top Bridges (Betweenness Centrality) -->
      <div class="insight-section">
        <div class="insight-section-title">🌉 跨界人脉桥梁 (中介中心性)</div>
        <div class="insight-list">
          <div v-for="(item, idx) in bridgeStudents" :key="item.name" class="insight-item">
            <span class="insight-rank">#{{ idx + 1 }}</span>
            <span class="insight-name">👤 {{ item.name }}</span>
            <span class="insight-score">Fq: {{ item.score }}</span>
          </div>
        </div>
      </div>

      <!-- Isolated Count -->
      <div class="insight-isolated-row">
        <span>🧭 待拓展社交圈的孤立同学：</span>
        <span class="isolated-badge" :class="{ 'has-isolated': isolatedCount > 0 }">
          {{ isolatedCount }} 人
        </span>
      </div>
    </div>

    <!-- Signed-up Activities Timeline (compact) -->
    <div class="activities-timeline-panel">
      <div class="timeline-title">✅ 已报名活动</div>
      <div v-if="signedUpActivities.length" class="timeline-list">
        <div v-for="(act, idx) in signedUpActivities" :key="act" class="timeline-item">
          <div class="timeline-dot" :style="{ animationDelay: idx * 0.08 + 's' }"></div>
          <span class="timeline-act-name">{{ act }}</span>
        </div>
      </div>
      <div v-else class="timeline-empty">🌱 还没有报名任何活动</div>
    </div>

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
import { currentUser, currentUserAvatar, userPersona, personaBadgeClass,
         userInterestTags, signedUpActivities, logout, currentUserRole } from '@/composables/useAuth'
import { stats } from '@/composables/useGraph'
import { topSocialStudents, bridgeStudents, isolatedCount } from '@/composables/useGraphInsights'

const props = defineProps<{ width: number }>()
const emit  = defineEmits<{ logout: [] }>()

const handleLogout = async () => {
  await logout()
  emit('logout')
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #0e1422 0%, #0b0f19 100%);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  box-sizing: border-box; overflow-y: auto;
  flex-shrink: 0;
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

/* ─── Profile Card ────────────────────────────────────────── */
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

/* Interest chips — show ALL tags, no "+N more" */
.profile-interests-strip { display: flex; flex-wrap: wrap; gap: 4px; }
.profile-interest-chip { font-size: 10px; padding: 2px 8px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); transition: all 0.2s; }
.profile-interest-chip:hover { background: rgba(253,151,31,0.1); border-color: rgba(253,151,31,0.3); color: #ffb74d; }
.interests-empty { font-size: 10px; color: rgba(255,255,255,0.25); font-style: italic; }

/* ─── Stats Grid (compact) ────────────────────────────────── */
.stats-grid-panel { margin: 10px 10px 0; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px; flex-shrink: 0; }
.stats-grid-title { font-size: 10.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat-card {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  padding-left: 12px;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 3px;
  background: var(--stat-color);
  opacity: 0.6;
  transition: all 0.25s ease;
}
.stat-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.09);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.stat-card:hover::before {
  opacity: 1;
  width: 4px;
}
.stat-card-val {
  font-size: 19px;
  font-weight: 800;
  font-family: Consolas, "SF Mono", Monaco, monospace;
  line-height: 1.2;
  letter-spacing: -0.2px;
}
.stat-card-label {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* ─── Timeline (compact) ──────────────────────────────────── */
.activities-timeline-panel { margin: 10px 10px 0; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px; flex: 1; min-height: 0; overflow-y: auto; }
.timeline-title { font-size: 10.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
.timeline-list { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; align-items: center; gap: 8px; position: relative; padding-bottom: 7px; }
.timeline-item:last-child { padding-bottom: 0; }
.timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 4px; top: 10px; bottom: 0; width: 1px; background: linear-gradient(180deg, rgba(52,211,153,0.3), transparent); }
.timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.5); flex-shrink: 0; animation: pulseDot 2s ease-in-out infinite; }
@keyframes pulseDot { 0%,100% { box-shadow: 0 0 5px rgba(52,211,153,0.4); } 50% { box-shadow: 0 0 10px rgba(52,211,153,0.7); } }
.timeline-act-name { font-size: 10px; color: rgba(255,255,255,0.7); line-height: 1.3; }
.timeline-empty { font-size: 10px; color: rgba(255,255,255,0.25); text-align: center; padding: 8px 0; }

/* ─── Footer ──────────────────────────────────────────────── */
.sidebar-footer {
  margin: auto 10px 10px 10px;
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

/* ─── Graph Insights Panel ────────────────────────────────── */
.insights-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.insight-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.insight-section-title {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--accent-orange);
  letter-spacing: 0.3px;
  text-align: left;
}
.insight-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.03);
  border-radius: 6px;
  padding: 6px 8px;
}
.insight-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  color: var(--text-primary);
}
.insight-rank {
  font-weight: 800;
  color: var(--text-secondary);
  font-family: monospace;
  width: 20px;
}
.insight-name {
  flex: 1;
  text-align: left;
  font-weight: 600;
}
.insight-score {
  font-family: Consolas, monospace;
  font-size: 9.5px;
  color: var(--accent-cyan);
}
.insight-isolated-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-secondary);
  border-top: 1px dashed rgba(255,255,255,0.05);
  padding-top: 6px;
  margin-top: 4px;
}
.isolated-badge {
  font-family: Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
}
.isolated-badge.has-isolated {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
</style>
