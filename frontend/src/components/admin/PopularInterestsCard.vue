<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3 style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          热门兴趣标签排行
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
            <h4>热门兴趣分布说明</h4>
            <p>统计全校 1,500+ 学生中各个兴趣标签的关联频次。高频次的标签反映出校园中规模最大的主要兴趣社群，在图结构中表现为密集连接的“网络枢纽中心”；低频标签则表示冷门小众的亚文化兴趣圈。</p>
          </div>
        </div>
      </div>
    </div>
    <div class="card-scroll-body">
      <div class="chart-container">
        <div v-for="(interest, idx) in popularInterests" :key="interest.name" class="bar-chart-row">
          <span class="rank-badge">#{{ idx + 1 }}</span>
          <span class="bar-label" :title="interest.name">{{ interest.name }}</span>
          <div class="bar-track">
            <div 
              class="bar-fill" 
              :style="{ width: (interest.count / maxInterestCount * 100) + '%' }"
            ></div>
          </div>
          <span class="bar-value">{{ interest.count }} 人</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { popularInterests } from '@/composables/useGraphInsights'

const maxInterestCount = computed(() => {
  return popularInterests.value.length ? Math.max(...popularInterests.value.map(i => i.count)) : 100
})
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
  padding-bottom: 4px;
  margin-bottom: 6px;
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
  overflow-y: auto;
  padding-right: 4px;
}
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-chart-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
}
.rank-badge {
  font-size: 10px;
  color: var(--text-secondary);
  font-family: monospace;
  width: 18px;
  text-align: left;
}
.bar-label {
  width: 50px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0.85) 100%);
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.4);
  transition: width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.bar-value {
  width: 35px;
  text-align: right;
  font-family: Consolas, monospace;
  color: var(--accent-cyan);
  font-weight: bold;
}
</style>
