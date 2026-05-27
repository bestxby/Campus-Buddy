<template>
  <div v-show="visible" class="fullscreen-graph-overlay fade-in">
    <div class="fullscreen-modal-card card glow-cyan">
      <!-- Header -->
      <div class="fullscreen-modal-header">
        <div class="vis-title-group">
          <h3>🌐 {{ viewMode === 'matrix' ? '校园人脉邻接关联矩阵' : (isGlobalMode ? '校园全局人脉拓扑网络' : '局域关联拓扑网络') }}</h3>
          <span class="vis-subtitle">
            {{ viewMode === 'matrix' ? '通过二维网格交叉诊断兴趣重合与活动参与' : (isGlobalMode ? '全校兴趣社群与活动分布骨干网络图谱' : (currentUserRole === 'admin' ? `${activeStudent} 的双跳聚焦关系网络` : '您的双跳聚焦关系网络')) }}
          </span>
        </div>
        <div class="modal-controls-row">
          <!-- Return to Matrix Button (Admin Only, when activeStudent is selected and in network view mode) -->
          <button
            v-if="currentUserRole === 'admin' && activeStudent && viewMode === 'network'"
            class="return-matrix-btn-neon"
            @click="viewMode = 'matrix'"
            title="返回全校人脉邻接关联矩阵"
          >
            🧮 返回人脉矩阵
          </button>

          <!-- Matrix Mode Select -->
          <div class="matrix-mode-select-wrap" v-if="viewMode === 'matrix'">
            <select v-model="matrixMode" class="matrix-select-neon">
              <option value="student-interest">👤 学生个人兴趣倾向</option>
              <option value="interest-cooccurrence">🎯 兴趣社群交叉共现</option>
              <option value="student-activity">🎉 校园活动参与分布</option>
            </select>
            <button
              v-if="activeStudent"
              class="view-network-btn-neon"
              @click="viewMode = 'network'"
              title="切换至该学生的双跳拓扑关系网络"
            >
              🌌 查看 {{ activeStudent }} 的聚焦关系网络
            </button>
          </div>

          <div class="canvas-toggles" v-if="viewMode === 'network'">
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
            </div>
            <div class="limit-slider-group" v-if="!isGlobalMode">
              <span class="slider-label">👥 推荐搭子限额: {{ buddyLimit }}人</span>
              <input type="range" min="0" :max="maxLimit" step="1" v-model.number="buddyLimit" class="neon-slider" />
            </div>
          </div>
          <div class="zoom-controls-modal" v-if="viewMode === 'network'">
            <button @click="zoomIn" class="zoom-btn" title="放大" aria-label="放大">➕</button>
            <button @click="zoomOut" class="zoom-btn" title="缩小" aria-label="缩小">➖</button>
            <button @click="resetZoom" class="zoom-btn" title="重置" aria-label="重置">🔄</button>
          </div>
          <button @click="close" class="close-modal-btn" title="关闭拓扑图" aria-label="关闭">❌</button>
        </div>
      </div>

      <!-- Canvas -->
      <div class="fullscreen-canvas-container">
        <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block;"></canvas>
        
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
        

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { graph } from '@/composables/useGraph'
import { activeStudent, recommendations, selectStudent, pathResult } from '@/composables/useRecommendations'
import { currentUser, currentUserRole, signedUpActivities } from '@/composables/useAuth'
import { useGraphStore } from '@/stores/graph'
import type { HoveredConnectionDetail } from '@/types'
import { ForceGraphRenderer } from '@/services/ForceGraphRenderer'
import { AdjacencyMatrixRenderer } from '@/services/AdjacencyMatrixRenderer'

