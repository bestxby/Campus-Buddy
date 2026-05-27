<template>
  <div class="dashboard-grid-card card">
    <div class="card-header">
      <div class="title-with-info">
        <h3>🎯 兴趣社群交叉共现矩阵</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content right-align">
            <h4>兴趣交叉共现诊断说明</h4>
            <p>展示全校各项兴趣之间的交叉重合情况。格子越红/橙表示同时拥有这两种兴趣的学生人数越多，对角线上的数字代表该兴趣圈的总人数。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="matrix-canvas-container" ref="containerRef">
      <canvas ref="canvasRef"></canvas>
      
      <!-- Local Tooltip -->
      <div v-if="hoveredDetail" class="matrix-tooltip fade-in">
        <div class="tooltip-header">
          <span class="tooltip-icon">🎯</span>
          <h4>{{ hoveredDetail.title }}</h4>
        </div>
        <div class="tooltip-body">
          <p>{{ hoveredDetail.details }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { graph } from '@/composables/useGraph'
import { AdjacencyMatrixRenderer } from '@/services/AdjacencyMatrixRenderer'
import type { HoveredConnectionDetail } from '@/types'

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hoveredDetail = ref<HoveredConnectionDetail | null>(null)
let renderer: AdjacencyMatrixRenderer | null = null

const initRenderer = () => {
  if (!canvasRef.value) return
  renderer = new AdjacencyMatrixRenderer(canvasRef.value, {
    onHover: (detail) => {
      hoveredDetail.value = detail
    }
  })
  draw()
}

const draw = () => {
  if (!renderer) return
  renderer.draw({
    graph: graph.value,
    matrixMode: 'interest-cooccurrence'
  })
}

// Watch graph to redraw
watch(graph, () => {
  draw()
}, { deep: true })

onMounted(() => {
  initRenderer()
  window.addEventListener('resize', draw)
})

onUnmounted(() => {
  window.removeEventListener('resize', draw)
  if (renderer) {
    renderer.destroy()
    renderer = null
  }
})
</script>

<style scoped>
.dashboard-grid-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
  background: linear-gradient(180deg, rgba(18, 24, 38, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%) !important;
  padding: 14px 18px !important;
  box-sizing: border-box;
}
.card-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.card-header h3 {
  font-size: 12px;
  margin: 0;
  color: var(--text-primary);
  font-weight: bold;
  text-align: left;
}
.matrix-canvas-container {
  flex: 1;
  position: relative;
  min-height: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.matrix-tooltip {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  width: 180px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(253, 151, 31, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  padding: 8px;
  pointer-events: none;
}
.tooltip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 4px;
}
.tooltip-icon {
  font-size: 11px;
}
.tooltip-header h4 {
  margin: 0;
  font-size: 11px;
  color: var(--text-primary);
  font-weight: 700;
}
.tooltip-body p {
  margin: 0;
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.3;
  text-align: left;
}
</style>
