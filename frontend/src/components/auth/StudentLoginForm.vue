<template>
  <div class="student-form-section">
    <!-- Name & Avatar row -->
    <div class="form-split-row">
      <div class="form-left-col">
        <div class="form-group">
          <label class="label-bold">👤 请输入您的姓名 (Your Name)</label>
          <input v-model="regForm.name" placeholder="请输入姓名或代号..." required />
        </div>
      </div>
      <div class="form-right-col">
        <div class="form-group">
          <label class="label-bold">🤖 选择您的头像 (Avatar)</label>
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
      <h4>🆔 实时社交画像预览 (Live Persona Card)</h4>
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
    <h3 class="section-title">🎯 勾选您的兴趣标签 (Select Your Interests - MultiSelect)</h3>

    <!-- Categorised Interest Pickers -->
    <div class="interests-picker-container">
      <div class="picker-section">
        <h5>⚽ 体育运动 (Sports)</h5>
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
        <h5>🎨 文化艺术 (Arts &amp; Hobbies)</h5>
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
        <h5>💻 极客技术 (Tech)</h5>
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
        <h5>🤝 志愿社交 (Social &amp; Others)</h5>
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

    <div v-if="regForm.selectedInterests.length === 0" class="warning-text">
      ⚠️ 请至少选择一个兴趣标签以建立连接！
    </div>

    <button 
      @click="handleStudentSubmit" 
      :disabled="regForm.selectedInterests.length === 0" 
      class="btn btn-primary glow-orange" 
      style="width: 100%;"
    >
      生成社交画像并登入系统
    </button>
  </div>
</template>

<script setup lang="ts">
import { regForm, previewPersona, previewPersonaClass, toggleInterestTag } from '@/composables/useAuth'
import { AVATAR_OPTIONS, INTEREST_CATEGORIES } from '@/constants/interests'

const emit = defineEmits<{
  // Fired when the user clicks submit; parent plays the loading animation,
  // then calls submitRegistration() itself after the animation finishes.
  'loading-start': [payload: { name: string; avatar: string; interests: string[] }]
}>()

const handleStudentSubmit = () => {
  if (!regForm.name.trim() || regForm.selectedInterests.length === 0) return
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
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.label-bold { font-size: 12.5px; font-weight: bold; }
.form-group input {
  background-color: rgba(0,0,0,0.3); border: 1px solid var(--border-color);
  color: var(--text-primary); border-radius: 6px; padding: 8px 12px; font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}
.form-group input:focus { outline: none; border-color: var(--accent-orange); }
.avatar-picker-grid { display: flex; gap: 6px; flex-wrap: nowrap; justify-content: space-between; padding: 4px 0; }
.avatar-picker-btn {
  width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-color); font-size: 15px; display: flex;
  align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; outline: none;
}
.avatar-picker-btn:hover { border-color: var(--accent-orange); background-color: rgba(253,151,31,0.08); transform: translateY(-2px); }
.avatar-active { border-color: var(--accent-orange) !important; background-color: rgba(253,151,31,0.15) !important; box-shadow: 0 0 10px var(--accent-orange-glow); transform: scale(1.05); }
.live-identity-card { background-color: rgba(168,85,247,0.03); border: 1px solid rgba(168,85,247,0.15); border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; }
.live-identity-card h4 { font-size: 11px; margin: 0 0 8px 0; color: var(--accent-orange); text-transform: uppercase; letter-spacing: 0.5px; }
.live-card-body { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.live-avatar-preview { font-size: 32px; background-color: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 8px; padding: 6px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
.live-info-preview { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.live-name-preview { font-size: 13px; font-weight: bold; color: var(--text-primary); }
.live-persona-preview { font-size: 11px; font-weight: bold; }
.live-interests-preview { width: 100%; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 6px; }
.preview-tag { background-color: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.2); color: #e9d5ff; font-size: 9px; padding: 1px 6px; border-radius: 12px; }
.placeholder-text { font-size: 11px; color: var(--text-secondary); font-style: italic; }
.interests-picker-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.picker-section h5 { font-size: 11.5px; color: var(--text-secondary); margin: 0 0 3px 0; border-left: 2px solid var(--accent-cyan); padding-left: 6px; }
.tags-grid { display: flex; flex-wrap: wrap; gap: 5px; }
.interest-tag { background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 20px; padding: 4px 10px; font-size: 11px; cursor: pointer; transition: all 0.2s ease; user-select: none; }
.interest-tag:hover { background-color: rgba(255,255,255,0.06); color: var(--text-primary); }
.tag-active { background-color: rgba(253,151,31,0.1) !important; border-color: rgba(253,151,31,0.4) !important; color: #ffe0b2 !important; box-shadow: 0 0 10px rgba(253,151,31,0.15); }
.warning-text { color: #f87171; font-size: 11px; margin-bottom: 6px; font-weight: bold; }
.btn-primary { width: 100%; padding: 12px; font-size: 13px; background-color: rgba(253,151,31,0.1); border-color: rgba(253,151,31,0.3); color: #ffb74d; margin-top: 10px; }
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
