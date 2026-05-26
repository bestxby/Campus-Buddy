<template>
  <div class="card result-card">
    <div class="result-card-header">
      <h3>🌐 全校所有活动</h3>
    </div>

    <div class="all-activities-container">
      <!-- Search Box -->
      <div class="activity-search-wrapper">
        <input 
          v-model="allActivitiesSearchQuery" 
          placeholder="🔍 搜索活动名称或关联兴趣标签..." 
          class="activity-search-input"
        />
      </div>
      
      <!-- Activities List -->
      <div v-if="filteredAllActivities.length > 0" class="activities-scroll-area">
        <div class="activities-grid">
          <div 
            v-for="act in filteredAllActivities" 
            :key="act.name" 
            class="activity-card-item"
            :class="{ 'card-signed': isSignedUp(act.name) }"
          >
            <div class="activity-card-header-row">
              <div class="header-left">
                <span class="activity-card-icon">🎉</span>
                <h4 class="activity-card-title" :title="act.name">{{ act.name }}</h4>
              </div>
              <div class="activity-card-tags-right">
                <span 
                  v-for="tag in act.interests" 
                  :key="tag" 
                  class="activity-tag-chip"
                  :class="getTagClass(tag)"
                ># {{ tag }}</span>
              </div>
            </div>

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
                    取消
                  </button>
                </template>
                <button
                  v-else-if="activeStudent === currentUser"
                  @click="handleSignUp(act.name)"
                  class="btn-action signup-btn glow-orange"
                >
                  一键报名
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="empty-msg">未找到符合搜索条件的校园活动。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { activeStudent } from '@/composables/useRecommendations'
import { currentUser, signUpForActivity, cancelSignUpForActivity, isSignedUp } from '@/composables/useAuth'
import { useGraphStore } from '@/stores/graph'
import { INTEREST_CATEGORIES } from '@/constants/interests'
import { addLog } from '@/composables/useLogs'

const emit = defineEmits<{ 'signed-up': [activity: string], 'cancelled': [activity: string] }>()

const allActivitiesSearchQuery = ref('')

const handleSignUp = (activity: string) => {
  signUpForActivity(activity)
  addLog('action', `【学生报名】学生【${currentUser.value}】成功报名了活动【${activity}】`)
  addLog('info', `推荐系统重算：已更新【${currentUser.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)
  emit('signed-up', activity)
}

const handleCancelSignUp = (activity: string) => {
  cancelSignUpForActivity(activity)
  addLog('action', `【取消报名】学生【${currentUser.value}】取消报名了活动【${activity}】`)
  addLog('info', `推荐系统重算：已移除【${currentUser.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)
  emit('cancelled', activity)
}

const allActivities = computed(() => {
  const graphStore = useGraphStore()
  const list: { name: string; interests: string[]; studentCount: number }[] = []
  
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
      list.push({ name, interests, studentCount })
    }
  }
  
  return list.sort((a, b) => b.studentCount - a.studentCount || a.name.localeCompare(b.name))
})

const filteredAllActivities = computed(() => {
  const q = allActivitiesSearchQuery.value.trim().toLowerCase()
  if (!q) return allActivities.value
  
  return allActivities.value.filter(act => {
    const nameMatch = act.name.toLowerCase().includes(q)
    const tagMatch = act.interests.some(interest => interest.toLowerCase().includes(q))
    return nameMatch || tagMatch
  })
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
.result-card h3 { font-size: 13px; margin: 0; color: var(--accent-cyan); font-weight: 800; letter-spacing: 0.3px; }

.all-activities-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}
.activity-search-wrapper {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.activity-search-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 11px;
  outline: none;
  width: 100%;
}
.activity-search-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}
.activities-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.activities-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.activity-card-item {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding: 14px 16px !important;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}
.activity-card-item:hover {
  border-color: rgba(6, 182, 212, 0.45) !important;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.04) 0%, rgba(30, 41, 59, 0.55) 100%) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 0 15px rgba(6, 182, 212, 0.12);
  transform: translateY(-2px);
}
.activity-card-item.card-signed {
  border-color: rgba(74, 222, 128, 0.2) !important;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.015) 0%, rgba(15, 23, 42, 0.6) 100%) !important;
}
.activity-card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.activity-card-tags-right {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-shrink: 0;
}
.activity-card-icon {
  font-size: 14px;
}
.activity-card-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  white-space: normal;
  line-height: 1.4;
  flex: 1;
}
.activity-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.activity-tag-chip {
  font-size: 8.5px;
  padding: 1.5px 5px;
  border-radius: 4px;
  font-weight: bold;
}
.tag-sports {
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.15);
  color: #22d3ee;
}
.tag-arts {
  background: rgba(244, 114, 182, 0.06);
  border: 1px solid rgba(244, 114, 182, 0.15);
  color: #f472b6;
}
.tag-tech {
  background: rgba(255, 183, 77, 0.06);
  border: 1px solid rgba(255, 183, 77, 0.15);
  color: #ffb74d;
}
.tag-social {
  background: rgba(52, 211, 153, 0.06);
  border: 1px solid rgba(52, 211, 153, 0.15);
  color: #34d399;
}
.activity-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding-top: 8px;
}
.activity-card-members {
  display: flex;
  align-items: center;
  gap: 6px;
}
.members-icon {
  font-size: 10px;
  color: var(--text-secondary);
}
.members-text {
  font-size: 9.5px;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.signed-badge {
  font-size: 10px;
  color: #4ade80;
  font-weight: 700;
}
.btn-action {
  border-radius: 4px;
  font-size: 9.5px;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  white-space: nowrap;
  border: 1px solid transparent;
}
.signup-btn {
  background-color: rgba(253,151,31,0.12);
  border-color: rgba(253,151,31,0.3);
  color: #ffb74d;
}
.signup-btn:hover {
  background-color: rgba(253,151,31,0.25);
  border-color: rgba(253,151,31,0.5);
}
.cancel-btn {
  background-color: rgba(239,68,68,0.08);
  border-color: rgba(239,68,68,0.2);
  color: #f87171;
}
.cancel-btn:hover {
  background-color: rgba(239,68,68,0.2);
  border-color: rgba(239,68,68,0.4);
}

.empty-msg {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
  text-align: left;
}
</style>
