<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3 style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path>
            <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"></path>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          跨界人脉桥梁
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
            <h4>跨界沟通桥梁说明</h4>
            <p>识别能够帮助跨界沟通、“连接不同圈子”的关键同学。这些同学虽然直接认识的人不一定是最多的，但由于他们跨越了不同的学科或兴趣圈子，在促进校园多元社群融合、打破人际隔阂中起着关键的纽带作用。</p>
          </div>
        </div>
      </div>
    </div>
    <div class="card-scroll-body">
      <div class="centrality-list">
        <div v-for="(item, idx) in bridgeStudents.slice(0, 5)" :key="item.name" class="centrality-item">
          <span class="centrality-rank">#{{ idx + 1 }}</span>
          <span class="centrality-name" style="display: inline-flex; align-items: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; opacity: 0.8;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ item.name }}
          </span>
          <span class="centrality-score">跨界活力: {{ item.score }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { bridgeStudents } from '@/composables/useGraphInsights'
</script>

<style scoped>
.dashboard-grid-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
  background: var(--color-surface);
  padding: 12px 16px !important;
}
.col-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.col-header h3 {
  font-size: 12px;
  margin: 0;
  color: var(--color-text);
  font-weight: bold;
  text-align: left;
}
.col-header .header-sub {
  font-size: 10px;
  color: var(--color-subtext);
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
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 12px;
}
.centrality-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text);
  line-height: 1.4;
}
.centrality-rank {
  font-weight: 800;
  color: var(--color-subtext);
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
