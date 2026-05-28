<template>
  <div class="stats-grid-panel">
    <div class="stats-grid-title">
      <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      图谱规模
    </div>
    <div class="stats-grid">
      <div class="stat-card" style="--stat-color: #ffb74d">
        <div class="stat-card-label">
          <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          学生节点
        </div>
        <div class="stat-card-val" style="color:#ffb74d">{{ stats.studentsCount }}</div>
      </div>
      <div class="stat-card" style="--stat-color: #22d3ee">
        <div class="stat-card-label">
          <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          兴趣类型
        </div>
        <div class="stat-card-val" style="color:#22d3ee">{{ stats.interestsCount }}</div>
      </div>
      <div class="stat-card" style="--stat-color: #a78bfa">
        <div class="stat-card-label">
          <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          活动数量
        </div>
        <div class="stat-card-val" style="color:#a78bfa">{{ stats.activitiesCount }}</div>
      </div>
      <div class="stat-card" style="--stat-color: #34d399">
        <div class="stat-card-label">
          <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          连通社区
        </div>
        <div class="stat-card-val" style="color:#34d399">{{ stats.componentsCount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { stats } from '@/composables/useGraph'
</script>

<style scoped>
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
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  gap: 3px;
}
</style>
