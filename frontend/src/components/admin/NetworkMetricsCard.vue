<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>📊 全局社交网络特征指标</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content right-align">
            <h4>图论特征指标说明</h4>
            <p>基于当前全校学生、兴趣标签与活动参与构成的社交关系图谱，实时计算出的高阶网络拓扑指标。</p>
          </div>
        </div>
      </div>
    </div>
    <div class="metrics-list">
      <!-- Metric 1: Connectivity -->
      <div class="metric-row">
        <div class="metric-info">
          <div class="metric-meta">
            <span class="metric-label">🌐 全校人脉连通率</span>
            <div class="info-tooltip-wrapper sub-tooltip">
              <span class="info-icon mini-icon">?</span>
              <div class="tooltip-content right-align">
                <p>非孤立节点学生占全校学生总数的比例，反映社交融入的整体水平。</p>
              </div>
            </div>
          </div>
          <span class="metric-desc">已融入圈子学生占比</span>
        </div>
        <span class="metric-value text-cyan">{{ connectivityRate }}%</span>
      </div>

      <!-- Metric 2: Average Path Length -->
      <div class="metric-row">
        <div class="metric-info">
          <div class="metric-meta">
            <span class="metric-label">👥 平均社交距离</span>
            <div class="info-tooltip-wrapper sub-tooltip">
              <span class="info-icon mini-icon">?</span>
              <div class="tooltip-content right-align">
                <p>任意两位同学在社交网中建立关联所需的平均步数（即通过兴趣/活动的间接关联跳数）。</p>
              </div>
            </div>
          </div>
          <span class="metric-desc">全校人脉的社交分隔度</span>
        </div>
        <span class="metric-value text-orange">{{ averagePathLength }} 步</span>
      </div>

      <!-- Metric 3: Clustering Coefficient -->
      <div class="metric-row">
        <div class="metric-info">
          <div class="metric-meta">
            <span class="metric-label">🔮 圈子聚集系数</span>
            <div class="info-tooltip-wrapper sub-tooltip">
              <span class="info-icon mini-icon">?</span>
              <div class="tooltip-content right-align">
                <p>代表各个兴趣社群内部的抱团紧密程度，系数越高表明兴趣重叠与好友交集越深。</p>
              </div>
            </div>
          </div>
          <span class="metric-desc">社群内部凝聚力指数</span>
        </div>
        <span class="metric-value text-purple">{{ clusteringCoefficient }}</span>
      </div>

      <!-- Metric 4: Network Density -->
      <div class="metric-row">
        <div class="metric-info">
          <div class="metric-meta">
            <span class="metric-label">📈 人脉网络密度</span>
            <div class="info-tooltip-wrapper sub-tooltip">
              <span class="info-icon mini-icon">?</span>
              <div class="tooltip-content right-align">
                <p>实际连线数量与理论上最大可能连线数量的比值，体现关联的密集程度。</p>
              </div>
            </div>
          </div>
          <span class="metric-desc">网络关联的紧密比例</span>
        </div>
        <span class="metric-value text-green">{{ networkDensity }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  connectivityRate,
  averagePathLength,
  clusteringCoefficient,
  networkDensity
} from '@/composables/useGraphInsights'
</script>

<style scoped>
.dashboard-grid-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, rgba(18, 24, 38, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%) !important;
  padding: 10px 14px !important;
  box-sizing: border-box;
}

.col-header {
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

.metrics-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  justify-content: space-between;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  padding: 8px 12px;
  box-sizing: border-box;
  text-align: left;
  transition: all 0.3s ease;
}

.metric-row:hover {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.metric-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.metric-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-label {
  font-size: 10.5px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.mini-icon {
  font-size: 8px;
  width: 11px;
  height: 11px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 2px;
}

.sub-tooltip .tooltip-content {
  width: 150px;
  font-weight: normal;
  line-height: 1.3;
}

.metric-value {
  font-family: Consolas, monospace;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  flex-shrink: 0;
}

.metric-desc {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.1;
  margin-top: 2px;
}

/* Colors with soft glow shadows */
.text-cyan {
  color: var(--accent-cyan);
  text-shadow: 0 0 6px rgba(6, 182, 212, 0.2);
}

.text-orange {
  color: #ffa726;
  text-shadow: 0 0 6px rgba(255, 167, 38, 0.2);
}

.text-purple {
  color: #b388ff;
  text-shadow: 0 0 6px rgba(179, 136, 255, 0.2);
}

.text-green {
  color: #34d399;
  text-shadow: 0 0 6px rgba(52, 211, 153, 0.2);
}

/* Make tooltips in this card pop up upwards */
:deep(.tooltip-content) {
  top: auto !important;
  bottom: 140% !important;
  transform: translateX(-50%) translateY(4px) !important;
}

:deep(.info-tooltip-wrapper:hover .tooltip-content) {
  transform: translateX(-50%) translateY(0) !important;
}

:deep(.tooltip-content.left-align) {
  left: 0 !important;
  transform: translateY(4px) !important;
}
:deep(.info-tooltip-wrapper:hover .tooltip-content.left-align) {
  transform: translateY(0) !important;
}

:deep(.tooltip-content.right-align) {
  right: 0 !important;
  left: auto !important;
  transform: translateY(4px) !important;
}
:deep(.info-tooltip-wrapper:hover .tooltip-content.right-align) {
  transform: translateY(0) !important;
}
</style>
