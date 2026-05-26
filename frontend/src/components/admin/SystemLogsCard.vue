<template>
  <div class="dashboard-grid-card card">
    <div class="col-header">
      <div class="title-with-info">
        <h3>📟 实时图算法与沙盒操作日志</h3>
        <div class="info-tooltip-wrapper">
          <span class="info-icon">ℹ️</span>
          <div class="tooltip-content">
            <h4>操作日志说明</h4>
            <p>实时滚动记录系统后台图算法的执行与沙盒环境操作进程。包含：图谱加载统计、BFS/介数中心性等图论指标的运算耗时、定向帮扶消息发送、推荐引擎计算请求，以及网络重置动作。</p>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1-scroll-no-padding">
      <div class="log-console-fullscreen">
        <div class="console-body">
          <div v-for="(log, idx) in logs" :key="idx" class="console-line" :class="log.type">
            <span class="line-time">[{{ log.time }}]</span>
            <span class="line-tag">[{{ log.type.toUpperCase() }}]</span>
            <span class="line-msg">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { logs } from '@/composables/useLogs'
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
.flex-1-scroll-no-padding {
  flex: 1;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}
.log-console-fullscreen {
  background: #060913;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  position: relative;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.8);
}
.log-console-fullscreen::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 80%, rgba(6, 9, 19, 0.85) 100%);
}
.console-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 4px;
}
.console-line {
  font-family: Consolas, "Courier New", Courier, monospace;
  font-size: 9.5px;
  line-height: 1.35;
  white-space: pre-wrap;
  word-break: break-all;
  display: flex;
  gap: 6px;
  text-align: left;
}
.console-line.info {
  color: rgba(255, 255, 255, 0.6);
}
.console-line.query {
  color: #22d3ee;
}
.console-line.action {
  color: #34d399;
}
.console-line.warn {
  color: #f87171;
}
.line-time {
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}
.line-tag {
  font-weight: bold;
  flex-shrink: 0;
}
.line-msg {
  flex: 1;
}
.console-body::-webkit-scrollbar {
  width: 4px;
}
.console-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
}
.console-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
