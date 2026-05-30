<template>
  <div v-if="visible" class="modal-overlay fade-in" @click.self="handleClose">
    <div class="modal-card card glow-orange">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <h3 style="display: inline-flex; align-items: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新增校园兴趣标签 (Publish New Interest Tag)
          </h3>
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
          <span v-if="errorMsg" class="error-text" style="display: inline-flex; align-items: center; gap: 2.5px;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink: 0;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            {{ errorMsg }}
          </span>
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
              <span class="domain-icon" style="display: inline-flex; align-items: center;">
                <svg v-if="d.key === 'sports'" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M6 12a6 6 0 0 1 12 0"></path>
                  <path d="M12 6a6 6 0 0 1 0 12"></path>
                </svg>
                <svg v-else-if="d.key === 'arts'" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                </svg>
                <svg v-else-if="d.key === 'tech'" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <svg v-else-if="d.key === 'social'" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
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
          style="display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
        >
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          确认发布标签 (Publish Tag)
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
    errorMsg.value = '该兴趣标签已存在，请输入其他名称 (Interest tag already exists)'
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
  border-bottom: 1px solid var(--color-border);
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
  color: var(--color-text);
  font-weight: 700;
}

.modal-subtitle {
  font-size: 10px;
  color: var(--color-subtext);
  display: block;
  margin-top: 4px;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-subtext);
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-text);
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
  color: var(--color-text);
}

.form-hint {
  font-size: 10px;
  color: var(--color-subtext);
}

.form-input {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 10px 12px;
  font-size: 11px;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 8px rgba(253, 151, 31, 0.15);
}

.error-text {
  font-size: 10px;
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
  border: 1px solid var(--color-border);
  color: var(--color-subtext);
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
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.submit-btn {
  padding: 8px 24px;
}
</style>