// ─── Local State ───────────────────────────────────────────────────────────────
const visible        = ref(false)
const canvasRef      = ref<HTMLCanvasElement | null>(null)
const hideBuddies    = ref(false)
const hideActivities = ref(false)
const maxLimit       = computed(() => currentUserRole.value === 'admin' ? 40 : 10)
const buddyLimit     = ref(currentUserRole.value === 'admin' ? 30 : 10)
const showGlobal     = ref(false)
const hoveredDetail  = ref<HoveredConnectionDetail | null>(null)
const viewMode       = ref<'network' | 'matrix'>('network')
const matrixMode     = ref<'student-interest' | 'student-activity' | 'interest-cooccurrence'>('student-interest')
let   graphRenderer: ForceGraphRenderer | null = null
let   matrixRenderer: AdjacencyMatrixRenderer | null = null

const isGlobalMode = computed(() => {
  if (currentUserRole.value !== 'admin') return false
  return showGlobal.value || !activeStudent.value
})

watch(maxLimit, (newMax) => {
  if (buddyLimit.value > newMax) {
    buddyLimit.value = newMax
  }
}, { immediate: true })

// ─── Public API ────────────────────────────────────────────────────────────────
const open = (
  forceGlobal?: boolean,
  initialViewMode?: 'network' | 'matrix',
  initialMatrixMode?: 'student-interest' | 'student-activity' | 'interest-cooccurrence'
) => {
  visible.value = true
  if (forceGlobal === true && currentUserRole.value === 'admin') {
    showGlobal.value = true
  }
  if (initialViewMode) {
    viewMode.value = initialViewMode
  } else if (showGlobal.value || !activeStudent.value) {
    viewMode.value = 'matrix'
  } else {
    viewMode.value = 'network'
  }
  if (initialMatrixMode) {
    matrixMode.value = initialMatrixMode
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
  if (viewMode.value === 'network') graphRenderer?.zoomIn()
}
const zoomOut = () => {
  if (viewMode.value === 'network') graphRenderer?.zoomOut()
}
const resetZoom = () => {
  if (viewMode.value === 'network') graphRenderer?.resetZoom()
}

// ─── D3 Force-directed Graph Renderer Delegation ──────────────────────────────
let drawScheduled = false
const drawGraph = () => {
  if (!canvasRef.value) return
  if (drawScheduled) return
  drawScheduled = true

  nextTick(() => {
    drawScheduled = false
    if (!canvasRef.value) return

    if (viewMode.value === 'network') {
      if (matrixRenderer) {
        matrixRenderer.destroy()
        matrixRenderer = null
      }

      if (!graphRenderer) {
        graphRenderer = new ForceGraphRenderer(canvasRef.value, {
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
        recommendations: recommendations.value,
        hideBuddies: hideBuddies.value,
        hideActivities: hideActivities.value,
        buddyLimit: buddyLimit.value,
        pathResult: pathResult.value,
        currentUser: currentUser.value,
        currentUserRole: currentUserRole.value,
        showGlobal: currentUserRole.value === 'admin' ? showGlobal.value : false,
        privateStudents: useGraphStore().privateStudents,
      })
    } else {
      if (graphRenderer) {
        graphRenderer.destroy()
        graphRenderer = null
      }

      if (!matrixRenderer) {
        matrixRenderer = new AdjacencyMatrixRenderer(canvasRef.value, {
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

      matrixRenderer.draw({
        graph: graph.value,
        activeStudent: activeStudent.value,
        matrixMode: matrixMode.value,
      })
    }
  })
}

// Unified watcher for all reactive state changes that trigger redraw
watch(
  [
    hideBuddies,
    hideActivities,
    buddyLimit,
    showGlobal,
    viewMode,
    matrixMode,
    activeStudent,
    pathResult,
    () => signedUpActivities.value
  ],
  ([_hb, _ha, _bl, _sg, _vm, _mm, newStudent], [_ohb, _oha, _obl, _osg, _ovm, _omm, oldStudent]) => {
    if (newStudent !== oldStudent) {
      showGlobal.value = false
      if (!newStudent) {
        viewMode.value = 'matrix'
      }
    }
    if (visible.value) drawGraph()
  },
  { deep: true }
)

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
  if (matrixRenderer) {
    matrixRenderer.destroy()
    matrixRenderer = null
  }
})
</script>

<style scoped src="./GraphModal.css"></style>
