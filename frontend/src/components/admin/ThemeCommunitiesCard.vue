<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🔮 主题社群划分与活跃度诊断</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content left-align">
            <h4>主题社群分析说明</h4>
            <p>基于运动、艺术、科技、社交四大领域类别，划分兴趣关联关系。环状图展示了各大兴趣领域学生参与人次的分布比重，指点悬停至不同区块可实时获取各社群的具体覆盖率与社交活跃度数。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-scroll-body">
      <div class="theme-communities-donut-layout">
        <!-- Left: Donut Chart -->
        <div class="donut-chart-container">
          <svg class="donut-svg" viewBox="0 0 100 100">
            <!-- Background circle track -->
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke="rgba(255,255,255,0.03)" 
              stroke-width="9" 
            />
            <!-- Donut segments -->
            <circle
              v-for="slice in slices"
              :key="slice.domain"
              class="donut-segment"
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke-width="9"
              :stroke="slice.color"
              :stroke-dasharray="slice.strokeDasharray"
              :stroke-dashoffset="slice.strokeDashoffset"
              transform="rotate(-90 50 50)"
              @mouseenter="hoveredSlice = slice"
              @mouseleave="hoveredSlice = null"
              :style="{ '--hover-color': slice.color }"
              :class="{ 'segment-highlighted': hoveredSlice?.domain === slice.domain }"
            />
            
            <!-- Center Text Group -->
            <g class="donut-center-text">
              <text x="50" y="42" class="center-title">{{ hoveredSlice ? hoveredSlice.label + '社群' : '主题社群' }}</text>
              <text x="50" y="55" class="center-value">{{ hoveredSlice ? `👥 ${hoveredSlice.size}人` : `共 ${totalSize}人次` }}</text>
              <text x="50" y="66" class="center-sub">{{ hoveredSlice ? `⚡ 均度: ${hoveredSlice.avgDegree}` : '悬停诊断' }}</text>
            </g>
          </svg>
        </div>

        <!-- Right: Legend list -->
        <div class="donut-legend-list">
          <div 
            v-for="slice in slices" 
            :key="slice.domain" 
            class="legend-item"
            :class="{ 'legend-item-active': hoveredSlice?.domain === slice.domain }"
            @mouseenter="hoveredSlice = slice"
            @mouseleave="hoveredSlice = null"
            :style="{ '--theme-color': slice.color }"
          >
            <div class="legend-header">
              <span class="legend-dot" :style="{ backgroundColor: slice.color }"></span>
              <span class="legend-label">{{ slice.label }}社群</span>
              <span class="legend-percentage">{{ slice.percentage }}%</span>
            </div>
            <div class="legend-details">
              <span>👥 {{ slice.size }}人</span>
              <span class="legend-deg">⚡ 均度: {{ slice.avgDegree }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { themeCommunities } from '@/composables/useGraphInsights'

const hoveredSlice = ref<any | null>(null)

const totalSize = computed(() => {
  return themeCommunities.value.reduce((acc, item) => acc + item.size, 0)
})

const slices = computed(() => {
  const C = 2 * Math.PI * 40 // Circumference: ~251.327
  let accumulatedPercent = 0
  
  return themeCommunities.value.map(item => {
    const share = totalSize.value > 0 ? (item.size / totalSize.value) : 0
    const sliceLength = C * share
    const strokeDasharray = `${sliceLength} ${C}`
    const strokeDashoffset = -C * accumulatedPercent
    
    accumulatedPercent += share
    
    return {
      ...item,
      share,
      strokeDasharray,
      strokeDashoffset,
    }
  })
})
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
.theme-communities-donut-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
.donut-chart-container {
  flex: 0 0 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.donut-svg {
  width: 100%;
  height: auto;
  max-width: 130px;
}
.donut-segment {
  cursor: pointer;
  transition: stroke-width 0.25s ease, filter 0.25s ease;
}
.donut-segment:hover,
.donut-segment.segment-highlighted {
  stroke-width: 12px;
  filter: drop-shadow(0 0 6px var(--hover-color));
}
.donut-center-text {
  pointer-events: none;
}
.donut-center-text text {
  text-anchor: middle;
  font-family: system-ui, -apple-system, sans-serif;
}
.center-title {
  font-size: 8px;
  font-weight: 700;
  fill: var(--text-primary);
}
.center-value {
  font-size: 9px;
  font-weight: bold;
  fill: #ffb74d;
}
.center-sub {
  font-size: 5.5px;
  fill: var(--text-secondary);
}
.donut-legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}
.legend-item {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
}
.legend-item:hover,
.legend-item-active {
  background: rgba(30, 41, 59, 0.7);
  border-color: var(--theme-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.legend-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}
.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-label {
  font-weight: 700;
  color: var(--text-primary);
}
.legend-percentage {
  margin-left: auto;
  font-family: monospace;
  font-weight: 700;
}
.legend-details {
  display: flex;
  gap: 8px;
  font-size: 8px;
  color: var(--text-secondary);
  padding-left: 12px;
}
.legend-deg {
  font-family: monospace;
}
</style>
