<template>
  <!-- Buddy search box -->
  <div v-if="currentUserRole === 'admin'" class="buddy-search-container">
    <div class="buddy-search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchFriendQuery"
        placeholder="查找特定朋友/同学姓名，分析共同兴趣..."
        class="buddy-search-input"
        aria-label="查找特定同学"
      />
      <button v-if="searchFriendQuery" @click="searchFriendQuery = ''" class="clear-search-btn" aria-label="清除搜索">清除</button>
    </div>
    <!-- Search results -->
    <div v-if="matchedFriends.length" class="friend-matches-list" role="listbox" aria-label="匹配的同学">
      <div v-for="friend in matchedFriends" :key="friend.name" class="friend-match-item" role="option">
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
</template>

<script setup lang="ts">
import { searchFriendQuery, matchedFriends, selectStudent } from '@/composables/useRecommendations'
import { currentUserRole } from '@/composables/useAuth'
</script>

<style scoped>
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
.text-orange-light { color: #ffb74d; }
</style>
