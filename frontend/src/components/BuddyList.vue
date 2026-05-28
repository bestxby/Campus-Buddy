<template>
  <div class="card result-card">
    <h3>🤝 兴趣契合的活动搭子</h3>

    <!-- Shortest Path Finder (人脉搭桥) -->
    <PathFinder @open-graph-highlight="emit('open-graph-highlight')" />

    <!-- Jaccard-ranked buddy list -->
    <ul v-if="recommendations.buddies.length" class="buddy-list">
      <li v-for="buddy in recommendations.buddies.slice(0, maxVisibleBuddies)" :key="buddy.name" class="path-item" :class="{ 'social-buddy-item': isSocialBuddy(buddy.name) }">
        <div class="buddy-row">
          <div class="path-flow">
            <span class="node student" :class="{ 'social-buddy-node': isSocialBuddy(activeStudent!) }" :title="activeStudent || ''">
              {{ activeStudent }}
              <span v-if="isSocialBuddy(activeStudent!)" class="social-star" title="社交达人">🌟</span>
            </span>
            <span class="arrow">➔</span>
            <span class="node interest" :title="getSharedInterest(activeStudent!, buddy.name, 'student')">{{ getSharedInterest(activeStudent!, buddy.name, 'student') }}</span>
            <span class="arrow">➔</span>
            <span class="node student" :class="{ 'social-buddy-node': isSocialBuddy(buddy.name) }" :title="buddy.name">
              {{ buddy.name }}
              <span v-if="isSocialBuddy(buddy.name)" class="social-star" title="社交达人">🌟</span>
            </span>
          </div>
          <!-- Jaccard badge -->
          <div class="jaccard-badge" :title="`Jaccard 相似度: ${(buddy.jaccard * 100).toFixed(0)}%`">
            <span class="jaccard-icon">🎯</span>
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
.result-card h3 { font-size: 13px; margin: 0 0 16px 0; color: var(--text-secondary); }
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
.path-item { background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; }
.buddy-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: nowrap; min-width: 0; }
.path-flow { display: flex; align-items: center; gap: 6px; font-size: 10px; flex: 1; min-width: 0; }
.node { padding: 4px 8px; border-radius: 4px; font-weight: bold; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: min(120px, 30%); }
.node.student { background-color: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2); color: #a5f3fc; }
.node.interest { background-color: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; }
.arrow { color: var(--text-secondary); font-weight: bold; flex-shrink: 0; }
.jaccard-badge { display: flex; align-items: center; gap: 4px; background: rgba(253,151,31,0.08); border: 1px solid rgba(253,151,31,0.2); border-radius: 20px; padding: 3px 8px; flex-shrink: 0; }
.jaccard-icon { font-size: 10px; }
.jaccard-count { font-size: 10px; color: rgba(255,255,255,0.55); }
.jaccard-score { font-size: 10px; font-weight: 700; color: #ffb74d; font-family: monospace; }
.empty-msg { font-size: 12px; color: var(--text-secondary); margin: 0; }

.social-buddy-item {
  background: linear-gradient(135deg, rgba(253,151,31,0.02) 0%, rgba(255,255,255,0.01) 100%) !important;
  border-color: rgba(253, 151, 31, 0.22) !important;
  box-shadow: 0 0 6px rgba(253, 151, 31, 0.03);
}
.social-buddy-node {
  background-color: rgba(253, 151, 31, 0.12) !important;
  border: 1px solid rgba(253, 151, 31, 0.35) !important;
  color: #ffb74d !important;
  text-shadow: 0 0 4px rgba(253, 151, 31, 0.25);
}
.social-star {
  font-size: 10px;
  margin-left: 2px;
  vertical-align: middle;
}
</style>
