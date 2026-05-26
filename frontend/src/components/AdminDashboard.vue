<template>
  <div class="admin-dashboard fade-in">
    <!-- 3x3 Grid Layout (Fits exactly in viewport, no body scroll) -->
    <div class="dashboard-grid-layout">
      <!-- Grid Card 1: Top Interests Chart (1 row) -->
      <PopularInterestsCard />

      <!-- Grid Card 2: Activity Saturation Diagnostics & Precision Promo -->
      <ActivitySaturationCard @create-activity="emit('create-activity')" />

      <!-- Grid Card 3: Centrality Insights - Degree Centrality -->
      <DegreeCentralityCard />

      <!-- Grid Card 4: Isolation Diagnostics & Auto-Bridge (Spans 2 rows) -->
      <IsolationCard class="span-2-rows" />

      <!-- Grid Card 5: System Logs -->
      <SystemLogsCard />

      <!-- Grid Card 6: Betweenness Centrality (Spans 2 rows) -->
      <BetweennessCentralityCard class="span-2-rows" />

      <!-- Grid Card 7: Icebreaking Potential Ranking -->
      <IcebreakingPotentialCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { stats, graph } from '@/composables/useGraph'
import { topSocialStudents, isolatedCount } from '@/composables/useGraphInsights'
import { activeStudent } from '@/composables/useRecommendations'
import { addLog } from '@/composables/useLogs'

// Import subcomponents
import IsolationCard from '@/components/admin/IsolationCard.vue'
import ActivitySaturationCard from '@/components/admin/ActivitySaturationCard.vue'
import DegreeCentralityCard from '@/components/admin/DegreeCentralityCard.vue'
import PopularInterestsCard from '@/components/admin/PopularInterestsCard.vue'
import SystemLogsCard from '@/components/admin/SystemLogsCard.vue'
import BetweennessCentralityCard from '@/components/admin/BetweennessCentralityCard.vue'
import IcebreakingPotentialCard from '@/components/admin/IcebreakingPotentialCard.vue'

const emit = defineEmits<{
  'create-activity': []
}>()

// Seed initial logs
onMounted(() => {
  addLog('info', '系统初始化完成，成功加载校园社交关系网图谱数据')
  addLog('info', `校园社交网络载入就绪：当前共包含 ${stats.studentsCount} 位同学，${stats.interestsCount} 种不同兴趣圈子，${stats.activitiesCount} 个校园活动`)
  addLog('info', `社群活跃度分析完成：共识别出 ${stats.componentsCount} 个相对独立的主题社群圈子`)
  addLog('info', '跨界中介路径计算完成，已找出能够连接不同圈子的关键人脉纽带')
  addLog('info', `待关怀学生筛查完毕：当前共有 ${isolatedCount.value} 名尚未融入任何圈子的同学`)
  addLog('info', '系统状态：校园人脉推荐引擎已就绪')
})

// Watch activeStudent to log queries
watch(activeStudent, (newVal) => {
  if (newVal) {
    addLog('query', `管理员已调取同学【${newVal}】的个人网络画像，正在计算社交匹配推荐...`)
    addLog('info', `匹配计算完毕：成功为【${newVal}】找到推荐校园活动 ${graph.value.get(`student:${newVal}`)?.size || 0} 项，并匹配志同道合的活动搭子 ${topSocialStudents.value.length} 名`)
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
  grid-template-columns: 1fr 1.3fr 0.7fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 16px;
}

.dashboard-grid-layout > * {
  min-height: 0;
}

.span-2-rows {
  grid-row: span 2;
}
</style>
