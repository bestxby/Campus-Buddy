<template>
  <div class="student-form-section">
    <!-- Name & Avatar row -->
    <div class="form-split-row">
      <div class="form-left-col">
        <div class="form-group">
          <label class="label-bold">
            <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            请输入您的姓名
          </label>
          <input v-model="regForm.name" placeholder="请输入姓名或代号..." required @keyup.enter="handleStudentSubmit" />
        </div>
      </div>
      <div class="form-right-col">
        <div class="form-group">
          <label class="label-bold">
            <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            选择您的头像
          </label>
          <div class="avatar-picker-grid">
            <button
              v-for="av in AVATAR_OPTIONS"
              :key="av"
              type="button"
              class="avatar-picker-btn"
              :class="{ 'avatar-active': regForm.avatar === av }"
              @click="regForm.avatar = av"
            >{{ av }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Persona Preview -->
    <div class="live-identity-card">
      <h4>
        <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
          <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
          <line x1="7" y1="8" x2="17" y2="8"></line>
          <line x1="7" y1="12" x2="17" y2="12"></line>
          <line x1="7" y1="16" x2="13" y2="16"></line>
        </svg>
        实时社交画像预览
      </h4>
      <div class="live-card-body">
        <div class="live-avatar-preview">{{ regForm.avatar }}</div>
        <div class="live-info-preview">
          <div class="live-name-preview">{{ regForm.name || '等待输入姓名...' }}</div>
          <div class="live-persona-preview" :class="previewPersonaClass">{{ previewPersona }}</div>
        </div>
        <div class="live-interests-preview">
          <span v-for="tag in regForm.selectedInterests" :key="tag" class="preview-tag"># {{ tag }}</span>
          <span v-if="regForm.selectedInterests.length === 0" class="placeholder-text">暂未勾选兴趣...</span>
        </div>
      </div>
    </div>

    <hr class="divider" />
    <h3 class="section-title">
      <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
      勾选您的兴趣标签
    </h3>

    <!-- Categorised Interest Pickers -->
    <div class="interests-picker-container">
      <div class="picker-section">
        <h5>
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M6.2 6.2a8.5 8.5 0 0 0 11.6 11.6"></path>
            <path d="M17.8 6.2a8.5 8.5 0 0 0-11.6 11.6"></path>
          </svg>
          体育运动
        </h5>
        <div class="tags-grid">
          <span
            v-for="item in INTEREST_CATEGORIES.sports"
            :key="item"
            class="interest-tag"
            :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
            @click="toggleInterestTag(item)"
          >{{ item }}</span>
        </div>
      </div>
      <div class="picker-section">
        <h5>
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
            <circle cx="12" cy="7.5" r="1.5"></circle>
            <circle cx="8" cy="11.5" r="1.5"></circle>
            <circle cx="16" cy="11.5" r="1.5"></circle>
          </svg>
          文化艺术
        </h5>
        <div class="tags-grid">
          <span
            v-for="item in INTEREST_CATEGORIES.arts"
            :key="item"
            class="interest-tag"
            :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
            @click="toggleInterestTag(item)"
          >{{ item }}</span>
        </div>
      </div>
      <div class="picker-section">
        <h5>
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          极客技术
        </h5>
        <div class="tags-grid">
          <span
            v-for="item in INTEREST_CATEGORIES.tech"
            :key="item"
            class="interest-tag"
            :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
            @click="toggleInterestTag(item)"
          >{{ item }}</span>
        </div>
      </div>
      <div class="picker-section">
        <h5>
          <svg class="icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -1.5px;">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          志愿社交
        </h5>
        <div class="tags-grid">
          <span
            v-for="item in INTEREST_CATEGORIES.social"
            :key="item"
            class="interest-tag"
            :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
            @click="toggleInterestTag(item)"
          >{{ item }}</span>
        </div>
      </div>
    </div>

    <div v-if="regForm.name.trim() && !isNameValid" class="warning-text">
      ⚠️ 姓名格式不合法：只允许中文、英文字母、数字和空格/连字符（长度为2-20字）！
    </div>

    <div v-if="regForm.selectedInterests.length === 0" class="warning-text">
      ⚠️ 请至少选择一个兴趣标签以建立连接！
    </div>

    <button 
      @click="handleStudentSubmit" 
      :disabled="regForm.selectedInterests.length === 0 || !isNameValid" 
      class="btn btn-primary glow-orange" 
      style="width: 100%;"
    >
      生成社交画像并登入系统
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { previewPersona, previewPersonaClass, toggleInterestTag } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { AVATAR_OPTIONS, INTEREST_CATEGORIES } from '@/constants/interests'
import { NAME_VALIDATION_REGEX } from '@/utils/auth-helpers'

const authStore = useAuthStore()
const regForm = authStore.regForm

const emit = defineEmits<{
  // Fired when the user clicks submit; parent plays the loading animation,
  // then calls submitRegistration() itself after the animation finishes.
  'loading-start': [payload: { name: string; avatar: string; interests: string[] }]
}>()

const isNameValid = computed(() => {
  const name = regForm.name.trim()
  if (!name) return false
  return NAME_VALIDATION_REGEX.test(name)
})

const handleStudentSubmit = () => {
  if (!isNameValid.value || regForm.selectedInterests.length === 0) return
  emit('loading-start', {
    name: regForm.name.trim(),
    avatar: regForm.avatar,
    interests: [...regForm.selectedInterests],
  })
}
</script>

<style scoped>
.student-form-section {
  text-align: left;
}
.section-title { font-size: 12px; color: var(--accent-orange); margin: 8px 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.form-split-row { display: flex; gap: 20px; margin-bottom: 8px; }
.form-left-col, .form-right-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.label-bold { font-size: 12.5px; font-weight: bold; line-height: 18px; display: block; }
.form-group input {
  background-color: rgba(0, 0, 0, 0.45);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0 14px;
  font-size: 13px;
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-group input:focus,
.form-group input:focus-visible {
  outline: none !important;
  border-color: var(--accent-orange) !important;
  background-color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 10px rgba(253, 151, 31, 0.15);
}
.avatar-picker-grid { display: flex; gap: 8px; flex-wrap: nowrap; justify-content: space-between; padding: 0; align-items: center; height: 38px; }
.avatar-picker-btn {
  width: 38px; height: 38px; border-radius: 50%; background: rgba(0,0,0,0.4);
  border: 1px solid var(--border-color); font-size: 16px; display: flex;
  align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.avatar-picker-btn:focus-visible { outline: 2px solid var(--accent-orange); outline-offset: 2px; }
.avatar-picker-btn:hover { border-color: var(--accent-orange); background-color: rgba(253,151,31,0.08); transform: translateY(-2px); }
.avatar-active { border-color: var(--accent-orange) !important; background-color: rgba(253,151,31,0.15) !important; box-shadow: 0 0 10px var(--accent-orange-glow); transform: scale(1.05); }
.live-identity-card { background-color: rgba(6,182,212,0.03); border: 1px solid rgba(6,182,212,0.15); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; }
.live-identity-card h4 { font-size: 11px; margin: 0 0 8px 0; color: var(--accent-orange); text-transform: uppercase; letter-spacing: 0.5px; }
.live-card-body { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.live-avatar-preview { font-size: 32px; background-color: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 8px; padding: 6px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
.live-info-preview { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.live-name-preview { font-size: 13px; font-weight: bold; color: var(--text-primary); }
.live-persona-preview { font-size: 11px; font-weight: bold; }
.live-interests-preview { width: 100%; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 6px; }
.preview-tag { background-color: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2); color: #e0f7fa; font-size: 10px; padding: 1px 6px; border-radius: 12px; }
.placeholder-text { font-size: 11px; color: var(--text-secondary); font-style: italic; }
.interests-picker-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.picker-section h5 { font-size: 11.5px; color: var(--text-secondary); margin: 0 0 4px 0; border-left: 2px solid var(--accent-cyan); padding-left: 6px; }
.tags-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.interest-tag { background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 20px; padding: 5px 12px; font-size: 11px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); user-select: none; }
.interest-tag:hover { background-color: rgba(255,255,255,0.06); color: var(--text-primary); border-color: rgba(255,255,255,0.15); transform: translateY(-1.5px); }
.tag-active { background-color: rgba(253,151,31,0.12) !important; border-color: rgba(253,151,31,0.45) !important; color: #ffe0b2 !important; box-shadow: 0 4px 12px rgba(253, 151, 31, 0.12); transform: translateY(-1.5px); }
.warning-text { color: #f87171; font-size: 11px; margin-bottom: 6px; font-weight: bold; }
.btn-primary { width: 100%; padding: 12px; font-size: 13px; background-color: rgba(253,151,31,0.1); border-color: rgba(253,151,31,0.3); color: #ffb74d; margin-top: 10px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.btn-primary:hover:not(:disabled) { background-color: rgba(253,151,31,0.18); border-color: rgba(253,151,31,0.5); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(253, 151, 31, 0.15); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.divider { border: 0; border-top: 1px solid var(--border-color); margin: 12px 0; }

@media (max-width: 640px) {
  .form-split-row {
    flex-direction: column;
    gap: 12px;
  }
  .avatar-picker-grid {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
