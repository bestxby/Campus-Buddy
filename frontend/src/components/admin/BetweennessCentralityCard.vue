<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🌉 跨界人脉桥梁</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content right-align">
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
          <span class="centrality-name">👤 {{ item.name }}</span>
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
