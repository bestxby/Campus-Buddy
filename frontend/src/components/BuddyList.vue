<template>
  <div class="card result-card">
    <h3>🤝 兴趣契合的活动搭子</h3>

    <!-- Shortest Path Finder (人脉搭桥) -->
    <PathFinder @open-graph-highlight="emit('open-graph-highlight')" />

    <!-- Jaccard-ranked buddy list -->
    <ul v-if="recommendations.buddies.length" class="buddy-list">
      <li v-for="buddy in recommendations.buddies.slice(0, 30)" :key="buddy.name" class="path-item">
        <div class="buddy-row">
          <div class="path-flow">
            <span class="node student">{{ activeStudent }}</span>
            <span class="arrow">➔</span>
            <span class="node interest">{{ getSharedInterest(activeStudent!, buddy.name, 'student') }}</span>
            <span class="arrow">➔</span>
            <span class="node student">{{ buddy.name }}</span>
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
import { activeStudent, recommendations, getSharedInterest } from '@/composables/useRecommendations'
import PathFinder from '@/components/buddy/PathFinder.vue'

const emit = defineEmits<{ 'open-graph-highlight': [] }>()
</script>

<style scoped>
.result-card { height: 100%; display: flex; flex-direction: column; }
.result-card h3 { font-size: 13px; margin: 0 0 16px 0; color: var(--text-secondary); }
.buddy-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; flex: 1; }
.path-item { background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; }
.buddy-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.path-flow { display: flex; align-items: center; gap: 8px; font-size: 10px; }
.node { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.node.student { background-color: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); color: #e9d5ff; }
.node.interest { background-color: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; }
.arrow { color: var(--text-secondary); font-weight: bold; }
.jaccard-badge { display: flex; align-items: center; gap: 4px; background: rgba(253,151,31,0.08); border: 1px solid rgba(253,151,31,0.2); border-radius: 20px; padding: 3px 8px; flex-shrink: 0; }
.jaccard-icon { font-size: 10px; }
.jaccard-count { font-size: 9px; color: rgba(255,255,255,0.5); }
.jaccard-score { font-size: 10px; font-weight: 700; color: #ffb74d; font-family: monospace; }
.empty-msg { font-size: 12px; color: var(--text-secondary); margin: 0; }
</style>
