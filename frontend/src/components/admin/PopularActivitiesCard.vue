<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🔥 热门校园活动排行</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
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
            >
              {{ isPromoted(item.name) ? '✓ 已置顶推荐' : '⚡ 置顶推荐' }}
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
.card-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.popularity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 2px;
}
.popularity-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  padding: 8px 10px;
}
.popularity-item-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.pop-rank {
  font-weight: 800;
  color: var(--text-secondary);
  font-family: monospace;
}
.pop-name {
  flex: 1;
  text-align: left;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pop-interest {
  background-color: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 9px;
  flex-shrink: 0;
}
.popularity-item-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.progress-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
}
.progress-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1e3a8a 0%, #06b6d4 100%);
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.6);
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.progress-value {
  font-size: 8.5px;
  color: var(--text-secondary);
  font-weight: 600;
}
.action-btn {
  font-size: 9px;
  padding: 4px 6px;
  white-space: nowrap;
  min-width: 80px;
}
.btn-promoted {
  background-color: rgba(253, 151, 31, 0.12) !important;
  border-color: rgba(253, 151, 31, 0.4) !important;
  color: #ffb74d !important;
}
</style>
