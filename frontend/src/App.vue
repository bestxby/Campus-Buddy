<template>
  <!-- 1. Mock Login & Questionnaire Overlay -->
  <div v-if="!currentUser" class="login-overlay fade-in">
    <div class="login-card card glow-orange">
      <div class="logo">
        <span class="icon">🧭</span>
        <h1>Campus Buddy 校园网络与智能推荐</h1>
      </div>
      
      <p class="subtitle">请输入您的姓名并选择头像，勾选您的兴趣标签。系统将模拟构建您的学生节点并将其无缝织入 1,500+ 学生校园拓扑图中，为您生成专属的画像推荐。</p>
      
      <form @submit.prevent="submitRegistration" class="login-form">
        <!-- Basic Info -->
        <div class="form-split-row">
          <!-- Left Column: Name & Student ID stacked -->
          <div class="form-left-col">
            <div class="form-group">
              <label class="label-bold">👤 请输入您的姓名 (Your Name)</label>
              <input v-model="regForm.name" placeholder="请输入姓名或代号..." required />
            </div>
            <div class="form-group">
              <label class="label-bold">🆔 请输入您的学号 (Student ID)</label>
              <input v-model="regForm.studentId" placeholder="请输入您的学号..." required />
            </div>
          </div>
          
          <!-- Right Column: Avatar picker -->
          <div class="form-right-col">
            <label class="label-bold">🤖 选择您的头像 (Avatar)</label>
            <div class="avatar-picker-grid">
              <button 
                v-for="av in avatarOptions" 
                :key="av" 
                type="button"
                class="avatar-picker-btn"
                :class="{ 'avatar-active': regForm.avatar === av }"
                @click="regForm.avatar = av"
              >
                {{ av }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dynamic Live Persona Card -->
        <div class="live-identity-card">
          <h4>🆔 实时社交画像预览 (Live Persona Card)</h4>
          <div class="live-card-body">
            <div class="live-avatar-preview">{{ regForm.avatar }}</div>
            <div class="live-info-preview">
              <div class="live-name-preview">
                {{ regForm.name || '等待输入姓名...' }}
                <span v-if="regForm.studentId" class="live-id-badge">#{{ regForm.studentId }}</span>
              </div>
              <div class="live-persona-preview" :class="previewPersonaClass">{{ previewPersona }}</div>
            </div>
            <div class="live-interests-preview">
              <span v-for="tag in regForm.selectedInterests" :key="tag" class="preview-tag">
                # {{ tag }}
              </span>
              <span v-if="regForm.selectedInterests.length === 0" class="placeholder-text">暂未勾选兴趣...</span>
            </div>
          </div>
        </div>

        <hr class="divider" />
        <h3 class="section-title">🎯 勾选您的兴趣标签 (Select Your Interests - MultiSelect)</h3>
        
        <!-- Categorized Tags Selectors -->
        <div class="interests-picker-container">
          <!-- Sports -->
          <div class="picker-section">
            <h5>⚽ 体育运动 (Sports)</h5>
            <div class="tags-grid">
              <span 
                v-for="item in interestCategories.sports" 
                :key="item"
                :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
                @click="toggleInterestTag(item)"
                class="interest-tag"
              >
                {{ item }}
              </span>
            </div>
          </div>

          <!-- Arts -->
          <div class="picker-section">
            <h5>🎨 文化艺术 (Arts & Hobbies)</h5>
            <div class="tags-grid">
              <span 
                v-for="item in interestCategories.arts" 
                :key="item"
                :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
                @click="toggleInterestTag(item)"
                class="interest-tag"
              >
                {{ item }}
              </span>
            </div>
          </div>

          <!-- Tech -->
          <div class="picker-section">
            <h5>💻 极客技术 (Tech)</h5>
            <div class="tags-grid">
              <span 
                v-for="item in interestCategories.tech" 
                :key="item"
                :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
                @click="toggleInterestTag(item)"
                class="interest-tag"
              >
                {{ item }}
              </span>
            </div>
          </div>

          <!-- Social -->
          <div class="picker-section">
            <h5>🤝 志愿社交 (Social & Others)</h5>
            <div class="tags-grid">
              <span 
                v-for="item in interestCategories.social" 
                :key="item"
                :class="{ 'tag-active': regForm.selectedInterests.includes(item) }"
                @click="toggleInterestTag(item)"
                class="interest-tag"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="regForm.selectedInterests.length === 0" class="warning-text">
          ⚠️ 请至少选择一个兴趣标签以建立连接！
        </div>

        <button type="submit" :disabled="regForm.selectedInterests.length === 0" class="btn btn-primary glow-orange">
          生成社交画像并登入系统
        </button>
      </form>
    </div>
  </div>

  <!-- 2. Main Dashboard Panel -->
  <div v-else class="dashboard">
    <!-- Left Sidebar: Graph Info & Live Actions -->
    <aside class="sidebar" :style="{ width: sidebarWidth + 'px' }">
      <div class="logo">
        <span class="icon">🧭</span>
        <h1>Campus Buddy</h1>
      </div>

      <!-- Current User Profile Card -->
      <div class="profile-panel card glow-orange">
        <div class="profile-header">
          <h3>👤 我的主页 (My Profile)</h3>
          <button @click="logout" class="logout-btn">注销</button>
        </div>
        <div class="profile-info">
          <div class="info-avatar-row">
            <span class="profile-avatar">{{ currentUserAvatar || '🧭' }}</span>
            <div class="profile-texts">
              <div class="info-row">
                <span>姓名:</span>
                <span class="text-orange font-bold">{{ currentUser }}</span>
              </div>
              <div v-if="currentUserId" class="info-row">
                <span>学号:</span>
                <span class="text-secondary font-bold">{{ currentUserId }}</span>
              </div>
              <div class="info-row">
                <span>兴趣画像:</span>
                <span class="text-cyan font-bold">{{ userPersona }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="registered-list">
          <h4>已报名的活动 (Signed Up):</h4>
          <ul v-if="signedUpActivities.length">
            <li v-for="act in signedUpActivities" :key="act" class="signed-item">
              ✅ {{ act }}
            </li>
          </ul>
          <p v-else class="empty-list-msg">尚未报名任何活动。</p>
        </div>
      </div>

      <div class="stats-panel card">
        <h3>📊 图结构分析 (Scale Stats)</h3>
        <div class="stat-row">
          <span>学生总数 (Students)</span>
          <span class="stat-val text-orange">{{ stats.studentsCount }}</span>
        </div>
        <div class="stat-row">
          <span>兴趣类型 (Interests)</span>
          <span class="stat-val text-cyan">{{ stats.interestsCount }}</span>
        </div>
        <div class="stat-row">
          <span>活动数量 (Activities)</span>
          <span class="stat-val text-orange">{{ stats.activitiesCount }}</span>
        </div>
        <div class="stat-row">
          <span>连通社区 (Communities)</span>
          <span class="stat-val text-cyan">{{ stats.componentsCount }}</span>
        </div>
      </div>

    </aside>

    <!-- Splitter between Sidebar and Main Workspace -->
    <div class="layout-splitter vertical-splitter" @mousedown="startSidebarResize"></div>

    <!-- Main Workspace -->
    <main class="main-content">
      <!-- Search Dashboard Header -->
      <header class="header card">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            @input="onSearchInput" 
            placeholder="输入同学姓名进行实时两步推荐 (输入您的姓名或 小明)..." 
          />
        </div>

        <!-- Autocomplete Suggestions -->
        <div v-if="suggestions.length" class="suggestions-dropdown card">
          <div 
            v-for="sug in suggestions" 
            :key="sug" 
            @click="selectStudent(sug)"
            class="sug-item"
          >
            👤 {{ sug }}
          </div>
        </div>
      </header>

      <!-- Main Columns Grid -->
      <div class="content-grid">
        <!-- Results Column -->
        <div class="results-column">
          <!-- Welcome Screen (if no student is selected, select current user by default) -->
          <div v-if="!activeStudent" class="card welcome-card fade-in">
            <h2>👋 欢迎，{{ currentUser }}！</h2>
            <p>系统已分析您的多选兴趣并与 1,500+ 的校园图网络合并。您可以点击下方的按钮，或者在上方搜索框内查找其他人。</p>
            <button @click="selectStudent(currentUser)" class="btn glow-orange select-self-btn">
              查看我的匹配推荐
            </button>
            <div class="tip-box">
              <strong>💡 D3.js 力导向画布提示：</strong>
              <p>右侧画布将渲染您的专属<b>二步关系子图 (Focal Subgraph)</b>，您可以拖拽节点或者滚动缩放，悬停某个节点可以高亮其连接路径，快速看清图连接！</p>
            </div>
          </div>

          <!-- Matching Results View -->
          <div v-else class="recommendations fade-in">
            <div class="active-profile card glow-orange">
              <h2>👤 当前选中: <span class="highlight">{{ activeStudent }}</span></h2>
              <button @click="clearSearch" class="btn-text">清除搜索</button>
            </div>

            <!-- Two split columns inside resizable Results area -->
            <div class="recommendations-row">
              <!-- Left Column: Activities -->
              <div class="rec-split-col">
                <div class="card result-card height-100">
                  <div class="result-card-header">
                    <h3>🎉 匹配活动推荐</h3>
                    <span class="card-hint">已折叠，点击展开或切换标签</span>
                  </div>
                  
                  <!-- Filter Tabs/Pills -->
                  <div v-if="filterTabs.length > 1" class="interest-filters">
                    <button 
                      v-for="tab in filterTabs" 
                      :key="tab" 
                      :class="{ 'tab-active': activeFilter === tab }" 
                      @click="activeFilter = tab"
                      class="filter-pill"
                    >
                      {{ tab === '全部' ? '🌟 全部' : tab }}
                    </button>
                  </div>

                  <div v-if="hasActivities" class="accordion-container">
                    <div 
                      v-for="(acts, interest) in filteredActivitiesGrouped" 
                      :key="interest" 
                      class="accordion-item"
                    >
                      <div class="accordion-header-static">
                        <span class="accordion-title">🎯 兴趣圈：{{ interest }} ({{ acts.length }})</span>
                      </div>
                      
                      <div class="accordion-content-static">
                        <ul>
                          <li 
                            v-for="act in (isGroupExpanded(interest) ? acts : acts.slice(0, 3))" 
                            :key="act" 
                            class="path-item"
                          >
                            <div class="path-content">
                              <div class="path-flow-vertical">
                                <div class="path-flow">
                                  <span class="node student">{{ activeStudent }}</span>
                                  <span class="arrow">➔</span>
                                  <span class="node interest">{{ interest }}</span>
                                  <span class="arrow">➔</span>
                                  <span class="node activity">{{ act }}</span>
                                </div>
                                
                                <!-- Smart Matchmaking Reason -->
                                <div class="match-reason">
                                  <span v-if="getBuddiesForActivity(activeStudent, act).length > 0" class="reason-text text-orange-light">
                                    👥 搭子: <b>{{ getBuddiesForActivity(activeStudent, act).slice(0, 1).join('') }}</b> 
                                    <span v-if="getBuddiesForActivity(activeStudent, act).length > 1"> 等 {{ getBuddiesForActivity(activeStudent, act).length }} 人</span>也报名了
                                  </span>
                                  <span v-else class="reason-text text-cyan-light">
                                    🎯 推荐理由: 匹配您的【{{ interest }}】
                                  </span>
                                </div>
                              </div>
                              
                              <!-- Join activity action for current user -->
                              <button 
                                v-if="activeStudent === currentUser" 
                                @click="signUpForActivity(act)" 
                                :disabled="isSignedUp(act)"
                                class="signup-btn"
                                :class="{ 'btn-signed': isSignedUp(act) }"
                              >
                                {{ isSignedUp(act) ? '已报名' : '一键报名' }}
                              </button>
                            </div>
                          </li>
                        </ul>
                        
                        <!-- Expand/Collapse Button -->
                        <button 
                          v-if="acts.length > 3" 
                          @click="toggleGroupExpand(interest)" 
                          class="expand-toggle-btn"
                        >
                          {{ isGroupExpanded(interest) ? '🔼 收起' : `➕ 展开其余 ${acts.length - 3} 个` }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p v-else class="empty-msg">没有找到合适的匹配活动。</p>
                </div>
              </div>

              <div class="rec-split-col">
                <div class="card result-card height-100">
                  <h3>🤝 兴趣契合的活动搭子</h3>
                  
                  <!-- Local Buddy Search Box -->
                  <div class="buddy-search-container">
                    <div class="buddy-search-input-wrapper">
                      <span class="search-icon">🔍</span>
                      <input 
                        v-model="searchFriendQuery" 
                        placeholder="查找特定朋友/同学姓名，分析共同兴趣..." 
                        class="buddy-search-input"
                      />
                      <button v-if="searchFriendQuery" @click="searchFriendQuery = ''" class="clear-search-btn">清除</button>
                    </div>
                    
                    <!-- Search Results -->
                    <div v-if="matchedFriends.length" class="friend-matches-list">
                      <div 
                        v-for="friend in matchedFriends" 
                        :key="friend.name" 
                        class="friend-match-item"
                      >
                        <div class="friend-match-info">
                          <span class="friend-name">👤 {{ friend.name }}</span>
                          <span v-if="friend.sharedCount > 0" class="friend-shared-desc text-orange-light">
                            🤝 {{ friend.sharedCount }}个共同兴趣: {{ friend.sharedInterests.slice(0, 2).join('、') }}
                          </span>
                          <span v-else class="friend-shared-desc">
                            无共同兴趣标签
                          </span>
                        </div>
                        <button @click="selectStudent(friend.name)" class="btn btn-xs glow-orange select-friend-btn">
                          ⚡ 查看连结
                        </button>
                      </div>
                    </div>
                    <div v-else-if="searchFriendQuery.trim().length > 0" class="friend-no-matches">
                      没有找到名字包含 "{{ searchFriendQuery }}" 的同学
                    </div>
                  </div>

                  <ul v-if="recommendations.buddies.length" class="buddy-list">
                    <li v-for="buddy in recommendations.buddies.slice(0, 30)" :key="buddy" class="path-item">
                      <div class="path-flow">
                        <span class="node student">{{ activeStudent }}</span>
                        <span class="arrow">➔</span>
                        <span class="node interest">{{ getSharedInterest(activeStudent, buddy, 'student') }}</span>
                        <span class="arrow">➔</span>
                        <span class="node student">{{ buddy }}</span>
                      </div>
                    </li>
                  </ul>
                  <p v-else class="empty-msg">暂时没有相同兴趣的搭子。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- 3. Floating Action Widget / Prompt on the Right Edge of the Screen -->
    <div v-if="activeStudent" class="right-floating-widget fade-in">
      <div v-if="showUpdatePrompt" class="prompt-pill glow-cyan">
        <span class="prompt-text">⚡ 关系网已变更，要渲染最新拓扑图吗？</span>
        <button @click="triggerRenderFullscreen" class="btn btn-primary btn-xs glow-cyan prompt-btn">
          ⚡ 立即渲染
        </button>
      </div>
      <button v-else @click="openFullscreenGraph" class="btn btn-secondary floating-toggle-btn glow-orange">
        🌌 👁️ 查看关系网络拓扑图
      </button>
    </div>

    <!-- 4. Fullscreen Graph Modal Overlay -->
    <div v-show="showFullscreenGraph" class="fullscreen-graph-overlay fade-in">
      <div class="fullscreen-modal-card card glow-cyan">
        <div class="fullscreen-modal-header">
          <div class="vis-title-group">
            <h3>🌐 局域关联拓扑网络 (Fullscreen Topology Canvas)</h3>
            <span class="vis-subtitle">{{ activeStudent }} 的双跳聚焦关系网络 (Focal Subgraph)</span>
          </div>
          
          <!-- Controls row inside fullscreen modal -->
          <div class="modal-controls-row">
            <div class="canvas-toggles">
              <div class="toggle-group">
                <label class="neon-checkbox">
                  <input type="checkbox" v-model="hideBuddiesInGraph" />
                  <span class="checkbox-box"></span>
                  👁️ 隐藏同学
                </label>
                <label class="neon-checkbox">
                  <input type="checkbox" v-model="hideActivitiesInGraph" />
                  <span class="checkbox-box"></span>
                  👁️ 隐藏活动
                </label>
              </div>
              
              <div class="limit-slider-group">
                <span class="slider-label">👥 推荐搭子限额: {{ topBuddiesLimit }}人</span>
                <input type="range" min="1" max="40" step="1" v-model.number="topBuddiesLimit" class="neon-slider" />
              </div>
            </div>
            
            <!-- Zoom Controls -->
            <div class="zoom-controls-modal">
              <button @click="zoomIn" class="zoom-btn" title="放大">➕</button>
              <button @click="zoomOut" class="zoom-btn" title="缩小">➖</button>
              <button @click="resetZoom" class="zoom-btn" title="重置">🔄</button>
            </div>
            
            <!-- Close Modal Button -->
            <button @click="closeFullscreenGraph" class="close-modal-btn" title="关闭拓扑图">❌</button>
          </div>
        </div>
        
        <!-- Fullscreen Graph Canvas Container -->
        <div class="fullscreen-canvas-container">
          <svg ref="svgRef" width="100%" height="100%"></svg>
          
          <!-- Floating Connection Tooltip Card -->
          <div v-if="hoveredConnectionDetail" class="vis-tooltip fade-in">
            <div class="tooltip-header">
              <span class="tooltip-icon">
                {{ hoveredConnectionDetail.type === 'student' ? '👤' : (hoveredConnectionDetail.type === 'activity' ? '🎉' : '🎯') }}
              </span>
              <h4>{{ hoveredConnectionDetail.title }}</h4>
            </div>
            <div class="tooltip-body">
              <p>{{ hoveredConnectionDetail.details }}</p>
            </div>
          </div>
          
          <div class="canvas-hint">💡 支持滚动鼠标缩放，拖拽/悬停节点，点击同学可切换视图</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import * as d3 from 'd3';

// Graph Definition
const graph = ref<Map<string, Set<string>>>(new Map());

const stats = reactive({
  studentsCount: 0,
  interestsCount: 0,
  activitiesCount: 0,
  componentsCount: 0
});



// 50 Interests categorized
// 30 Interests categorized
const interestCategories = {
  sports: ["篮球", "足球", "羽毛球", "网球", "游泳", "乒乓球", "排球"],
  arts: ["摄影", "读书", "电影", "音乐", "绘画", "棋类", "桌游", "书法"],
  tech: ["Python", "Web开发", "机器学习", "算法竞赛", "网络安全", "Linux", "硬件DIY", "物联网"],
  social: ["志愿服务", "英语角", "户外探索", "辩论社", "公益支教", "求职沙龙", "旅行搭子"]
};

// Registration overlay
const currentUser = ref<string | null>(null);
const currentUserId = ref<string | null>(null);
const currentUserAvatar = ref<string>('🚀');
const userPersona = ref<string>('未知');
const signedUpActivities = ref<string[]>([]);

const regForm = reactive({
  name: '',
  studentId: '',
  avatar: '🚀',
  selectedInterests: [] as string[]
});

// Replaced soccer ball '⚽' with gamepad '🎮', added headphones '🎧' & brain '🧠', removed first '👾'
const avatarOptions = ['🚀', '💻', '🎨', '🎮', '🧭', '🎧', '🧠'];

// Resizable layout widths
const sidebarWidth = ref(330);
const resultsWidth = ref(450);

// Canvas rendering state
const isCanvasRendered = ref(false);
const showFullscreenGraph = ref(false);
const showUpdatePrompt = ref(false);
const lastSignedUpActivity = ref('');

const hideBuddiesInGraph = ref(false);
const hideActivitiesInGraph = ref(false);
const topBuddiesLimit = ref(30);
const hoveredConnectionDetail = ref<{
  title: string;
  type: 'student' | 'activity' | 'interest';
  details: string;
} | null>(null);

watch([hideBuddiesInGraph, hideActivitiesInGraph, topBuddiesLimit], () => {
  if (isCanvasRendered.value && showFullscreenGraph.value) {
    drawGraph();
  }
});

const triggerRenderFullscreen = () => {
  showUpdatePrompt.value = false;
  showFullscreenGraph.value = true;
  isCanvasRendered.value = true;
  setTimeout(() => {
    drawGraph();
  }, 50);
};

const openFullscreenGraph = () => {
  showFullscreenGraph.value = true;
  isCanvasRendered.value = true;
  setTimeout(() => {
    drawGraph();
  }, 50);
};

const closeFullscreenGraph = () => {
  showFullscreenGraph.value = false;
};

// Resizer logic
let startX = 0;
let startWidth = 0;
let activeResizer: 'sidebar' | 'results' | null = null;

const startSidebarResize = (e: MouseEvent) => {
  activeResizer = 'sidebar';
  startX = e.clientX;
  startWidth = sidebarWidth.value;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.userSelect = 'none';
};

const startResultsResize = (e: MouseEvent) => {
  activeResizer = 'results';
  startX = e.clientX;
  startWidth = resultsWidth.value;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.userSelect = 'none';
};

const onMouseMove = (e: MouseEvent) => {
  if (!activeResizer) return;
  const deltaX = e.clientX - startX;
  if (activeResizer === 'sidebar') {
    const newWidth = startWidth + deltaX;
    if (newWidth >= 250 && newWidth <= 450) {
      sidebarWidth.value = newWidth;
    }
  } else if (activeResizer === 'results') {
    const newWidth = startWidth + deltaX;
    if (newWidth >= 300 && newWidth <= 800) {
      resultsWidth.value = newWidth;
    }
  }
};

const onMouseUp = () => {
  activeResizer = null;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.body.style.userSelect = '';
  drawGraph();
};

const searchQuery = ref('');
const suggestions = ref<string[]>([]);
const searchFriendQuery = ref('');
const activeStudent = ref<string | null>(null);

const matchedFriends = computed(() => {
  const query = searchFriendQuery.value.trim().toLowerCase();
  if (!query) return [];
  
  const results = [];
  for (const node of graph.value.keys()) {
    if (node.startsWith('student:')) {
      const name = node.replace('student:', '');
      if (name === activeStudent.value) continue;
      
      if (name.toLowerCase().includes(query)) {
        const sNode = nodeKey('student', activeStudent.value || '');
        const oNode = nodeKey('student', name);
        const sInterests = Array.from(graph.value.get(sNode) || []).filter(i => i.startsWith('interest:'));
        const oInterests = Array.from(graph.value.get(oNode) || []).filter(i => i.startsWith('interest:'));
        const shared = sInterests.filter(x => oInterests.includes(x)).map(x => x.replace('interest:', ''));
        
        results.push({
          name,
          sharedCount: shared.length,
          sharedInterests: shared
        });
      }
    }
  }
  
  results.sort((a, b) => {
    if (b.sharedCount !== a.sharedCount) {
      return b.sharedCount - a.sharedCount;
    }
    return a.name.localeCompare(b.name);
  });
  
  return results.slice(0, 30);
});

const recommendations = reactive({
  activities: [] as string[],
  buddies: [] as string[]
});

const svgRef = ref<SVGSVGElement | null>(null);

// Zoom behaviour references
let currentZoomBehavior: any = null;

const zoomIn = () => {
  if (!svgRef.value || !currentZoomBehavior) return;
  d3.select(svgRef.value)
    .transition()
    .duration(200)
    .call(currentZoomBehavior.scaleBy, 1.25);
};

const zoomOut = () => {
  if (!svgRef.value || !currentZoomBehavior) return;
  d3.select(svgRef.value)
    .transition()
    .duration(200)
    .call(currentZoomBehavior.scaleBy, 0.8);
};

const resetZoom = () => {
  if (!svgRef.value || !currentZoomBehavior) return;
  d3.select(svgRef.value)
    .transition()
    .duration(300)
    .call(currentZoomBehavior.transform, d3.zoomIdentity);
};

// Live Preview Persona Card computed helpers
const previewPersona = computed(() => {
  if (regForm.selectedInterests.length === 0) return '待生成画像...';
  
  const sportsCount = regForm.selectedInterests.filter(x => interestCategories.sports.includes(x)).length;
  const techCount = regForm.selectedInterests.filter(x => interestCategories.tech.includes(x)).length;
  const artsCount = regForm.selectedInterests.filter(x => interestCategories.arts.includes(x)).length;
  const socialCount = regForm.selectedInterests.filter(x => interestCategories.social.includes(x)).length;

  const max = Math.max(sportsCount, techCount, artsCount, socialCount);
  if (max === techCount) return '科技极客 (Tech Geek)';
  if (max === sportsCount) return '运动健将 (Sports Fan)';
  if (max === artsCount) return '文艺青年 (Creative Artist)';
  return '社交达人 (Social Hub)';
});

const previewPersonaClass = computed(() => {
  const p = previewPersona.value;
  if (p.includes('Tech')) return 'text-orange';
  if (p.includes('Sports')) return 'text-cyan';
  if (p.includes('Creative')) return 'text-pink';
  return 'text-green';
});

// Node Key Formatter
const nodeKey = (kind: string, name: string) => `${kind}:${name}`;

// Active filter interest name (e.g. "全部", "Python", etc.)
const activeFilter = ref('全部');

// Dynamic filter tabs (current student's interests)
const filterTabs = computed(() => {
  if (!activeStudent.value) return ['全部'];
  const sNode = nodeKey('student', activeStudent.value);
  const interests = Array.from(graph.value.get(sNode) || [])
    .filter(n => n.startsWith('interest:'))
    .map(n => n.replace('interest:', ''))
    .sort();
  return ['全部', ...interests];
});

// Group recommended activities by their specific interest name
const filteredActivitiesGrouped = computed(() => {
  const groups: Record<string, string[]> = {};
  if (!activeStudent.value) return groups;
  
  const filterVal = activeFilter.value;
  
  for (const act of recommendations.activities) {
    const interest = getSharedInterest(activeStudent.value, act, 'activity');
    if (filterVal === '全部' || interest === filterVal) {
      if (!groups[interest]) groups[interest] = [];
      groups[interest].push(act);
    }
  }
  return groups;
});

const hasActivities = computed(() => recommendations.activities.length > 0);

// Expanded groups tracking
const expandedGroups = ref<Record<string, boolean>>({});
const toggleGroupExpand = (interestName: string) => {
  expandedGroups.value[interestName] = !expandedGroups.value[interestName];
};
const isGroupExpanded = (interestName: string) => {
  return !!expandedGroups.value[interestName];
};

// Buddies registered for a given activity
const getBuddiesForActivity = (studentName: string, activityName: string) => {
  const actNode = nodeKey('activity', activityName);
  
  // Get all students registered for this activity
  const registeredStudents = Array.from(graph.value.get(actNode) || [])
    .filter(n => n.startsWith('student:'))
    .map(n => n.replace('student:', ''));
  
  // Get all buddies of this student
  const studentBuddies = recommendations.buddies;
  
  // Return intersection
  return registeredStudents.filter(b => studentBuddies.includes(b));
};

// Toggle tags in overlay questionnaire
const toggleInterestTag = (interest: string) => {
  const index = regForm.selectedInterests.indexOf(interest);
  if (index > -1) {
    regForm.selectedInterests.splice(index, 1);
  } else {
    regForm.selectedInterests.push(interest);
  }
};

// Core Graph helpers
const addEdge = (u: string, v: string) => {
  if (!graph.value.has(u)) graph.value.set(u, new Set());
  if (!graph.value.has(v)) graph.value.set(v, new Set());
  graph.value.get(u)!.add(v);
  graph.value.get(v)!.add(u);
};

// BFS Connected Components
const calculateConnectedComponents = () => {
  const visited = new Set<string>();
  let count = 0;
  
  for (const node of graph.value.keys()) {
    if (visited.has(node)) continue;
    
    count++;
    const queue = [node];
    visited.add(node);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = graph.value.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
  return count;
};

// Re-calculate graph stats
const updateStats = () => {
  let sCount = 0;
  let iCount = 0;
  let aCount = 0;
  
  for (const node of graph.value.keys()) {
    if (node.startsWith('student:')) sCount++;
    else if (node.startsWith('interest:')) iCount++;
    else if (node.startsWith('activity:')) aCount++;
  }
  
  stats.studentsCount = sCount;
  stats.interestsCount = iCount;
  stats.activitiesCount = aCount;
  stats.componentsCount = calculateConnectedComponents();
};

// 2-Hop recommendations
const runRecommendations = (student: string) => {
  const start = nodeKey('student', student);
  const matchedActivities = new Set<string>();
  const matchedBuddies = new Set<string>();

  if (!graph.value.has(start)) return;

  const interests = graph.value.get(start) || [];
  for (const interest of interests) {
    if (!interest.startsWith('interest:')) continue;
    
    const neighbors = graph.value.get(interest) || [];
    for (const neighbor of neighbors) {
      if (neighbor.startsWith('activity:')) {
        matchedActivities.add(neighbor.replace('activity:', ''));
      } else if (neighbor.startsWith('student:') && neighbor !== start) {
        matchedBuddies.add(neighbor.replace('student:', ''));
      }
    }
  }
  
  recommendations.activities = Array.from(matchedActivities).sort();
  recommendations.buddies = Array.from(matchedBuddies).sort();
};

// Retrieve shared interest between two nodes
const getSharedInterest = (student: string, other: string, otherType: 'student' | 'activity') => {
  const sNode = nodeKey('student', student);
  const oNode = nodeKey(otherType, other);
  
  const sInterests = Array.from(graph.value.get(sNode) || []).filter(i => i.startsWith('interest:'));
  const oInterests = Array.from(graph.value.get(oNode) || []).filter(i => i.startsWith('interest:'));
  
  const intersection = sInterests.filter(x => oInterests.includes(x));
  if (intersection.length > 0) {
    return intersection[0].replace('interest:', '');
  }
  return '';
};

// Login and questionnaire submission
const submitRegistration = () => {
  const name = regForm.name.trim();
  if (!name || regForm.selectedInterests.length === 0) return;

  // Set current user
  currentUser.value = name;
  localStorage.setItem('campus_buddy_user', name);
  
  // Set student ID if provided
  const studentId = regForm.studentId.trim();
  if (studentId) {
    currentUserId.value = studentId;
    localStorage.setItem('campus_buddy_student_id', studentId);
  }

  // Set avatar
  currentUserAvatar.value = regForm.avatar;
  localStorage.setItem('campus_buddy_avatar', regForm.avatar);

  // Setup user persona based on major selection count
  const sportsCount = regForm.selectedInterests.filter(x => interestCategories.sports.includes(x)).length;
  const techCount = regForm.selectedInterests.filter(x => interestCategories.tech.includes(x)).length;
  const artsCount = regForm.selectedInterests.filter(x => interestCategories.arts.includes(x)).length;
  const socialCount = regForm.selectedInterests.filter(x => interestCategories.social.includes(x)).length;

  const max = Math.max(sportsCount, techCount, artsCount, socialCount);
  if (max === techCount) userPersona.value = '科技极客 (Tech Geek)';
  else if (max === sportsCount) userPersona.value = '运动健将 (Sports Fan)';
  else if (max === artsCount) userPersona.value = '文艺青年 (Creative Artist)';
  else userPersona.value = '社交达人 (Social Hub)';
  
  localStorage.setItem('campus_buddy_persona', userPersona.value);

  // Save interests to localStorage and add to graph
  localStorage.setItem('campus_buddy_interests', JSON.stringify(regForm.selectedInterests));
  
  const sNode = nodeKey('student', name);
  for (const interest of regForm.selectedInterests) {
    const iNode = nodeKey('interest', interest);
    addEdge(sNode, iNode);
  }

  // Redraw
  updateStats();
  selectStudent(name);
};

// Logout
const logout = () => {
  localStorage.clear();
  currentUser.value = null;
  currentUserId.value = null;
  currentUserAvatar.value = '🧭';
  userPersona.value = '未知';
  signedUpActivities.value = [];
  regForm.selectedInterests = [];
  regForm.name = '';
  regForm.studentId = '';
  regForm.avatar = '🚀';
  clearSearch();
  // Reload base graph
  graph.value.clear();
  loadMockData();
};

// Join/Signup activity
const signUpForActivity = (activity: string) => {
  if (!currentUser.value) return;
  
  const sNode = nodeKey('student', currentUser.value);
  const aNode = nodeKey('activity', activity);
  
  // Create an explicit registration edge between student and activity
  addEdge(sNode, aNode);
  
  if (!signedUpActivities.value.includes(activity)) {
    signedUpActivities.value.push(activity);
    localStorage.setItem('campus_buddy_signups', JSON.stringify(signedUpActivities.value));
  }
  
  updateStats();
  
  // Set signup modal state
  lastSignedUpActivity.value = activity;
  showUpdatePrompt.value = true;
};

const isSignedUp = (activity: string) => {
  return signedUpActivities.value.includes(activity);
};

// Load default mock database and recover localStorage profile
const loadMockData = async () => {
  try {
    const res = await fetch('./graph_data.json');
    if (!res.ok) throw new Error('Data file not found');
    const data = await res.json();
    
    // Load default nodes
    for (const [student, interest] of data.students) {
      const s = nodeKey('student', student);
      const i = nodeKey('interest', interest);
      addEdge(s, i);
    }
    for (const [activity, interest] of data.activities) {
      const a = nodeKey('activity', activity);
      const i = nodeKey('interest', interest);
      addEdge(a, i);
    }
    if (data.registrations) {
      for (const [student, activity] of data.registrations) {
        const s = nodeKey('student', student);
        const a = nodeKey('activity', activity);
        addEdge(s, a);
      }
    }
    
    // Recover localStorage session
    const savedUser = localStorage.getItem('campus_buddy_user');
    if (savedUser) {
      currentUser.value = savedUser;
      currentUserAvatar.value = localStorage.getItem('campus_buddy_avatar') || '🧭';
      userPersona.value = localStorage.getItem('campus_buddy_persona') || '普通同学';
      
      const savedId = localStorage.getItem('campus_buddy_student_id');
      if (savedId) {
        currentUserId.value = savedId;
        regForm.studentId = savedId;
      }
      
      const savedInterests = JSON.parse(localStorage.getItem('campus_buddy_interests') || '[]');
      const sNode = nodeKey('student', savedUser);
      for (const interest of savedInterests) {
        const iNode = nodeKey('interest', interest);
        addEdge(sNode, iNode);
      }
      
      const savedSignups = JSON.parse(localStorage.getItem('campus_buddy_signups') || '[]');
      signedUpActivities.value = savedSignups;
      for (const act of savedSignups) {
        const aNode = nodeKey('activity', act);
        addEdge(sNode, aNode);
      }
    }
    
    updateStats();
    drawGraph();
  } catch (err) {
    console.error('Failed loading graph data:', err);
  }
};

// Search Auto-complete
const onSearchInput = () => {
  const query = searchQuery.value.trim();
  if (query.length < 1) {
    suggestions.value = [];
    return;
  }
  
  const matched = [];
  for (const node of graph.value.keys()) {
    if (node.startsWith('student:')) {
      const name = node.replace('student:', '');
      if (name.includes(query)) {
        matched.push(name);
      }
    }
  }
  suggestions.value = matched.slice(0, 5);
};

const selectStudent = (name: string) => {
  searchQuery.value = name;
  suggestions.value = [];
  searchFriendQuery.value = '';
  activeStudent.value = name;
  runRecommendations(name);
};

const clearSearch = () => {
  searchQuery.value = '';
  activeStudent.value = null;
  recommendations.activities = [];
  recommendations.buddies = [];
  isCanvasRendered.value = false;
  showFullscreenGraph.value = false;
  showUpdatePrompt.value = false;
};



// Watch active student changes to update visualization and reset filter
watch(activeStudent, () => {
  activeFilter.value = '全部';
  expandedGroups.value = {};
  isCanvasRendered.value = false;
  showFullscreenGraph.value = false;
  showUpdatePrompt.value = false;
  hideBuddiesInGraph.value = false;
  hideActivitiesInGraph.value = false;
  topBuddiesLimit.value = 30;
  hoveredConnectionDetail.value = null;
});

// D3.js Network Simulation Rendering
const drawGraph = () => {
  if (!svgRef.value) return;
  
  const svg = d3.select(svgRef.value);
  svg.selectAll('*').remove(); // Clear previous drawing
  
  const width = svgRef.value.clientWidth || 600;
  const height = svgRef.value.clientHeight || 500;
  
  // 1. Gather nodes and links to draw
  let nodesToDraw: any[] = [];
  let linksToDraw: any[] = [];
  
  if (activeStudent.value) {
    // Focal Subgraph around selected student (2 hops + direct activity registrations)
    const focalNode = nodeKey('student', activeStudent.value);
    const addedNodes = new Set<string>([focalNode]);
    
    nodesToDraw.push({ id: focalNode, type: 'student', name: activeStudent.value });
    
    // Pre-calculate top N buddies sorted by shared interest count
    const sNode = nodeKey('student', activeStudent.value);
    const sInterests = Array.from(graph.value.get(sNode) || []).filter(i => i.startsWith('interest:'));
    const buddyOverlapCounts = recommendations.buddies.map(buddyName => {
      const bNode = nodeKey('student', buddyName);
      const bInterests = Array.from(graph.value.get(bNode) || []).filter(i => i.startsWith('interest:'));
      const overlap = sInterests.filter(x => bInterests.includes(x)).length;
      return { name: buddyName, overlap };
    });
    
    buddyOverlapCounts.sort((a, b) => b.overlap - a.overlap);
    const allowedBuddies = new Set(buddyOverlapCounts.slice(0, topBuddiesLimit.value).map(x => x.name));

    const interestsAndDirectEdges = graph.value.get(focalNode) || [];
    for (const neighbor of interestsAndDirectEdges) {
      if (neighbor.startsWith('activity:')) {
        if (hideActivitiesInGraph.value) continue;
        const name = neighbor.replace('activity:', '');
        if (!addedNodes.has(neighbor)) {
          addedNodes.add(neighbor);
          nodesToDraw.push({ id: neighbor, type: 'activity', name: name });
        }
        linksToDraw.push({ source: focalNode, target: neighbor });
        continue;
      }
      
      if (neighbor.startsWith('interest:')) {
        if (!addedNodes.has(neighbor)) {
          addedNodes.add(neighbor);
          nodesToDraw.push({ 
            id: neighbor, 
            type: 'interest', 
            name: neighbor.replace('interest:', '') 
          });
        }
        linksToDraw.push({ source: focalNode, target: neighbor });
        
        const subNeighbors = graph.value.get(neighbor) || [];
        for (const subNeighbor of subNeighbors) {
          const name = subNeighbor.split(':')[1];
          const isBuddy = subNeighbor.startsWith('student:') && !hideBuddiesInGraph.value && allowedBuddies.has(name);
          const isActivity = subNeighbor.startsWith('activity:') && !hideActivitiesInGraph.value && recommendations.activities.includes(name);
          
          if (isBuddy || isActivity) {
            if (!addedNodes.has(subNeighbor)) {
              addedNodes.add(subNeighbor);
              nodesToDraw.push({ 
                id: subNeighbor, 
                type: subNeighbor.startsWith('student:') ? 'student' : 'activity', 
                name: name 
              });
            }
            linksToDraw.push({ source: neighbor, target: subNeighbor });
          }
        }
      }
    }
    
    // Add links between buddies and activities in the subgraph if they have registered
    for (const nodeA of addedNodes) {
      if (nodeA.startsWith('student:') && nodeA !== focalNode) {
        const registrations = graph.value.get(nodeA) || [];
        for (const reg of registrations) {
          if (reg.startsWith('activity:') && addedNodes.has(reg)) {
            linksToDraw.push({ source: nodeA, target: reg, type: 'registration' });
          }
        }
      }
    }
  } else {
    // Global Index view: draw all interest nodes and a random subset of student nodes to avoid clutter
    const addedNodes = new Set<string>();
    const interests = Array.from(graph.value.keys()).filter(n => n.startsWith('interest:'));
    
    for (const interest of interests) {
      addedNodes.add(interest);
      nodesToDraw.push({ 
        id: interest, 
        type: 'interest', 
        name: interest.replace('interest:', '') 
      });
      
      // Select up to 3 neighbors from each interest to represent
      const neighbors = Array.from(graph.value.get(interest) || []).slice(0, 3);
      for (const neighbor of neighbors) {
        if (!addedNodes.has(neighbor)) {
          addedNodes.add(neighbor);
          nodesToDraw.push({ 
            id: neighbor, 
            type: neighbor.startsWith('student:') ? 'student' : 'activity', 
            name: neighbor.split(':')[1] 
          });
        }
        linksToDraw.push({ source: interest, target: neighbor });
      }
    }
  }

  // 2. Setup simulation forces with focal centric weighting
  const simulation = d3.forceSimulation(nodesToDraw)
    .force('link', d3.forceLink(linksToDraw).id((d: any) => d.id).distance((d: any) => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const activeNodeId = nodeKey('student', activeStudent.value || '');
      if (sourceId === activeNodeId || targetId === activeNodeId) {
        return 70; // Primary circle closer
      }
      return activeStudent.value ? 120 : 80;
    }))
    .force('charge', d3.forceManyBody().strength(activeStudent.value ? -260 : -120))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius((d: any) => {
      if (d.id === nodeKey('student', activeStudent.value || '')) return 35;
      return 20;
    }));
    
  // 3. Pan and Zoom handler
  const gContainer = svg.append('g');
  
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      gContainer.attr('transform', event.transform);
    });
  currentZoomBehavior = zoom;
  svg.call(zoom);

  // 4. Render Link lines
  const link = gContainer.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(linksToDraw)
    .enter()
    .append('line')
    .attr('stroke', (d: any) => {
      if (d.type === 'registration') return 'rgba(253, 151, 31, 0.45)';
      const sType = typeof d.source === 'object' ? d.source.type : (d.source.startsWith('student:') ? 'student' : (d.source.startsWith('activity:') ? 'activity' : 'interest'));
      const tType = typeof d.target === 'object' ? d.target.type : (d.target.startsWith('student:') ? 'student' : (d.target.startsWith('activity:') ? 'activity' : 'interest'));
      if ((sType === 'student' && tType === 'activity') || (sType === 'activity' && tType === 'student')) {
        return 'rgba(6, 182, 212, 0.6)';
      }
      return 'rgba(255, 255, 255, 0.08)';
    })
    .attr('stroke-dasharray', (d: any) => {
      if (d.type === 'registration') return '3,3';
      return null;
    })
    .attr('stroke-width', (d: any) => {
      if (d.type === 'registration') return 1.5;
      const sType = typeof d.source === 'object' ? d.source.type : (d.source.startsWith('student:') ? 'student' : (d.source.startsWith('activity:') ? 'activity' : 'interest'));
      const tType = typeof d.target === 'object' ? d.target.type : (d.target.startsWith('student:') ? 'student' : (d.target.startsWith('activity:') ? 'activity' : 'interest'));
      if ((sType === 'student' && tType === 'activity') || (sType === 'activity' && tType === 'student')) {
        return 2;
      }
      return 1.5;
    });

  // 5. Render Nodes container
  const node = gContainer.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodesToDraw)
    .enter()
    .append('g')
    .call(d3.drag<SVGGElement, any>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
    )
    .on('click', (event, d) => {
      if (d.type === 'student') {
        selectStudent(d.name);
      }
    })
    .on('mouseover', (event, d) => {
      // Highlight direct links and dim other elements to increase selectability
      const connectedNodeIds = new Set<string>([d.id]);
      
      link.style('opacity', (l: any) => {
        const isConnected = l.source.id === d.id || l.target.id === d.id;
        if (isConnected) {
          connectedNodeIds.add(l.source.id);
          connectedNodeIds.add(l.target.id);
          return 1.0;
        }
        return 0.12;
      });
      
      node.style('opacity', (n: any) => {
        return connectedNodeIds.has(n.id) ? 1.0 : 0.15;
      });

      // Update hovered connection detail for tooltip card
      if (activeStudent.value) {
        if (d.type === 'student') {
          if (d.name === activeStudent.value) {
            hoveredConnectionDetail.value = {
              title: `${d.name} (您)`,
              type: 'student',
              details: '当前推荐的起点中心节点。围绕着您的是您勾选的兴趣标签以及报名的校园活动。'
            };
          } else {
            const sNode = nodeKey('student', activeStudent.value);
            const oNode = nodeKey('student', d.name);
            const sInterests = Array.from(graph.value.get(sNode) || []).filter(i => i.startsWith('interest:'));
            const oInterests = Array.from(graph.value.get(oNode) || []).filter(i => i.startsWith('interest:'));
            const shared = sInterests.filter(x => oInterests.includes(x)).map(x => x.replace('interest:', ''));
            
            const sActs = Array.from(graph.value.get(sNode) || []).filter(i => i.startsWith('activity:'));
            const oActs = Array.from(graph.value.get(oNode) || []).filter(i => i.startsWith('activity:'));
            const sharedActs = sActs.filter(x => oActs.includes(x)).map(x => x.replace('activity:', ''));
            
            let details = `【活动搭子】您与 ${d.name} 共同关注的兴趣：${shared.join('、') || '暂无'}。`;
            if (sharedActs.length > 0) {
              details += ` 你们都报名了相同的活动：${sharedActs.join('、')}。`;
            } else {
              details += ` 匹配度较高，不妨约他一起报名下方的推荐活动吧！`;
            }
            
            hoveredConnectionDetail.value = {
              title: d.name,
              type: 'student',
              details: details
            };
          }
        } else if (d.type === 'activity') {
          const sNode = nodeKey('student', activeStudent.value);
          const aNode = nodeKey('activity', d.name);
          const sInterests = Array.from(graph.value.get(sNode) || []).filter(i => i.startsWith('interest:'));
          const aInterests = Array.from(graph.value.get(aNode) || []).filter(i => i.startsWith('interest:'));
          const shared = sInterests.filter(x => aInterests.includes(x)).map(x => x.replace('interest:', ''));
          
          const isReg = signedUpActivities.value.includes(d.name);
          let details = `【活动推荐】基于您的兴趣「${shared.join('、')}」向您匹配推荐。`;
          if (isReg) {
            details += ` 您已成功报名此活动，已建立直接人脉连结！`;
          } else {
            details += ` 您尚未报名该活动，一键报名后可在图中建立连结！`;
          }
          
          hoveredConnectionDetail.value = {
            title: d.name,
            type: 'activity',
            details: details
          };
        } else if (d.type === 'interest') {
          hoveredConnectionDetail.value = {
            title: `🎯 兴趣圈：${d.name}`,
            type: 'interest',
            details: `连接您与匹配学生/活动的桥梁纽带节点。通过该兴趣标签进行社交推荐。`
          };
        }
      } else {
        // Global Index Tooltips
        if (d.type === 'interest') {
          hoveredConnectionDetail.value = {
            title: `🎯 兴趣圈：${d.name}`,
            type: 'interest',
            details: `全局兴趣主题节点。`
          };
        } else if (d.type === 'student') {
          hoveredConnectionDetail.value = {
            title: d.name,
            type: 'student',
            details: `校园中的学生成员。在全局视图中展示随机抽取的代表。`
          };
        } else {
          hoveredConnectionDetail.value = {
            title: d.name,
            type: 'activity',
            details: `校园活动。在全局视图中展示随机抽取的代表。`
          };
        }
      }
    })
    .on('mouseout', () => {
      // Reset opacity
      link.style('opacity', 1.0);
      node.style('opacity', 1.0);
      hoveredConnectionDetail.value = null;
    });

  // Color nodes based on type
  node.append('circle')
    .attr('r', (d) => {
      if (d.id === nodeKey('student', activeStudent.value || '')) return 22; // Focal node
      if (d.type === 'interest') return 14;
      return 10;
    })
    .attr('fill', (d) => {
      if (d.id === nodeKey('student', activeStudent.value || '')) return '#ec4899'; // Selected student: vibrant neon pink/rose
      if (d.type === 'student') return '#fd971f'; // Sublime Orange
      if (d.type === 'interest') return '#3b82f6'; // Deep blue
      return '#06b6d4'; // Cyan
    })
    .attr('stroke', (d) => {
      if (d.id === nodeKey('student', activeStudent.value || '')) return '#facc15'; // Yellow neon halo
      return '#0f172a';
    })
    .attr('stroke-width', (d) => {
      if (d.id === nodeKey('student', activeStudent.value || '')) return 3.5;
      return 2;
    })
    .attr('class', (d) => {
      if (d.id === nodeKey('student', activeStudent.value || '')) return 'node-focal-pulse';
      return d.type === 'interest' ? 'glow-cyan' : 'glow-orange';
    })
    .style('cursor', 'pointer');

  // Text labels
  node.append('text')
    .text((d) => d.name)
    .attr('dx', (d) => {
      if (d.id === nodeKey('student', activeStudent.value || '')) return 26;
      return d.type === 'interest' ? 18 : 14;
    })
    .attr('dy', 4)
    .attr('fill', '#f8fafc')
    .attr('font-size', '10px')
    .attr('font-weight', (d) => d.id === nodeKey('student', activeStudent.value || '') ? 'bold' : 'normal')
    .style('pointer-events', 'none');

  // 6. Bind ticking force
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    node.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
  });
};

