<template>
  <div class="profile-card" :class="{ 'admin-card-border': currentUserRole === 'admin' }">

    <!-- TOP ROW: Avatar + Name/Persona + Logout button -->
    <div class="profile-top-row">

      <!-- Avatar -->
      <!-- Avatar -->
      <div class="profile-avatar-wrap">
        <span class="profile-avatar-big">
          <template v-if="currentUserAvatar">{{ currentUserAvatar }}</template>
          <svg v-else class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" stroke="var(--accent-neon-cyan)" stroke-width="1.5"></circle>
            <!-- Needle split into two halves for a premium 3D neon compass effect -->
            <polygon points="12,12 16.24,7.76 14.12,14.12" fill="var(--accent-neon-pink)" stroke="var(--accent-neon-pink)" stroke-width="0.5"></polygon>
            <polygon points="12,12 16.24,7.76 9.88,9.88" fill="#b30059" stroke="#b30059" stroke-width="0.5"></polygon>
            <polygon points="12,12 7.76,16.24 9.88,9.88" fill="var(--accent-neon-cyan)" stroke="var(--accent-neon-cyan)" stroke-width="0.5"></polygon>
            <polygon points="12,12 7.76,16.24 14.12,14.12" fill="#0099ab" stroke="#0099ab" stroke-width="0.5"></polygon>
            <circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="none"></circle>
          </svg>
        </span>
        <div class="profile-avatar-ring"></div>
        <div v-if="isPrivateMode && currentUserRole !== 'admin'" class="avatar-private-overlay">
          <svg class="icon-svg" viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div v-if="isSocialMode && currentUserRole !== 'admin'" class="avatar-social-overlay">
          <svg class="icon-svg" viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="currentColor" stroke-width="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
      </div>

      <!-- Name + Persona (same row) -->
      <div class="profile-identity">
        <div class="identity-row">
          <div class="profile-name">{{ currentUser }}</div>
          <div class="profile-persona-badge" :class="personaBadgeClass">{{ userPersona }}</div>
        </div>
      </div>

      <!-- Logout button (icon-only, top-right) -->
      <button @click="handleLogout" class="logout-btn" title="退出登录">
        <span class="logout-icon">⏻</span>
      </button>
    </div>

    <!-- BOTTOM ROW: Mode toggles (Student only) -->
    <template v-if="currentUserRole !== 'admin'">
      <div class="mode-toggle-row">
        <!-- Privacy mode: turning on disables social -->
        <button
          class="mode-btn"
          :class="isPrivateMode ? 'mode-btn-active-private' : 'mode-btn-inactive'"
          @click="togglePrivate"
          :title="isPrivateMode ? '隐身保护中，点击关闭' : '开启隐身模式（不被推荐给他人）'"
        >
          <span class="mode-icon">
            <svg v-if="isPrivateMode" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <svg v-else class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
          </span>
          <span class="mode-label">{{ isPrivateMode ? '隐身中' : '隐身模式' }}</span>
        </button>

        <!-- Social active mode: turning on disables privacy -->
        <button
          class="mode-btn"
          :class="isSocialMode ? 'mode-btn-active-social' : 'mode-btn-inactive'"
          @click="toggleSocial"
          :title="isSocialMode ? '达人模式开启中，点击关闭' : '开启达人模式（优先被推荐给有共同活动的同学）'"
        >
          <span class="mode-icon">
            <svg v-if="isSocialMode" class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="currentColor" stroke-width="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <svg v-else class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </span>
          <span class="mode-label">{{ isSocialMode ? '达人中' : '达人模式' }}</span>
        </button>
      </div>
    </template>

    <!-- Admin badge row -->
    <template v-else>
      <div class="admin-access-badge">
        <span class="pulse-dot"></span>
        <span class="badge-text">Root Access · 全局管理员</span>
      </div>
    </template>

    <!-- Privacy status hint -->
    <div v-if="isPrivateMode && currentUserRole !== 'admin'" class="privacy-status-bar">
      <span class="privacy-status-dot"></span>
      <span>隐身保护中 · 您的社交关系已对他人隐藏</span>
    </div>

    <!-- Social status hint -->
    <div v-if="isSocialMode && currentUserRole !== 'admin'" class="social-status-bar">
      <span class="social-status-dot"></span>
      <span>社交达人中 · 您将被优先推荐给有共同兴趣的同学</span>
    </div>

    <!-- Export Report button (Student only) -->
    <template v-if="currentUserRole !== 'admin'">
      <div class="export-report-row">
        <button class="export-report-btn" @click="downloadReport" title="导出我的个性化匹配与方向推荐报告">
          <span class="export-icon">📥</span>
          <span class="export-label">导出我的个性化匹配报告</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { currentUser, currentUserAvatar, userPersona, personaBadgeClass,
         logout, currentUserRole, isPrivateMode, togglePrivacyMode,
         isSocialMode, toggleSocialMode, userInterestTags } from '@/composables/useAuth'
