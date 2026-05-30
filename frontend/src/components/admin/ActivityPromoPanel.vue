<template>
  <div class="promo-box card glow-cyan fade-in">
    <div class="promo-header" style="display: flex; align-items: center;">
      <span style="display: inline-flex; align-items: center;">
        <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; color: #67e8f9;">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
        </svg>
        活动【{{ activityName }}】定向宣传与关怀推送助手
      </span>
      <button @click="emit('close')" class="close-promo-btn">×</button>
    </div>
    <div class="promo-body">
      <p class="promo-intro">寻找对 <b>{{ interestName }}</b> 有共同兴趣但<b>尚未知晓或未报名</b>的同学：</p>
      <div v-if="promoTargetsForSelectedActivity.length > 0" class="promo-targets-list">
        <span v-for="target in promoTargetsForSelectedActivity" :key="target" class="target-student-chip" style="display: inline-flex; align-items: center; gap: 4px;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.8;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {{ target }}
        </span>
      </div>
      <div v-else class="promo-empty">
        没有找到符合该兴趣条件且未报名的学生（全部符合条件的同学已报名）。
      </div>

      <div class="promo-action-row" v-if="promoTargetsForSelectedActivity.length > 0">
        <button 
          @click="sendTargetedPromotion"
          class="btn btn-xs btn-primary glow-orange send-promo-btn"
          :disabled="promoSuccess"
          style="display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
        >
          <template v-if="promoSuccess">
            <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            邀请消息已推送
          </template>
          <template v-else>
            <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            发送定向活动邀请
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { graph, nodeKey } from '@/composables/useGraph'
import { addLog } from '@/composables/useLogs'

const props = defineProps<{
  activityName: string
  interestName: string
}>()

const emit = defineEmits<{
  close: []
}>()

const promoSuccess = ref(false)

// Find students who share interest but haven't signed up
const promoTargetsForSelectedActivity = computed(() => {
  const actName = props.activityName
  if (!actName) return []

  const actNode = nodeKey('activity', actName)
  const actNeighbors = graph.value.get(actNode) ?? new Set<string>()

  // Get interest node of this activity
  const interestNode = Array.from(actNeighbors).find(n => n.startsWith('interest:'))
  if (!interestNode) return []

  // Find all students connected to this interest node
  const interestNeighbors = graph.value.get(interestNode) ?? new Set<string>()
  const interestStudents = Array.from(interestNeighbors).filter(n => n.startsWith('student:'))

  // Filter out students who are already registered to this activity
  const targets: string[] = []
  for (const sNode of interestStudents) {
    const sNeighbors = graph.value.get(sNode) ?? new Set<string>()
    if (!sNeighbors.has(actNode)) {
      targets.push(sNode.slice('student:'.length))
    }
  }

  return targets.sort().slice(0, 4) // Show up to 4 targets
})

const sendTargetedPromotion = () => {
  const actName = props.activityName
  const targets = promoTargetsForSelectedActivity.value
  if (!actName || targets.length === 0) return

  addLog('action', `【活动宣传推送】成功为活动【${actName}】向契合其兴趣的目标同学【${targets.join('、')}】发送了温馨活动邀请`)
  addLog('info', `宣传效果预估：通过此次温馨邀请，预计将为该活动带来新的活跃成员，帮助丰富同学们的课余生活。`)

  promoSuccess.value = true
  setTimeout(() => {
    promoSuccess.value = false
  }, 3000)
}
</script>

<style scoped>
.promo-box {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.04) 0%, rgba(18, 24, 38, 0.95) 100%) !important;
  border: 1px solid rgba(6, 182, 212, 0.2) !important;
  padding: 10px !important;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  border-radius: 8px;
}
.promo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
  color: #67e8f9;
}
.close-promo-btn {
  background: transparent;
  border: none;
  color: var(--color-subtext);
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}
.close-promo-btn:hover {
  color: var(--color-text);
}
.promo-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}
.promo-intro {
  font-size: 10px;
  color: var(--color-subtext);
  margin: 0;
}
.promo-targets-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 2px 0;
}
.target-student-chip {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.promo-empty {
  font-size: 10px;
  color: var(--color-subtext);
  font-style: italic;
}
.promo-action-row {
  display: flex;
  justify-content: flex-end;
}
.send-promo-btn {
  background-color: rgba(253, 151, 31, 0.1) !important;
  border-color: rgba(253, 151, 31, 0.25) !important;
  color: #ffb74d !important;
  padding: 4px 8px;
  font-size: 10px;
}
</style>
