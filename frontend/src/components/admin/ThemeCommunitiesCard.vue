<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🔮 主题社群划分与活跃度诊断</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content left-align">
            <h4>主题社群分析说明</h4>
            <p>基于运动、艺术、科技、社交四大领域类别，实时 analysis 对应圈子的学生覆盖比例（即参与了该类兴趣的学生占比）以及在该圈子中活跃学生的平均社交度数（连接活跃度）。有助于管理员动态发现冷门社群并针对性发布活动进行调控。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-scroll-body">
      <div class="theme-communities-grid">
        <div 
          v-for="item in themeCommunities" 
          :key="item.domain" 
          class="theme-community-card-cell"
          :style="{ borderColor: 'rgba(' + hexToRgb(item.color) + ', 0.15)' }"
        >
          <div class="cell-header">
            <span class="cell-icon-label">
              <span class="cell-icon">{{ item.icon }}</span>
              <span class="cell-label" :style="{ color: item.color }">{{ item.label }}社群</span>
            </span>
            <span class="cell-percentage" :style="{ color: item.color }">{{ item.percentage }}%</span>
          </div>
          
          <div class="cell-progress">
            <div class="progress-bar-track">
              <div 
                class="progress-bar-fill" 
                :style="{ width: item.percentage + '%', background: item.color, boxShadow: '0 0 6px ' + item.color }"
              ></div>
            </div>
          </div>
          
          <div class="cell-metrics">
            <span class="metric-badge">👥 {{ item.size }}人</span>
            <span class="metric-badge metric-deg" :style="{ color: item.color, borderColor: 'rgba(' + hexToRgb(item.color) + ', 0.3)' }">⚡ {{ item.avgDegree }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { themeCommunities } from '@/composables/useGraphInsights'

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
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
  overflow-y: hidden;
  height: 100%;
}
.theme-communities-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  height: 100%;
  padding: 2px 0;
  box-sizing: border-box;
}
.theme-community-card-cell {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  transition: all 0.3s ease;
}
.theme-community-card-cell:hover {
  background: rgba(30, 41, 59, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
}
.cell-icon-label {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cell-icon {
  font-size: 12px;
}
.cell-label {
  font-weight: 700;
}
.cell-percentage {
  font-family: monospace;
  font-weight: 700;
  font-size: 10.5px;
}
.cell-progress {
  width: 100%;
  margin: 4px 0;
}
.progress-bar-track {
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
.cell-metrics {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}
.metric-badge {
  font-size: 8.5px;
  padding: 1.5px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
}
.metric-deg {
  font-family: monospace;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
