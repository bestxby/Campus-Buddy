<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>🧮 社交邻接矩阵分析</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
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
        <span class="btn-left">👤 学生个人兴趣倾向分析</span>
        <span class="btn-arrow">➔</span>
      </button>

      <!-- Button 2: Interest × Interest -->
      <button 
        @click="emit('open-graph', true, 'matrix', 'interest-cooccurrence')"
        class="matrix-btn neon-orange-btn"
      >
        <span class="btn-left">🎯 兴趣社群交叉共现分析</span>
        <span class="btn-arrow">➔</span>
      </button>

      <!-- Button 3: Student × Activity -->
      <button 
        @click="emit('open-graph', true, 'matrix', 'student-activity')"
        class="matrix-btn neon-green-btn"
      >
        <span class="btn-left">🎉 校园活动参与分布分析</span>
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
  background: linear-gradient(180deg, rgba(18, 24, 38, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%) !important;
  padding: 10px 14px !important;
}
.col-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
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
}
.matrix-btn:hover {
  transform: translateY(-1.5px);
}
.matrix-btn:active {
  transform: translateY(0);
}
.neon-cyan-btn {
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #cffafe;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.05);
}
.neon-cyan-btn:hover {
  background: rgba(6, 182, 212, 0.18);
  border-color: #22d3ee;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.25);
  color: #ffffff;
}
.neon-orange-btn {
  background: rgba(253, 151, 31, 0.08);
  border: 1px solid rgba(253, 151, 31, 0.3);
  color: #ffeed6;
  box-shadow: 0 0 8px rgba(253, 151, 31, 0.05);
}
.neon-orange-btn:hover {
  background: rgba(253, 151, 31, 0.18);
  border-color: #ffb74d;
  box-shadow: 0 0 15px rgba(253, 151, 31, 0.25);
  color: #ffffff;
}
.neon-green-btn {
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #d1fae5;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.05);
}
.neon-green-btn:hover {
  background: rgba(52, 211, 153, 0.18);
  border-color: #34d399;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.25);
  color: #ffffff;
}
.btn-arrow {
  transition: transform 0.3s;
}
.matrix-btn:hover .btn-arrow {
  transform: translateX(3px);
}
</style>
