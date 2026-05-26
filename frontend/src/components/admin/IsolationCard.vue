<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🧭 社交孤立诊断与一键人脉桥接</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content left-align">
            <h4>社交孤立诊断说明</h4>
            <p>基于图论度数（Degree）检测。当一个学生节点的度数为 0（无任何连边）时即判定为社交孤立。系统实时诊断这些“孤岛学生”，并提供关联热门兴趣、推荐社交达人或报名热门活动三种一键桥接方案，以最小的图边代价将他们织入全校社交网。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex-1-scroll">
      <div class="isolation-diagnostic-summary">
        <span class="isolated-alert-badge" :class="{ 'has-isolated-alert': isolatedStudents.length > 0 }">
          当前社交孤立学生：{{ isolatedStudents.length }} 人
        </span>
        <p class="isolated-desc">绝对孤立即无任何社交连接的学生，处于完全隔离的孤岛状态。</p>
      </div>

      <div class="isolated-list-container">
        <div class="list-title">👤 待帮扶孤立学生列表 (点击启动桥接)</div>
        <div v-if="isolatedStudents.length > 0" class="isolated-students-list">
          <div 
            v-for="student in isolatedStudents" 
            :key="student"
            class="isolated-student-item"
            :class="{ 'item-selected': selectedIsolatedStudent === student }"
            @click="selectIsolatedStudent(student)"
          >
            <span class="student-avatar-icon">👤</span>
            <div class="student-meta-info">
              <span class="student-name-text">{{ student }}</span>
              <span class="student-deg-badge">度数: 0 (绝对孤立)</span>
            </div>
            <button class="btn btn-xs btn-secondary select-bridge-btn">⚡ 桥接方案</button>
          </div>
        </div>
        <div v-else class="isolated-empty-state">
          🎉 全校学生社交图谱连通率 100%，没有检测到任何孤立个体！
        </div>
      </div>

      <!-- Bridge execution box inside scrolling area -->
      <BridgePlanPanel 
        v-if="selectedIsolatedStudent"
        :student-name="selectedIsolatedStudent"
        @close="selectedIsolatedStudent = null"
        @applied="selectedIsolatedStudent = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { graph } from '@/composables/useGraph'
import BridgePlanPanel from './BridgePlanPanel.vue'

const selectedIsolatedStudent = ref<string | null>(null)

const isolatedStudents = computed(() => {
  const list: string[] = []
  for (const [node, neighbors] of graph.value.entries()) {
    if (node.startsWith('student:') && node !== 'student:系统管理员' && neighbors.size === 0) {
      list.push(node.slice('student:'.length))
    }
  }
  return list.sort()
})

const selectIsolatedStudent = (name: string) => {
  selectedIsolatedStudent.value = name
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
.flex-1-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}
.isolation-diagnostic-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: rgba(239, 68, 68, 0.02);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  flex-shrink: 0;
}
.isolated-alert-badge {
  font-size: 10px;
  font-weight: bold;
  color: var(--text-secondary);
  text-align: left;
}
.isolated-alert-badge.has-isolated-alert {
  color: #f87171;
  text-shadow: 0 0 6px rgba(239, 68, 68, 0.35);
}
.isolated-desc {
  font-size: 9px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.3;
  text-align: left;
}
.isolated-list-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 80px;
}
.list-title {
  font-size: 9.5px;
  font-weight: bold;
  color: var(--text-secondary);
  text-align: left;
}
.isolated-students-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  padding: 4px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
  flex: 1;
}
.isolated-student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  background-color: rgba(255, 255, 255, 0.008);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.isolated-student-item:hover {
  background-color: rgba(253, 151, 31, 0.02);
  border-color: rgba(253, 151, 31, 0.1);
}
.isolated-student-item.item-selected {
  background-color: rgba(253, 151, 31, 0.06);
  border-color: rgba(253, 151, 31, 0.3);
}
.student-avatar-icon {
  font-size: 14px;
}
.student-meta-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 8px;
  text-align: left;
}
.student-name-text {
  font-size: 10px;
  font-weight: bold;
  color: var(--text-primary);
}
.student-deg-badge {
  font-size: 8.5px;
  color: #f87171;
}
.select-bridge-btn {
  font-size: 8px;
  padding: 2px 4px;
}
.isolated-empty-state {
  font-size: 10px;
  color: #34d399;
  font-weight: bold;
  padding: 20px 10px;
  text-align: center;
  border: 1px dashed rgba(52, 211, 153, 0.15);
  border-radius: 6px;
  background-color: rgba(52, 211, 153, 0.01);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