onMounted(() => {
  loadMockData();
  window.addEventListener('resize', drawGraph);
});
</script>

<style scoped>
/* 1. Login Overlay & Categorized Picker */
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(11, 15, 25, 0.96);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  width: 620px;
  max-width: 100%;
  padding: 20px 24px;
  background-color: var(--panel-bg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  max-height: 95vh;
  overflow-y: auto;
}

.subtitle {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 14px;
}

.section-title {
  font-size: 13px;
  color: var(--accent-orange);
  margin-top: 14px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.label-bold {
  font-size: 13px;
  font-weight: bold;
}

.form-group input {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-orange);
}

.interests-picker-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.picker-section h5 {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  border-left: 2px solid var(--accent-cyan);
  padding-left: 6px;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.interest-tag {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.interest-tag:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.tag-active {
  background-color: rgba(253, 151, 31, 0.1) !important;
  border-color: rgba(253, 151, 31, 0.4) !important;
  color: #ffe0b2 !important;
  box-shadow: 0 0 10px rgba(253, 151, 31, 0.15);
}

.warning-text {
  color: #f87171;
  font-size: 11px;
  margin-bottom: 12px;
  font-weight: bold;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 13px;
  background-color: rgba(253, 151, 31, 0.1);
  border-color: rgba(253, 151, 31, 0.3);
  color: #ffb74d;
  margin-top: 10px;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 2. Main Dashboard & Sidebar Layout */
.dashboard {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
}

.sidebar {
  width: 330px;
  background-color: var(--panel-bg);
  border-right: 1px solid var(--border-color);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}
.logo .icon {
  font-size: 24px;
}

.card {
  background-color: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

/* Profile Panel Styles */
.profile-panel {
  background-color: rgba(253, 151, 31, 0.02);
}
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.profile-header h3 {
  font-size: 13px;
  margin: 0;
  color: var(--accent-orange);
}
.logout-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
}
.logout-btn:hover {
  color: #ef4444;
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.info-row {
  display: flex;
  justify-content: space-between;
}
.font-bold {
  font-weight: bold;
}
.registered-list h4 {
  font-size: 11px;
  margin: 0 0 6px 0;
  color: var(--text-secondary);
}
.registered-list ul {
  margin: 0;
  padding-left: 14px;
}
.signed-item {
  font-size: 11px;
  margin-bottom: 4px;
  list-style: none;
}
.empty-list-msg {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

.stats-panel h3, .register-panel h3 {
  font-size: 13px;
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sandbox-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 12px 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
}
.stat-row:last-child {
  margin-bottom: 0;
}

.stat-val {
  font-family: monospace;
  font-weight: bold;
}
.text-orange { color: #ffb74d; }
.text-cyan { color: #22d3ee; }

.divider {
  border: 0;
  border-top: 1px solid var(--border-color);
  margin: 14px 0;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.entry-form input {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 11px;
}
.entry-form input:focus {
  outline: none;
  border-color: var(--accent-orange);
}

.btn {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 4px;
  padding: 8px;
  font-size: 11px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}
.btn:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

/* 3. Main content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.header {
  position: relative;
  padding: 8px 16px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-icon {
  font-size: 16px;
  color: var(--text-secondary);
}
.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
}
.search-box input:focus {
  outline: none;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  z-index: 10;
  background-color: var(--panel-bg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  padding: 8px 0;
}
.sug-item {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
}
.sug-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--accent-orange);
}

/* Content grid */
.content-grid {
  display: flex;
  flex: 1;
  gap: 20px;
  min-height: 0;
}

.results-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding-right: 4px;
}

.welcome-card h2 {
  font-size: 18px;
  margin-top: 0;
}
.welcome-card p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
.select-self-btn {
  display: block;
  width: 100%;
  margin-top: 12px;
}
.tip-box {
  background-color: rgba(6, 182, 212, 0.04);
  border-left: 3px solid var(--accent-cyan);
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
}
.tip-box strong {
  font-size: 12px;
  color: var(--accent-cyan);
}
.tip-box p {
  margin: 4px 0 0 0;
  font-size: 12px;
}

.active-profile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}
.active-profile h2 {
  font-size: 14px;
  margin: 0;
}
.highlight {
  color: var(--accent-orange);
}
.btn-text {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}
.btn-text:hover {
  color: var(--accent-orange);
  text-decoration: underline;
}

.result-card h3 {
  font-size: 13px;
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

/* Accordion Collapsible Panels for recommendations */
.accordion-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.accordion-item {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.005);
  overflow: hidden;
}

.accordion-header {
  padding: 10px 14px;
  background-color: rgba(255, 255, 255, 0.015);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.accordion-header:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.accordion-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-primary);
}

.accordion-caret {
  font-size: 10px;
  color: var(--text-secondary);
}

.accordion-content {
  padding: 10px;
  border-top: 1px solid var(--border-color);
  max-height: 350px;
  overflow-y: auto;
}

.accordion-content ul {
  margin: 0;
  padding: 0;
}

.path-item {
  list-style: none;
  background-color: rgba(255,255,255,0.01);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
}
.path-item:last-child {
  margin-bottom: 0;
}

.path-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.path-flow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
}
.node {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}
.node.student {
  background-color: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  color: #e9d5ff;
}
.node.interest {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}
.node.activity {
  background-color: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: #99f6e4;
}
.arrow {
  color: var(--text-secondary);
  font-weight: bold;
}
.signup-btn {
  background-color: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #22d3ee;
  border-radius: 4px;
  font-size: 10px;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}
.signup-btn:hover {
  background-color: rgba(6, 182, 212, 0.3);
}
.btn-signed {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: var(--border-color) !important;
  color: var(--text-secondary) !important;
  cursor: not-allowed !important;
}

.empty-msg {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

/* Visualization column */
.visualization-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}
.vis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.vis-title-group {
  display: flex;
  flex-direction: column;
}
.vis-header h3 {
  font-size: 14px;
  margin: 0 0 4px 0;
}
.vis-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
}
.canvas-toggles {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
}
.toggle-group {
  display: flex;
  gap: 12px;
}
.neon-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s;
}
.neon-checkbox:hover {
  color: var(--text-primary);
}
.neon-checkbox input {
  display: none;
}
.checkbox-box {
  width: 12px;
  height: 12px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}
.neon-checkbox input:checked + .checkbox-box {
  background-color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.6);
}
.neon-checkbox input:checked + .checkbox-box::after {
  content: "";
  position: absolute;
  left: 3px;
  top: 1px;
  width: 4px;
  height: 6px;
  border: solid #090d16;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.limit-slider-group {
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 12px;
}
.slider-label {
  color: var(--text-secondary);
  white-space: nowrap;
}
.neon-slider {
  -webkit-appearance: none;
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
}
.neon-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-cyan);
  box-shadow: 0 0 5px var(--accent-cyan);
  cursor: pointer;
  transition: transform 0.1s;
}
.neon-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

