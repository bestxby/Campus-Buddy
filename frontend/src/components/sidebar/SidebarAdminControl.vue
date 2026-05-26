<template>
  <div class="admin-controls-wrapper">
    <!-- 1. 全局网络与数据控制 -->
    <div class="stats-grid-panel admin-global-panel">
      <div class="stats-grid-title">🌐 全局网络与数据控制</div>
      
      <div class="control-cards-grid">
        <!-- 打开全局拓扑卡片 (可点击) -->
        <div 
          @click="triggerOpenGlobalGraph" 
          class="control-card action-card" 
          style="--control-color: #06b6d4"
        >
          <div class="control-card-content">
            <div class="control-card-header">
              <span class="control-icon">🌌</span>
              <span class="control-label">打开全局拓扑图谱</span>
            </div>
            <span class="action-hint">查看/缩放全校所有人脉关系网络</span>
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
  'create-activity': []
}>()

const triggerOpenGlobalGraph = () => {
  emit('open-graph', true)
}

const triggerOpenIndividualGraph = () => {
  emit('open-graph', false)
}

const triggerCreateActivity = () => {
  emit('create-activity')
}

const triggerResetGraph = async () => {
  if (confirm('确认要重置系统数据吗？这将清除当前所有动态修改，并重新加载校园关系网络。')) {
    emit('logout')
    await loadGraphData()
    addLog('action', '🔄 重置系统数据：成功重新生成了校园社交网络，包含 4 名需要关怀帮扶的同学')
  }
}
</script>

<style scoped>
.stats-grid-panel { margin: 10px 10px 0; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px; flex-shrink: 0; }
.stats-grid-title { font-size: 10.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 8px; text-align: left; }

.control-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.control-card {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 12px;
  position: relative;
  overflow: hidden;
  padding-left: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 3px;
  background: var(--control-color);
  opacity: 0.6;
  transition: all 0.25s ease;
}

.control-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.control-icon {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.control-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Search Card details */
.search-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: visible !important;
}

.search-input-field {
  position: relative;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  transition: border-color 0.2s;
}

.search-input-field:focus-within {
  border-color: var(--control-color);
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.25);
}

.sidebar-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 11px;
  outline: none;
  width: 100%;
}

.sidebar-search-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  z-index: 100;
  background-color: var(--panel-bg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid var(--border-color);
  padding: 4px 0;
  border-radius: 4px;
}

.sug-item {
  padding: 8px 12px;
  font-size: 11px;
  cursor: pointer;
  text-align: left;
}

.sug-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--accent-orange);
}

/* Action card details */
.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.09);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 0 10px var(--control-color) !important;
}

.action-card:hover::before {
  opacity: 1;
  width: 4px;
}

.action-card:active {
  transform: scale(0.98);
}

.control-card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-hint {
  font-size: 9px;
  color: var(--text-secondary);
  margin-top: 1px;
}

.action-arrow {
  font-size: 11px;
  color: var(--text-secondary);
  transition: transform 0.25s;
}

.action-card:hover .action-arrow {
  transform: translateX(3px);
  color: var(--text-primary);
}

/* Selected student action card */
.selected-student-actions {
  background: linear-gradient(135deg, rgba(253, 151, 31, 0.05) 0%, rgba(18, 24, 38, 0.95) 100%) !important;
  border: 1px solid rgba(253, 151, 31, 0.25) !important;
  padding: 10px !important;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.selected-student-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.selected-icon {
  font-size: 14px;
}
.selected-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}
.selected-label {
  font-size: 9px;
  color: var(--text-secondary);
}
.selected-name {
  font-size: 11.5px;
  font-weight: 800;
  color: #ffb74d;
}
.selected-buttons-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 6px;
}
</style>
