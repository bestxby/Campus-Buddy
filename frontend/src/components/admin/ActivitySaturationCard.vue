<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3 style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path>
          </svg>
          校园活动热度与关怀推广
        </h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon" style="display: inline-flex; align-items: center; justify-content: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </span>
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
                <td><span :class="['interest-badge-light', getInterestClass(act.interest)]">{{ act.interest }}</span></td>
                <td class="count-td">{{ act.count }} 人</td>
                <td>
                  <span class="status-pill" :class="act.status" style="display: inline-flex; align-items: center; gap: 2.5px;">
                    <template v-if="act.status === 'hot'">
                      <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path>
                      </svg>
                      极高人气
                    </template>
                    <template v-else-if="act.status === 'cold'">
                      <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      需多关注
                    </template>
                    <template v-else>正常</template>
                  </span>
                </td>
                <td>
                  <button 
                    v-if="act.status === 'cold'"
                    @click="selectedActivityForPromo = act.name"
                    class="btn btn-xs btn-secondary glow-cyan"
                    style="display: inline-flex; align-items: center; gap: 2px;"
                  >
                    <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                    </svg>
                    定向邀请
                  </button>
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
const getInterestClass = (interestName: string) => {
  const sports = ['篮球', '足球', '羽毛球', '网球', '游泳', '跑步', '健身', '瑜伽', '自行车', '乒乓球']
  const arts = ['音乐', '舞蹈', '绘画', '书法', '摄影', '电影', '话剧', '吉他', '设计', '阅读', '写诗']
  const tech = ['编程', '算法', 'AI/人工智能', '机器人', '数码/测评', '网络安全', '游戏开发', '硬件工程', '建模', '数据分析']
  const social = ['公益/支教', '环保', '敬老志愿', '流浪动物关怀', '读书会', '英语角', '辩论', '剧本杀', '桌游', '狼人杀', '心理交流', '校园导游']

  if (sports.includes(interestName) || interestName.includes('运动') || interestName.includes('体育')) return 'tag-sports'
  if (arts.includes(interestName) || interestName.includes('艺术') || interestName.includes('文化') || interestName.includes('人文')) return 'tag-arts'
  if (tech.includes(interestName) || interestName.includes('技术') || interestName.includes('极客') || interestName.includes('开发') || interestName.includes('编程')) return 'tag-tech'
  if (social.includes(interestName) || interestName.includes('社交') || interestName.includes('志愿') || interestName.includes('公益')) return 'tag-social'
  return 'tag-neutral'
}
</script>

<style scoped>
.dashboard-grid-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
  background: var(--color-surface);
  padding: 12px 16px !important;
}
.col-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.col-header h3 {
  font-size: 12px;
  margin: 0;
  color: var(--color-text);
  font-weight: bold;
  text-align: left;
}
.col-header .header-sub {
  font-size: 10px;
  color: var(--color-subtext);
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
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-surface-2);
}
.saturation-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  text-align: left;
}
.saturation-table th, .saturation-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
}
.saturation-table th {
  background-color: var(--color-muted); /* Opaque solid color to prevent text overlapping on scroll */
  border-bottom: 1px solid var(--color-border);
  color: var(--color-subtext);
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
}
.saturation-table tr:hover {
  background-color: var(--color-surface);
}
.saturation-table tr.row-selected {
  background-color: var(--color-accent-light);
}
.act-name-td {
  font-weight: 600;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.interest-badge-light {
  padding: 1.5px 5px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}
.interest-badge-light.tag-sports {
  background: var(--bg-sports);
  border: 1px solid var(--color-border);
  color: var(--color-sports);
}
.interest-badge-light.tag-arts {
  background: var(--bg-arts);
  border: 1px solid var(--color-border);
  color: var(--color-arts);
}
.interest-badge-light.tag-tech {
  background: var(--bg-tech);
  border: 1px solid var(--color-border);
  color: var(--color-tech);
}
.interest-badge-light.tag-social {
  background: var(--bg-social);
  border: 1px solid var(--color-border);
  color: var(--color-social);
}
.interest-badge-light.tag-neutral {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-subtext);
}
.count-td {
  font-family: Consolas, monospace;
}
.status-pill {
  font-size: 10px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 12px;
  display: inline-block;
}
.status-pill.hot {
  background-color: rgba(239, 68, 68, 0.08);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.15);
}
.status-pill.normal {
  background-color: rgba(52, 211, 153, 0.06);
  color: var(--color-social);
  border: 1px solid rgba(52, 211, 153, 0.15);
}
.status-pill.cold {
  background-color: rgba(251, 191, 36, 0.06);
  color: var(--color-warning);
  border: 1px solid rgba(251, 191, 36, 0.15);
}
</style>
