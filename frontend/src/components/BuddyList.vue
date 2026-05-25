<template>
  <div class="card result-card">
    <h3>🤝 兴趣契合的活动搭子</h3>

    <!-- Buddy search box -->
    <div v-if="currentUserRole === 'admin'" class="buddy-search-container">
      <div class="buddy-search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchFriendQuery"
          placeholder="查找特定朋友/同学姓名，分析共同兴趣..."
          class="buddy-search-input"
        />
        <button v-if="searchFriendQuery" @click="searchFriendQuery = ''" class="clear-search-btn">清除</button>
      </div>
      <!-- Search results -->
      <div v-if="matchedFriends.length" class="friend-matches-list">
        <div v-for="friend in matchedFriends" :key="friend.name" class="friend-match-item">
          <div class="friend-match-info">
            <span class="friend-name">👤 {{ friend.name }}</span>
            <span v-if="friend.sharedCount > 0" class="friend-shared-desc text-orange-light">
              🤝 {{ friend.sharedCount }}个共同兴趣: {{ friend.sharedInterests.slice(0, 2).join('、') }}
            </span>
            <span v-else class="friend-shared-desc">无共同兴趣标签</span>
          </div>
          <button @click="selectStudent(friend.name)" class="btn btn-xs glow-orange select-friend-btn">⚡ 查看连结</button>
        </div>
      </div>
      <div v-else-if="searchFriendQuery.trim().length > 0" class="friend-no-matches">
        没有找到名字包含 "{{ searchFriendQuery }}" 的同学
      </div>
    </div>

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

    <!-- Shortest Path Finder (人脉搭桥) -->
    <div class="pathfinder-container">
      <h4>🔍 BFS 人脉社交通路寻人</h4>
      <div class="pathfinder-search-row">
        <input
          v-model="pathTargetInput"
          @input="onPathInput"
          @keyup.enter="handlePathSearch"
          @blur="closePathSuggestions"
          placeholder="输入同学姓名，寻找最短相识通路..."
          class="pathfinder-input"
        />
        <button @click="handlePathSearch" class="btn btn-xs btn-secondary glow-cyan">寻找连结</button>
      </div>
      
      <!-- Auto-suggestions for path target -->
      <div v-if="pathSuggestions.length" class="path-sug-dropdown card">
        <div
          v-for="sug in pathSuggestions"
          :key="sug"
          class="path-sug-item"
          @mousedown="selectPathTarget(sug)"
        >👤 {{ sug }}</div>
      </div>

      <!-- Path finder result -->
      <div v-if="pathResult" class="pathfinder-result card glow-orange fade-in">
        <div class="pathfinder-result-header">
          <span>✨ 最短 {{ pathResult.hops }} 度人脉关联通路：</span>
          <button @click="clearPath" class="path-clear-btn" title="清除通路">❌</button>
        </div>
        <div class="pathfinder-flow">
          <template v-for="(node, idx) in pathResult.readable" :key="idx">
            <span class="pathfinder-node" :class="idx % 2 === 0 ? 'node-person' : 'node-link'">
              {{ idx % 2 === 0 ? '👤 ' + node : '🎯 ' + node }}
            </span>
            <span v-if="idx < pathResult.readable.length - 1" class="pathfinder-arrow">➔</span>
          </template>
        </div>
        <button @click="triggerOpenGraphHighlight" class="btn btn-xs btn-primary glow-orange path-highlight-btn">
          👁️ 在关系图谱中高亮显示
        </button>
      </div>
      <div v-else-if="pathSearchError" class="pathfinder-error">
        ⚠️ 未找到社交连结通路（该同学处于另一个连通分量或名字不存在）
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  activeStudent, searchFriendQuery, recommendations,
  matchedFriends, getSharedInterest, selectStudent, pathResult
} from '@/composables/useRecommendations'
import { currentUserRole } from '@/composables/useAuth'
import { graph, findPath } from '@/composables/useGraph'

const emit = defineEmits<{ 'open-graph-highlight': [] }>()

// ─── BFS Shortest Path Finder ──────────────────────────────────────────────────
const pathTargetInput = ref('')
const pathSuggestions = ref<string[]>([])
const pathSearchError = ref(false)

const onPathInput = () => {
  const query = pathTargetInput.value.trim()
  if (query.length < 1) { pathSuggestions.value = []; return }
  const matched: string[] = []
  for (const node of graph.value.keys()) {
    if (node.startsWith('student:')) {
      const name = node.slice('student:'.length)
      if (name !== activeStudent.value && name.toLowerCase().includes(query.toLowerCase())) {
        matched.push(name)
      }
    }
  }
  pathSuggestions.value = matched.slice(0, 5)
}

const selectPathTarget = (name: string) => {
  pathTargetInput.value = name
  pathSuggestions.value = []
  handlePathSearch()
}

const closePathSuggestions = () => {
  setTimeout(() => {
    pathSuggestions.value = []
  }, 200)
}

