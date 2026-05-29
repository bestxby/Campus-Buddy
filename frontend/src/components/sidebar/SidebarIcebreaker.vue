<template>
  <div class="sidebar-icebreaker-panel">
    <div class="panel-title">
      <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M15.09 14c.18-.33.3-.68.37-1.04A5 5 0 0 0 16 9a5 5 0 0 0-10 0 5 5 0 0 0 .54 2.96c.07.36.19.7.37 1.04l1.59 2h7l1.59-2z"></path>
      </svg>
      社交破冰小贴士
    </div>
    <div class="tip-content" style="display: flex; align-items: flex-start; gap: 6px;">
      <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--accent-orange)" stroke-width="2" style="margin-top: 2px;">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M15.09 14c.18-.33.3-.68.37-1.04A5 5 0 0 0 16 9a5 5 0 0 0-10 0 5 5 0 0 0 .54 2.96c.07.36.19.7.37 1.04l1.59 2h7l1.59-2z"></path>
      </svg>
      <Transition name="fade" mode="out-in">
        <div :key="tipData.buddyName || tipData.text" style="flex: 1;">
          <template v-if="tipData.hasBuddy">
            建议与
            <span class="highlight-buddy">{{ tipData.buddyName }}</span>
            交流
            <span class="highlight-interest"># {{ tipData.interest }}</span>
            话题，你们有共同的兴趣契合点！
          </template>
          <template v-else>
            {{ tipData.text }}
          </template>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { recommendations } from '@/composables/useRecommendations'

const tipData = computed(() => {
  const list = recommendations.value.buddies
  if (list && list.length > 0) {
    const topBuddy = list.find(b => b.sharedInterests && b.sharedInterests.length > 0)
    if (topBuddy) {
      return {
        hasBuddy: true,
        buddyName: topBuddy.name,
        interest: topBuddy.sharedInterests[0],
        text: ''
      }
    }
  }
  return {
    hasBuddy: false,
    text: '建议多去【智能推荐活动】一键报名心仪活动，偶遇更多契合的活动搭子！'
  }
})
</script>

<style scoped>
.sidebar-icebreaker-panel {
  margin: 10px 10px 0;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 12px;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar-icebreaker-panel:hover {
  background: rgba(255, 255, 255, 0.035);
  border-color: rgba(253, 151, 31, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 8px rgba(253, 151, 31, 0.04);
}
.panel-title {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #ffb74d;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.tip-content {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  text-align: left;
}
.highlight-buddy {
  color: var(--accent-orange);
  font-weight: bold;
}
.highlight-interest {
  color: #22d3ee;
  font-weight: bold;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