import { useGraphStore } from '@/stores/graph'
import { useRecommendationStore } from '@/stores/recommendation'
import { recommendations } from '@/composables/useRecommendations'

const emit = defineEmits<{
  logout: []
}>()

// Mutually exclusive behavior handled globally in store/composable
const togglePrivate = () => {
  togglePrivacyMode()
}

const toggleSocial = () => {
  toggleSocialMode()
}

const handleLogout = async () => {
  await logout()
  emit('logout')
}

// Generate Personalized Markdown Report
const generateMarkdownReport = () => {
  const name = currentUser.value
  if (!name) return ''

  const userInterests = userInterestTags.value
  const recStore = useRecommendationStore()
  const graphStore = useGraphStore()
  
  const acts = recommendations.value.activities
  const buddiesList = recommendations.value.buddies

  let md: string[] = []
  md.push(`# 🧭 Campus Buddy 个性化校园推荐报告 — ${name}`)
  md.push(`\n> **报告生成时间**: ${new Date().toLocaleDateString('zh-CN')}`)
  md.push(`\n---\n`)

  md.push(`## 👤 个人画像与标签`)
  if (userInterests.length > 0) {
    md.push(`您目前在系统登记的兴趣倾向：\n`)
    for (const interest of userInterests) {
      md.push(`* **${interest}** (兴趣等级: \`已设定\`)`)
    }
  } else {
    md.push(`您目前尚未登记任何兴趣。`)
  }
  md.push(`\n---\n`)

  md.push(`## 🎉 智能活动推荐（两跳推荐路径）`)
  if (acts.length > 0) {
    md.push(`系统根据您的兴趣，为您推荐了以下尚未报名的活动，并附带了关系链推荐路径：\n`)
    for (let idx = 0; idx < acts.length; idx++) {
      const actName = acts[idx]
      const shared = recStore.getSharedInterest(name, actName, 'activity')
      const pathStr = `student:${name} ----> interest:${shared} ----> activity:${actName}`
      
      md.push(`### ${idx + 1}. ${actName}`)
      md.push(`* **所属兴趣圈**: 🎯 \`${shared}\``)
      md.push(`* **推荐路径解释**:`)
      md.push(`  \`${pathStr}\`\n`)
    }
  } else {
    md.push(`暂时没有基于您的兴趣推荐的活动。您可以尝试在侧边栏添加更多兴趣标签！`)
  }
  md.push(`\n---\n`)

  md.push(`## 🤝 志同道合的活动搭子（按 Jaccard 相似度排序）`)
  if (buddiesList.length > 0) {
    md.push(`系统为您匹配了拥有共同兴趣圈子的同学，最匹配的排在最前：\n`)
    md.push(`| 排名 | 搭子姓名 | 兴趣重合度 | 共同的兴趣 |`)
    md.push(`| --- | --- | --- | --- |`)
    for (let rank = 0; rank < buddiesList.length; rank++) {
      const buddy = buddiesList[rank]
      const pct = `${(buddy.jaccard * 100).toFixed(1)}%`
      const sharedStr = buddy.sharedInterests.join('、')
      md.push(`| #${rank + 1} | **${buddy.name}** | ${pct} | ${sharedStr} |`)
    }
  } else {
    md.push(`暂时没有找到与您拥有共同兴趣的学生。`)
  }
  md.push(`\n---\n`)

  md.push(`## 🌐 社交网络社区洞察`)
  md.push(`根据社交网络拓扑分析：`)
  md.push(`* 全校活跃学生总数: \`${graphStore.stats.studentsCount}\` 位`)
  md.push(`* 连通社群数量: \`${graphStore.stats.componentsCount}\` 个`)
  md.push(`\n*快叫上新匹配的搭子，一起报名参加推荐的活动吧！*`)

  return md.join('\n')
}

// Download Markdown report file client-side
const downloadReport = () => {
  const content = generateMarkdownReport()
  if (!content) return
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${currentUser.value}_校园活动搭子匹配推荐报告.md`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped src="./SidebarProfile.css"></style>
