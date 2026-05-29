<template>
  <div class="card result-card">
    <div class="result-card-header">
      <h3>
        <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        全校所有活动
      </h3>
    </div>

    <div class="all-activities-container">
      <!-- Search Box -->
      <div class="activity-search-wrapper">
        <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; opacity: 0.5;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="allActivitiesSearchQuery" 
          placeholder="搜索活动名称或关联兴趣标签..." 
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
                <span class="activity-card-icon" style="display: inline-flex; align-items: center; color: var(--accent-cyan);">
                  <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </span>
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
                <span class="members-icon" style="display: inline-flex; align-items: center; margin-right: 4px; vertical-align: -1px; color: var(--text-secondary);">
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
  // 按照活动名称拼音/字母排序，防止报名人数变化时卡片顺序动态改变发生乱跳
  return [...useGraphStore().allActivitiesList].sort((a, b) => a.name.localeCompare(b.name))
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

<style scoped src="./AllActivities.css"></style>
