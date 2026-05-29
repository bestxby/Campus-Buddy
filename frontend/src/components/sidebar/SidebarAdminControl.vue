<template>
  <div class="admin-controls-wrapper">
    <!-- 1. 全局网络与数据控制 -->
    <div class="stats-grid-panel admin-global-panel">
      <div class="stats-grid-title">
        <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        全局网络与数据控制
      </div>
      
      <div class="control-cards-grid">

        <!-- 发布新活动卡片 (可点击) -->
        <div 
          @click="triggerCreateActivity" 
          class="control-card action-card" 
          style="--control-color: #34d399"
        >
          <div class="control-card-content">
            <div class="control-card-header">
              <span class="control-icon">
                <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
              <span class="control-label">发布校园新活动</span>
            </div>
            <span class="action-hint">创建新活动并设置相关兴趣圈标签</span>
          </div>
          <span class="action-arrow">➔</span>
        </div>

        <!-- 发布新兴趣标签卡片 (可点击) -->
        <div 
          @click="triggerCreateInterest" 
          class="control-card action-card" 
          style="--control-color: #06b6d4"
        >
          <div class="control-card-content">
            <div class="control-card-header">
              <span class="control-icon">
                <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </span>
              <span class="control-label">发布新兴趣标签</span>
            </div>
            <span class="action-hint">创建新兴趣并设置相关归属领域类别</span>
          </div>
          <span class="action-arrow">➔</span>
        </div>

        <!-- 重置系统数据卡片 (可点击) -->
        <div 
          @click="triggerResetGraph" 
          class="control-card action-card" 
          style="--control-color: #fd971f"
        >
          <div class="control-card-content">
            <div class="control-card-header">
              <span class="control-icon">
                <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </span>
              <span class="control-label">重置系统数据</span>
            </div>
            <span class="action-hint">重置为系统默认网络关系</span>
          </div>
          <span class="action-arrow">➔</span>
        </div>
      </div>
    </div>

    <!-- 2. 个人社交匹配与检索 -->
    <div class="stats-grid-panel admin-individual-panel">
      <div class="stats-grid-title">
        <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1px;">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </svg>
        个人社交匹配与检索
      </div>
      
      <div class="control-cards-grid">
        <!-- 检索卡片 -->
        <div class="control-card search-card" style="--control-color: #3b82f6">
          <div class="control-card-header">
            <span class="control-icon">
              <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <span class="control-label">网络检索</span>
          </div>
          <div class="search-input-field">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              @blur="closeSuggestions"
              placeholder="输入姓名检索个人社交画像..."
              class="sidebar-search-input"
            />
            <!-- 联想下拉框 -->
            <div v-if="suggestions.length" class="suggestions-dropdown card">
              <div
                v-for="sug in suggestions"
                :key="sug"
                class="sug-item"
                @mousedown="selectStudent(sug)"
              >
                <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; opacity: 0.7;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {{ sug }}
              </div>
            </div>
          </div>
        </div>

        <!-- 当前选中与操作区域 (仅当 activeStudent 有值时显示) -->
        <div v-if="activeStudent" class="selected-student-actions card glow-orange fade-in">
          <div class="selected-student-header">
            <span class="selected-icon">
              <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-orange);">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <div class="selected-info">
              <span class="selected-label">当前选中</span>
              <span class="selected-name">{{ activeStudent }}</span>
            </div>
          </div>
          <div class="selected-buttons-row">
            <div style="display: flex; gap: 6px;">
              <button @click="triggerOpenIndividualGraph" class="btn btn-xs btn-secondary glow-cyan" style="display: flex; align-items: center; gap: 4px;">
                <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                查看拓扑图
              </button>
              <button @click="isExportModalVisible = true" class="btn btn-xs btn-primary glow-orange" style="display: flex; align-items: center; gap: 4px;">
                <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                导出分析报告
              </button>
            </div>
            <button @click="clearSearch" class="btn-text btn-xs">清除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal Overlay for Admin Mode -->
    <ExportModal 
      :visible="isExportModalVisible" 
      :isAdminMode="true" 
      :studentName="activeStudent || ''" 
      @close="isExportModalVisible = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExportModal from '@/components/ExportModal.vue'
import { loadGraphData } from '@/composables/useGraph'

const isExportModalVisible = ref(false)
import { searchQuery, suggestions, onSearchInput, selectStudent, activeStudent, clearSearch } from '@/composables/useRecommendations'
import { addLog } from '@/composables/useLogs'

const closeSuggestions = () => {
  setTimeout(() => {
    suggestions.value = []
  }, 200)
}

const emit = defineEmits<{
  logout: [],
  'open-graph': [forceGlobal?: boolean],
  'create-activity': [],
  'create-interest': []
}>()


const triggerOpenIndividualGraph = () => {
  emit('open-graph', false)
}

const triggerCreateActivity = () => {
  emit('create-activity')
}

const triggerCreateInterest = () => {
  emit('create-interest')
}

const triggerResetGraph = async () => {
  if (confirm('确认要重置系统数据吗？这将清除当前所有动态修改，并重新加载校园关系网络。')) {
    emit('logout')
    await loadGraphData()
    addLog('action', '🔄 重置系统数据：成功重新生成了校园社交网络，包含 4 名需要关怀帮扶的同学')
  }
}
</script>

<style scoped src="./SidebarAdminControl.css"></style>
