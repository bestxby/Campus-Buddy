<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🔥 校园活动热度与关怀推广</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content">
            <h4>校园活动热度与推广说明</h4>
            <p>了解校园活动的报名热度。报名人数少于 5 人提示需多关注，多于 18 人为极高人气。针对需要多加关注的冷门活动，系统可以检索对该主题感兴趣但尚未知晓或未报名的同学，帮助管理员定向发送活动邀请，丰富其课外生活。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex-1-scroll">
      <div class="activity-saturation-section">
        <div class="table-container">
          <table class="saturation-table">
            <thead>
              <tr>
                <th>活动名称</th>
                <th>所属兴趣</th>
                <th>报名数</th>
                <th>活动热度</th>
                <th>校园宣传邀请</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="act in allActivitiesStats.slice(0, 15)" 
                :key="act.name" 
                :class="{ 'row-selected': selectedActivityForPromo === act.name }"
              >
                <td class="act-name-td" :title="act.name">{{ act.name }}</td>
                <td><span class="interest-badge-light">{{ act.interest }}</span></td>
                <td class="count-td">{{ act.count }} 人</td>
                <td>
                  <span class="status-pill" :class="act.status">
                    {{ act.status === 'hot' ? '🔥 极高人气' : act.status === 'cold' ? '⚠️ 需多关注' : '正常' }}
                  </span>
                </td>
                <td>
                  <button 
                    v-if="act.status === 'cold'"
                    @click="selectedActivityForPromo = act.name"
                    class="btn btn-xs btn-secondary glow-cyan"
                  >🎯 定向邀请</button>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Targeted promotion panel inside scrolling area -->
        <ActivityPromoPanel 
          v-if="selectedActivityForPromo"
          :activity-name="selectedActivityForPromo"
          :interest-name="allActivitiesStats.find(a => a.name === selectedActivityForPromo)?.interest || ''"
          @close="selectedActivityForPromo = null"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { graph } from '@/composables/useGraph'
import ActivityPromoPanel from './ActivityPromoPanel.vue'

const selectedActivityForPromo = ref<string | null>(null)

// Group all activities and count registrations
const allActivitiesStats = computed(() => {
  const list: { name: string; interest: string; count: number; status: 'hot' | 'normal' | 'cold' }[] = []
  for (const [node, neighbors] of graph.value.entries()) {
    if (node.startsWith('activity:')) {
      const actName = node.slice('activity:'.length)

      // ✅ OPTIMIZED: Iterate the Set directly instead of Array.from().find()
      let interestName = '未知'
      let studentCount = 0
      for (const n of neighbors) {
        if (n.startsWith('interest:') && interestName === '未知') {
          interestName = n.slice('interest:'.length)
        } else if (n.startsWith('student:')) {
          studentCount++
        }
      }

      let status: 'hot' | 'normal' | 'cold' = 'normal'
      if (studentCount >= 18) status = 'hot'
      else if (studentCount < 5) status = 'cold'

      list.push({ name: actName, interest: interestName, count: studentCount, status })
    }
  }
  return list.sort((a, b) => a.count - b.count) // Show cold activities first
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
}
.col-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.col-header h3 {
  font-size: 12px;
  margin: 0;
  color: var(--text-primary);
  font-weight: bold;
  text-align: left;
}
.col-header .header-sub {
  font-size: 9px;
  color: var(--text-secondary);
  text-align: left;
}
.flex-1-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}
.activity-saturation-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}
.table-container {
  flex: 1;
  min-height: 80px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.15);
}
.saturation-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  text-align: left;
}
.saturation-table th, .saturation-table td {
  padding: 6px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}
.saturation-table th {
  background-color: #141a29; /* Opaque solid color to prevent text overlapping on scroll */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
}
.saturation-table tr:hover {
  background-color: rgba(255, 255, 255, 0.015);
}
.saturation-table tr.row-selected {
  background-color: rgba(6, 182, 212, 0.08);
}
.act-name-td {
  font-weight: 600;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.interest-badge-light {
  background-color: rgba(167, 139, 250, 0.06);
  border: 1px solid rgba(167, 139, 250, 0.12);
  color: #c084fc;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 9px;
}
.count-td {
  font-family: Consolas, monospace;
}
.status-pill {
  font-size: 8.5px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 12px;
  display: inline-block;
}
.status-pill.hot {
  background-color: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.status-pill.normal {
  background-color: rgba(52, 211, 153, 0.06);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.15);
}
.status-pill.cold {
  background-color: rgba(251, 191, 36, 0.08);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}
</style>
