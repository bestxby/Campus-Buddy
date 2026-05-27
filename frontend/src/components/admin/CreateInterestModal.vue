<template>
  <div v-if="visible" class="modal-overlay fade-in" @click.self="handleClose">
    <div class="modal-card card glow-orange">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <h3>➕ 新增校园兴趣标签 (Publish New Interest Tag)</h3>
          <span class="modal-subtitle">创建新的兴趣圈子标签，该标签可用于发布活动以及作为学生的个人兴趣选项</span>
        </div>
        <button @click="handleClose" class="close-btn" title="关闭 modal">×</button>
      </div>

      <!-- Form Body -->
      <div class="modal-body">
        <!-- Interest Name -->
        <div class="form-group">
          <label class="form-label">兴趣名称 (Interest Tag Name)</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="例如：三维建模、剧本杀、流行街舞..."
            class="form-input"
            @input="clearError"
          />
          <span v-if="errorMsg" class="error-text">{{ errorMsg }}</span>
        </div>

        <!-- Interest Category Domain -->
        <div class="form-group">
          <label class="form-label">归属兴趣领域 (Select Domain Category)</label>
          <span class="form-hint">选择该兴趣归属的大类，将匹配对应的系统色调和游离连线展现</span>
          <div class="domains-selector">
            <button
              v-for="d in domains"
              :key="d.key"
              type="button"
              class="domain-btn"
              :class="{ 'domain-active': form.domain === d.key }"
              :style="{ 
                '--hover-bg': d.color + '22',
                '--hover-border': d.color,
                '--text-color': d.color
              }"
              @click="form.domain = d.key"
            >
              <span class="domain-icon">{{ d.icon }}</span>
              <span class="domain-text">{{ d.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="modal-footer">
        <button @click="handleClose" class="btn btn-text">取消 (Cancel)</button>
        <button 
          @click="handleSubmit" 
          :disabled="!isValid" 
          class="btn btn-primary glow-orange submit-btn"
        >
          🚀 确认发布标签 (Publish Tag)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { DOMAIN_META } from '@/constants/interests'
import { useGraphStore } from '@/stores/graph'
import { addLog } from '@/composables/useLogs'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  created: [name: string]
}>()

const form = reactive({
  name: '',
  domain: 'sports' as 'sports' | 'arts' | 'tech' | 'social'
})

const errorMsg = ref('')
const domains = DOMAIN_META

const isValid = computed(() => {
  return form.name.trim().length > 0 && !!form.domain
})

const clearError = () => {
  errorMsg.value = ''
}

const handleClose = () => {
  form.name = ''
  form.domain = 'sports'
  errorMsg.value = ''
  emit('close')
}

const handleSubmit = () => {
  const name = form.name.trim()
  if (!name) return

  const graphStore = useGraphStore()
  const interestNode = `interest:${name}`

  // Check for duplicate in graph
  if (graphStore.graph.has(interestNode)) {
    errorMsg.value = '⚠️ 该兴趣标签已存在，请输入其他名称 (Interest tag already exists)'
    return
  }

  // Add the interest to the store
  graphStore.addInterestNode(name, form.domain)

  // Append system log
  const domainLabel = domains.find(d => d.key === form.domain)?.label || form.domain
  addLog('action', `【兴趣发布】管理员发布了新兴趣标签【${name}】，归属领域【${domainLabel}】`)
  addLog('info', `关系网图谱已更新：新增兴趣节点【${name}】，该标签已可用于社交推荐和活动绑定`)

  emit('created', name)
  handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(8, 12, 21, 0.75);
  backdrop-filter: blur(16px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%) !important;
  border: 1px solid rgba(253, 151, 31, 0.25) !important;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-title-group {
  text-align: left;
}

.modal-title-group h3 {
  margin: 0;
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 700;
}

.modal-subtitle {
  font-size: 9.5px;
  color: var(--text-secondary);
  display: block;
  margin-top: 4px;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
}

.form-hint {
  font-size: 9px;
  color: var(--text-secondary);
}

.form-input {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  padding: 10px 12px;
  font-size: 11px;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--accent-orange);
  box-shadow: 0 0 8px rgba(253, 151, 31, 0.15);
}

.error-text {
  font-size: 9.5px;
  color: #f87171;
  margin-top: 2px;
}

.domains-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 6px;
}

.domain-btn {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.domain-btn:hover {
  background-color: var(--hover-bg);
  border-color: var(--hover-border);
  color: var(--text-color) !important;
  box-shadow: 0 0 10px var(--hover-bg);
}

.domain-btn.domain-active {
  background-color: var(--hover-bg);
  border-color: var(--hover-border);
  color: var(--text-color) !important;
  box-shadow: 0 0 12px var(--hover-bg);
}

.domain-icon {
  font-size: 14px;
}

.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.submit-btn {
  padding: 8px 24px;
}
</style>
