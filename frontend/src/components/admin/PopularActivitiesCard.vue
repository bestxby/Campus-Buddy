<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3 style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path>
          </svg>
          热门校园活动排行
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
            <h4>热门活动排行说明</h4>
            <p>展示全校学生参与度最高、最受欢迎的校园社交活动。您可以一键“置顶推荐”这些活动，使其在学生端推荐列表中优先置顶展示，以吸引更多同学报名参与。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-scroll-body">
      <div class="popularity-list">
        <div v-for="(item, idx) in popularActivities" :key="item.name" class="popularity-item">
          <div class="popularity-item-header">
            <span class="pop-rank">#{{ idx + 1 }}</span>
            <span class="pop-name" :title="item.name">{{ item.name }}</span>
            <span class="pop-interest">{{ item.interest }}</span>
          </div>
          
          <div class="popularity-item-body">
            <div class="progress-bar-container">
              <div class="progress-bar-track">
                <div 
                  class="progress-bar-fill" 
                  :style="{ width: (maxCount > 0 ? (item.count / maxCount * 100) : 0) + '%' }"
                ></div>
              </div>
              <span class="progress-value">{{ item.count }} 人报名 / 参与</span>
            </div>
            
            <button 
              @click="togglePromotion(item.name)" 
              class="btn btn-xs action-btn"
              :class="isPromoted(item.name) ? 'btn-promoted glow-orange' : 'btn-secondary glow-cyan'"
              style="display: inline-flex; align-items: center; justify-content: center; gap: 2px;"
            >
              <template v-if="isPromoted(item.name)">
                <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                已置顶推荐
              </template>
              <template v-else>
                <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                置顶推荐
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { popularActivities } from '@/composables/useGraphInsights'
import { promotedActivities, activeStudent, runRecommendations } from '@/composables/useRecommendations'
import { addLog } from '@/composables/useLogs'

const maxCount = computed(() => {
  return popularActivities.value.length ? Math.max(...popularActivities.value.map(a => a.count)) : 1
})

const isPromoted = (name: string): boolean => {
  return promotedActivities.value.has(name)
}

const togglePromotion = (name: string) => {
  if (promotedActivities.value.has(name)) {
    promotedActivities.value.delete(name)
    promotedActivities.value = new Set(promotedActivities.value)
    addLog('action', `【推广置顶取消】已取消热门活动【${name}】的优先推荐状态`)
  } else {
    promotedActivities.value.add(name)
    promotedActivities.value = new Set(promotedActivities.value)
    addLog('action', `【活动推荐置顶】成功将热门活动【${name}】设为置顶推荐，吸引更多同学报名参与`)
    addLog('info', `推荐引擎优化：正在为相关兴趣群体的同学们调整活动展示顺序，方便其查看该活动`)
  }
  
  if (activeStudent.value) {
    runRecommendations(activeStudent.value)
  }
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
  padding-bottom: 4px;
  margin-bottom: 6px;
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
.card-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.popularity-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 2px;
}
.popularity-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 4px 8px;
}
.popularity-item-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.pop-rank {
  font-weight: 800;
  color: var(--color-subtext);
  font-family: monospace;
}
.pop-name {
  flex: 1;
  text-align: left;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pop-interest {
  background-color: var(--bg-sports);
  border: 1px solid var(--color-sports);
  border-color: rgba(6, 182, 212, 0.2);
  color: var(--color-sports);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 10px;
  flex-shrink: 0;
}
.popularity-item-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.progress-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
}
.progress-bar-track {
  height: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-sports) 100%);
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.3);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.progress-value {
  font-size: 10px;
  color: var(--color-subtext);
  font-weight: 600;
}
.action-btn {
  font-size: 10px;
  padding: 2px 5px;
  white-space: nowrap;
  min-width: 70px;
}
.btn-promoted {
  background-color: var(--bg-tech) !important;
  border-color: var(--color-tech) !important;
  color: var(--color-tech) !important;
}
</style>
