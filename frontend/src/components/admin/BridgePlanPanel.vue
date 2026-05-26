<template>
  <div class="bridge-plan-box card glow-orange fade-in">
    <div class="bridge-header">
      <h4>⚡ 针对【{{ studentName }}】的人脉拓扑桥接方案</h4>
      <button @click="emit('close')" class="close-promo-btn">×</button>
    </div>
    
    <div class="bridge-body">
      <p class="bridge-intro">系统计算出以下三种最小代价的拓扑连结方式，您可以选择一种应用到网络中：</p>
      
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
            <div class="option-header-row">
              <span class="option-badge opt-interest">方案一</span>
              <span class="option-title">关联最热门兴趣圈</span>
            </div>
            <p class="option-desc">关联热门兴趣<b>【{{ mostPopularInterest.name }}】</b>，立刻与另外 <b>{{ mostPopularInterest.count }}</b> 名同学间接连通。</p>
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
            <div class="option-header-row">
              <span class="option-badge opt-student">方案二</span>
              <span class="option-title">结识全校社交核心达人</span>
            </div>
            <p class="option-desc">连通达人<b>【{{ topHubStudent.name }}】</b>（其直接关联 {{ topHubStudent.score }} 人），快速拓展社交圈。</p>
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
            <div class="option-header-row">
              <span class="option-badge opt-activity">方案三</span>
              <span class="option-title">报名最火爆校园活动</span>
            </div>
            <p class="option-desc">一键报名热门活动<b>【{{ mostPopularActivity.name }}】</b>（已有 <b>{{ mostPopularActivity.count }}</b> 人报名），提供即时的线下社交突破口。</p>
          </div>
        </label>
      </div>

      <button 
        @click="applyBridgePlan"
        class="btn btn-primary glow-orange apply-bridge-btn"
      >
        📢 发送社交桥接建议，引导融入校园网
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { graph, addEdge, updateStats, nodeKey } from '@/composables/useGraph'
import { topSocialStudents, popularInterests } from '@/composables/useGraphInsights'
import { addLog } from '@/composables/useLogs'

const props = defineProps<{
  studentName: string
}>()

const emit = defineEmits<{
  close: []
  applied: []
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
  const studentNode = nodeKey('student', studentName)
  let targetNode = ''
  let targetName = ''
  let bridgeType = ''

  if (bridgeOptionSelected.value === 'interest') {
    targetName = mostPopularInterest.value.name
    targetNode = nodeKey('interest', targetName)
    bridgeType = '兴趣圈'
  } else if (bridgeOptionSelected.value === 'student') {
    targetName = topHubStudent.value.name
    targetNode = nodeKey('student', targetName)
    bridgeType = '社交枢纽同学'
  } else {
    targetName = mostPopularActivity.value.name
    targetNode = nodeKey('activity', targetName)
    bridgeType = '热门校园活动'
  }

  // Add the edge to bridge them
  addEdge(studentNode, targetNode)
  updateStats()

  addLog('action', `【人脉桥接推送】成功向孤立同学【${studentName}】推送${bridgeType}【${targetName}】的社交桥接建议`)
  addLog('info', `系统诊断：已向用户端下发帮扶建议。若其接受并完成关联，社交度数将增至 1，正式连通校园网。`)

  emit('applied')
}
</script>

<style scoped>
.bridge-plan-box {
  background: linear-gradient(135deg, rgba(253, 151, 31, 0.04) 0%, rgba(18, 24, 38, 0.95) 100%) !important;
  border: 1px solid rgba(253, 151, 31, 0.2) !important;
  padding: 10px !important;
  flex-shrink: 0;
  border-radius: 8px;
}
.bridge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
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
  gap: 6px;
  text-align: left;
}
.bridge-intro {
  font-size: 9px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.3;
}
.bridge-options-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.bridge-option-item {
  display: flex;
  padding: 6px;
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
  margin-right: 8px;
  accent-color: var(--accent-orange);
  cursor: pointer;
}
.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.option-header-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.option-badge {
  font-size: 8px;
  font-weight: bold;
  padding: 1px 3px;
  border-radius: 3px;
}
.option-badge.opt-interest { background-color: rgba(6, 182, 212, 0.1); color: #22d3ee; }
.option-badge.opt-student { background-color: rgba(167, 139, 250, 0.1); color: #c084fc; }
.option-badge.opt-activity { background-color: rgba(253, 151, 31, 0.12); color: #ffb74d; }
.option-title {
  font-size: 9.5px;
  font-weight: bold;
  color: var(--text-primary);
}
.option-desc {
  font-size: 9px;
  color: var(--text-secondary);
  margin: 1px 0 0 0;
  line-height: 1.3;
}
.apply-bridge-btn {
  margin-top: 2px;
  width: 100%;
  padding: 8px;
  font-size: 11px;
}
</style>
