<template>
  <div class="card result-card">
    <div class="result-card-header">
      <h3>
        <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
        智能推荐活动
      </h3>
    </div>

    <!-- Interest Filter Tabs -->
    <div v-if="filterTabs.length > 1" class="interest-filters">
      <button
        v-for="tab in filterTabs"
        :key="tab"
        class="filter-pill"
        :class="{ 'tab-active': activeFilter === tab }"
        @click="activeFilter = tab"
      >
        <span v-if="tab === '全部'" style="display: inline-flex; align-items: center; margin-right: 4px; vertical-align: -1px;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </span>
        {{ tab === '全部' ? '全部推荐' : tab }}
      </button>
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
            <div class="header-left">
              <span class="activity-card-icon" style="display: inline-flex; align-items: center; color: var(--color-accent);">
                <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
              </span>
              <h4 class="activity-card-title" :title="act.name">{{ act.name }}</h4>
            </div>
            <div class="activity-card-tags-right">
              <span 
                class="activity-tag-chip"
                :class="getTagClass(act.matchingInterest)"
              ># {{ act.matchingInterest }}</span>
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

          <!-- Buddy match reason (compact) -->
          <div class="match-reason-line">
            <span v-if="act.buddiesSigned.length > 0" class="buddy-signup-text" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: -1px; color: var(--color-subtext);">
                <path d="M17 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M9 21v-2a4 4 0 0 0-3-3.87"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              {{ act.buddiesSigned.slice(0, 2).join('、') }}<span v-if="act.buddiesSigned.length > 2">等{{ act.buddiesSigned.length }}人</span>也报名了
            </span>
            <span v-else class="recommend-reason-text" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: -1px; color: var(--color-accent);">
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
                <path d="M15.09 14c.18-.33.3-.68.37-1.04A5 5 0 0 0 16 9a5 5 0 0 0-10 0 5 5 0 0 0 .54 2.96c.07.36.19.7.37 1.04l1.59 2h7l1.59-2z"></path>
              </svg>
              基于共同兴趣推荐
            </span>
          </div>

          <!-- Footer & Actions -->
          <div class="activity-card-footer">
            <div class="activity-card-members">
              <span class="members-icon" style="display: inline-flex; align-items: center; margin-right: 4px; vertical-align: -1px; color: var(--color-subtext);">
                <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </span>
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
  cancelSignUpForActivity(activity)
  addLog('action', `【取消报名】学生【${currentUser.value}】取消报名了活动【${activity}】`)
  addLog('info', `推荐系统重算：已移除【${currentUser.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)
  emit('cancelled', activity)
}

// Build helper computed properties to gather activity tags, registration count, and buddies
const activityInfoMap = computed(() => {
  const map = new Map<string, { interests: string[]; studentCount: number }>()
  for (const act of useGraphStore().allActivitiesList) {
    map.set(act.name, { interests: act.interests, studentCount: act.studentCount })
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
  const seen = new Set<string>()
  
  for (const interest in groups) {
    const acts = groups[interest]
    for (const act of acts) {
      // Avoid duplicate activity entries in matching result
      if (seen.has(act)) continue
      seen.add(act)
      
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

<style scoped src="./RecommendedActivities.css"></style>
