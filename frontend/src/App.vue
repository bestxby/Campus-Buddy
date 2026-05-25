<template>
  <!-- Login overlay (shown when no active user) -->
  <LoginOverlay v-if="!currentUser" @submitted="onRegistered" />

  <!-- Main dashboard -->
  <div v-else class="dashboard">
    <AppSidebar :width="sidebarWidth" @logout="onLogout" />
    <div class="layout-splitter vertical-splitter" @mousedown="startSidebarResize" />

    <main class="main-content">
      <!-- Search Header (Admin Only) -->
      <SearchHeader v-if="currentUserRole === 'admin'" />
      <!-- Read-only Banner (Student Only) -->
      <header v-else class="card student-header-banner">
        <div class="student-header-title">
          <span class="header-badge badge-orange">👤 学生看板</span>
          <h2>个人社交推荐看板 (Personal Social Recommendation Dashboard)</h2>
        </div>
      </header>

      <div class="content-grid">
        <!-- Welcome screen (no student selected) -->
        <div v-if="!activeStudent" class="card welcome-card fade-in">
          <h2>👋 欢迎，{{ currentUser }}！</h2>
          <p v-if="currentUserRole === 'admin'">
            作为系统管理员，您可以使用顶部的搜索栏输入或选择同学姓名，调取其双跳聚焦关系网络，并进行图论社交推荐与匹配分析。
          </p>
          <p v-else>
            系统已分析您的多选兴趣并与 1,500+ 的校园图网络合并。点击下方按钮即可开启您的画像分析与社交推荐匹配。
          </p>
          <button v-if="currentUserRole !== 'admin'" @click="selectStudent(currentUser!)" class="btn glow-orange select-self-btn">
            查看我的匹配推荐
          </button>
          <div class="tip-box">
            <strong>💡 D3.js 力导向画布提示：</strong>
            <p v-if="currentUserRole === 'admin'">
              选中特定同学后，点击“查看关系网络拓扑图”即可开启力导向图可视化。支持跨界人脉最短路径查找与高亮。在管理员模式下，您可以在拓扑图中直接点击其他同学节点，无缝下钻切换其视图。
            </p>
            <p v-else>
              右侧画布将渲染您的专属<b>二步关系子图 (Focal Subgraph)</b>，支持拖拽节点和滚动缩放，悬停节点可高亮连接路径。
            </p>
          </div>
        </div>

        <!-- Recommendations panel -->
        <div v-else class="recommendations fade-in">
          <!-- Student Entry: Full-width clickable card to open graph -->
          <div
            v-if="currentUserRole === 'student'"
            class="student-graph-btn-card card glow-orange"
            @click="openGraph"
          >
            <div class="student-card-content">
              <span class="btn-icon">🌌</span>
              <span class="btn-text-content">查看我的关系网络拓扑图 (View My Relationship Network Topology)</span>
            </div>
            <span class="btn-arrow">➔</span>
          </div>

          <!-- Admin Entry: Name header + Actions (view graph, clear search) -->
          <div v-else class="active-profile card glow-orange">
            <h2>👤 当前选中: <span class="highlight">{{ activeStudent }}</span></h2>
            <div class="profile-actions">
              <button @click="openGraph" class="btn btn-xs btn-secondary glow-cyan">
                🌌 查看关系网络拓扑图
              </button>
              <button @click="clearSearch" class="btn-text">清除搜索</button>
            </div>
          </div>

          <div class="recommendations-row">
            <div class="rec-split-col">
              <ActivityList />
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import LoginOverlay  from '@/components/LoginOverlay.vue'
import AppSidebar    from '@/components/AppSidebar.vue'
import SearchHeader  from '@/components/SearchHeader.vue'
import ActivityList  from '@/components/ActivityList.vue'
import BuddyList     from '@/components/BuddyList.vue'
import GraphModal    from '@/components/GraphModal.vue'

import { loadGraphData, updateStats } from '@/composables/useGraph'
import { currentUser, restoreSession, currentUserRole } from '@/composables/useAuth'
import { activeStudent, selectStudent, clearSearch } from '@/composables/useRecommendations'

// ─── Graph Modal ───────────────────────────────────────────────────────────────
const graphModalRef = ref<InstanceType<typeof GraphModal> | null>(null)
const openGraph     = () => graphModalRef.value?.open()

// ─── Event handlers ────────────────────────────────────────────────────────────
const onRegistered = () => { if (currentUser.value) selectStudent(currentUser.value) }
const onLogout     = () => clearSearch()

// Reset update prompt whenever the viewed student changes
// Enforce student profile lock: if role is student, activeStudent MUST be currentUser
watch([currentUser, currentUserRole], ([user, role]) => {
  if (role === 'student' && user) {
    selectStudent(user)
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
  updateStats()
  if (currentUser.value) selectStudent(currentUser.value)
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
.recommendations { width: 100%; display: flex; flex-direction: column; gap: 14px; overflow: hidden; height: 100%; }
.recommendations-row { display: flex; gap: 16px; flex: 1; overflow: hidden; min-height: 0; }
.rec-split-col { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }

/* Student Entry Card */
.student-graph-btn-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px !important;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: linear-gradient(135deg, rgba(18,24,38,0.9) 0%, rgba(30,41,59,0.8) 100%) !important;
  border: 1px solid rgba(253,151,31,0.2) !important;
  flex-shrink: 0;
  user-select: none;
}
.student-graph-btn-card:hover {
  border-color: rgba(253,151,31,0.5) !important;
  background: linear-gradient(135deg, rgba(253,151,31,0.06) 0%, rgba(18,24,38,0.95) 100%) !important;
  box-shadow: 0 0 20px rgba(253,151,31,0.15), inset 0 0 15px rgba(253,151,31,0.05) !important;
  transform: translateY(-1px);
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

/* Student Header Banner */
.student-header-banner {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.student-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.student-header-title h2 {
  font-size: 14px;
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}
.header-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: bold;
}
</style>
