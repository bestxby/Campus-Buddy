<template>
  <div class="card result-card">
    <div class="result-card-header">
      <h3>
        <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        兴趣契合的活动搭子
      </h3>
    </div>

    <!-- Shortest Path Finder (人脉搭桥) -->
    <PathFinder v-if="currentUserRole === 'admin'" @open-graph-highlight="emit('open-graph-highlight')" />

    <!-- Jaccard-ranked buddy list -->
    <ul v-if="recommendations.buddies.length" class="buddy-list">
      <li v-for="buddy in recommendations.buddies.slice(0, maxVisibleBuddies)" :key="buddy.name" class="path-item" :class="{ 'social-buddy-item': isSocialBuddy(buddy.name) }">
        <div class="buddy-row">
          <div class="path-flow">
            <span class="node student" :class="{ 'social-buddy-node': isSocialBuddy(activeStudent!) }" :title="activeStudent || ''">
              {{ activeStudent }}
              <span v-if="isSocialBuddy(activeStudent!)" class="social-star" title="社交达人" style="display: inline-flex; align-items: center; margin-left: 2px;">
                <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
            </span>
            <span class="arrow">➔</span>
            <span class="node interest" :title="getSharedInterest(activeStudent!, buddy.name, 'student')">{{ getSharedInterest(activeStudent!, buddy.name, 'student') }}</span>
            <span class="arrow">➔</span>
            <span class="node student" :class="{ 'social-buddy-node': isSocialBuddy(buddy.name) }" :title="buddy.name">
              {{ buddy.name }}
              <span v-if="isSocialBuddy(buddy.name)" class="social-star" title="社交达人" style="display: inline-flex; align-items: center; margin-left: 2px;">
                <svg class="icon-svg" viewBox="0 0 24 24" width="9" height="9" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
            </span>
          </div>
          <!-- Jaccard badge -->
          <div class="jaccard-badge" :title="`Jaccard 相似度: ${(buddy.jaccard * 100).toFixed(0)}%`">
            <span class="jaccard-icon" style="display: inline-flex; align-items: center; color: var(--color-accent);">
              <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </span>
            <span class="jaccard-count">{{ buddy.sharedCount }}个共同</span>
            <span class="jaccard-score">{{ (buddy.jaccard * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="empty-msg">暂时没有相同兴趣的搭子。</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { activeStudent, recommendations, getSharedInterest } from '@/composables/useRecommendations'
import { currentUserRole } from '@/composables/useAuth'
import { useGraphStore } from '@/stores/graph'
import PathFinder from '@/components/buddy/PathFinder.vue'

const emit = defineEmits<{ 'open-graph-highlight': [] }>()

const graphStore = useGraphStore()
const isSocialBuddy = (name: string) => graphStore.socialStudents.has(name)

const maxVisibleBuddies = computed(() => currentUserRole.value === 'admin' ? 30 : 10)
</script>

<style scoped>
.result-card { height: 100%; display: flex; flex-direction: column; }
.result-card-header { margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.result-card h3 {
  font-size: 11.5px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-accent);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.buddy-list {
  list-style: none;
  padding: 8px 8px 8px 6px;
  margin: -8px -8px -8px -6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
}
.path-item {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.path-item:hover {
  border-color: var(--color-accent) !important;
  background: var(--color-accent-light) !important;
  transform: translateY(-1.5px);
  box-shadow: var(--shadow-md);
}
.buddy-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: nowrap; min-width: 0; }
.path-flow { display: flex; align-items: center; gap: 6px; font-size: 10px; flex: 1; min-width: 0; }
.node { padding: 4px 8px; border-radius: 4px; font-weight: bold; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: min(120px, 30%); }
.node.student { background-color: var(--buddy-node-student-bg); border: 1px solid var(--buddy-node-student-border); color: var(--buddy-node-student-text); }
.node.interest { background-color: var(--buddy-node-interest-bg); border: 1px solid var(--buddy-node-interest-border); color: var(--buddy-node-interest-text); }
.arrow { color: var(--color-subtext); font-weight: bold; flex-shrink: 0; }
.jaccard-badge { display: flex; align-items: center; gap: 4px; background: var(--buddy-jaccard-bg); border: 1px solid var(--buddy-jaccard-border); border-radius: 20px; padding: 3px 8px; flex-shrink: 0; }
.jaccard-icon { font-size: 10px; }
.jaccard-count { font-size: 10px; color: var(--buddy-jaccard-count); }
.jaccard-score { font-size: 10px; font-weight: 700; color: var(--buddy-jaccard-score); font-family: monospace; }
.empty-msg { font-size: 12px; color: var(--color-subtext); margin: 0; }

.social-buddy-item {
  background: var(--buddy-social-item-bg) !important;
  border-color: var(--buddy-social-item-border) !important;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.social-buddy-item:hover {
  border-color: var(--color-accent) !important;
  background: var(--buddy-social-item-bg) !important;
  filter: brightness(0.98);
  transform: translateY(-1.5px);
  box-shadow: var(--shadow-md);
}
.social-buddy-node {
  background-color: var(--buddy-social-node-bg) !important;
  border: 1px solid var(--buddy-social-node-border) !important;
  color: var(--buddy-social-node-text) !important;
  text-shadow: none;
}
.social-star {
  font-size: 10px;
  margin-left: 2px;
  vertical-align: middle;
}
</style>
