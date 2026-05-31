<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3 style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
          </svg>
          社交邻接矩阵分析
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
            <h4>邻接关联矩阵分析</h4>
            <p>通过多维网格分析，展现全校的兴趣重合度和活动参与分布。点击下方对应的分析按钮，即可在全局全屏视图下展开并深入探索数据关系。</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="matrix-buttons-list">
      <!-- Button 1: Student × Interest -->
      <button 
        @click="emit('open-graph', true, 'matrix', 'student-interest')"
        class="matrix-btn neon-cyan-btn"
      >
        <span class="btn-left" style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; opacity: 0.85;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          学生个人兴趣倾向分析
        </span>
        <span class="btn-arrow">➔</span>
      </button>

      <!-- Button 2: Interest × Interest -->
      <button 
        @click="emit('open-graph', true, 'matrix', 'interest-cooccurrence')"
        class="matrix-btn neon-orange-btn"
      >
        <span class="btn-left" style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; opacity: 0.85;">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
          </svg>
          兴趣社群交叉共现分析
        </span>
        <span class="btn-arrow">➔</span>
      </button>

      <!-- Button 3: Student × Activity -->
      <button 
        @click="emit('open-graph', true, 'matrix', 'student-activity')"
        class="matrix-btn neon-green-btn"
      >
        <span class="btn-left" style="display: inline-flex; align-items: center;">
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; opacity: 0.85;">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          校园活动参与分布分析
        </span>
        <span class="btn-arrow">➔</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'open-graph': [forceGlobal: boolean, viewMode: 'network' | 'matrix', matrixMode: 'student-interest' | 'student-activity' | 'interest-cooccurrence']
}>()
</script>

<style scoped>
.dashboard-grid-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
  background: var(--color-surface);
  padding: 12px 16px !important;
  position: relative;
  z-index: 1;
}
.dashboard-grid-card:has(.matrix-btn:hover) {
  z-index: 10;
}
.col-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 5px;
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
.matrix-buttons-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.matrix-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-align: left;
  position: relative;
  z-index: 1;
}
.matrix-btn:hover {
  transform: translateY(-1.5px);
  z-index: 10;
}
.matrix-btn:active {
  transform: translateY(0);
}
.neon-cyan-btn {
  background: var(--color-admin-active-bg);
  border: 1px solid var(--color-admin-active-border);
  color: var(--color-admin-active-text);
  box-shadow: 0 0 8px var(--color-admin-active-bg);
}
.neon-cyan-btn:hover {
  background: var(--color-admin-active-border);
  border-color: var(--color-admin-active-text);
  color: var(--color-text);
  box-shadow: 0 0 15px var(--color-admin-active-border);
}
.neon-orange-btn {
  background: var(--color-social-active-bg);
  border: 1px solid var(--color-social-active-border);
  color: var(--color-social-active-text);
  box-shadow: 0 0 8px var(--color-social-active-bg);
}
.neon-orange-btn:hover {
  background: var(--color-social-active-border);
  border-color: var(--color-social-active-text);
  color: var(--color-text);
  box-shadow: 0 0 15px var(--color-social-active-border);
}
.neon-green-btn {
  --green-active-bg: rgba(21, 128, 61, 0.08);
  --green-active-border: rgba(21, 128, 61, 0.25);
  --green-active-text: #15803D;
  background: var(--green-active-bg);
  border: 1px solid var(--green-active-border);
  color: var(--green-active-text);
  box-shadow: 0 0 8px var(--green-active-bg);
}
[data-theme="dark"] .neon-green-btn {
  --green-active-bg: rgba(52, 211, 153, 0.08);
  --green-active-border: rgba(52, 211, 153, 0.25);
  --green-active-text: #34d399;
}
.neon-green-btn:hover {
  background: var(--green-active-border);
  border-color: var(--green-active-text);
  color: var(--color-text);
  box-shadow: 0 0 15px var(--green-active-border);
}
.btn-arrow {
  transition: transform 0.3s;
}
.matrix-btn:hover .btn-arrow {
  transform: translateX(3px);
}
</style>
