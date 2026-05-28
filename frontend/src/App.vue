<template>
  <!-- Login overlay (shown when no active user) -->
  <LoginOverlay v-if="!currentUser" @submitted="onRegistered" />

  <!-- Main dashboard -->
  <div v-else class="dashboard">
    <AppSidebar 
      :width="sidebarWidth" 
      :class="{ 'sidebar-open': sidebarOpen }"
      @logout="onLogout" 
      @open-graph="openGraph" 
      @create-activity="showCreateActivity = true"
      @create-interest="showCreateInterest = true"
    />
    <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false" />
    <div class="layout-splitter vertical-splitter" role="separator" @mousedown="startSidebarResize" />

    <main class="main-content">
      <!-- Mobile Top Bar (Visible only on mobile) -->
      <div class="mobile-top-bar" v-if="currentUser">
        <button 
          class="hamburger-btn" 
          @click="sidebarOpen = !sidebarOpen" 
          aria-label="打开菜单"
        >
          ☰
        </button>
        <span class="mobile-title">Campus Buddy</span>
        <div class="mobile-avatar">{{ currentUserRole === 'admin' ? '🤖' : '👤' }}</div>
      </div>



      <div class="content-grid">
        <!-- Welcome screen / Admin Dashboard (no student selected) -->
        <template v-if="!activeStudent">
          <AdminDashboard 
            v-if="currentUserRole === 'admin'" 
            @create-activity="showCreateActivity = true" 
            @open-graph="openGraph"
          />
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
            role="button"
            tabindex="0"
            @click="openGraph"
            @keydown.enter="openGraph"
          >
            <div class="student-card-content">
              <span class="btn-icon" style="display: inline-flex; align-items: center; justify-content: center;">
                <svg class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
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
            <div class="rec-split-col buddy-col">
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
    <CreateInterestModal 
      :visible="showCreateInterest" 
      @close="showCreateInterest = false"
      @created="onActivityCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import LoginOverlay  from '@/components/LoginOverlay.vue'
import AppSidebar    from '@/components/AppSidebar.vue'
import RecommendedActivities from '@/components/RecommendedActivities.vue'
import AllActivities from '@/components/AllActivities.vue'
import BuddyList     from '@/components/BuddyList.vue'
import GraphModal    from '@/components/GraphModal.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import CreateActivityModal from '@/components/admin/CreateActivityModal.vue'
import CreateInterestModal from '@/components/admin/CreateInterestModal.vue'

import { loadGraphData, updateStats } from '@/composables/useGraph'
import { currentUser, restoreSession, currentUserRole } from '@/composables/useAuth'
import { activeStudent, selectStudent, clearSearch } from '@/composables/useRecommendations'
import { graphAnalyticsService } from '@/services/GraphAnalyticsService'

const showCreateActivity = ref(false)
const showCreateInterest = ref(false)
const sidebarOpen = ref(false)

// ─── Graph Modal ───────────────────────────────────────────────────────────────
const graphModalRef = ref<InstanceType<typeof GraphModal> | null>(null)
const openGraph     = (forceGlobal?: any, viewMode?: any, matrixMode?: any) => {
  const isGlobal = typeof forceGlobal === 'boolean' ? forceGlobal : undefined
  graphModalRef.value?.open(isGlobal, viewMode, matrixMode)
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
  sidebarOpen.value = false
  if (currentUserRole.value === 'student' && newStudent !== currentUser.value) {
    if (currentUser.value) {
      selectStudent(currentUser.value)
    }
  }
})

// ─── Sidebar Resize ────────────────────────────────────────────────────────────
const sidebarWidth = ref(330)
let _resizeStartX = 0, _resizeStartW = 0
let activeOnMove: ((ev: MouseEvent) => void) | null = null
let activeOnUp: (() => void) | null = null

const startSidebarResize = (e: MouseEvent) => {
  _resizeStartX = e.clientX
  _resizeStartW = sidebarWidth.value
  document.body.style.userSelect = 'none'
  
  if (activeOnMove && activeOnUp) {
    document.removeEventListener('mousemove', activeOnMove)
    document.removeEventListener('mouseup', activeOnUp)
  }

  const onMove = (ev: MouseEvent) => {
    const w = _resizeStartW + (ev.clientX - _resizeStartX)
    if (w >= 250 && w <= 450) sidebarWidth.value = w
  }
  const onUp = () => {
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    activeOnMove = null
    activeOnUp = null
  }
  
  activeOnMove = onMove
  activeOnUp = onUp
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

onUnmounted(() => {
  if (activeOnMove && activeOnUp) {
    document.removeEventListener('mousemove', activeOnMove)
    document.removeEventListener('mouseup', activeOnUp)
  }
})

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

<style scoped src="./App.css"></style>
