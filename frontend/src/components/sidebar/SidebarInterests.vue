<template>
  <div class="sidebar-interests-panel">
    <div class="panel-title">🏷️ 我的兴趣标签</div>
    <div class="profile-interests-strip" v-if="userInterestTags.length">
      <span
        v-for="tag in userInterestTags"
        :key="tag"
        class="profile-interest-chip"
        :class="getTagClass(tag)"
      ># {{ tag }}</span>
    </div>
    <div v-else class="interests-empty">暂无兴趣标签</div>
  </div>
</template>

<script setup lang="ts">
import { userInterestTags } from '@/composables/useAuth'
import { INTEREST_CATEGORIES } from '@/constants/interests'

const getTagClass = (tag: string) => {
  if ((INTEREST_CATEGORIES.sports as readonly string[]).includes(tag)) return 'tag-sports'
  if ((INTEREST_CATEGORIES.arts as readonly string[]).includes(tag)) return 'tag-arts'
  if ((INTEREST_CATEGORIES.tech as readonly string[]).includes(tag)) return 'tag-tech'
  return 'tag-social'
}
</script>

<style scoped>
.sidebar-interests-panel {
  margin: 10px 10px 0;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 12px;
  flex-shrink: 0;
}
.panel-title {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #22d3ee;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.profile-interests-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.profile-interest-chip {
  font-size: 9px;
  padding: 2.5px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  font-weight: bold;
}
.tag-sports {
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.15);
  color: #22d3ee;
}
.tag-arts {
  background: rgba(244, 114, 182, 0.06);
  border: 1px solid rgba(244, 114, 182, 0.15);
  color: #f472b6;
}
.tag-tech {
  background: rgba(255, 183, 77, 0.06);
  border: 1px solid rgba(255, 183, 77, 0.15);
  color: #ffb74d;
}
.tag-social {
  background: rgba(52, 211, 153, 0.06);
  border: 1px solid rgba(52, 211, 153, 0.15);
  color: #34d399;
}
.profile-interest-chip:hover {
  transform: translateY(-1px);
  filter: brightness(1.2);
}
.interests-empty {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
}
</style>
