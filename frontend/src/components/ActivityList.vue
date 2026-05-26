<template>
  <div class="card result-card">
    <div class="result-card-header">
      <h3>🎉 匹配活动推荐</h3>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import {
  activeStudent, activeFilter, filterTabs, filteredActivitiesGrouped, hasActivities,
  toggleGroupExpand, isGroupExpanded, getBuddiesForActivity,
} from '@/composables/useRecommendations'
import { currentUser, signUpForActivity, isSignedUp } from '@/composables/useAuth'

const emit = defineEmits<{ 'signed-up': [activity: string] }>()

const handleSignUp = (activity: string) => {
  signUpForActivity(activity)
  emit('signed-up', activity)
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
</style>
