<template>
  <div class="admin-dashboard fade-in">
    <!-- 3x3 Grid Layout (Fits exactly in viewport, no body scroll) -->
    <div v-if="isReady" class="dashboard-grid-layout">
      <!-- Column 1 Layout (Spans all 3 rows) -->
      <div class="col-1-layout">
        <!-- Matrix Diagnostics Card (Height auto-contracts) -->
        <MatrixDiagnosticsCard @open-graph="(forceGlobal, viewMode, matrixMode) => emit('open-graph', forceGlobal, viewMode, matrixMode)" />

        <!-- Betweenness Centrality (Flex grow) -->
        <BetweennessCentralityCard />

        <!-- Degree Centrality (Flex grow) -->
        <DegreeCentralityCard />

        <!-- Network Metrics Card (Height auto-contracts) -->
        <NetworkMetricsCard />
      </div>

      <!-- Grid Card 1: Top Interests Chart (1 row) -->
      <PopularInterestsCard />

      <!-- Grid Card 2: Activity Saturation Diagnostics & Precision Promo -->
      <ActivitySaturationCard @create-activity="emit('create-activity')" />

      <!-- Grid Card 3: Theme Communities Classification -->
      <ThemeCommunitiesCard />

      <!-- Grid Card 4: Isolation Diagnostics & Auto-Bridge (1 row) -->
      <IsolationCard />

      <!-- Grid Card 7: Popular Activities Ranking -->
      <PopularActivitiesCard />

      <!-- Grid Card 5: System Logs -->
      <SystemLogsCard />
    </div>

    <!-- Smooth skeleton placeholder during transitions -->
    <div v-else class="dashboard-grid-skeleton" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { stats, graph, updateStats } from '@/composables/useGraph'
import { isolatedCount, recalculateGraphInsights } from '@/composables/useGraphInsights'
import { activeStudent, recommendations } from '@/composables/useRecommendations'
import { addLog } from '@/composables/useLogs'

// Import subcomponents
import IsolationCard from '@/components/admin/IsolationCard.vue'
import ActivitySaturationCard from '@/components/admin/ActivitySaturationCard.vue'
import DegreeCentralityCard from '@/components/admin/DegreeCentralityCard.vue'
import PopularInterestsCard from '@/components/admin/PopularInterestsCard.vue'
import SystemLogsCard from '@/components/admin/SystemLogsCard.vue'
import BetweennessCentralityCard from '@/components/admin/BetweennessCentralityCard.vue'
import PopularActivitiesCard from '@/components/admin/PopularActivitiesCard.vue'
import ThemeCommunitiesCard from '@/components/admin/ThemeCommunitiesCard.vue'
import MatrixDiagnosticsCard from '@/components/admin/MatrixDiagnosticsCard.vue'
import NetworkMetricsCard from '@/components/admin/NetworkMetricsCard.vue'

const emit = defineEmits<{
  'create-activity': [],
  'open-graph': [forceGlobal: boolean, viewMode: 'network' | 'matrix', matrixMode: 'student-interest' | 'student-activity' | 'interest-cooccurrence']
}>()

const isReady = ref(false)

// Seed initial logs
onMounted(() => {
  // Defer heavy components rendering and stats calculation to prevent entry transition jank
  setTimeout(() => {
    isReady.value = true
    nextTick(() => {
      updateStats(true)
      recalculateGraphInsights(true)
    })
  }, 350) // 350ms matches the fade transition of the login overlay

  addLog('info', '系统初始化完成，成功加载校园社交关系网图谱数据')
  addLog('info', `校园社交网络载入就绪：当前共包含 ${stats.value.studentsCount} 位同学，${stats.value.interestsCount} 种不同兴趣圈子，${stats.value.activitiesCount} 个校园活动`)
  addLog('info', `社群活跃度分析完成：共识别出 ${stats.value.componentsCount} 个相对独立的主题社群圈子`)
  addLog('info', '跨界中介路径计算完成，已找出能够连接不同圈子的关键人脉纽带')
  addLog('info', `待关怀学生筛查完毕：当前共有 ${isolatedCount.value} 名尚未融入任何圈子的同学`)
  addLog('info', '系统状态：校园人脉推荐引擎已就绪')
})

// Watch activeStudent to log queries
watch(activeStudent, (newVal) => {
  if (newVal) {
    addLog('query', `管理员已调取同学【${newVal}】的个人网络画像，正在计算社交匹配推荐...`)
    addLog('info', `匹配计算完毕：成功为【${newVal}】找到推荐校园活动 ${recommendations.value.activities.length} 项，并匹配志同道合的活动搭子 ${recommendations.value.buddies.length} 名`)
  }
})

// Watch graph changes to log mutations
watch(() => graph.value.size, (newSize, oldSize) => {
  if (oldSize > 0 && newSize !== oldSize) {
    addLog('action', `校园社交网络发生动态更新，当前活跃网络总节点数：${newSize}`)
  }
})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Remove dashboard-level scrolling */
}

/* 3x3 CSS Grid Layout - Fits perfectly */
.dashboard-grid-layout {
  flex: 1;
  min-height: 0; /* Critical for grid children height constraint */
  display: grid;
  grid-template-columns: 0.7fr 1fr 1.3fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 16px;
}

.dashboard-grid-layout > * {
  min-height: 0;
}

.col-1-layout {
  grid-column: 1;
  grid-row: 1 / span 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

/* Diagnostics card height fits its 3 buttons */
.col-1-layout > :nth-child(1) {
  height: auto !important;
}

/* Centrality cards have a compact height to fit exactly 5 items */
.col-1-layout > :nth-child(2),
.col-1-layout > :nth-child(3) {
  height: 175px !important;
}

/* Global Network Metrics Card stretches to fill the remaining vertical height */
.col-1-layout > :nth-child(4) {
  flex: 1;
  min-height: 0;
}

/* Skeleton Loading styles */
.dashboard-grid-skeleton {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.skeleton-card {
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  color: var(--accent-cyan);
  padding: 24px 48px;
  background: rgba(9, 14, 26, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.05);
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@media (max-width: 1024px) {
  .admin-dashboard {
    overflow: visible;
    height: auto;
  }
  .dashboard-grid-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    overflow: visible;
  }
  .span-2-rows {
    grid-row: span 1;
  }
  .col-1-layout {
    grid-column: 1;
    grid-row: auto;
    height: auto;
    overflow: visible;
  }
  .col-1-layout > :nth-child(2),
  .col-1-layout > :nth-child(3) {
    height: auto !important;
  }
}
</style>
