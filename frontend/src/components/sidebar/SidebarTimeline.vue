<template>
  <div class="activities-timeline-panel">
    <div class="timeline-title">✅ 已报名活动</div>
    <div v-if="signedUpActivities.length" class="timeline-list">
      <div v-for="(act, idx) in signedUpActivities" :key="act" class="timeline-item">
        <div class="timeline-dot" :style="{ animationDelay: idx * 0.08 + 's' }"></div>
        <span class="timeline-act-name">{{ act }}</span>
      </div>
    </div>
    <div v-else class="timeline-empty">🌱 还没有报名任何活动</div>
  </div>
</template>

<script setup lang="ts">
import { signedUpActivities } from '@/composables/useAuth'
</script>

<style scoped>
.activities-timeline-panel { margin: 10px 10px 0; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px; flex: 1; min-height: 0; overflow-y: auto; }
.timeline-title { font-size: 10.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
.timeline-list { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; align-items: center; gap: 8px; position: relative; padding-bottom: 7px; }
.timeline-item:last-child { padding-bottom: 0; }
.timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 4px; top: 10px; bottom: 0; width: 1px; background: linear-gradient(180deg, rgba(52,211,153,0.3), transparent); }
.timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.5); flex-shrink: 0; animation: pulseDot 2s ease-in-out infinite; }
@keyframes pulseDot { 0%,100% { box-shadow: 0 0 5px rgba(52,211,153,0.4); } 50% { box-shadow: 0 0 10px rgba(52,211,153,0.7); } }
.timeline-act-name { font-size: 10px; color: rgba(255,255,255,0.7); line-height: 1.3; }
.timeline-empty { font-size: 10px; color: rgba(255,255,255,0.25); text-align: center; padding: 8px 0; }
</style>
