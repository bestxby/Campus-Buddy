<template>
  <div class="card result-card">
    <div class="result-card-header">
      <h3>🎯 智能推荐活动 (Recommended)</h3>
    </div>

    <!-- Interest Filter Tabs -->
    <div v-if="filterTabs.length > 1" class="interest-filters">
      <button
        v-for="tab in filterTabs"
        :key="tab"
        class="filter-pill"
        :class="{ 'tab-active': activeFilter === tab }"
        @click="activeFilter = tab"
      >{{ tab === '全部' ? '🌟 全部推荐' : tab }}</button>
    </div>

    <!-- Activity Cards Container -->
    <div v-if="hasActivities" class="activities-scroll-area">
      <div class="activities-grid">
        <div 
          v-for="act in flattenedRecommendedActivities" 
          :key="act.name" 
          class="activity-card-item"
          :class="{ 'card-signed': isSignedUp(act.name) }"
        >
          <!-- Activity Title & Header -->
          <div class="activity-card-header-row">
            <span class="activity-card-icon">🎯</span>
            <div class="activity-title-area">
              <h4 class="activity-card-title" :title="act.name">{{ act.name }}</h4>
              <span class="interest-source-badge">关联兴趣: {{ act.matchingInterest }}</span>
            </div>
          </div>

          <!-- Network Flow Path (Visualization) -->
          <div class="network-flow-path">
            <div class="flow-step">
              <span class="flow-node node-student" title="您">{{ activeStudent }}</span>
              <span class="flow-arrow">➔</span>
              <span class="flow-node node-interest" :title="`匹配兴趣: ${act.matchingInterest}`">{{ act.matchingInterest }}</span>
              <span class="flow-arrow">➔</span>
              <span class="flow-node node-activity" :title="`推荐活动: ${act.name}`">{{ act.name }}</span>
            </div>
          </div>

          <!-- Matching domain chips -->
          <div class="activity-card-tags" v-if="act.interests.length">
            <span 
              v-for="tag in act.interests" 
              :key="tag" 
              class="activity-tag-chip"
              :class="getTagClass(tag)"
            ># {{ tag }}</span>
          </div>

          <!-- Buddy recommendation explanation -->
          <div class="match-reason" :class="act.buddiesSigned.length > 0 ? 'reason-buddies' : 'reason-interest'">
            <span v-if="act.buddiesSigned.length > 0" class="reason-text text-orange-light">
              👥 <b>{{ act.buddiesSigned.slice(0, 2).join('、') }}</b>
              <span v-if="act.buddiesSigned.length > 2"> 等 {{ act.buddiesSigned.length }} 位搭子</span>也报名了
            </span>
            <span v-else class="reason-text text-cyan-light">
              💡 智能理由: 基于图数据 Jaccard 契合度与共同兴趣推荐
            </span>
          </div>

          <!-- Footer & Actions -->
          <div class="activity-card-footer">
            <div class="activity-card-members">
              <span class="members-icon">👥</span>
              <span class="members-text">{{ act.studentCount }} 人已报名</span>
            </div>
            
            <div class="action-buttons">
              <template v-if="isSignedUp(act.name)">
                <span class="signed-badge">✓ 已报名</span>
                <button
                  v-if="activeStudent === currentUser"
                  @click="handleCancelSignUp(act.name)"
                  class="btn-action cancel-btn"
                  title="取消报名此活动"
                >
                  取消报名
                </button>
              </template>
              <button
                v-else-if="activeStudent === currentUser"
                @click="handleSignUp(act.name)"
                class="btn-action signup-btn glow-cyan"
              >
                一键报名
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="empty-msg">暂时没有匹配该兴趣推荐的校园活动。</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  activeStudent, activeFilter, filterTabs, filteredActivitiesGrouped, hasActivities,
  getBuddiesForActivity,
} from '@/composables/useRecommendations'
import { currentUser, signUpForActivity, cancelSignUpForActivity, isSignedUp } from '@/composables/useAuth'
import { useGraphStore } from '@/stores/graph'
import { INTEREST_CATEGORIES } from '@/constants/interests'
import { addLog } from '@/composables/useLogs'

const emit = defineEmits<{ 'signed-up': [activity: string], 'cancelled': [activity: string] }>()

const handleSignUp = (activity: string) => {
  signUpForActivity(activity)
  addLog('action', `【学生报名】学生【${currentUser.value}】成功报名了活动【${activity}】`)
  addLog('info', `推荐系统重算：已更新【${currentUser.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)
  emit('signed-up', activity)
}

const handleCancelSignUp = (activity: string) => {
  if (confirm(`确定要取消报名活动【${activity}】吗？`)) {
    cancelSignUpForActivity(activity)
    addLog('action', `【取消报名】学生【${currentUser.value}】取消报名了活动【${activity}】`)
    addLog('info', `推荐系统重算：已移除【${currentUser.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)
    emit('cancelled', activity)
  }
}

// Build helper computed properties to gather activity tags, registration count, and buddies
const activityInfoMap = computed(() => {
  const graphStore = useGraphStore()
  const map = new Map<string, { interests: string[]; studentCount: number }>()
  for (const [node, neighbors] of graphStore.graph.entries()) {
    if (node.startsWith('activity:')) {
      const name = node.slice('activity:'.length)
      const interests: string[] = []
      let studentCount = 0
      for (const neighbor of neighbors) {
        if (neighbor.startsWith('interest:')) {
          interests.push(neighbor.slice('interest:'.length))
        } else if (neighbor.startsWith('student:')) {
          studentCount++
        }
      }
      map.set(name, { interests, studentCount })
    }
  }
  return map
})

interface FlattenedActivity {
  name: string
  matchingInterest: string
  interests: string[]
  studentCount: number
  buddiesSigned: string[]
}

