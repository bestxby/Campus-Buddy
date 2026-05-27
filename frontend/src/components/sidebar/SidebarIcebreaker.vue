<template>
  <div class="sidebar-icebreaker-panel">
    <div class="panel-title">💡 社交破冰小贴士</div>
    <div class="tip-content">
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
    text: '💡 建议多去【智能推荐活动】一键报名心仪活动，偶遇更多契合的活动搭子！'
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
  color: #c084fc;
  font-weight: bold;
}
.highlight-interest {
  color: #22d3ee;
  font-weight: bold;
}
</style>
