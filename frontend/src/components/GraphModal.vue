<template>
  <div v-show="visible" class="fullscreen-graph-overlay fade-in">
    <div class="fullscreen-modal-card card glow-cyan">
      <!-- Close Button (decoupled from header flow) -->
      <button @click="close" class="close-modal-btn" title="关闭拓扑图" aria-label="关闭">
        <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Header -->
      <div class="fullscreen-modal-header">
        <div class="vis-title-group">
          <h3>
            <svg class="icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: -1px; color: var(--accent-cyan);">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            {{ viewMode === 'matrix' ? '校园人脉邻接关联矩阵' : (isGlobalMode ? '校园全局人脉拓扑网络' : '局域关联拓扑网络') }}
          </h3>
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
            style="display: inline-flex; align-items: center; gap: 6px;"
          >
            <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            返回人脉矩阵
          </button>

          <!-- Matrix Mode Select -->
          <div class="matrix-mode-select-wrap" v-if="viewMode === 'matrix'">
            <select v-model="matrixMode" class="matrix-select-neon">
              <option value="student-interest">学生个人兴趣倾向</option>
              <option value="interest-cooccurrence">兴趣社群交叉共现</option>
              <option value="student-activity">校园活动参与分布</option>
            </select>
            <button
              v-if="activeStudent"
              class="view-network-btn-neon"
              @click="viewMode = 'network'"
              title="切换至该学生的双跳拓扑关系网络"
              style="display: inline-flex; align-items: center; gap: 6px;"
            >
              <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              查看 {{ activeStudent }} 的聚焦关系网络
            </button>
          </div>

          <div class="canvas-toggles" v-if="viewMode === 'network'">
            <div class="toggle-group">
              <label class="neon-checkbox" style="display: inline-flex; align-items: center;">
                <input type="checkbox" v-model="hideBuddies" />
                <span class="checkbox-box"></span>
                <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                隐藏同学
              </label>
              <label class="neon-checkbox" style="display: inline-flex; align-items: center;">
                <input type="checkbox" v-model="hideActivities" />
                <span class="checkbox-box"></span>
                <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                隐藏活动
              </label>
            </div>
            <div class="limit-slider-group" v-if="!isGlobalMode">
              <span class="slider-label" style="display: inline-flex; align-items: center; gap: 4px;">
                <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                推荐搭子限额: {{ buddyLimit }}人
              </span>
              <input type="range" min="0" :max="maxLimit" step="1" v-model.number="buddyLimit" class="neon-slider" />
            </div>
          </div>
          <div class="zoom-controls-modal" v-if="viewMode === 'network'">
            <button @click="zoomIn" class="zoom-btn" title="放大" aria-label="放大" style="display: inline-flex; align-items: center; justify-content: center;">
              <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button @click="zoomOut" class="zoom-btn" title="缩小" aria-label="缩小" style="display: inline-flex; align-items: center; justify-content: center;">
              <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button @click="resetZoom" class="zoom-btn" title="重置" aria-label="重置" style="display: inline-flex; align-items: center; justify-content: center;">
              <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div class="fullscreen-canvas-container" ref="canvasContainerRef">

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
const visible            = ref(false)
const canvasRef          = ref<HTMLCanvasElement | null>(null)
const canvasContainerRef = ref<HTMLDivElement | null>(null)
const hideBuddies        = ref(false)
const hideActivities     = ref(false)
const maxLimit           = computed(() => currentUserRole.value === 'admin' ? 40 : 10)
const buddyLimit         = ref(currentUserRole.value === 'admin' ? 30 : 10)
const showGlobal         = ref(false)
const hoveredDetail      = ref<HoveredConnectionDetail | null>(null)
const viewMode           = ref<'network' | 'matrix'>('network')
const matrixMode         = ref<'student-interest' | 'student-activity' | 'interest-cooccurrence'>('student-interest')
let   graphRenderer: ForceGraphRenderer | null = null
let   matrixRenderer: AdjacencyMatrixRenderer | null = null
let   resizeObserver: ResizeObserver | null = null

const isGlobalMode = computed(() => {
  if (currentUserRole.value !== 'admin') return false
  return showGlobal.value || !activeStudent.value
})

watch(maxLimit, (newMax) => {
  if (buddyLimit.value > newMax) {
    buddyLimit.value = newMax
  }
}, { immediate: true })

// ─── Resize Observer Helper ───────────────────────────────────────────────────
const startObserving = () => {
  if (!canvasContainerRef.value) return
  if (window.ResizeObserver) {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    resizeObserver = new ResizeObserver((entries) => {
      let hasValidSize = false
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          hasValidSize = true
        }
      }
      if (hasValidSize) {
        redraw()
      }
    })
    resizeObserver.observe(canvasContainerRef.value)
  } else {
    window.addEventListener('resize', redraw)
    redraw()
  }
}

const stopObserving = () => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  } else {
    window.removeEventListener('resize', redraw)
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────
const open = (
  forceGlobal?: boolean,
  initialViewMode?: 'network' | 'matrix',
  initialMatrixMode?: 'student-interest' | 'student-activity' | 'interest-cooccurrence'
) => {
  visible.value = true
  
  // Lock body scroll to prevent viewport size shifting from toggling background scrollbars
  document.body.style.overflow = 'hidden'

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
  
  nextTick(() => {
    startObserving()
  })
}
const close = () => {
  visible.value = false
  
  // Restore body scroll
  document.body.style.overflow = ''
  stopObserving()
  if (graphRenderer) {
    graphRenderer.destroy()
    graphRenderer = null
  }
  if (matrixRenderer) {
    matrixRenderer.destroy()
    matrixRenderer = null
  }
  hoveredDetail.value = null
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

// ─── D3 Force-directed Graph/Matrix Renderer Delegation ────────────────────────
let drawFrameId: number | null = null
const drawGraph = () => {
  if (!canvasRef.value) return
  
  // Cancel any previously scheduled draw in the current animation frame to collapse consecutive requests
  if (drawFrameId !== null) {
    cancelAnimationFrame(drawFrameId)
  }
  
  drawFrameId = requestAnimationFrame(() => {
    drawFrameId = null
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
  if (visible.value) {
    startObserving()
  }
})

onUnmounted(() => {
  // Ensure body scroll is unlocked in case modal is unmounted abruptly
  document.body.style.overflow = ''

  stopObserving()
  if (drawFrameId !== null) {
    cancelAnimationFrame(drawFrameId)
  }
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
