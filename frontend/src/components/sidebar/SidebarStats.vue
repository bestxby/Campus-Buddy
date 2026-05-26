<template>
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
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  gap: 3px;
}
</style>
