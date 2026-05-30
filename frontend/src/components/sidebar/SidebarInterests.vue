<template>
  <div class="sidebar-interests-panel">
    <div class="panel-title">
      <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
      我的兴趣标签
    </div>
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
  margin: 0 10px; /* top margin handled by sidebar gap:8px */
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
  flex-shrink: 0;
}
.panel-title {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: var(--color-accent);
  margin-bottom: 10px;
  text-transform: uppercase;
}
.profile-interests-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.profile-interest-chip {
  font-size: 10.5px;
  padding: 3px 9px;
  border-radius: 12px;
  transition: all 0.2s ease;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: default; /* tags are display-only */
}
/* Sports: vivid cyan-teal */
.tag-sports {
  background: rgba(6, 182, 212, 0.12);
  border: 1.5px solid rgba(6, 182, 212, 0.5);
  color: #0891b2;
}
:global([data-theme="dark"]) .tag-sports {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.45);
  color: #22d3ee;
}
/* Arts: warm rose-pink */
.tag-arts {
  background: rgba(244, 63, 94, 0.10);
  border: 1.5px solid rgba(244, 63, 94, 0.45);
  color: #e11d48;
}
:global([data-theme="dark"]) .tag-arts {
  background: rgba(244, 63, 94, 0.14);
  border-color: rgba(244, 63, 94, 0.45);
  color: #fb7185;
}
/* Tech: electric amber/gold */
.tag-tech {
  background: rgba(234, 179, 8, 0.10);
  border: 1.5px solid rgba(234, 179, 8, 0.50);
  color: #b45309;
}
:global([data-theme="dark"]) .tag-tech {
  background: rgba(250, 204, 21, 0.12);
  border-color: rgba(250, 204, 21, 0.45);
  color: #fbbf24;
}
/* Social: vivid violet/purple */
.tag-social {
  background: rgba(139, 92, 246, 0.10);
  border: 1.5px solid rgba(139, 92, 246, 0.45);
  color: #7c3aed;
}
:global([data-theme="dark"]) .tag-social {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.45);
  color: #a78bfa;
}
.profile-interest-chip:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.interests-empty {
  font-size: 10px;
  color: var(--color-subtext);
  font-style: italic;
}
</style>