/* Tooltip design */
.vis-tooltip {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 250px;
  background: rgba(18, 24, 38, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.1);
  border-radius: 8px;
  padding: 12px;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
}
.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 6px;
}
.tooltip-icon {
  font-size: 14px;
}
.tooltip-header h4 {
  margin: 0;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
}
.tooltip-body p {
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Animations and glow helper */
@keyframes focalPulse {
  0% {
    filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.6));
  }
  100% {
    filter: drop-shadow(0 0 16px rgba(236, 72, 153, 1));
  }
}
.node-focal-pulse {
  animation: focalPulse 1.5s infinite alternate;
}

.canvas-container {
  flex: 1;
  position: relative;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}
.canvas-hint {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  color: var(--text-secondary);
  pointer-events: none;
}

/* Simulated login badge styling */
.sandbox-badge {
  background-color: rgba(6, 182, 212, 0.08);
  border: 1px dashed rgba(6, 182, 212, 0.25);
  color: var(--accent-cyan);
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: bold;
}

/* Custom layout splitters */
.layout-splitter {
  width: 6px;
  background-color: transparent;
  cursor: col-resize;
  transition: background-color 0.2s, box-shadow 0.2s;
  z-index: 10;
  position: relative;
}
.layout-splitter:hover {
  background-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}
