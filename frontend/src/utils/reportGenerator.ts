import { useGraphStore } from '@/stores/graph'
import { GraphAlgorithms } from './graph-algorithms'
import { graphAnalyticsService } from '@/services/GraphAnalyticsService'

export interface RecommendedBuddy {
  name: string;
  jaccard: number;
  sharedInterests: string[];
}

// ─── Defensive HTML Escaping ────────────────────────────────────────────────
/**
 * Escapes HTML special characters in user-controlled strings to prevent XSS injection.
 * Applied to all user data (names, interests, activities) before interpolation into HTML templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Admin Diagnostic Data (shared between MD and HTML admin reports) ────────
export interface AdminDiagnosticData {
  studentsList: { name: string; degree: number }[]
  studentRank: number
  studentDegree: number
  studentPercentile: string
  isBridge: boolean
  bridgeScore: number
  socialRole: string
  socialRoleIcon: string
  diagnosisNote: string
  componentSize: number
  totalStudents: number
  compPct: string
  communityDiagnosis: string
  hubStudent: string | undefined
  hubPathStr: string
  graph: Map<string, Set<string>>
  privateStudents: Set<string>
}

/**
 * Computes all shared admin diagnostic metrics (social role, BFS component, hub path, etc.)
 * from the graph store. Used by both generateAdminMarkdownReport and generateAdminHtmlReport
 * to eliminate ~150 lines of duplicated logic.
 */
