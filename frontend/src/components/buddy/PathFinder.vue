<template>
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { activeStudent, pathResult } from '@/composables/useRecommendations'
import { graph, findPath } from '@/composables/useGraph'

const emit = defineEmits<{ 'open-graph-highlight': [] }>()

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
.pathfinder-container {
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: 14px;
  position: relative;
}
.pathfinder-container h4 {
  font-size: 11px;
  margin: 0 0 8px 0;
  color: var(--color-accent);
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
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  outline: none;
  transition: all 0.2s ease;
}
.pathfinder-input:focus {
  border-color: var(--color-accent-cyan);
  background-color: var(--color-surface);
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
}
.path-sug-dropdown {
  position: absolute;
  top: 54px;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  padding: 4px 0;
  border-radius: 4px;
}
.path-sug-item {
  padding: 6px 12px;
  font-size: 11px;
  cursor: pointer;
  text-align: left;
  color: var(--color-text);
}
.path-sug-item:hover {
  background-color: var(--color-muted);
  color: var(--color-accent-cyan);
}
.pathfinder-result {
  margin-top: 8px;
  padding: 8px 10px !important;
  background: var(--color-social-active-bg) !important;
  border: 1px solid var(--color-social-active-border) !important;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 6px;
}
.pathfinder-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text);
}
.path-clear-btn {
  background: transparent;
  border: none;
  color: var(--color-subtext);
  font-size: 10px;
  cursor: pointer;
}
.path-clear-btn:hover {
  color: var(--color-danger);
}
.pathfinder-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  background: var(--color-surface-2);
  padding: 6px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}
.pathfinder-node {
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: 600;
}
.node-person {
  background-color: var(--buddy-node-student-bg);
  border: 1px solid var(--buddy-node-student-border);
  color: var(--buddy-node-student-text);
}
.node-link {
  background-color: var(--buddy-node-interest-bg);
  border: 1px solid var(--buddy-node-interest-border);
  color: var(--buddy-node-interest-text);
}
.pathfinder-arrow {
  color: var(--color-subtext);
  font-size: 10px;
  font-weight: bold;
}
.path-highlight-btn {
  width: 100%;
  padding: 5px;
  font-weight: 700;
  font-size: 10px;
}
.pathfinder-error {
  font-size: 10px;
  color: var(--color-danger);
  text-align: left;
  margin-top: 6px;
  font-weight: bold;
}
</style>
