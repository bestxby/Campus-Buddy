<template>
  <div class="admin-controls-wrapper">
    <!-- 1. 全局网络与数据控制 -->
    <div class="stats-grid-panel admin-global-panel">
      <div class="stats-grid-title">🌐 全局网络与数据控制</div>
      
      <div class="control-cards-grid">

        <!-- 发布新活动卡片 (可点击) -->
        <div 
          @click="triggerCreateActivity" 
          class="control-card action-card" 
          style="--control-color: #34d399"
        >
          <div class="control-card-content">
            <div class="control-card-header">
              <span class="control-icon">➕</span>
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
              <span class="control-icon">🏷️</span>
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
              <span class="control-icon">🔄</span>
              <span class="control-label">重置系统数据</span>
            </div>
            <span class="action-hint">重置为系统默认网络关系</span>
          </div>
          <span class="action-arrow">➔</span>
        </div>
      </div>
    </div>

    <!-- 2. 个人社交诊断与检索 -->
    <div class="stats-grid-panel admin-individual-panel">
      <div class="stats-grid-title">⚡ 个人社交诊断与检索</div>
      
      <div class="control-cards-grid">
        <!-- 检索卡片 -->
        <div class="control-card search-card" style="--control-color: #3b82f6">
          <div class="control-card-header">
            <span class="control-icon">🔍</span>
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
              >👤 {{ sug }}</div>
            </div>
          </div>
        </div>

        <!-- 当前选中与操作区域 (仅当 activeStudent 有值时显示) -->
        <div v-if="activeStudent" class="selected-student-actions card glow-orange fade-in">
          <div class="selected-student-header">
            <span class="selected-icon">👤</span>
            <div class="selected-info">
              <span class="selected-label">当前选中</span>
              <span class="selected-name">{{ activeStudent }}</span>
            </div>
          </div>
          <div class="selected-buttons-row">
            <button @click="triggerOpenIndividualGraph" class="btn btn-xs btn-secondary glow-cyan">
              🌌 查看拓扑图
            </button>
            <button @click="clearSearch" class="btn-text btn-xs">清除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loadGraphData } from '@/composables/useGraph'
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
