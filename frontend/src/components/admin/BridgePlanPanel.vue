<template>
  <div class="bridge-plan-box card glow-orange fade-in">
    <div class="bridge-header">
      <h4>⚡ 人脉拓扑桥接方案</h4>
      <button @click="emit('close')" class="close-promo-btn">×</button>
    </div>
    
    <div class="bridge-body">
      <div class="bridge-options-list">
        <!-- Option 1: Popular Interest -->
        <label class="bridge-option-item" :class="{ 'option-checked': bridgeOptionSelected === 'interest' }">
          <input 
            type="radio" 
            value="interest" 
            v-model="bridgeOptionSelected"
            class="hidden-radio"
          />
          <div class="option-content">
            <span class="option-badge opt-interest">兴趣圈</span>
            <span class="option-title">关联 <b>{{ mostPopularInterest.name }}</b> <span class="opt-sub">({{ mostPopularInterest.count }}人)</span></span>
          </div>
        </label>

        <!-- Option 2: Top Hub Student -->
        <label class="bridge-option-item" :class="{ 'option-checked': bridgeOptionSelected === 'student' }">
          <input 
            type="radio" 
            value="student" 
            v-model="bridgeOptionSelected"
            class="hidden-radio"
          />
          <div class="option-content">
            <span class="option-badge opt-student">社交达人</span>
            <span class="option-title">结识 <b>{{ topHubStudent.name }}</b> <span class="opt-sub">(度:{{ topHubStudent.score }})</span></span>
          </div>
        </label>

        <!-- Option 3: Popular Activity -->
        <label class="bridge-option-item" :class="{ 'option-checked': bridgeOptionSelected === 'activity' }">
          <input 
            type="radio" 
            value="activity" 
            v-model="bridgeOptionSelected"
            class="hidden-radio"
          />
          <div class="option-content">
            <span class="option-badge opt-activity">校园活动</span>
            <span class="option-title">报名 <b>{{ mostPopularActivity.name }}</b> <span class="opt-sub">({{ mostPopularActivity.count }}人)</span></span>
          </div>
        </label>
      </div>

      <button 
        @click="applyBridgePlan"
        class="btn btn-primary glow-orange apply-bridge-btn"
      >
        📢 一键发送桥接建议
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { graph } from '@/composables/useGraph'
import { topSocialStudents, popularInterests } from '@/composables/useGraphInsights'
import { addLog } from '@/composables/useLogs'

const props = defineProps<{
  studentName: string
}>()

const emit = defineEmits<{
  close: []
  applied: [studentName: string]
}>()

const bridgeOptionSelected = ref<'interest' | 'student' | 'activity'>('interest')

const mostPopularInterest = computed(() => {
  if (popularInterests.value.length === 0) return { name: '读书', count: 0 }
  return popularInterests.value[0]
})

const topHubStudent = computed(() => {
  if (topSocialStudents.value.length === 0) return { name: '小明', score: 0 }
  return topSocialStudents.value[0]
})

const mostPopularActivity = computed(() => {
  const list: { name: string; count: number }[] = []
  for (const [node, neighbors] of graph.value.entries()) {
    if (node.startsWith('activity:')) {
      const name = node.slice('activity:'.length)
      const studentCount = Array.from(neighbors).filter(n => n.startsWith('student:')).length
      list.push({ name, count: studentCount })
    }
  }
  if (list.length === 0) return { name: '校园讲座', count: 0 }
  return list.sort((a, b) => b.count - a.count)[0]
})

const applyBridgePlan = () => {
  const studentName = props.studentName
  let targetName = ''
  let bridgeType = ''

  if (bridgeOptionSelected.value === 'interest') {
    targetName = mostPopularInterest.value.name
    bridgeType = '兴趣圈'
  } else if (bridgeOptionSelected.value === 'student') {
    targetName = topHubStudent.value.name
    bridgeType = '社交枢纽同学'
  } else {
    targetName = mostPopularActivity.value.name
    bridgeType = '热门校园活动'
  }

  addLog('action', `【人脉桥接建议】已成功向孤立同学【${studentName}】推送${bridgeType}【${targetName}】的帮扶建议`)
  addLog('info', `系统状态：已向用户端下发建议通知，等待该生确认加入以融入校园网。`)

  emit('applied', studentName)
}
</script>

<style scoped>
.bridge-plan-box {
  background: linear-gradient(135deg, rgba(253, 151, 31, 0.04) 0%, rgba(18, 24, 38, 0.95) 100%) !important;
  border: 1px solid rgba(253, 151, 31, 0.2) !important;
  padding: 8px !important;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}
.bridge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.bridge-header h4 {
  font-size: 10px;
  margin: 0;
  color: #ffb74d;
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
.bridge-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
  flex: 1;
  min-height: 0;
  justify-content: space-between;
}
.bridge-options-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bridge-option-item {
  display: flex;
  align-items: center;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.02);
  background-color: rgba(255, 255, 255, 0.005);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.bridge-option-item:hover {
  background-color: rgba(255, 255, 255, 0.015);
}
.bridge-option-item.option-checked {
  background-color: rgba(253, 151, 31, 0.03);
  border-color: rgba(253, 151, 31, 0.2);
}
.hidden-radio {
  margin-right: 6px;
  accent-color: var(--accent-orange);
  cursor: pointer;
}
.option-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  overflow: hidden;
}
.option-badge {
  font-size: 10px;
  font-weight: bold;
  padding: 1px 3px;
  border-radius: 3px;
  flex-shrink: 0;
}
.option-badge.opt-interest { background-color: rgba(6, 182, 212, 0.1); color: #22d3ee; }
.option-badge.opt-student { background-color: rgba(167, 139, 250, 0.1); color: #c084fc; }
.option-badge.opt-activity { background-color: rgba(253, 151, 31, 0.12); color: #ffb74d; }
.option-title {
  font-size: 10px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.opt-sub {
  font-size: 10px;
  color: var(--text-secondary);
}
.apply-bridge-btn {
  margin-top: 4px;
  width: 100%;
  padding: 4px;
  font-size: 10px;
}
</style>
