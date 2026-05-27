<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🔮 主题社群划分与活跃度诊断</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content left-align">
            <h4>主题社群分析说明</h4>
            <p>基于运动、艺术、科技、社交四大领域类别，实时分析对应圈子的学生覆盖比例（即参与了该类兴趣的学生占比）以及在该圈子中活跃学生的平均社交度数（连接活跃度）。有助于管理员动态发现冷门社群并针对性发布活动进行调控。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-scroll-body">
      <div class="theme-communities-list">
        <div 
          v-for="item in themeCommunities" 
          :key="item.domain" 
          class="theme-community-item"
        >
          <div class="theme-community-left">
            <span class="theme-icon" :style="{ color: item.color }">{{ item.icon }}</span>
            <span class="theme-label" :style="{ color: item.color }">{{ item.label }}</span>
          </div>
          
          <div class="progress-bar-container">
            <div class="progress-bar-track">
              <div 
                class="progress-bar-fill" 
                :style="{ width: item.percentage + '%', background: item.color, boxShadow: '0 0 4px ' + item.color }"
              ></div>
            </div>
            <span class="progress-value">{{ item.percentage }}%</span>
          </div>
          
          <div class="theme-metrics">
            <span class="metric-badge">👥 {{ item.size }}</span>
            <span class="metric-badge metric-deg" :style="{ borderColor: item.color, color: item.color }">⚡ {{ item.avgDegree }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { themeCommunities } from '@/composables/useGraphInsights'
</script>

<style scoped>
.dashboard-grid-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
  background: linear-gradient(180deg, rgba(18, 24, 38, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%) !important;
  padding: 10px 14px !important;
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
.card-scroll-body {
  flex: 1;
  overflow-y: hidden; /* Prevent scrollbar since we have exactly 4 static domains */
}
.theme-communities-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 2px 0;
}
.theme-community-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  padding: 4px 8px;
}
.theme-community-left {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 55px; /* Fixed width to align progress bars */
  flex-shrink: 0;
}
.theme-icon {
  font-size: 11px;
}
.theme-label {
  font-size: 10px;
  font-weight: 700;
  text-align: left;
}
.progress-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}
.progress-bar-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.progress-value {
  font-size: 8px;
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 24px;
  text-align: right;
}
.theme-metrics {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.metric-badge {
  font-size: 8px;
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
}
.metric-deg {
  font-family: monospace;
}
</style>