const handlePathSearch = () => {
  pathSuggestions.value = []
  const target = pathTargetInput.value.trim()
  if (!target || !activeStudent.value) return
  const result = findPath(activeStudent.value, target)
  if (result) {
    pathResult.value = result
    pathSearchError.value = false
  } else {
    pathResult.value = null
    pathSearchError.value = true
  }
}

const clearPath = () => {
  pathTargetInput.value = ''
  pathResult.value = null
  pathSearchError.value = false
}

const triggerOpenGraphHighlight = () => {
  emit('open-graph-highlight')
}

// Reset pathfinder when active student changes
watch(activeStudent, () => {
  clearPath()
})
</script>

<style scoped>
.result-card { height: 100%; display: flex; flex-direction: column; }
.result-card h3 { font-size: 13px; margin: 0 0 16px 0; color: var(--text-secondary); }
.buddy-search-container { margin-bottom: 16px; background-color: rgba(0,0,0,0.15); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; }
.buddy-search-input-wrapper { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; }
.search-icon { font-size: 14px; color: var(--text-secondary); flex-shrink: 0; }
.buddy-search-input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 11px; outline: none; }
.clear-search-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 10px; cursor: pointer; }
.clear-search-btn:hover { color: var(--accent-orange); }
.friend-matches-list { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px; }
.friend-match-item { display: flex; justify-content: space-between; align-items: center; padding: 6px; background-color: rgba(255,255,255,0.01); border-radius: 4px; border: 1px solid transparent; transition: all 0.2s; }
.friend-match-item:hover { background-color: rgba(253,151,31,0.03); border-color: rgba(253,151,31,0.15); }
.friend-match-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.friend-name { font-size: 11px; font-weight: bold; color: var(--text-primary); }
.friend-shared-desc { font-size: 9px; color: var(--text-secondary); }
.friend-no-matches { font-size: 10px; color: var(--text-secondary); text-align: center; padding: 10px 0 0 0; }
.select-friend-btn { padding: 4px 8px; font-size: 9px; white-space: nowrap; }
.buddy-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; flex: 1; }
.path-item { background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; }
.buddy-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.path-flow { display: flex; align-items: center; gap: 8px; font-size: 10px; }
.node { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.node.student { background-color: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); color: #e9d5ff; }
.node.interest { background-color: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; }
.arrow { color: var(--text-secondary); font-weight: bold; }
/* Jaccard badge */
.jaccard-badge { display: flex; align-items: center; gap: 4px; background: rgba(253,151,31,0.08); border: 1px solid rgba(253,151,31,0.2); border-radius: 20px; padding: 3px 8px; flex-shrink: 0; }
.jaccard-icon { font-size: 10px; }
.jaccard-count { font-size: 9px; color: rgba(255,255,255,0.5); }
.jaccard-score { font-size: 10px; font-weight: 700; color: #ffb74d; font-family: monospace; }
.empty-msg { font-size: 12px; color: var(--text-secondary); margin: 0; }

/* ─── Shortest Path Finder ────────────────────────────────── */
.pathfinder-container {
  margin-top: 14px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  padding-top: 12px;
  position: relative;
}
.pathfinder-container h4 {
  font-size: 11px;
  margin: 0 0 8px 0;
  color: var(--accent-orange);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: left;
  font-weight: 700;
}
.pathfinder-search-row {
  display: flex;
  gap: 8px;
}
.pathfinder-input {
  flex: 1;
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  outline: none;
}
.pathfinder-input:focus {
  border-color: var(--accent-cyan);
}
.path-sug-dropdown {
  position: absolute;
  top: 54px;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: var(--panel-bg);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  border: 1px solid var(--border-color);
  padding: 4px 0;
  border-radius: 4px;
}
.path-sug-item {
  padding: 6px 12px;
  font-size: 11px;
  cursor: pointer;
  text-align: left;
}
.path-sug-item:hover {
  background-color: rgba(255,255,255,0.04);
  color: var(--accent-cyan);
}
.pathfinder-result {
  margin-top: 8px;
  padding: 8px 10px !important;
  background: rgba(253, 151, 31, 0.02) !important;
  border: 1px solid rgba(253,151,31,0.1) !important;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pathfinder-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-primary);
}
.path-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 10px;
  cursor: pointer;
}
.path-clear-btn:hover {
  color: #ef4444;
}
.pathfinder-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  background: rgba(0,0,0,0.2);
  padding: 6px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.02);
}
.pathfinder-node {
  font-size: 9.5px;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: 600;
}
.node-person {
  background-color: rgba(168,85,247,0.12);
  border: 1px solid rgba(168,85,247,0.25);
  color: #e9d5ff;
}
.node-link {
  background-color: rgba(59,130,246,0.12);
  border: 1px solid rgba(59,130,246,0.2);
  color: #93c5fd;
}
.pathfinder-arrow {
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: bold;
}
.path-highlight-btn {
  width: 100%;
  padding: 5px;
  font-weight: 700;
  font-size: 9.5px;
}
.pathfinder-error {
  font-size: 10px;
  color: #f87171;
  text-align: left;
  margin-top: 6px;
  font-weight: bold;
}
</style>
