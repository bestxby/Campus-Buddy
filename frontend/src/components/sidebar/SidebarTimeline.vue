<template>
  <div class="activities-timeline-panel">
    <div class="timeline-title">
      <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
      已报名校园活动
    </div>
    <div v-if="signedUpActivities.length" class="timeline-list">
      <div v-for="(act, idx) in signedUpActivities" :key="act" class="timeline-item">
        <div class="timeline-dot" :style="{ animationDelay: idx * 0.08 + 's' }"></div>
        <span class="timeline-act-name">{{ act }}</span>
        <button 
          @click="handleCancel(act)" 
          class="timeline-cancel-btn" 
          title="取消报名此活动"
        >
          取消
        </button>
      </div>
    </div>
    <div v-else class="timeline-empty">
      <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right: 4px; vertical-align: -1px; opacity: 0.5;">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      还没有报名任何活动
    </div>
  </div>
</template>

<script setup lang="ts">
import { currentUser, signedUpActivities, cancelSignUpForActivity } from '@/composables/useAuth'
import { addLog } from '@/composables/useLogs'

const handleCancel = (activity: string) => {
  cancelSignUpForActivity(activity)
  addLog('action', `【取消报名】学生【${currentUser.value}】在侧边栏取消报名了活动【${activity}】`)
  addLog('info', `推荐系统重算：已从侧边栏移除【${currentUser.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)
}
</script>

<style scoped>
.activities-timeline-panel { margin: 10px 10px 0; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px; flex-shrink: 0; }
.timeline-title { font-size: 11.5px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #34d399; margin-bottom: 10px; }
.timeline-list { display: flex; flex-direction: column; gap: 0; }
.timeline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: 4px 6px 8px 6px;
  margin: 0 -6px;
  border-radius: 4px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.timeline-item:last-child { padding-bottom: 4px; }
.timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 9px; top: 16px; bottom: 0; width: 1px; background: linear-gradient(180deg, rgba(52,211,153,0.3), transparent); }
.timeline-item:hover {
  background: rgba(255, 255, 255, 0.03);
}
.timeline-item:hover .timeline-dot {
  transform: scale(1.3);
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
}
.timeline-item:hover .timeline-act-name {
  color: var(--text-primary);
}
.timeline-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; flex-shrink: 0; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.timeline-act-name { font-size: 11px; color: rgba(255,255,255,0.85); line-height: 1.4; flex: 1; text-align: left; transition: color 0.25s ease; }
.timeline-empty { font-size: 11px; color: rgba(255,255,255,0.25); text-align: center; padding: 8px 0; }
.timeline-cancel-btn {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-radius: 4px;
  font-size: 10px;
  padding: 2px 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}
.timeline-cancel-btn:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.45);
}
</style>
