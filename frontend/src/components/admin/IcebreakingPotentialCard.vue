<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🎯 校园活动“破冰探索”排行</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content">
            <h4>活动社交破冰说明</h4>
            <p>评估活动连接不同圈子、打破社交隔阂的潜在作用。有些活动可能报名总数不多，但能吸引来自不同兴趣背景的同学参与，非常利于“破冰”与新朋友结识。置顶推荐此类活动，能有效促进全校不同群体同学间的交流沟通。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-scroll-body">
      <div class="icebreaking-list">
        <div v-for="(item, idx) in icebreakingActivities" :key="item.name" class="icebreaking-item">
          <div class="icebreaking-item-header">
            <span class="ice-rank">#{{ idx + 1 }}</span>
            <span class="ice-name" :title="item.name">{{ item.name }}</span>
            <span class="ice-interest">{{ item.interest }}</span>
          </div>
          
          <div class="icebreaking-item-body">
            <div class="progress-bar-container">
              <div class="progress-bar-track">
                <div 
                  class="progress-bar-fill" 
                  :style="{ width: item.score + '%' }"
                ></div>
              </div>
              <span class="progress-value">{{ item.score }}% 社交破冰潜力</span>
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
import { icebreakingActivities } from '@/composables/useGraphInsights'
import { promotedActivities, activeStudent, runRecommendations } from '@/composables/useRecommendations'
import { addLog } from '@/composables/useLogs'

const isPromoted = (name: string): boolean => {
  return promotedActivities.value.has(name)
}

const togglePromotion = (name: string) => {
  if (promotedActivities.value.has(name)) {
    promotedActivities.value.delete(name)
    // Force reactive trigger
    promotedActivities.value = new Set(promotedActivities.value)
    addLog('action', `【推广置顶取消】已取消活动【${name}】的优先推荐状态`)
  } else {
    promotedActivities.value.add(name)
    // Force reactive trigger
    promotedActivities.value = new Set(promotedActivities.value)
    addLog('action', `【活动推荐置顶】成功将破冰潜力活动【${name}】设为置顶推荐，引导更多同学跨圈交流`)
    addLog('info', `推荐引擎优化：正在为相关兴趣群体的同学们调整活动展示顺序，方便其查看该活动`)
  }
  
  // Re-run recommendations for current student to apply sorting change immediately
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
.icebreaking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 2px;
}
.icebreaking-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  padding: 8px 10px;
}
.icebreaking-item-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.ice-rank {
  font-weight: 800;
  color: var(--text-secondary);
  font-family: monospace;
}
.ice-name {
  flex: 1;
  text-align: left;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ice-interest {
  background-color: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 9px;
  flex-shrink: 0;
}
.icebreaking-item-body {
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
