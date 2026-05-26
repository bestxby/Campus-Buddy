<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>👑 校园社交达人</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content right-align">
            <h4>社交活跃达人说明</h4>
            <p>展示校园中最为活跃、参与活动及兴趣非常丰富的同学。他们在多个社群都有所涉及，建立的校园人际连接较多，在日常活动和社交生活中扮演着积极开朗的纽带与先锋角色。</p>
          </div>
        </div>
      </div>
    </div>
    <div class="card-scroll-body">
      <div class="centrality-list">
        <div v-for="(item, idx) in topSocialStudents" :key="item.name" class="centrality-item">
          <span class="centrality-rank">#{{ idx + 1 }}</span>
          <span class="centrality-name">👤 {{ item.name }}</span>
          <span class="centrality-score">{{ item.score }} 个连结</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { topSocialStudents } from '@/composables/useGraphInsights'
</script>

<style scoped>
.dashboard-grid-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
  background: linear-gradient(180deg, rgba(18, 24, 38, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%) !important;
  padding: 14px 18px !important;
}
.col-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.col-header h3 {
  font-size: 12px;
  margin: 0;
  color: var(--text-primary);
  font-weight: bold;
  text-align: left;
}
.col-header .header-sub {
  font-size: 9px;
  color: var(--text-secondary);
  text-align: left;
}
.card-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.centrality-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 10px 12px;
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
  width: 25px;
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