const flattenedRecommendedActivities = computed((): FlattenedActivity[] => {
  const result: FlattenedActivity[] = []
  const groups = filteredActivitiesGrouped.value
  
  for (const interest in groups) {
    const acts = groups[interest]
    for (const act of acts) {
      // Avoid duplicate activity entries in matching result
      if (result.some(r => r.name === act)) continue
      
      const info = activityInfoMap.value.get(act) ?? { interests: [], studentCount: 0 }
      const buddiesSigned = getBuddiesForActivity(activeStudent.value ?? '', act)
      
      result.push({
        name: act,
        matchingInterest: interest,
        interests: info.interests,
        studentCount: info.studentCount,
        buddiesSigned
      })
    }
  }
  
  return result
})

const getTagClass = (tag: string) => {
  if ((INTEREST_CATEGORIES.sports as readonly string[]).includes(tag)) return 'tag-sports'
  if ((INTEREST_CATEGORIES.arts as readonly string[]).includes(tag)) return 'tag-arts'
  if ((INTEREST_CATEGORIES.tech as readonly string[]).includes(tag)) return 'tag-tech'
  return 'tag-social'
}
</script>

<style scoped>
.result-card { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.result-card-header { margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.result-card h3 { font-size: 13px; margin: 0; color: var(--accent-orange); font-weight: 800; letter-spacing: 0.3px; }

.interest-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; flex-shrink: 0; }
.filter-pill { background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 20px; padding: 4px 10px; font-size: 10.5px; cursor: pointer; transition: all 0.2s ease; user-select: none; }
.filter-pill:hover { background-color: rgba(255,255,255,0.06); color: var(--text-primary); }
.tab-active { background-color: rgba(253,151,31,0.12) !important; border-color: rgba(253,151,31,0.4) !important; color: #ffb74d !important; box-shadow: 0 0 10px rgba(253,151,31,0.15); }

.activities-scroll-area { flex: 1; overflow-y: auto; padding-right: 4px; }
.activities-grid { display: flex; flex-direction: column; gap: 10px; }

.activity-card-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.005) 0%, rgba(255, 255, 255, 0.015) 100%) !important;
  border: 1px solid var(--border-color) !important;
  padding: 12px 14px !important;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.25s ease;
  text-align: left;
}
.activity-card-item:hover {
  border-color: rgba(253, 151, 31, 0.25) !important;
  background: linear-gradient(135deg, rgba(253, 151, 31, 0.02) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.activity-card-item.card-signed {
  border-color: rgba(74, 222, 128, 0.2) !important;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.015) 0%, rgba(255, 255, 255, 0.01) 100%) !important;
}

.activity-card-header-row { display: flex; align-items: center; gap: 8px; }
.activity-card-icon { font-size: 14px; }
.activity-title-area { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.activity-card-title {
  font-size: 12px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.interest-source-badge { font-size: 9px; color: rgba(253,151,31,0.7); font-weight: 600; margin-top: 1px; }

/* Network Flow Path Visualization */
.network-flow-path {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  padding: 6px;
  margin: 2px 0;
  overflow-x: auto;
  white-space: nowrap;
}
.flow-step { display: inline-flex; align-items: center; gap: 4px; }
.flow-node { font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: 600; max-width: 100px; overflow: hidden; text-overflow: ellipsis; }
.node-student { background-color: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); color: #e9d5ff; }
.node-interest { background-color: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; }
.node-activity { background-color: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); color: #99f6e4; }
.flow-arrow { font-size: 8px; color: rgba(255,255,255,0.3); font-weight: bold; }

.activity-card-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.activity-tag-chip { font-size: 8.5px; padding: 1.5px 5px; border-radius: 4px; font-weight: bold; }
.tag-sports { background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.15); color: #22d3ee; }
.tag-arts { background: rgba(244, 114, 182, 0.06); border: 1px solid rgba(244, 114, 182, 0.15); color: #f472b6; }
.tag-tech { background: rgba(255, 183, 77, 0.06); border: 1px solid rgba(255, 183, 77, 0.15); color: #ffb74d; }
.tag-social { background: rgba(52, 211, 153, 0.06); border: 1px solid rgba(52, 211, 153, 0.15); color: #34d399; }

.match-reason { padding-left: 6px; border-left: 2px solid rgba(255,255,255,0.1); margin: 2px 0; }
.reason-buddies { border-left-color: rgba(253,151,31,0.5); }
.reason-interest { border-left-color: rgba(6,182,212,0.4); }
.reason-text { font-size: 9.5px; display: inline-block; }
.text-orange-light { color: #ffb74d; }
.text-cyan-light { color: rgba(34,211,238,0.75); }

.activity-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.03); padding-top: 6px; margin-top: 2px; }
.activity-card-members { display: flex; align-items: center; gap: 4px; }
.members-icon { font-size: 10px; color: var(--text-secondary); }
.members-text { font-size: 9.5px; color: var(--text-secondary); }

.action-buttons { display: flex; align-items: center; gap: 8px; }
.signed-badge { font-size: 10px; color: #4ade80; font-weight: 700; }
.btn-action { border-radius: 4px; font-size: 9.5px; padding: 4px 8px; cursor: pointer; font-weight: bold; transition: all 0.2s; white-space: nowrap; border: 1px solid transparent; }
.signup-btn { background-color: rgba(6,182,212,0.12); border-color: rgba(6,182,212,0.3); color: #22d3ee; }
.signup-btn:hover { background-color: rgba(6,182,212,0.25); border-color: rgba(6,182,212,0.5); }
.cancel-btn { background-color: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #f87171; }
.cancel-btn:hover { background-color: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); }

.empty-msg { font-size: 11px; color: var(--text-secondary); margin: 12px 0 0; text-align: left; }
</style>
