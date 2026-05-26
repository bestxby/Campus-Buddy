<template>
  <header class="dashboard-header card glow-orange">
    <div class="header-logo-section">
      <span class="pulse-ring-glow">📡</span>
      <div class="header-text">
        <h2>系统大数据中心化管理看板</h2>
        <p>实时监控异构无向图状态、社交圈划分、桥梁诊断及热门兴趣排行</p>
      </div>
    </div>
    <div class="sys-status">
      <span class="status-dot green"></span>
      <span class="status-text">系统正常运行中</span>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%) !important;
  border: 1px solid rgba(253, 151, 31, 0.15) !important;
  flex-shrink: 0;
}
.header-logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}
.pulse-ring-glow {
  font-size: 20px;
  animation: pulseScale 2s infinite ease-in-out;
  display: inline-block;
  filter: drop-shadow(0 0 6px var(--accent-orange));
}
@keyframes pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
.header-text h2 {
  font-size: 14px;
  margin: 0 0 2px 0;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: 0.3px;
  text-align: left;
}
.header-text p {
  font-size: 10px;
  margin: 0;
  color: var(--text-secondary);
  text-align: left;
}
.sys-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.2);
  padding: 4px 10px;
  border-radius: 20px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-dot.green {
  background-color: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
}
.status-text {
  font-size: 9px;
  font-weight: bold;
  color: #6ee7b7;
}
</style>
