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
      <!-- Compact diagnostic banner -->
      <div class="isolation-diagnostic-summary" :class="{ 'has-isolated-alert': isolatedStudents.length > 0 }">
        <span class="alert-icon">{{ isolatedStudents.length > 0 ? '⚠️' : '🎉' }}</span>
        <span class="alert-text">
          <template v-if="isolatedStudents.length > 0">
            检测到 <strong>{{ isolatedStudents.length }}</strong> 名处于隔离状态的孤立学生
          </template>
          <template v-else>
            全校社交网络连通率 100%，无孤立个体！
          </template>
        </span>
      </div>

      <div class="isolation-content-area" :class="{ 'has-selection': selectedIsolatedStudent }">
        <div v-if="isolatedStudents.length > 0" class="isolated-list-container">
          <div class="isolated-students-list">
            <div 
              v-for="student in isolatedStudents" 
              :key="student"
              class="isolated-student-item"
              :class="{ 'item-selected': selectedIsolatedStudent === student }"
              @click="selectIsolatedStudent(student)"
            >
              <div class="student-left">
                <span class="student-avatar-icon">👤</span>
                <span class="student-name-text">{{ student }}</span>
                <span class="student-deg-badge">度数: 0</span>
              </div>
              <button class="btn btn-xs btn-secondary select-bridge-btn">⚡ 桥接</button>
            </div>
          </div>
        </div>

        <!-- Bridge execution box inside scrolling area -->
        <BridgePlanPanel 
          v-if="selectedIsolatedStudent"
          :student-name="selectedIsolatedStudent"
          @close="selectedIsolatedStudent = null"
          @applied="selectedIsolatedStudent = null"
          class="bridge-panel-sidebar"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { graph } from '@/composables/useGraph'
import { ADMIN_NAME } from '@/constants/interests'
import BridgePlanPanel from './BridgePlanPanel.vue'

const selectedIsolatedStudent = ref<string | null>(null)

const isolatedStudents = computed(() => {
  const list: string[] = []
  for (const [node, neighbors] of graph.value.entries()) {
    if (node.startsWith('student:') && node !== `student:${ADMIN_NAME}` && neighbors.size === 0) {
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
  padding: 10px 14px !important;
}
.col-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 4px;
  margin-bottom: 6px;
  flex-shrink: 0;
}
.col-header h3 {
  font-size: 12px;
  margin: 0;
  color: var(--text-primary);
  font-weight: bold;
  text-align: left;
}
.flex-1-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
}
.isolation-diagnostic-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(52, 211, 153, 0.03);
  border: 1px solid rgba(52, 211, 153, 0.15);
  border-radius: 6px;
  padding: 6px 10px;
  flex-shrink: 0;
  text-align: left;
}
.isolation-diagnostic-summary.has-isolated-alert {
  background-color: rgba(239, 68, 68, 0.03);
  border-color: rgba(239, 68, 68, 0.15);
}
.alert-icon {
  font-size: 12px;
}
.alert-text {
  font-size: 9.5px;
  color: var(--text-secondary);
  line-height: 1.3;
}
.alert-text strong {
  color: #f87171;
  text-shadow: 0 0 6px rgba(239, 68, 68, 0.3);
}
.isolation-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.isolation-content-area.has-selection {
  flex-direction: row;
}
.isolated-list-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  transition: all 0.3s ease;
}
.isolation-content-area.has-selection .isolated-list-container {
  flex: 0 0 45%;
}
.isolated-students-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  padding: 3px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
  flex: 1;
}
.isolated-student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
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
.student-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.student-avatar-icon {
  font-size: 12px;
  opacity: 0.8;
}
.student-name-text {
  font-size: 10px;
  font-weight: bold;
  color: var(--text-primary);
}
.student-deg-badge {
  font-size: 8px;
  color: #f87171;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  padding: 0px 4px;
  border-radius: 3px;
}
.select-bridge-btn {
  font-size: 8px;
  padding: 2px 5px;
}
.bridge-panel-sidebar {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