.vertical-splitter {
  height: 100%;
}

/* Profile avatar row styling */
.info-avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.profile-avatar {
  font-size: 32px;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  box-sizing: border-box;
}
.profile-texts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Cyber login screen avatar selector & live preview */
.form-group-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.form-split-row {
  display: flex;
  gap: 20px;
  margin-bottom: 14px;
}
.form-left-col {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.avatar-selector-dropdown {
  display: flex;
  align-items: center;
}
.avatar-select {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 10px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}
.avatar-select:focus {
  border-color: var(--accent-orange);
}

/* Live identity card layout */
.live-identity-card {
  background-color: rgba(168, 85, 247, 0.03);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
}
.live-identity-card h4 {
  font-size: 12px;
  margin: 0 0 10px 0;
  color: var(--accent-orange);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.live-card-body {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.live-avatar-preview {
  font-size: 36px;
  background-color: rgba(0,0,0,0.2);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.live-info-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.live-name-preview {
  font-size: 14px;
  font-weight: bold;
  color: var(--text-primary);
}
.live-persona-preview {
  font-size: 11px;
  font-weight: bold;
}
.live-interests-preview {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding-top: 8px;
}
.preview-tag {
  background-color: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.2);
  color: #e9d5ff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
}
.placeholder-text {
  font-size: 11px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Floating Zoom controls on canvas */
.zoom-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 10;
}
.zoom-btn {
  background-color: rgba(18, 24, 38, 0.85);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.zoom-btn:hover {
  background-color: rgba(6, 182, 212, 0.2);
  border-color: var(--accent-cyan);
  color: #cffafe;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
}

.text-pink { color: #f472b6; }
.text-green { color: #4ade80; }

/* Interest Filter Tabs */
.interest-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}
.filter-pill {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}
.filter-pill:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}
.tab-active {
  background-color: rgba(6, 182, 212, 0.15) !important;
  border-color: rgba(6, 182, 212, 0.4) !important;
  color: #cffafe !important;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.15);
}

/* Static accordion design (categorized lists) */
.accordion-header-static {
  padding: 10px 14px;
  background-color: rgba(255, 255, 255, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}
.accordion-content-static {
  padding: 12px;
}
.path-flow-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.match-reason {
  margin-top: 4px;
  padding-left: 6px;
  border-left: 2px solid rgba(255, 255, 255, 0.15);
}
.reason-text {
  font-size: 10px;
  letter-spacing: 0.2px;
}
.text-orange-light {
  color: #ffb74d;
}
.text-cyan-light {
  color: #a5f3fc;
}
.expand-toggle-btn {
  background: transparent;
  border: 1px dashed var(--border-color);
  color: var(--text-secondary);
  font-size: 10px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  text-align: center;
  transition: all 0.2s;
}
.expand-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}
.result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.result-card-header h3 {
  margin-bottom: 0 !important;
}
.card-hint {
  font-size: 10px;
  color: var(--text-secondary);
}

/* Two split columns recommendations layout */
.recommendations-row {
  display: flex;
  gap: 16px;
  width: 100%;
}
.rec-split-col {
  flex: 1;
  min-width: 0;
}
.height-100 {
  height: 100%;
}
.buddy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Canvas render pending screen overlay */
.canvas-render-pending {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(18, 24, 38, 0.88);
  backdrop-filter: blur(8px);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.pending-content {
  text-align: center;
  max-width: 320px;
}
.pending-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: pulseNeon 2s infinite ease-in-out;
}
.canvas-render-pending h4 {
  font-size: 15px;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}
.pending-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 20px 0;
}
.render-now-btn {
  padding: 10px 20px;
  font-size: 11px;
}

/* Post-signup modal popup redraw dialog */
.redraw-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(11, 15, 25, 0.85);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.redraw-modal-card {
  width: 420px;
  max-width: 100%;
  padding: 24px;
  text-align: center;
  background-color: var(--panel-bg);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
  border-color: var(--accent-cyan);
}
.modal-icon {
  font-size: 40px;
  color: var(--accent-cyan);
  margin-bottom: 12px;
  animation: pulseGlow 1.5s infinite alternate;
}
.redraw-modal-card h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}
.modal-activity-name {
  font-size: 13px;
  color: var(--accent-cyan);
  background-color: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.15);
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
  margin: 4px 0 12px 0;
}
.modal-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 20px 0;
}
.redraw-btn {
  width: 100%;
  padding: 10px;
  font-size: 12px;
}

