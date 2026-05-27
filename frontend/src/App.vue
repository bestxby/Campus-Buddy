<template>
  <!-- Login overlay (shown when no active user) -->
  <LoginOverlay v-if="!currentUser" @submitted="onRegistered" />

  <!-- Main dashboard -->
  <div v-else class="dashboard">
    <AppSidebar 
      :width="sidebarWidth" 
      @logout="onLogout" 
      @open-graph="openGraph" 
      @create-activity="showCreateActivity = true"
    />
    <div class="layout-splitter vertical-splitter" @mousedown="startSidebarResize" />

    <main class="main-content">



      <div class="content-grid">
        <!-- Welcome screen / Admin Dashboard (no student selected) -->
        <template v-if="!activeStudent">
          <AdminDashboard v-if="currentUserRole === 'admin'" @create-activity="showCreateActivity = true" />
          <div v-else class="card welcome-card fade-in">
            <h2>👋 欢迎，{{ currentUser }}！</h2>
            <p>
              系统已分析您的多选兴趣并与 1,500+ 的校园图网络合并。点击下方按钮即可开启您的画像分析与社交推荐匹配。
            </p>
            <button @click="selectStudent(currentUser!)" class="btn glow-orange select-self-btn">
              查看我的匹配推荐
            </button>
            <div class="tip-box">
              <strong>💡 D3.js 力导向画布提示：</strong>
              <p>
                右侧画布将渲染您的专属<b>二步关系子图 (Focal Subgraph)</b>，支持拖拽节点和滚动缩放，悬停节点可高亮连接路径。
              </p>
            </div>
          </div>
        </template>

        <!-- Recommendations panel -->
        <div v-else class="recommendations fade-in">
          <!-- Student Entry: Full-width clickable card to open graph -->
          <div
            v-if="currentUserRole === 'student'"
            class="student-graph-btn-card card"
            @click="openGraph"
          >
            <div class="student-card-content">
              <span class="btn-icon">🌌</span>
              <span class="btn-text-content">查看我的关系网络拓扑图</span>
            </div>
            <span class="btn-arrow">➔</span>
          </div>

          <div class="recommendations-row">
            <div class="rec-split-col">
              <RecommendedActivities />
            </div>
            <div class="rec-split-col">
              <AllActivities />
            </div>
            <div class="rec-split-col">
              <BuddyList @open-graph-highlight="openGraph" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Fullscreen D3 Graph Modal -->
    <GraphModal ref="graphModalRef" />

    <!-- Create Activity Modal -->
    <CreateActivityModal 
      :visible="showCreateActivity" 
      @close="showCreateActivity = false"
      @created="onActivityCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import LoginOverlay  from '@/components/LoginOverlay.vue'
import AppSidebar    from '@/components/AppSidebar.vue'
import RecommendedActivities from '@/components/RecommendedActivities.vue'
import AllActivities from '@/components/AllActivities.vue'
import BuddyList     from '@/components/BuddyList.vue'
import GraphModal    from '@/components/GraphModal.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import CreateActivityModal from '@/components/admin/CreateActivityModal.vue'

import { loadGraphData, updateStats } from '@/composables/useGraph'
import { currentUser, restoreSession, currentUserRole } from '@/composables/useAuth'
import { activeStudent, selectStudent, clearSearch } from '@/composables/useRecommendations'
import { graphAnalyticsService } from '@/services/GraphAnalyticsService'

const showCreateActivity = ref(false)

// ─── Graph Modal ───────────────────────────────────────────────────────────────
const graphModalRef = ref<InstanceType<typeof GraphModal> | null>(null)
const openGraph     = (forceGlobal?: any) => {
  const isGlobal = typeof forceGlobal === 'boolean' ? forceGlobal : undefined
  graphModalRef.value?.open(isGlobal)
}

// ─── Event handlers ────────────────────────────────────────────────────────────
const onActivityCreated = () => {
  if (graphModalRef.value) {
    graphModalRef.value.redraw()
  }
}

const onRegistered = () => {
  if (currentUser.value && currentUserRole.value !== 'admin') {
    selectStudent(currentUser.value)
  } else {
    clearSearch()
  }
}
const onLogout     = () => clearSearch()