export function computeAdminDiagnosticData(name: string, useHtmlMarkup: boolean): AdminDiagnosticData {
  let graph: Map<string, Set<string>> = new Map()
  let privateStudents: Set<string> = new Set()
  let bridgeStudents: any[] = []

  try {
    const graphStore = useGraphStore()
    graph = graphStore.graph
    privateStudents = graphStore.privateStudents
    bridgeStudents = graphAnalyticsService.bridgeStudents.value
  } catch (_e) {
    // Fallback
  }

  // 1. Gather all student degree stats to compute rank/percentile
  const studentsList = Array.from(graph.keys())
    .filter(k => k.startsWith('student:'))
    .map(k => {
      const studentName = k.substring(8)
      return { name: studentName, degree: graph.get(k)?.size || 0 }
    })
    .sort((a, b) => b.degree - a.degree)

  const studentRank = studentsList.findIndex(s => s.name === name) + 1
  const studentDegree = graph.get(`student:${name}`)?.size || 0
  const studentPercentile = studentsList.length > 0
    ? ((studentsList.length - studentRank) / studentsList.length * 100).toFixed(1)
    : '0.0'

  const isBridge = bridgeStudents.some(b => b.name === name)
  const bridgeScore = bridgeStudents.find(b => b.name === name)?.score || 0

  let socialRole = '普通社交参与者'
  let socialRoleIcon = '🟡'
  let diagnosisNote = '该同学社交连接度一般，建议尝试参与更多跨主题活动，拓展本校社交圈。'

  if (studentDegree === 0) {
    socialRole = '暂无网络连接 (可积极建连)'
    socialRoleIcon = '🚨'
    diagnosisNote = '提示：该同学目前在校园社交网络中尚未与其他同学建立边连接。建议可以补充一些兴趣标签或报名一些热门的校园活动，以便系统更好地为其推荐校园搭子。'
  } else if (studentRank <= 15) {
    socialRole = '校园社交达人 (活跃核心)'
    socialRoleIcon = '👑'
    diagnosisNote = '分析：该同学在校园网络中具有极高的社交连接度，属于非常活跃的社交核心。可以继续保持积极的活动参与度，带动和发起更多有趣的搭子活动。'
  } else if (isBridge) {
    socialRole = '社群桥梁枢纽 (跨界联络人)'
    socialRoleIcon = '🌉'
    diagnosisNote = `分析：该同学在不同兴趣社群和朋友圈子中起着纽带桥梁作用（社交桥梁指数: ${bridgeScore}）。非常适合发起跨界活动，帮助更多不同领域的同学建立社交连接。`
  } else if (studentDegree >= 6) {
    socialRole = '活跃社交成员 (活动探索者)'
    socialRoleIcon = '🟢'
    diagnosisNote = '分析：该同学积极参与多项校园活动，兴趣广泛且社交连接度良好。建议保持活跃，发掘更多志趣相投的校园搭子。'
  }

  // Find connected component size using BFS
  const visited = new Set<string>()
  const queue = [`student:${name}`]
  let head = 0
  visited.add(`student:${name}`)
  while (head < queue.length) {
    const curr = queue[head++]
    for (const neighbor of graph.get(curr) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  const componentSize = Array.from(visited).filter(k => k.startsWith('student:')).length
  const totalStudents = studentsList.length
  const compPct = totalStudents > 0 ? ((componentSize / totalStudents) * 100).toFixed(1) : '0.0'

  // Community diagnosis text (with HTML or Markdown markup)
  const bold = (text: string) => useHtmlMarkup ? `<strong>${text}</strong>` : `**${text}**`
  let communityDiagnosis = ''
  if (componentSize === 1) {
    communityDiagnosis = `🚨 ${bold('社交孤立状态提示')}：该同学当前暂未在校园社交网络中建立任何连接。建议可以通过添加个人兴趣标签或报名参与活动来开启第一步。`
  } else if (Number(compPct) >= 80) {
    communityDiagnosis = `✅ ${bold('社交圈连通度极佳')}：该同学已融入全校的核心主社交网络，该网络覆盖了全校 ${componentSize} 名同学（占比 ${bold(compPct + '%')}），在全局网络中具备非常广泛的社交潜在匹配空间。`
  } else {
    communityDiagnosis = `⚠️ ${bold('处于局部社交圈')}：该同学当前被包含在一个包含 ${componentSize} 人（全校占比 ${bold(compPct + '%')}）的局部兴趣圈子中。如果希望结识更多不同领域的伙伴，可以尝试探索和报名其他跨学科/跨主题的活动。`
  }

  // Path to Social Hub Student
  const hubStudent = studentsList[0]?.name
  let hubPathStr = ''
  if (hubStudent && hubStudent !== name) {
    const pathResult = GraphAlgorithms.findPath(graph, name, hubStudent, privateStudents)
    if (pathResult) {
      const elements = pathResult.path.map(k => {
        const colonIdx = k.indexOf(':')
        const kind = k.substring(0, colonIdx)
        const label = k.substring(colonIdx + 1)
        const icon = kind === 'student' ? '👤' : (kind === 'interest' ? '🎯' : '🎉')
        const safeLabel = useHtmlMarkup ? escapeHtml(label) : label
        return `${icon}${safeLabel}`
      })
      hubPathStr = elements.join(' ➔ ')
    } else {
      hubPathStr = '❌ 无法建立联系：该同学与学校社交达人处于两个互不连通的独立社交分支中。'
    }
  } else {
    hubPathStr = '👑 该同学本身即为全校社交活跃度最高的核心达人之一。'
  }

  return {
    studentsList, studentRank, studentDegree, studentPercentile,
    isBridge, bridgeScore, socialRole, socialRoleIcon, diagnosisNote,
    componentSize, totalStudents, compPct, communityDiagnosis,
    hubStudent, hubPathStr, graph, privateStudents,
  }
}

// ─── Shared HTML Content Builders ───────────────────────────────────────────
function buildInterestsHtml(userInterests: string[], emptyMessage: string): string {
  if (userInterests.length > 0) {
    return userInterests.map(interest => `<span class="tag tag-primary">${escapeHtml(interest)}</span>`).join('')
  }
  return `<p class="empty-state">${emptyMessage}</p>`
}

function buildActivitiesHtml(
  name: string,
  acts: string[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string,
  emptyMessage: string
): string {
  if (acts.length === 0) return `<p class="empty-state">${emptyMessage}</p>`
  let html = ''
  acts.forEach((actName, idx) => {
    const shared = getSharedInterest(name, actName, 'activity')
    const safeName = escapeHtml(name)
    const safeAct = escapeHtml(actName)
    const safeShared = escapeHtml(shared)
    const pathStr = `student:${safeName} --(🎯${safeShared})--&gt; activity:${safeAct}`
    html += `
      <div class="activity-item">
        <div class="activity-name">${idx + 1}. ${safeAct}</div>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">所属兴趣圈: 🎯 <strong>${safeShared}</strong></div>
        <div class="activity-path">推荐纽带: ${pathStr}</div>
      </div>
    `
  })
  return html
}

function buildBuddiesHtml(buddiesList: RecommendedBuddy[], emptyMessage: string): string {
  if (buddiesList.length === 0) return `<p class="empty-state">${emptyMessage}</p>`
  let rows = ''
  buddiesList.forEach((buddy, rank) => {
    const pct = `${(buddy.jaccard * 100).toFixed(1)}%`
    const sharedStr = buddy.sharedInterests.map(s => escapeHtml(s)).join('、')
    rows += `
      <tr>
        <td>#${rank + 1}</td>
        <td><strong>${escapeHtml(buddy.name)}</strong></td>
        <td><span class="badge-percent">${pct}</span></td>
        <td>${sharedStr}</td>
      </tr>
    `
  })
  return `
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>推荐搭子</th>
          <th>匹配契合度</th>
          <th>共同兴趣</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

export function generateMarkdownReport(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): string {
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
    md.push(`您目前尚未登记 any 兴趣。`)
  }
  md.push(`\n---\n`)
  md.push(`## 🎉 智能活动推荐`)
  if (acts.length > 0) {
    md.push(`系统根据您的兴趣，为您推荐了以下尚未报名的活动：\n`)
    for (let idx = 0; idx < acts.length; idx++) {
      const actName = acts[idx]
      const shared = getSharedInterest(name, actName, 'activity')
      const pathStr = `student:${name} --(🎯${shared})--> activity:${actName}`
      md.push(`### ${idx + 1}. ${actName}`)
      md.push(`* **所属兴趣圈**: 🎯 \`${shared}\``)
      md.push(`* **推荐纽带**:`)
      md.push(`  \`${pathStr}\`\n`)
    }
  } else {
    md.push(`暂时没有基于您的兴趣推荐的活动。您可以尝试在侧边栏添加更多兴趣标签！`)
  }
  md.push(`\n---\n`)
  md.push(`## 🤝 志同道合的活动搭子`)
  if (buddiesList.length > 0) {
    md.push(`系统为您匹配了拥有共同兴趣圈子的同学：\n`)
    md.push(`| 排名 | 推荐搭子 | 匹配契合度 | 共同的兴趣 |`)
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
  md.push(`\n*快叫上新匹配的搭子，一起报名参加推荐的活动吧！*`)

  return md.join('\n')
}

/**
 * Builds the nodes and links data structure for the interactive SVG/Canvas graph
 * embedded in the HTML reports. Extracted to eliminate duplicate graphing logic.
 */
function buildHtmlReportGraphData(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): { nodesData: any[]; linksData: any[] } {
  const displayInterests = userInterests.slice(0, 4)
  const nodesData: any[] = [
    { id: `student:${name}`, label: name, type: 'student', x: 350, y: 200, size: 9, color: '#f43f5e' }
  ]
  const linksData: any[] = []

  displayInterests.forEach((tag, idx) => {
    const angle = (idx * Math.PI * 2) / Math.max(displayInterests.length, 1)
    const x = 350 + Math.cos(angle) * 95
    const y = 200 + Math.sin(angle) * 95
    nodesData.push({ id: `interest:${tag}`, label: tag, type: 'interest', x, y, size: 6.5, color: '#22d3ee' })
    linksData.push({ source: `student:${name}`, target: `interest:${tag}` })
  })

  const outerList: any[] = []
  acts.slice(0, 3).forEach(act => {
    const shared = getSharedInterest(name, act, 'activity')
    outerList.push({ name: act, type: 'activity', interest: shared, color: '#c084fc' })
  })
  buddiesList.slice(0, 4).forEach(buddy => {
    const shared = buddy.sharedInterests[0] || ''
    outerList.push({ name: buddy.name, type: 'buddy', interest: shared, color: '#10b981' })
  })

  outerList.forEach((item, idx) => {
    const angle = ((idx + 0.5) * Math.PI * 2) / Math.max(outerList.length, 1)
    const x = 350 + Math.cos(angle) * 170
    const y = 200 + Math.sin(angle) * 170
    nodesData.push({ id: `${item.type}:${item.name}`, label: item.name, type: item.type, x, y, size: 5.5, color: item.color })
    if (item.interest) {
      linksData.push({ source: `interest:${item.interest}`, target: `${item.type}:${item.name}` })
    } else {
      linksData.push({ source: `student:${name}`, target: `${item.type}:${item.name}` })
    }
  })

  return { nodesData, linksData }
}

function buildBaseHtmlReport(params: {
  title: string
  name: string
  subtitle: string
  primaryColor: string
  borderColor: string
  highlightColor: string
  interestsHtml: string
  actsHtml: string
  buddiesHtml: string
  nodesData: any[]
  linksData: any[]
  extraHtmlContent?: string
}): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(params.title)} — ${escapeHtml(params.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: rgba(30, 41, 59, 0.45);
      --text-color: #f1f5f9;
      --primary-color: ${params.primaryColor};
      --accent-color: #c084fc;
      --border-color: ${params.borderColor};
    }
    body {
      font-family: "Outfit", "Inter", "Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: linear-gradient(135deg, #090d16 0%, #0d121f 100%);
      color: var(--text-color);
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      width: 100%;
    }
    .header {
      background: linear-gradient(135deg, ${params.borderColor.replace('0.25', '0.15')} 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid var(--border-color);
      color: white;
      padding: 30px 40px;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.08);
      margin-bottom: 24px;
      position: relative;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--primary-color);
      text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
    }
    .header p {
      margin: 0;
      color: #94a3b8;
      font-size: 13px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 18px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(8px);
    }
    .card h2 {
      margin-top: 0;
      font-size: 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tag {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .tag-primary {
      background-color: ${params.primaryColor.startsWith('#') ? params.primaryColor + '14' : params.primaryColor.replace('rgb', 'rgba').replace(')', ', 0.08)')};
      border-color: ${params.primaryColor.startsWith('#') ? params.primaryColor + '40' : params.primaryColor.replace('rgb', 'rgba').replace(')', ', 0.25)')};
      color: var(--primary-color);
      box-shadow: 0 0 8px ${params.primaryColor.startsWith('#') ? params.primaryColor + '0d' : params.primaryColor.replace('rgb', 'rgba').replace(')', ', 0.05)')};
    }
    .activity-item {
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-name {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 4px;
    }
    .activity-path {
      background-color: rgba(0, 0, 0, 0.2);
      border-left: 3px solid var(--primary-color);
      padding: 10px;
      font-family: Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #94a3b8;
      border-radius: 6px;
      margin-top: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      text-align: left;
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    th {
      background-color: rgba(0, 0, 0, 0.15);
      font-weight: 600;
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      font-size: 14px;
    }
    .badge-percent {
      background-color: rgba(52, 199, 89, 0.1);
      color: #34c759;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
    }
    .empty-state {
      color: #8e8e93;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }
    .graph-hint {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 10px;
      text-align: center;
    }
    /* Admin specific CSS styles */
    .diag-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .diag-item-cell {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .diag-item-cell strong {
      color: #94a3b8;
      font-size: 13px;
    }
    .diag-item-cell span {
      font-weight: 600;
      font-size: 13px;
    }
    .diag-card {
      border-color: #ffb74d !important;
      background: rgba(255, 183, 77, 0.04) !important;
    }
    .diag-card h2 {
      color: #ffb74d !important;
      border-color: rgba(255, 183, 77, 0.15) !important;
    }
    .diag-note-box, .diag-status-box {
      margin-top: 12px;
      padding: 12px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 13px;
      line-height: 1.5;
      color: #cbd5e1;
    }
    .diag-note-box {
      margin-top: 18px;
    }
    .path-container {
      padding: 12px;
      background: rgba(0,0,0,0.25);
      border-left: 3px solid #ffb74d;
      border-radius: 6px;
      font-size: 13px;
      color: #e2e8f0;
      font-family: monospace;
      overflow-x: auto;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧭 ${escapeHtml(params.title)}</h1>
      <p>报告学生: <strong>${escapeHtml(params.name)}</strong> &nbsp;|&nbsp; ${params.subtitle}</p>
    </div>
    
    ${params.extraHtmlContent || ''}
    
    <div class="card">
      <h2>👤 个人画像与登记兴趣</h2>
      <div>${params.interestsHtml}</div>
    </div>
 
    <!-- Interactive SVG Graph Box -->
    <div class="card">
      <h2>📡 我的校园社交圈 (互动图谱)</h2>
      <div class="graph-container" style="display: flex; flex-direction: column; align-items: center; position: relative;">
        <svg id="interactive-svg" viewBox="0 0 700 400" style="width: 100%; max-width: 700px; height: 400px; background: rgba(0,0,0,0.15); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;"></svg>
        
        <!-- Tooltip overlay -->
        <div id="graph-tooltip" style="position: absolute; top: 15px; left: 15px; background: rgba(15, 23, 42, 0.85); border: 1.5px solid transparent; border-radius: 8px; padding: 10px 12px; font-size: 11px; display: none; pointer-events: none; width: 160px; box-sizing: border-box; z-index: 10;">
          <div id="tooltip-title" style="font-weight: bold; color: #ffffff; margin-bottom: 4px;"></div>
          <div id="tooltip-desc" style="color: #94a3b8; font-size: 10px;"></div>
        </div>

        <div class="graph-hint">💡 提示：将鼠标悬停在节点上，可以高亮显示并查看兴趣、搭子与活动关联的匹配细节。</div>
      </div>
    </div>
 
    <div class="card">
      <h2>🎉 智能活动推荐</h2>
      <div>${params.actsHtml}</div>
    </div>
 
    <div class="card">
      <h2>🤝 志同道合的活动搭子</h2>
      <div>${params.buddiesHtml}</div>
    </div>
  </div>
  
  <script>
    (function() {
      const nodes = ${JSON.stringify(params.nodesData)};
      const links = ${JSON.stringify(params.linksData)};
      
      const svg = document.getElementById('interactive-svg');
      const tooltip = document.getElementById('graph-tooltip');
      const tooltipTitle = document.getElementById('tooltip-title');
      const tooltipDesc = document.getElementById('tooltip-desc');
      if (!svg || !tooltip) return;

      // 1. Draw links
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'graph-link');
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        line.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
        line.setAttribute('stroke-width', '1.2');
        line.setAttribute('data-source', link.source);
        line.setAttribute('data-target', link.target);
        line.style.transition = 'stroke 0.2s, stroke-width 0.2s';
        svg.appendChild(line);
      });

      // 2. Draw nodes
      nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'graph-node');
        g.setAttribute('id', node.id);
        g.setAttribute('data-label', node.label);
        g.setAttribute('data-type', node.type);
        g.setAttribute('transform', 'translate(' + node.x + ', ' + node.y + ')');
        g.style.cursor = 'pointer';

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', node.size);
        circle.setAttribute('fill', node.color);
        circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
        circle.setAttribute('stroke-width', '1');
        circle.style.transition = 'r 0.2s, stroke-width 0.2s, filter 0.2s';
        g.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('y', String(-(node.size + 8)));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#cbd5e1');
        text.setAttribute('font-size', '10');
        text.setAttribute('font-family', 'Outfit, Inter, sans-serif');
        text.style.userSelect = 'none';
        text.style.transition = 'fill 0.2s, font-weight 0.2s';
        text.textContent = node.label;
        g.appendChild(text);

        svg.appendChild(g);
      });

      // 3. Setup event listeners
      const nodeGroups = svg.querySelectorAll('.graph-node');
      const linkLines = svg.querySelectorAll('.graph-link');

      nodeGroups.forEach(g => {
        const nodeId = g.getAttribute('id');
        const nodeLabel = g.getAttribute('data-label');
        const nodeType = g.getAttribute('data-type');
        const circle = g.querySelector('circle');
        const text = g.querySelector('text');
        const baseColor = circle.getAttribute('fill');
        const baseSize = parseFloat(circle.getAttribute('r'));

        g.addEventListener('mouseenter', () => {
          circle.setAttribute('r', baseSize + 3.5);
          circle.setAttribute('stroke', baseColor);
          circle.setAttribute('stroke-width', '2.5');
          circle.style.filter = 'drop-shadow(0 0 6px ' + baseColor + ')';
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('fill', '#ffffff');

          tooltip.style.display = 'block';
          tooltip.style.borderColor = baseColor;
          tooltipTitle.textContent = nodeLabel;
          const typeLabel = nodeType === 'student' ? '个人姓名' : 
                            (nodeType === 'interest' ? '兴趣标签' : 
                            (nodeType === 'activity' ? '推荐活动' : '匹配同学'));
          tooltipDesc.textContent = '类型: ' + typeLabel;

          linkLines.forEach(line => {
            const src = line.getAttribute('data-source');
            const tgt = line.getAttribute('data-target');
            if (src === nodeId || tgt === nodeId) {
              line.setAttribute('stroke', baseColor);
              line.setAttribute('stroke-width', '2.5');
              line.style.filter = 'drop-shadow(0 0 5px ' + baseColor + ')';
            } else {
              line.setAttribute('stroke', 'rgba(255, 255, 255, 0.02)');
            }
          });
        });

        g.addEventListener('mouseleave', () => {
          circle.setAttribute('r', baseSize);
          circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
          circle.setAttribute('stroke-width', '1');
          circle.style.filter = 'none';
          text.setAttribute('font-weight', 'normal');
          text.setAttribute('fill', '#cbd5e1');

          tooltip.style.display = 'none';

          linkLines.forEach(line => {
            line.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
            line.setAttribute('stroke-width', '1.2');
            line.style.filter = 'none';
          });
        });
      });
    })();
  </script>
</body>
</html>
  `;
}

export function generateHtmlReport(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): string {
  const interestsHtml = buildInterestsHtml(userInterests, '您目前尚未登记 any 兴趣。')
  const actsHtml = buildActivitiesHtml(name, acts, getSharedInterest, '暂时没有基于您的兴趣推荐的活动。')
  const buddiesHtml = buildBuddiesHtml(buddiesList, '暂时没有找到与您拥有共同兴趣的学生。')

  const { nodesData, linksData } = buildHtmlReportGraphData(
    name,
    userInterests,
    acts,
    buddiesList,
    getSharedInterest
  )

  return buildBaseHtmlReport({
    title: 'Campus Buddy 个性化校园推荐报告',
    name,
    subtitle: `报告学生: <strong>${escapeHtml(name)}</strong>`,
    primaryColor: '#22d3ee',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    highlightColor: '#22d3ee',
    interestsHtml,
    actsHtml,
    buddiesHtml,
    nodesData,
    linksData
  })
}

export function generateAdminMarkdownReport(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): string {
  const d = computeAdminDiagnosticData(name, false)

  // Start assembling markdown
  let md: string[] = []
  md.push(`# 📊 Campus Buddy 社交匹配与社交圈分析报告 — ${name}`)
  md.push(`\n> **报告生成时间**: ${new Date().toLocaleDateString('zh-CN')} | **管理权限**: 全局管理员`)
  md.push(`\n---\n`)
  
  md.push(`## 🧭 一、校园社交定位与中心度分析`)
  md.push(`* **网络定位**: ${d.socialRoleIcon} **${d.socialRole}**`)
  md.push(`* **直连度数 (Degree)**: \`${d.studentDegree}\``)
  md.push(`* **全校排名**: 第 **${d.studentRank}** 名 (超越全校 \`${d.studentPercentile}%\` 的学生)`)
  md.push(`* **社群连通覆盖率**: \`${d.compPct}%\` (共 ${d.componentSize} 名学生与该生连通)`)
  md.push(`\n**分析建议**：\n> ${d.diagnosisNote}`)
  md.push(`\n**连通状态**：\n> ${d.communityDiagnosis}`)
  md.push(`\n---\n`)

  md.push(`## 🔗 二、与校园核心社交达人的连接路径`)
  md.push(`与学校最活跃核心达人 (**${d.hubStudent}**) 的最短路径：\n`)
  md.push(`\`${d.hubPathStr}\``)
  md.push(`\n*注：该路径基于 BFS 最短路径算法生成，已自动屏蔽途中开启了隐私模式的同学节点。*`)
  md.push(`\n---\n`)

  md.push(`## 👤 三、登记的兴趣与个人标签`)
  if (userInterests.length > 0) {
    for (const interest of userInterests) {
      md.push(`* **${interest}**`)
    }
  } else {
    md.push(`该同学目前在系统内尚未登记任何兴趣倾向。`)
  }
  md.push(`\n---\n`)

  md.push(`## 🎉 四、定向智能活动推荐`)
  if (acts.length > 0) {
    for (let idx = 0; idx < acts.length; idx++) {
      const actName = acts[idx]
      const shared = getSharedInterest(name, actName, 'activity')
      const pathStr = `student:${name} --(🎯${shared})--> activity:${actName}`
      md.push(`### ${idx + 1}. ${actName}`)
      md.push(`* **匹配兴趣**: 🎯 \`${shared}\``)
      md.push(`* **匹配路径**: \`${pathStr}\``)
    }
  } else {
    md.push(`暂无活动推荐。`)
  }
  md.push(`\n---\n`)

  md.push(`## 🤝 五、推荐的同行匹配搭子`)
  if (buddiesList.length > 0) {
    md.push(`| 排名 | 推荐搭子 | 匹配契合度 | 共同兴趣 |`)
    md.push(`| --- | --- | --- | --- |`)
    for (let rank = 0; rank < buddiesList.length; rank++) {
      const buddy = buddiesList[rank]
      const pct = `${(buddy.jaccard * 100).toFixed(1)}%`
      const sharedStr = buddy.sharedInterests.join('、')
      md.push(`| #${rank + 1} | **${buddy.name}** | ${pct} | ${sharedStr} |`)
    }
  } else {
    md.push(`暂无匹配的同伴。`)
  }

  return md.join('\n')
}

export function generateAdminHtmlReport(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): string {
  const d = computeAdminDiagnosticData(name, true)
  const interestsHtml = buildInterestsHtml(userInterests, '目前尚未登记任何兴趣倾向。')
  const actsHtml = buildActivitiesHtml(name, acts, getSharedInterest, '暂时没有基于该生兴趣推荐的活动。')
  const buddiesHtml = buildBuddiesHtml(buddiesList, '暂时没有找到具有共同兴趣的搭子。')

  const { nodesData, linksData } = buildHtmlReportGraphData(
    name,
    userInterests,
    acts,
    buddiesList,
    getSharedInterest
  )

  const extraHtml = `
    <!-- Diagnostic Panel -->
    <div class="card diag-card">
      <h2>🧭 校园社交定位与分析指标</h2>
      <div class="diag-grid">
        <div class="diag-item-cell">
          <strong>网络位置定位</strong>
          <span style="color: #ffb74d;">${d.socialRoleIcon} ${escapeHtml(d.socialRole)}</span>
        </div>
        <div class="diag-item-cell">
          <strong>直连度数 (Degree)</strong>
          <span class="badge-percent" style="background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.2); font-size: 13px; padding: 2px 6px;">${d.studentDegree}</span>
        </div>
        <div class="diag-item-cell">
          <strong>全校度数排名</strong>
          <span>第 ${d.studentRank} 名 (超越全校 ${d.studentPercentile}% 的学生)</span>
        </div>
        <div class="diag-item-cell">
          <strong>社群连通覆盖率</strong>
          <span>${d.compPct}% (共 ${d.componentSize} 人)</span>
        </div>
      </div>
      <div class="diag-note-box">
        <strong>分析建议：</strong>${d.diagnosisNote}
      </div>
      <div class="diag-status-box">
        <strong>连通状态：</strong>${d.communityDiagnosis}
      </div>
    </div>

    <!-- Relationship Path to Hub -->
    <div class="card">
      <h2>🔗 与全校核心社交人物的关联路径</h2>
      <div class="path-container">
        ${d.hubPathStr}
      </div>
      <p style="font-size: 11px; color: #64748b; margin-top: 6px; margin-bottom: 0;">* 注：路径通过广度优先搜索 (BFS) 遍历，已自动避开途中开启了隐私保护模式的同学节点。</p>
    </div>
  `

  return buildBaseHtmlReport({
    title: 'Campus Buddy 社交匹配与社交圈分析报告',
    name,
    subtitle: `报告学生: <strong>${escapeHtml(name)}</strong> &nbsp;|&nbsp; 级别: 全局管理员`,
    primaryColor: '#ffb74d',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    highlightColor: '#ffb74d',
    interestsHtml,
    actsHtml,
    buddiesHtml,
    nodesData,
    linksData,
    extraHtmlContent: extraHtml
  });
}
