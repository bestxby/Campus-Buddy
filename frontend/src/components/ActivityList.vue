<template>
  <div class="card result-card">
    <div class="result-card-header">
      <div class="activity-view-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'recommended' }"
          @click="activeTab = 'recommended'"
        >🎯 智能推荐活动</button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >🌐 全校所有活动</button>
      </div>
    </div>

    <!-- RECOMMENDED ACTIVITIES TAB -->
    <template v-if="activeTab === 'recommended'">
      <!-- Interest Filter Tabs -->
      <div v-if="filterTabs.length > 1" class="interest-filters">
        <button
          v-for="tab in filterTabs"
          :key="tab"
          class="filter-pill"
          :class="{ 'tab-active': activeFilter === tab }"
          @click="activeFilter = tab"
        >{{ tab === '全部' ? '🌟 全部' : tab }}</button>
      </div>

      <!-- Activity accordion -->
      <div v-if="hasActivities" class="accordion-container">
        <div v-for="(acts, interest) in filteredActivitiesGrouped" :key="interest" class="accordion-item">
          <div class="accordion-header-static">
            <span class="accordion-title">🎯 兴趣圈：{{ interest }} ({{ acts.length }})</span>
          </div>
          <div class="accordion-content-static">
            <ul>
              <li
                v-for="act in (isGroupExpanded(String(interest)) ? acts : acts.slice(0, 3))"
                :key="act"
                class="path-item"
              >
                <div class="path-content">
                  <div class="path-flow-vertical">
                    <div class="path-flow">
                      <span class="node student">{{ activeStudent }}</span>
                      <span class="arrow">➔</span>
                      <span class="node interest">{{ interest }}</span>
                      <span class="arrow">➔</span>
                      <span class="node activity">{{ act }}</span>
                    </div>
                    <!-- Buddy match reason -->
                    <div class="match-reason">
                      <span v-if="getBuddiesForActivity(activeStudent!, act).length > 0" class="reason-text text-orange-light">
                        👥 搭子: <b>{{ getBuddiesForActivity(activeStudent!, act).slice(0, 1).join('') }}</b>
                        <span v-if="getBuddiesForActivity(activeStudent!, act).length > 1"> 等 {{ getBuddiesForActivity(activeStudent!, act).length }} 人</span>也报名了
                      </span>
                      <span v-else class="reason-text text-cyan-light">
                        🎯 推荐理由: 匹配您的【{{ interest }}】
                      </span>
                    </div>
                  </div>
                  <!-- Sign-up button (only for current user) -->
                  <button
                    v-if="activeStudent === currentUser"
                    @click="handleSignUp(act)"
                    :disabled="isSignedUp(act)"
                    class="signup-btn"
                    :class="{ 'btn-signed': isSignedUp(act) }"
                  >{{ isSignedUp(act) ? '已报名' : '一键报名' }}</button>
                </div>
              </li>
            </ul>
            <!-- Expand/collapse inner list -->
            <button v-if="acts.length > 3" @click="toggleGroupExpand(String(interest))" class="expand-toggle-btn">
              {{ isGroupExpanded(String(interest)) ? '🔼 收起' : `➕ 展开其余 ${acts.length - 3} 个` }}
            </button>
          </div>
        </div>
      </div>
      <p v-else class="empty-msg">没有找到合适的匹配活动。</p>
    </template>

    <!-- ALL CAMPUS ACTIVITIES TAB -->
    <template v-else>
      <div class="all-activities-container">
        <div class="activity-search-wrapper">
          <input 
            v-model="allActivitiesSearchQuery" 
            placeholder="🔍 搜索活动名称或关联兴趣标签..." 
            class="activity-search-input"
          />
        </div>
        
        <div v-if="filteredAllActivities.length > 0" class="activities-scroll-area">
          <div class="activities-grid">
            <div 
              v-for="act in filteredAllActivities" 
              :key="act.name" 
              class="activity-card-item"
              :class="{ 'card-signed': isSignedUp(act.name) }"
            >
              <div class="activity-card-header-row">
                <span class="activity-card-icon">🎉</span>
                <h4 class="activity-card-title" :title="act.name">{{ act.name }}</h4>
              </div>
              
              <div class="activity-card-tags">
                <span 
                  v-for="tag in act.interests" 
                  :key="tag" 
                  class="activity-tag-chip"
                  :class="getTagClass(tag)"
                ># {{ tag }}</span>
              </div>

              <div class="activity-card-footer">
                <div class="activity-card-members">
                  <span class="members-icon">👥</span>
                  <span class="members-text">{{ act.studentCount }} 人已报名</span>
                </div>
                <button
                  v-if="activeStudent === currentUser"
                  @click="handleSignUp(act.name)"
                  :disabled="isSignedUp(act.name)"
                  class="signup-btn"
                  :class="{ 'btn-signed': isSignedUp(act.name) }"
                >
                  {{ isSignedUp(act.name) ? '✓ 已报名' : '一键报名' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="empty-msg">未找到符合搜索条件的校园活动。</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  activeStudent, activeFilter, filterTabs, filteredActivitiesGrouped, hasActivities,
  toggleGroupExpand, isGroupExpanded, getBuddiesForActivity,
} from '@/composables/useRecommendations'
import { currentUser, signUpForActivity, isSignedUp } from '@/composables/useAuth'
import { useGraphStore } from '@/stores/graph'
import { INTEREST_CATEGORIES } from '@/constants/interests'
import { addLog } from '@/composables/useLogs'

const emit = defineEmits<{ 'signed-up': [activity: string] }>()

const activeTab = ref<'recommended' | 'all'>('recommended')
const allActivitiesSearchQuery = ref('')

const handleSignUp = (activity: string) => {
  signUpForActivity(activity)
  addLog('action', `【学生报名】学生【${currentUser.value}】成功报名了活动【${activity}】`)
  addLog('info', `推荐系统重算：已更新【${currentUser.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)
  emit('signed-up', activity)
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
.result-card { height: 100%; display: flex; flex-direction: column; }
.result-card h3 { font-size: 13px; margin: 0 0 12px 0; color: var(--text-secondary); }
.interest-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; }
.filter-pill { background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 20px; padding: 6px 12px; font-size: 11px; cursor: pointer; transition: all 0.2s ease; user-select: none; }
.filter-pill:hover { background-color: rgba(255,255,255,0.06); color: var(--text-primary); }
.tab-active { background-color: rgba(6,182,212,0.15) !important; border-color: rgba(6,182,212,0.4) !important; color: #cffafe !important; box-shadow: 0 0 10px rgba(6,182,212,0.15); }
.accordion-container { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; padding-right: 4px; }
.accordion-item { border: 1px solid var(--border-color); border-radius: 6px; background-color: rgba(255,255,255,0.005); overflow: hidden; transition: all 0.2s ease; flex-shrink: 0; }
.accordion-item:hover { border-color: rgba(6,182,212,0.2); }
.accordion-header-static { padding: 10px 14px; background-color: rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); }
.accordion-title { font-size: 12px; font-weight: bold; color: var(--text-primary); }
.accordion-content-static { padding: 12px; }
.accordion-content-static ul { margin: 0; padding: 0; }
.path-item { list-style: none; background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
.path-item:last-child { margin-bottom: 0; }
.path-content { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.path-flow { display: flex; align-items: center; gap: 8px; font-size: 10px; }
.path-flow-vertical { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.node { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.node.student { background-color: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); color: #e9d5ff; }
.node.interest { background-color: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; }
.node.activity { background-color: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); color: #99f6e4; }
.arrow { color: var(--text-secondary); font-weight: bold; }
.match-reason { margin-top: 4px; padding-left: 6px; border-left: 2px solid rgba(255,255,255,0.15); }
.reason-text { font-size: 10px; letter-spacing: 0.2px; }
.signup-btn { background-color: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); color: #22d3ee; border-radius: 4px; font-size: 10px; padding: 4px 8px; cursor: pointer; font-weight: bold; transition: all 0.2s; white-space: nowrap; }
.signup-btn:hover { background-color: rgba(6,182,212,0.3); }
.btn-signed { background-color: rgba(255,255,255,0.05) !important; border-color: var(--border-color) !important; color: var(--text-secondary) !important; cursor: not-allowed !important; }
.expand-toggle-btn { background: transparent; border: 1px dashed var(--border-color); color: var(--text-secondary); font-size: 10px; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 8px; text-align: center; transition: all 0.2s; }
.expand-toggle-btn:hover { background-color: rgba(255,255,255,0.03); color: var(--text-primary); border-color: var(--text-secondary); }
.empty-msg { font-size: 12px; color: var(--text-secondary); margin: 0; }

/* ─── View Switcher Tabs ─────────────────────────────────── */
.activity-view-tabs {
  display: flex;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  width: 100%;
}
.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  position: relative;
  transition: color 0.2s;
}
.tab-btn:hover {
  color: var(--text-primary);
}
.tab-btn.active {
  color: var(--accent-orange);
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--accent-orange);
  box-shadow: 0 0 8px var(--accent-orange);
}

/* ─── All Activities Panel ───────────────────────────────── */
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
  gap: 10px;
}
.activity-card-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.005) 0%, rgba(255, 255, 255, 0.015) 100%) !important;
  border: 1px solid var(--border-color) !important;
  padding: 12px 14px !important;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.25s ease;
  text-align: left;
}
.activity-card-item:hover {
  border-color: rgba(253, 151, 31, 0.2) !important;
  background: linear-gradient(135deg, rgba(253, 151, 31, 0.02) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.activity-card-item.card-signed {
  border-color: rgba(74, 222, 128, 0.15) !important;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.015) 0%, rgba(255, 255, 255, 0.01) 100%) !important;
}
.activity-card-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.activity-card-icon {
  font-size: 14px;
}
.activity-card-title {
  font-size: 12px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.activity-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.activity-tag-chip {
  font-size: 9px;
  padding: 2px 6px;
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
  border-top: 1px solid rgba(255, 255, 255, 0.02);
  padding-top: 8px;
}
.activity-card-members {
  display: flex;
  align-items: center;
  gap: 6px;
}
.members-icon {
  font-size: 11px;
  color: var(--text-secondary);
}
.members-text {
  font-size: 10px;
  color: var(--text-secondary);
}
</style>