@keyframes pulseNeon {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; text-shadow: 0 0 15px var(--accent-cyan); }
}
@keyframes pulseGlow {
  0% { text-shadow: 0 0 5px rgba(6, 182, 212, 0.2); }
  100% { text-shadow: 0 0 20px rgba(6, 182, 212, 0.7); }
}

/* Modal and Floating widgets styling */
.right-floating-widget {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  pointer-events: auto;
}
.floating-toggle-btn {
  padding: 10px 16px;
  font-size: 11px;
  font-weight: bold;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(253, 151, 31, 0.4);
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--panel-bg);
  border: 1px solid var(--accent-orange);
  color: var(--text-primary);
}
.floating-toggle-btn:hover {
  transform: translateY(-2px);
  background-color: rgba(253, 151, 31, 0.1);
  box-shadow: 0 4px 20px rgba(253, 151, 31, 0.6);
}
.prompt-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(8, 12, 21, 0.9);
  border: 1px solid var(--accent-cyan);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 11px;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
  animation: borderGlow 1.5s infinite alternate;
}
.prompt-text {
  color: var(--text-primary);
  font-weight: 500;
}
.prompt-btn {
  padding: 4px 8px;
  font-size: 10px;
}

.fullscreen-graph-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 400;
  background: rgba(8, 12, 21, 0.7);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}
