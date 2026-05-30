<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3 style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          社交孤立分析与一键人脉桥接
        </h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon" style="display: inline-flex; align-items: center; justify-content: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </span>
          <div class="tooltip-content left-align">
            <h4>社交孤立分析说明</h4>
            <p>基于图论度数（Degree）检测。当一个学生节点的度数为 0（无任何连边）时即判定为社交孤立。系统实时分析这些“孤岛学生”，并提供关联热门兴趣、推荐社交达人或报名热门活动三种一键桥接方案，以最小的图边代价将他们织入全校社交网。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex-1-scroll">
      <!-- Compact analysis banner -->
      <div class="isolation-diagnostic-summary" :class="{ 'has-isolated-alert': isolatedStudents.length > 0 }">
        <span class="alert-icon" style="display: inline-flex; align-items: center;">
          <template v-if="isolatedStudents.length > 0">
            <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#f87171" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </template>
          <template v-else>
            <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#34d399" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </template>
        </span>
        <span class="alert-text">
          <template v-if="isolatedStudents.length > 0">
            检测到 <strong>{{ isolatedStudents.length }}</strong> 名暂无社交连接的孤立学生
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
                <span class="student-avatar-icon" style="display: inline-flex; align-items: center;">
                  <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.8;">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <span class="student-name-text">{{ student }}</span>
                <span class="student-deg-badge">度数: 0</span>
                <span v-if="sentSuggestions.has(student)" class="suggestion-sent-badge">已建议</span>
              </div>
              <button 
                class="btn btn-xs select-bridge-btn"
                :class="sentSuggestions.has(student) ? 'suggested-btn' : 'btn-secondary'"
                style="display: inline-flex; align-items: center; justify-content: center; gap: 2px;"
              >
                <template v-if="sentSuggestions.has(student)">
                  <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  已建议
                </template>
                <template v-else>
                  <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  桥接
                </template>
              </button>
            </div>
          </div>
        </div>

        <!-- Bridge execution box inside scrolling area -->
        <BridgePlanPanel 
          v-if="selectedIsolatedStudent"
          :student-name="selectedIsolatedStudent"
          @close="selectedIsolatedStudent = null"
          @applied="handleApplied"
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
const sentSuggestions = ref(new Set<string>())

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

const handleApplied = (studentName: string) => {
  sentSuggestions.value.add(studentName)
  sentSuggestions.value = new Set(sentSuggestions.value) // Trigger reactivity
  selectedIsolatedStudent.value = null
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
  font-size: 10px;
  color: var(--color-subtext);
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
  border: 1px solid var(--color-border);
  padding: 3px;
  border-radius: 6px;
  background: var(--color-surface-2);
  flex: 1;
}
.isolated-student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.isolated-student-item:hover {
  background-color: var(--color-surface-2);
  border-color: var(--color-accent);
}
.isolated-student-item.item-selected {
  background-color: var(--bg-tech);
  border-color: var(--color-tech);
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
  color: var(--color-text);
}
.student-deg-badge {
  font-size: 10px;
  color: var(--color-danger);
  background: var(--color-accent-light);
  border: 1px solid var(--color-border);
  padding: 0px 4px;
  border-radius: 3px;
}
.select-bridge-btn {
  font-size: 10px;
  padding: 2px 5px;
}
.select-bridge-btn.suggested-btn {
  background-color: var(--bg-tech) !important;
  border-color: var(--color-tech) !important;
  color: var(--color-tech) !important;
  box-shadow: var(--shadow-sm);
}
.suggestion-sent-badge {
  font-size: 7.5px;
  color: var(--color-tech);
  background: var(--bg-tech);
  border: 1px solid var(--color-tech);
  padding: 0px 3px;
  border-radius: 3px;
  margin-left: 2px;
}
.bridge-panel-sidebar {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
