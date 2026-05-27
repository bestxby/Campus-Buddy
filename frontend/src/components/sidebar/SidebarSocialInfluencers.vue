<template>
  <div class="sidebar-influencers-panel">
    <div class="panel-title">👑 校园社交达人</div>
    <div class="centrality-list">
      <div v-for="(item, idx) in topSocialStudents.slice(0, 5)" :key="item.name" class="centrality-item">
        <span class="centrality-rank">#{{ idx + 1 }}</span>
        <span class="centrality-name">👤 {{ item.name }}</span>
        <span class="centrality-score">{{ item.score }}连结</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { topSocialStudents } from '@/composables/useGraphInsights'
</script>

<style scoped>
.sidebar-influencers-panel {
  margin: 10px 10px 0;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 12px;
  flex-shrink: 0;
  box-sizing: border-box;
}
.panel-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #ffb74d;
  margin-bottom: 8px;
  text-transform: uppercase;
  text-align: left;
}
.centrality-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 8px 10px;
}
.centrality-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-primary);
  line-height: 1.4;
}
.centrality-rank {
  font-weight: 800;
  color: var(--text-secondary);
  font-family: monospace;
  width: 20px;
  text-align: left;
}
.centrality-name {
  flex: 1;
  text-align: left;
  font-weight: 600;
}
.centrality-score {
  font-family: Consolas, monospace;
  font-size: 10.5px;
  color: var(--accent-cyan);
}
</style>
