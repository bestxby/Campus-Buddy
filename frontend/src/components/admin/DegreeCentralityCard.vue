<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3 style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
            <path d="M12 2a6 6 0 0 1 6 6v1a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path>
          </svg>
          校园社交达人
        </h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon" style="display: inline-flex; align-items: center; justify-content: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </span>
          <div class="tooltip-content left-align">
            <h4>社交活跃达人说明</h4>
            <p>展示校园中最为活跃、参与活动及兴趣非常丰富的同学。他们在多个社群都有所涉及，建立的校园人际连接较多，在日常活动 and 社交生活中扮演着积极开朗的纽带与先锋角色。</p>
          </div>
        </div>
      </div>
    </div>
    <div class="card-scroll-body">
      <div class="centrality-list">
        <div v-for="(item, idx) in topSocialStudents.slice(0, 5)" :key="item.name" class="centrality-item">
          <span class="centrality-rank">#{{ idx + 1 }}</span>
          <span class="centrality-name" style="display: inline-flex; align-items: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; opacity: 0.8;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ item.name }}
          </span>
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
  padding: 12px 16px !important;
}
.col-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 6px;
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
  font-size: 10px;
  color: var(--text-secondary);
  text-align: left;
}
.card-scroll-body {
  flex: 1;
  overflow-y: hidden;
}
.centrality-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 8px 12px;
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
