<template>
  <div v-show="visible" class="fullscreen-graph-overlay fade-in">
    <div class="fullscreen-modal-card card glow-cyan">
      <!-- Header -->
      <div class="fullscreen-modal-header">
        <div class="vis-title-group">
          <h3>🌐 {{ isGlobalMode ? '校园全局人脉拓扑网络' : '局域关联拓扑网络' }}</h3>
          <span class="vis-subtitle">
            {{ isGlobalMode ? '全校兴趣社群与活动分布骨干网络图谱' : (currentUserRole === 'admin' ? `${activeStudent} 的双跳聚焦关系网络` : '您的双跳聚焦关系网络') }}
          </span>
        </div>
        <div class="modal-controls-row">
          <div class="canvas-toggles">
            <div class="toggle-group">
              <label class="neon-checkbox">
                <input type="checkbox" v-model="hideBuddies" />
                <span class="checkbox-box"></span>
                👁️ 隐藏同学
              </label>
              <label class="neon-checkbox">
                <input type="checkbox" v-model="hideActivities" />
                <span class="checkbox-box"></span>
                👁️ 隐藏活动
              </label>
              <label class="neon-checkbox" v-if="activeStudent">
                <input type="checkbox" v-model="showGlobal" />
                <span class="checkbox-box"></span>
                🌐 全局骨干网络
              </label>
            </div>
            <div class="limit-slider-group">
              <span class="slider-label">👥 推荐搭子限额: {{ buddyLimit }}人</span>
              <input type="range" min="0" max="40" step="1" v-model.number="buddyLimit" class="neon-slider" />
            </div>
          </div>
          <div class="zoom-controls-modal">
            <button @click="zoomIn" class="zoom-btn" title="放大">➕</button>
            <button @click="zoomOut" class="zoom-btn" title="缩小">➖</button>
            <button @click="resetZoom" class="zoom-btn" title="重置">🔄</button>
          </div>
          <button @click="close" class="close-modal-btn" title="关闭拓扑图">❌</button>
        </div>
      </div>

      <!-- Canvas -->
      <div class="fullscreen-canvas-container">
        <svg ref="svgRef" width="100%" height="100%"></svg>
        
        <!-- Hover tooltip -->
        <div v-if="hoveredDetail" class="vis-tooltip fade-in">
          <div class="tooltip-header">
            <span class="tooltip-icon">
              {{ hoveredDetail.type === 'student' ? '👤' : (hoveredDetail.type === 'activity' ? '🎉' : '🎯') }}
            </span>
            <h4>{{ hoveredDetail.title }}</h4>
          </div>
          <div class="tooltip-body">
            <p>{{ hoveredDetail.details }}</p>
          </div>
        </div>
        
        <div class="canvas-hint">
          💡 支持滚动鼠标缩放，拖拽/悬停节点<span v-if="currentUserRole === 'admin'">，点击同学可切换视图</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { graph } from '@/composables/useGraph'
import { activeStudent, recommendations, selectStudent, pathResult } from '@/composables/useRecommendations'
import { currentUser, currentUserRole, signedUpActivities } from '@/composables/useAuth'
import type { HoveredConnectionDetail } from '@/types'
import { ForceGraphRenderer } from '@/services/ForceGraphRenderer'

// ─── Local State ───────────────────────────────────────────────────────────────
const visible        = ref(false)
const svgRef         = ref<SVGSVGElement | null>(null)
const hideBuddies    = ref(false)
const hideActivities = ref(false)
const buddyLimit     = ref(30)
const showGlobal     = ref(false)
const hoveredDetail  = ref<HoveredConnectionDetail | null>(null)
let   graphRenderer: ForceGraphRenderer | null = null

const isGlobalMode = computed(() => showGlobal.value || !activeStudent.value)

// ─── Public API ────────────────────────────────────────────────────────────────
const open = (forceGlobal?: boolean) => {
  visible.value = true
  if (forceGlobal === true) {
    showGlobal.value = true
  }
  setTimeout(drawGraph, 50)
}
const close = () => {
  visible.value = false
}
const redraw = () => {
  if (visible.value) drawGraph()
}
defineExpose({ open, close, redraw })

// ─── Zoom Actions ──────────────────────────────────────────────────────────────
const zoomIn = () => {
  graphRenderer?.zoomIn()
}
const zoomOut = () => {
  graphRenderer?.zoomOut()
}
const resetZoom = () => {
  graphRenderer?.resetZoom()
}

// ─── D3 Force-directed Graph Renderer Delegation ──────────────────────────────
const drawGraph = () => {
  if (!svgRef.value) return
  if (!graphRenderer) {
    graphRenderer = new ForceGraphRenderer(svgRef.value, {
      onNodeClick: (node: any) => {
        if (node.type === 'student' && currentUserRole.value === 'admin') {
          selectStudent(node.name)
        }
      },
      onHover: (detail) => {
        hoveredDetail.value = detail
      }
    })
  }

  graphRenderer.draw({
    graph: graph.value,
    activeStudent: activeStudent.value,
    recommendations,
    hideBuddies: hideBuddies.value,
    hideActivities: hideActivities.value,
    buddyLimit: buddyLimit.value,
    pathResult: pathResult.value,
    currentUser: currentUser.value,
    currentUserRole: currentUserRole.value,
    showGlobal: showGlobal.value
  })
}

// Redraw when filter controls change
watch([hideBuddies, hideActivities, buddyLimit, showGlobal], () => {
  if (visible.value) drawGraph()
})

// Auto redraw if visible and activeStudent changes
watch(activeStudent, () => {
  showGlobal.value = false
  if (visible.value) drawGraph()
})

// Auto redraw on activity signup changes to keep graph fresh
watch(signedUpActivities, () => {
  if (visible.value) drawGraph()
}, { deep: true })

// Auto redraw on pathResult changes to draw/clear highlighted shortest paths
watch(pathResult, () => {
  if (visible.value) drawGraph()
})

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('resize', redraw)
})

onUnmounted(() => {
  window.removeEventListener('resize', redraw)
  if (graphRenderer) {
    graphRenderer.destroy()
    graphRenderer = null
  }
})
</script>

<style scoped src="./GraphModal.css"></style>
