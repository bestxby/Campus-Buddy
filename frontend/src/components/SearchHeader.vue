<template>
  <header class="header card">
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        @input="onSearchInput"
        @blur="closeSuggestions"
        aria-label="搜索同学姓名"
        :aria-expanded="suggestions.length > 0"
        aria-autocomplete="list"
        placeholder="输入同学姓名进行实时两步推荐 (输入您的姓名或 小明)..."
      />
    </div>
    <!-- Autocomplete dropdown -->
    <div 
      v-if="suggestions.length" 
      class="suggestions-dropdown card"
      role="listbox"
    >
      <div
        v-for="sug in suggestions"
        :key="sug"
        class="sug-item"
        role="option"
        @mousedown="selectStudent(sug)"
      >👤 {{ sug }}</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { searchQuery, suggestions, onSearchInput, selectStudent } from '@/composables/useRecommendations'

const closeSuggestions = () => {
  setTimeout(() => {
    suggestions.value = []
  }, 200)
}
</script>

<style scoped>
.header { position: relative; padding: 8px 16px; transition: border-color 0.2s, box-shadow 0.2s; }
.search-box { display: flex; align-items: center; gap: 12px; }
.search-icon { font-size: 16px; color: var(--text-secondary); }
.search-box input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 14px; }
.search-box input:focus { outline: none; }
.header:focus-within {
  border-color: var(--accent-orange) !important;
  box-shadow: 0 0 10px rgba(253, 151, 31, 0.25);
}
.suggestions-dropdown { position: absolute; top: 100%; left: 0; right: 0; margin-top: 8px; z-index: 10; background-color: var(--panel-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.5); padding: 8px 0; }
.sug-item { padding: 8px 16px; font-size: 13px; cursor: pointer; }
.sug-item:hover { background-color: rgba(255,255,255,0.05); color: var(--accent-orange); }
</style>
