<template>
  <div v-if="visible" class="modal-overlay fade-in" @click.self="handleClose">
    <div class="modal-card card glow-orange">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <h3 style="display: inline-flex; align-items: center;">
            <svg class="icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
            发布校园新活动 (Publish New Activity)
          </h3>
          <span class="modal-subtitle">创建新活动并分配关联的兴趣标签，学生可依据兴趣匹配和报名</span>
        </div>
        <button @click="handleClose" class="close-btn" title="关闭 modal">×</button>
      </div>

      <!-- Form Body -->
      <div class="modal-body">
        <!-- Activity Name -->
        <div class="form-group">
          <label class="form-label">活动名称 (Activity Name)</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="例如：AI与算法竞赛沙龙、毕业季荧光夜跑..."
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

        <!-- Interest Tags Pickers -->
        <div class="form-group">
          <label class="form-label">关联兴趣圈子标签 (Select Related Interest Tags - Multi-select)</label>
          <span class="form-hint">学生将根据其个人兴趣画像被推荐匹配本活动</span>
          
          <div class="interests-container">
            <div 
              v-for="domain in domains" 
              :key="domain.key" 
              class="domain-group"
            >
              <div class="domain-title" :style="{ color: domain.color }" style="display: inline-flex; align-items: center; gap: 4px;">
                <svg v-if="domain.key === 'sports'" class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M6 12a6 6 0 0 1 12 0"></path>
                  <path d="M12 6a6 6 0 0 1 0 12"></path>
                </svg>
                <svg v-else-if="domain.key === 'arts'" class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                </svg>
                <svg v-else-if="domain.key === 'tech'" class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <svg v-else-if="domain.key === 'social'" class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {{ domain.label }}
              </div>
              <div class="tags-grid">
                <button
                  v-for="tag in INTEREST_CATEGORIES[domain.key]"
                  :key="tag"
                  type="button"
                  class="tag-chip"
                  :class="{ 
                    'tag-active': form.selectedInterests.includes(tag),
                    ['tag-' + domain.key]: true
                  }"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
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
          确认发布活动 (Publish)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { INTEREST_CATEGORIES, DOMAIN_META } from '@/constants/interests'
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
  selectedInterests: [] as string[]
})

const errorMsg = ref('')

const domains = DOMAIN_META

const isValid = computed(() => {
  return form.name.trim().length > 0 && form.selectedInterests.length > 0
})

const toggleTag = (tag: string) => {
  const index = form.selectedInterests.indexOf(tag)
  if (index > -1) {
    form.selectedInterests.splice(index, 1)
  } else {
    form.selectedInterests.push(tag)
  }
}

const clearError = () => {
  errorMsg.value = ''
}

const handleClose = () => {
  form.name = ''
  form.selectedInterests = []
  errorMsg.value = ''
  emit('close')
}

const handleSubmit = () => {
  const name = form.name.trim()
  if (!name) return

  const graphStore = useGraphStore()
  const actKey = `activity:${name}`

  // Check for duplicates
  if (graphStore.graph.has(actKey)) {
    errorMsg.value = '该活动名称已存在，请输入其他名称 (Activity already exists)'
    return
  }

  // Create the activity in the graph store
  graphStore.addActivity(name, form.selectedInterests)

  // Append system log
  addLog('action', `【活动发布】管理员发布了新活动【${name}】，并关联了兴趣圈子【${form.selectedInterests.join('、')}】`)
  addLog('info', `关系网图谱已更新：新增活动节点【${name}】，且新建了其与相应兴趣的 ${form.selectedInterests.length} 条关联边`)

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
  max-width: 600px;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%) !important;
  border: 1px solid rgba(253, 151, 31, 0.25) !important;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
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
  overflow-y: auto;
  flex: 1;
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

.interests-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
}

.domain-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.domain-title {
  font-size: 10px;
  font-weight: bold;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  color: var(--color-subtext);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-chip:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

/* Active and Hover States per domain colors */
.tag-chip.tag-sports:hover, .tag-chip.tag-sports.tag-active {
  background-color: rgba(6, 182, 212, 0.12) !important;
  border-color: rgba(6, 182, 212, 0.4) !important;
  color: #22d3ee !important;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.15);
}

.tag-chip.tag-arts:hover, .tag-chip.tag-arts.tag-active {
  background-color: rgba(244, 114, 182, 0.12) !important;
  border-color: rgba(244, 114, 182, 0.4) !important;
  color: #f472b6 !important;
  box-shadow: 0 0 8px rgba(244, 114, 182, 0.15);
}

.tag-chip.tag-tech:hover, .tag-chip.tag-tech.tag-active {
  background-color: rgba(255, 183, 77, 0.12) !important;
  border-color: rgba(255, 183, 77, 0.4) !important;
  color: #ffb74d !important;
  box-shadow: 0 0 8px rgba(255, 183, 77, 0.15);
}

.tag-chip.tag-social:hover, .tag-chip.tag-social.tag-active {
  background-color: rgba(52, 211, 153, 0.12) !important;
  border-color: rgba(52, 211, 153, 0.4) !important;
  color: #34d399 !important;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.15);
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