// Reset update prompt whenever the viewed student changes
// Enforce student profile lock: if role is student, activeStudent MUST be currentUser
watch([currentUser, currentUserRole], ([user, role]) => {
  if (role === 'student' && user) {
    selectStudent(user)
  } else {
    clearSearch()
  }
}, { immediate: true })

watch(activeStudent, (newStudent) => {
  if (currentUserRole.value === 'student' && newStudent !== currentUser.value) {
    if (currentUser.value) {
      selectStudent(currentUser.value)
    }
  }
})

// ─── Sidebar Resize ────────────────────────────────────────────────────────────
const sidebarWidth = ref(330)
let _resizeStartX = 0, _resizeStartW = 0

const startSidebarResize = (e: MouseEvent) => {
  _resizeStartX = e.clientX
  _resizeStartW = sidebarWidth.value
  document.body.style.userSelect = 'none'
  const onMove = (ev: MouseEvent) => {
    const w = _resizeStartW + (ev.clientX - _resizeStartX)
    if (w >= 250 && w <= 450) sidebarWidth.value = w
  }
  const onUp = () => {
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadGraphData()
  restoreSession()
  graphAnalyticsService.initialize()
  // updateStats() ensures admin panel stats are populated after restoreSession()
  updateStats()
  // selectStudent() is handled automatically by the watch([currentUser, currentUserRole]) above
})
</script>

<style scoped>
/* Layout */
.dashboard { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; padding: 16px 16px 0 16px; }
.content-grid { flex: 1; display: flex; padding: 16px 0; overflow: hidden; }
.layout-splitter { flex-shrink: 0; width: 5px; cursor: col-resize; background: transparent; transition: background 0.2s; }
.layout-splitter:hover, .layout-splitter:active { background: rgba(253,151,31,0.3); }
.vertical-splitter { height: 100%; }

/* Welcome card */
.welcome-card { flex: 1; align-self: flex-start; padding: 32px; max-width: 680px; }
.welcome-card h2 { margin: 0 0 12px; font-size: 20px; }
.welcome-card p  { color: var(--text-secondary); font-size: 13px; margin-bottom: 20px; }
.select-self-btn { padding: 10px 24px; font-size: 13px; }
.tip-box { margin-top: 20px; padding: 14px 18px; background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.15); border-radius: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
.tip-box strong { color: var(--accent-cyan); display: block; margin-bottom: 6px; }
.tip-box p { margin: 0; }

/* Recommendations */
.recommendations {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  height: 100%;
  padding: 10px 10px 0;
  margin: -10px -10px 0;
}
.recommendations-row {
  display: flex;
  gap: 16px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  padding: 10px 10px 0;
  margin: -10px -10px 0;
}
.rec-split-col {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 10px 10px 0;
  margin: -10px -10px 0;
}

/* Student Entry Card */
.student-graph-btn-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px !important;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.98) 0%, rgba(30, 41, 59, 0.92) 100%) !important;
  border: none !important;
  border-radius: 8px;
  flex-shrink: 0;
  user-select: none;
  position: relative;
  z-index: 0;
}
.student-graph-btn-card::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  z-index: -1;
  border-radius: 9px;
  background: conic-gradient(
    from 0deg,
    #fd971f,
    #ec4899,
    #8b5cf6,
    #06b6d4,
    #34d399,
    #fd971f
  );
  animation: borderSpin 4s linear infinite;
  transition: inset 0.3s ease;
}
.student-graph-btn-card:hover {
  transform: translateY(-2px);
}
.student-graph-btn-card:hover::before {
  inset: -2.5px;
  border-radius: 10px;
}
@keyframes borderSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.student-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}
.student-graph-btn-card:hover .btn-icon {
  transform: rotate(15deg) scale(1.15);
}
.btn-text-content {
  font-size: 13px;
  font-weight: 700;
  color: #ffb74d;
}
.btn-arrow {
  font-size: 14px;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}
.student-graph-btn-card:hover .btn-arrow {
  transform: translateX(4px);
  color: var(--accent-orange);
}

/* Admin Entry Card */
.active-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  flex-shrink: 0;
}
.active-profile h2 {
  font-size: 15px;
  margin: 0;
}
.profile-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}


</style>