.fullscreen-modal-card {
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  background: rgba(18, 24, 38, 0.85) !important;
  border: 1px solid rgba(6, 182, 212, 0.25) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.15) !important;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 24px !important;
  overflow: hidden;
  box-sizing: border-box;
}
.fullscreen-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}
.modal-controls-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.zoom-controls-modal {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px;
  border-radius: 6px;
}
.close-modal-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.close-modal-btn:hover {
  color: var(--accent-pink);
  background: rgba(236, 72, 153, 0.1);
  transform: scale(1.1);
}
.fullscreen-canvas-container {
  flex: 1;
  position: relative;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
}

@keyframes borderGlow {
  0% {
    border-color: rgba(6, 182, 212, 0.3);
    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
  }
  100% {
    border-color: rgba(6, 182, 212, 1);
    box-shadow: 0 4px 25px rgba(6, 182, 212, 0.5);
  }
}

/* Custom avatar picker grid */
.avatar-picker-grid {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  padding: 4px 0;
  justify-content: space-between;
}
.avatar-picker-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}
.avatar-picker-btn:hover {
  border-color: var(--accent-orange);
  background-color: rgba(253, 151, 31, 0.08);
  transform: translateY(-2px);
}
.avatar-picker-btn.avatar-active {
  border-color: var(--accent-orange);
  background-color: rgba(253, 151, 31, 0.15);
  box-shadow: 0 0 10px var(--accent-orange-glow);
  transform: scale(1.05);
}
.live-id-badge {
  font-size: 10px;
  background-color: rgba(253, 151, 31, 0.15);
  border: 1px solid var(--accent-orange);
  color: var(--accent-orange);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  font-family: monospace;
}

/* Buddy Search Section */
.buddy-search-container {
  margin-bottom: 16px;
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px;
}
.buddy-search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 6px 10px;
}
.buddy-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 11px;
  outline: none;
}
.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 10px;
  cursor: pointer;
}
.clear-search-btn:hover {
  color: var(--accent-orange);
}
.friend-matches-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 8px;
}
.friend-match-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  background-color: rgba(255, 255, 255, 0.01);
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.friend-match-item:hover {
  background-color: rgba(253, 151, 31, 0.03);
  border-color: rgba(253, 151, 31, 0.15);
}
.friend-match-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}
.friend-name {
  font-size: 11px;
  font-weight: bold;
  color: var(--text-primary);
}
.friend-shared-desc {
  font-size: 9px;
  color: var(--text-secondary);
}
.select-friend-btn {
  padding: 4px 8px;
  font-size: 9px;
  white-space: nowrap;
}
.friend-no-matches {
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  padding: 10px 0 0 0;
}
</style>
