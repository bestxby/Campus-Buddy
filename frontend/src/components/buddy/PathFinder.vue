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
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
  padding-bottom: 14px;
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
  border-radius: 6px;
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
  font-size: 10px;
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
  color: #f87171;
  text-align: left;
  margin-top: 6px;
  font-weight: bold;
}
</style>
