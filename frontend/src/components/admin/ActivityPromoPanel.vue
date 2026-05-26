<template>
  <div class="promo-box card glow-cyan fade-in">
    <div class="promo-header">
      <span>🎯 活动【{{ activityName }}】定向宣传与关怀推送助手</span>
      <button @click="emit('close')" class="close-promo-btn">×</button>
    </div>
    <div class="promo-body">
      <p class="promo-intro">寻找对 <b>{{ interestName }}</b> 有共同兴趣但<b>尚未知晓或未报名</b>的同学：</p>
      <div v-if="promoTargetsForSelectedActivity.length > 0" class="promo-targets-list">
        <span v-for="target in promoTargetsForSelectedActivity" :key="target" class="target-student-chip">
          👤 {{ target }}
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
        >
          {{ promoSuccess ? '✓ 邀请消息已推送' : `📢 发送定向活动邀请` }}
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
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}
.close-promo-btn:hover {
  color: var(--text-primary);
}
.promo-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}
.promo-intro {
  font-size: 9.5px;
  color: var(--text-secondary);
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
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 9.5px;
  padding: 2px 6px;
  border-radius: 4px;
}
.promo-empty {
  font-size: 9.5px;
  color: var(--text-secondary);
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
