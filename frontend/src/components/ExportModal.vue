<template>
  <div v-if="visible" class="export-modal-overlay" @click.self="close">
    <div class="export-modal-card">
      <!-- Close button -->
      <button @click="close" class="close-export-btn" title="关闭" aria-label="关闭">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Header -->
      <div class="export-modal-header">
        <h3>
          <span class="export-header-glow">🧭</span>
          导出个性化匹配与方向推荐报告
        </h3>
        <p>支持将您的专属画像、活动匹配路径、相似搭子及社区拓扑指标一键保存至本地</p>
      </div>

      <!-- Options -->
      <div class="export-options-list">
        <!-- MD -->
        <div class="export-option-card opt-md" @click="exportMarkdown">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="10" y1="9" x2="8" y2="11"></line>
              <line x1="8" y1="11" x2="10" y2="13"></line>
              <line x1="14" y1="9" x2="16" y2="11"></line>
              <line x1="16" y1="11" x2="14" y2="13"></line>
              <line x1="12" y1="9" x2="12" y2="15"></line>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">Markdown 文档 (.md)</span>
            <span class="export-option-desc">便于导入 Obsidian 或 Notion 知识库，轻量纯文本</span>
          </div>
        </div>

        <!-- HTML -->
        <div class="export-option-card opt-html" @click="exportHtml">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">离线 HTML 网页 (.html)</span>
            <span class="export-option-desc">包含苹果风卡片式排版与色彩设计，支持双击离线浏览</span>
          </div>
        </div>

        <!-- PDF -->
        <div class="export-option-card opt-pdf" @click="exportPdf">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">学术 PDF 报告 (.pdf)</span>
            <span class="export-option-desc">高对比度分页排版，自动调起浏览器打印，完美输出为PDF文件</span>
          </div>
        </div>

        <!-- PNG -->
        <div class="export-option-card opt-png" @click="exportPng">
          <div class="export-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03457 19.176 5.12257 19.264 5.16315 19.373C5.20373 19.482 5.19502 19.5992 5.17761 19.8337L5.07447 21.2185C5.03666 21.7251 5.48512 22.1242 5.98687 22.0468L7.49132 21.8148C7.68367 21.7852 7.77984 21.7704 7.87157 21.7951C7.9633 21.8197 8.04169 21.8812 8.19846 22.0042C9.35122 22.909 10.793 23.4357 12.3333 23.4357" />
              <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/>
              <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/>
              <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/>
              <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div class="export-option-info">
            <span class="export-option-title">精美分享海报 (.png)</span>
            <span class="export-option-desc">生成极具科技感的立体点云匹配海报，适合朋友圈及群分享</span>
          </div>
        </div>
      </div>

      <!-- Temp Print Container for PDF -->
      <iframe ref="printIframeRef" class="hidden-print-iframe"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { currentUser, userInterestTags, userPersona } from '@/composables/useAuth'
import { recommendations } from '@/composables/useRecommendations'
import { useGraphStore } from '@/stores/graph'
import { useRecommendationStore } from '@/stores/recommendation'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const printIframeRef = ref<HTMLIFrameElement | null>(null)

const close = () => {
  emit('close')
}
const generateMarkdownReport = () => {
  const name = currentUser.value
  if (!name) return ''
  const userInterests = userInterestTags.value
  const recStore = useRecommendationStore()
  const acts = recommendations.value.activities
  // Limit buddies to top 10
  const buddiesList = recommendations.value.buddies.slice(0, 10)

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
  md.push(`## 🤝 志同道合的活动搭子（按 Jaccard 相似度排序，至多推荐 10 位）`)
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
  md.push(`\n*快叫上新匹配的搭子，一起报名参加推荐的活动吧！*`)

  return md.join('\n')
}

const exportMarkdown = () => {
  const content = generateMarkdownReport()
  if (!content) return
  // Prepend UTF-8 BOM \ufeff to prevent gibberish on Windows
  const blob = new Blob(['\ufeff' + content], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${currentUser.value}_校园活动搭子匹配推荐报告.md`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── 2. Generate HTML Report ──────────────────────────────────────────────────
const generateHtmlReport = () => {
  const name = currentUser.value
  if (!name) return ''
  const userInterests = userInterestTags.value
  const recStore = useRecommendationStore()
  const acts = recommendations.value.activities
  // Limit buddies to top 10
  const buddiesList = recommendations.value.buddies.slice(0, 10)

  let interestsHtml = ''
  if (userInterests.length > 0) {
    interestsHtml = userInterests.map(interest => `<span class="tag tag-primary">${interest}</span>`).join('')
  } else {
    interestsHtml = '<p class="empty-state">您目前尚未登记 any 兴趣。</p>'
  }

  let actsHtml = ''
  if (acts.length > 0) {
    acts.forEach((actName, idx) => {
      const shared = recStore.getSharedInterest(name, actName, 'activity')
      const pathStr = `student:${name} ----&gt; interest:${shared} ----&gt; activity:${actName}`
      actsHtml += `
        <div class="activity-item">
          <div class="activity-name">${idx + 1}. ${actName}</div>
          <div style="font-size: 13px; color: #8e8e93; margin-top: 4px;">所属兴趣圈: 🎯 <strong>${shared}</strong></div>
          <div class="activity-path">推荐路径: ${pathStr}</div>
        </div>
      `
    })
  } else {
    actsHtml = '<p class="empty-state">暂时没有基于您的兴趣推荐的活动。</p>'
  }

  let buddiesHtml = ''
  if (buddiesList.length > 0) {
    let rows = ''
    buddiesList.forEach((buddy, rank) => {
      const pct = `${(buddy.jaccard * 100).toFixed(1)}%`
      const sharedStr = buddy.sharedInterests.join('、')
      rows += `
        <tr>
          <td>#${rank + 1}</td>
          <td><strong>${buddy.name}</strong></td>
          <td><span class="badge-percent">${pct}</span></td>
          <td>${sharedStr}</td>
        </tr>
      `
    })
    buddiesHtml = `
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>搭子姓名</th>
            <th>兴趣重合度</th>
            <th>共同的兴趣</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `
  } else {
    buddiesHtml = '<p class="empty-state">暂时没有找到与您拥有共同兴趣的学生。</p>'
  }

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Campus Buddy 个性化校园推荐报告 — ${name}</title>
  <style>
    :root {
      --bg-color: #f4f7f6;
      --card-bg: #ffffff;
      --text-color: #1c1c1e;
      --primary-color: #007aff;
      --accent-color: #34c759;
      --border-color: #e5e5ea;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      width: 100%;
    }
    .header {
      background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
      color: white;
      padding: 40px;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0, 122, 255, 0.15);
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 0;
      opacity: 0.85;
      font-size: 14px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 18px;
      padding: 30px;
      margin-bottom: 24px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border-color);
    }
    .card h2 {
      margin-top: 0;
      font-size: 20px;
      border-bottom: 1px solid #f2f2f7;
      padding-bottom: 12px;
      color: #1c1c1e;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tag {
      display: inline-block;
      background-color: #f2f2f7;
      color: #1c1c1e;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .tag-primary {
      background-color: rgba(0, 122, 255, 0.08);
      color: #007aff;
    }
    .activity-item {
      padding: 16px 0;
      border-bottom: 1px solid #f2f2f7;
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-name {
      font-size: 16px;
      font-weight: 700;
      color: #1c1c1e;
      margin-bottom: 4px;
    }
    .activity-path {
      background-color: #f8f9fa;
      border-left: 3px solid #007aff;
      padding: 10px;
      font-family: Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #48484a;
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
      border-bottom: 1px solid var(--border-color);
    }
    th {
      background-color: #f2f2f7;
      font-weight: 600;
      color: #8e8e93;
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧭 Campus Buddy 校园活动匹配报告</h1>
      <p>姓名: <strong>${name}</strong> &nbsp;|&nbsp; 报告时间: ${new Date().toLocaleDateString('zh-CN')}</p>
    </div>
    
    <div class="card">
      <h2>👤 个人画像与登记兴趣</h2>
      <div>${interestsHtml}</div>
    </div>

    <div class="card">
      <h2>🎉 智能活动推荐（两跳关系路径）</h2>
      <div>${actsHtml}</div>
    </div>

    <div class="card">
      <h2>🤝 志同道合的活动搭子 (Jaccard, 至多推荐 10 位)</h2>
      <div>${buddiesHtml}</div>
    </div>
  </div>
</body>
</html>
  `
}

const exportHtml = () => {
  const content = generateHtmlReport()
  if (!content) return
  // Prepend UTF-8 BOM \ufeff to prevent gibberish on Windows
  const blob = new Blob(['\ufeff' + content], { type: 'text/html;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${currentUser.value}_校园活动搭子匹配推荐报告.html`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── 3. Generate PDF Report via Hidden Iframe Print ─────────────────────────
const exportPdf = () => {
  const name = currentUser.value
  if (!name) return

  const iframe = printIframeRef.value
  if (!iframe) return

  const htmlContent = generateHtmlReport()
  
  const printStyles = `
    <style>
      @media print {
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
          padding: 0 !important;
          margin: 20mm 15mm !important;
        }
        .container {
          box-shadow: none !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        .header {
          background: none !important;
          color: #000000 !important;
          box-shadow: none !important;
          padding: 0 0 15px 0 !important;
          border-bottom: 2px solid #000000 !important;
          border-radius: 0 !important;
          margin-bottom: 24px !important;
        }
        .header h1 {
          color: #000000 !important;
          font-size: 24px !important;
        }
        .card {
          box-shadow: none !important;
          border: none !important;
          padding: 15px 0 !important;
          margin-bottom: 15px !important;
          page-break-inside: avoid !important;
        }
        .card h2 {
          font-size: 16px !important;
          border-bottom: 1.5px solid #000000 !important;
          color: #000000 !important;
          padding-bottom: 6px !important;
        }
        .tag {
          border: 1px solid #000000 !important;
          background: none !important;
          color: #000000 !important;
          padding: 3px 8px !important;
          border-radius: 4px !important;
        }
        .activity-path {
          background-color: #f2f2f2 !important;
          border-left: 3px solid #000000 !important;
          color: #000000 !important;
          padding: 8px !important;
          font-size: 11px !important;
        }
        table {
          margin-top: 10px !important;
        }
        th {
          background-color: #f2f2f2 !important;
          color: #000000 !important;
          border-bottom: 1.5px solid #000000 !important;
        }
        td {
          border-bottom: 1px solid #e5e5e5 !important;
        }
        .badge-percent {
          background: none !important;
          border: 1px solid #000000 !important;
          color: #000000 !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
        }
        .stats-row {
          gap: 10px !important;
        }
        .stat-box {
          background-color: #f2f2f2 !important;
          border: 1px solid #e5e5e5 !important;
          padding: 12px !important;
        }
        .stat-value {
          color: #000000 !important;
          font-size: 20px !important;
        }
      }
    </style>
  `
  
  const finalDoc = htmlContent.replace('</head>', `${printStyles}</head>`)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) return

  doc.open()
  doc.write(finalDoc)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
  }, 250)
}

// ─── 4. Generate PNG Share Card via HTML5 Canvas ───────────────────────────
const exportPng = () => {
  const name = currentUser.value
  if (!name) return

  const userInterests = userInterestTags.value
  const recStore = useRecommendationStore()
  const graphStore = useGraphStore()
  const acts = recommendations.value.activities
  const buddiesList = recommendations.value.buddies.slice(0, 10)
  const persona = userPersona.value || '校园探索者'

  // Poster Size (High-Res 800x1200)
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 1200
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 1. Dark Neon Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1200)
  bgGrad.addColorStop(0, '#090d16')
  bgGrad.addColorStop(0.3, '#0b1120')
  bgGrad.addColorStop(0.8, '#1e1b4b')
  bgGrad.addColorStop(1, '#080710')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 800, 1200)

  // 2. Tech Decal / Grid Background
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)'
  ctx.lineWidth = 1
  for (let i = 0; i < 800; i += 40) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 1200)
    ctx.stroke()
  }
  for (let j = 0; j < 1200; j += 40) {
    ctx.beginPath()
    ctx.moveTo(0, j)
    ctx.lineTo(800, j)
    ctx.stroke()
  }

  // 3. Cybernetic Constellation / Point Cloud matching visualizer
  const nodes: { x: number; y: number; size: number; color: string; label?: string }[] = []
  
  // User Focus Node (Rose pink glow)
  nodes.push({ x: 400, y: 320, size: 10, color: '#f43f5e', label: `我: ${name}` })
  
  // Interest nodes (Cyan neon glow)
  const displayInterests = userInterests.slice(0, 3)
  displayInterests.forEach((interest, idx) => {
    const angle = (idx * Math.PI * 2) / Math.max(displayInterests.length, 1)
    const dist = 95
    nodes.push({
      x: 400 + Math.cos(angle) * dist,
      y: 320 + Math.sin(angle) * dist,
      size: 6.5,
      color: '#06b6d4',
      label: interest
    })
  })

  // Buddy nodes (Emerald green glow)
  const displayBuddies = buddiesList.slice(0, 3)
  displayBuddies.forEach((buddy, idx) => {
    const angle = ((idx + 0.5) * Math.PI * 2) / Math.max(displayBuddies.length, 1)
    const dist = 175
    nodes.push({
      x: 400 + Math.cos(angle) * dist,
      y: 320 + Math.sin(angle) * dist,
      size: 5.5,
      color: '#10b981',
      label: buddy.name
    })
  })

  // Random decorative point cloud stars in background
  for (let i = 0; i < 30; i++) {
    nodes.push({
      x: 80 + Math.random() * 640,
      y: 180 + Math.random() * 280,
      size: 1.5 + Math.random() * 2,
      color: Math.random() > 0.55 ? 'rgba(34, 211, 238, 0.25)' : 'rgba(168, 85, 247, 0.25)'
    })
  }

  // Draw node connectors (constellation lines)
  ctx.lineWidth = 1
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < 140) {
        const opacity = (1 - dist / 140) * 0.16
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.stroke()
      }
    }
  }

  // Render glow nodes
  nodes.forEach(node => {
    ctx.shadowColor = node.color
    ctx.shadowBlur = node.size * 2
    ctx.fillStyle = node.color
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
    ctx.fill()
    
    // Clear shadow blur for rendering labels
    ctx.shadowBlur = 0
    
    if (node.label) {
      ctx.fillStyle = '#cbd5e1'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y - node.size - 6)
    }
  })

  // 4. Header Section
  ctx.textAlign = 'center'
  ctx.fillStyle = '#22d3ee'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText('🧭 CAMPUS BUDDY', 400, 68)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.fillText('— 校园智能活动与社交匹配网络图谱 —', 400, 95)

  // 5. Profile card at the top
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)'
  ctx.lineWidth = 1
  drawRoundRect(ctx, 80, 120, 640, 75, 12)
  ctx.fill()
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffb74d'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText(name, 110, 166)

  // Persona Badge
  ctx.fillStyle = '#a855f7'
  const nameWidth = ctx.measureText(name).width
  drawRoundRect(ctx, 110 + nameWidth + 15, 146, 85, 24, 12)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(persona, 110 + nameWidth + 15 + 42, 162)

  // Report Time info
  ctx.textAlign = 'right'
  ctx.fillStyle = '#64748b'
  ctx.font = '12px sans-serif'
  ctx.fillText(`匹配报告生成时间: ${new Date().toLocaleDateString('zh-CN')}`, 700, 162)

  // 6. Statistics Row
  const boxW = 195
  const boxH = 65
  const boxG = 27
  const startX = 80
  
  const stats = [
    { value: userInterests.length.toString(), label: '登记兴趣倾向' },
    { value: acts.length.toString(), label: '推荐校园活动' },
    { value: buddiesList.length.toString(), label: '智能匹配搭子' }
  ]

  stats.forEach((stat, idx) => {
    const sX = startX + idx * (boxW + boxG)
    const sY = 520
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    drawRoundRect(ctx, sX, sY, boxW, boxH, 10)
    ctx.fill()
    ctx.stroke()
    
    ctx.textAlign = 'center'
    ctx.fillStyle = '#22d3ee'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(stat.value, sX + boxW / 2, sY + 30)
    
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px sans-serif'
    ctx.fillText(stat.label, sX + boxW / 2, sY + 50)
  })

  // 7. Activity Recommendations Box
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('🎯 智能活动推荐及两跳路径解释', 80, 625)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)'
  drawRoundRect(ctx, 80, 642, 640, 195, 12)
  ctx.fill()
  ctx.stroke()

  if (acts.length > 0) {
    const drawActs = acts.slice(0, 2)
    drawActs.forEach((actName, idx) => {
      const aY = 642 + 25 + idx * 80
      const shared = recStore.getSharedInterest(name, actName, 'activity')
      const pathStr = `student:${name} --(🎯${shared})--> activity:${actName}`
      
      // Index Circle Icon
      ctx.fillStyle = 'rgba(34, 211, 238, 0.08)'
      ctx.beginPath()
      ctx.arc(115, aY + 12, 14, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.textAlign = 'center'
      ctx.fillStyle = '#22d3ee'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText((idx + 1).toString(), 115, aY + 16)
      
      // Activity Title
      ctx.textAlign = 'left'
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(actName, 145, aY + 8)
      
      // Connection Hops
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px Monaco, monospace'
      ctx.fillText(pathStr, 145, aY + 28)
    })
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#64748b'
    ctx.font = '13px sans-serif'
    ctx.fillText('您目前尚未登记兴趣，去侧边栏添加兴趣来获取匹配吧！', 400, 740)
  }

  // 8. Match Buddies Box
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('🤝 志同道合的活动搭子匹配', 80, 875)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)'
  drawRoundRect(ctx, 80, 892, 640, 215, 12)
  ctx.fill()
  ctx.stroke()

  if (buddiesList.length > 0) {
    const drawBuddies = buddiesList.slice(0, 3)
    drawBuddies.forEach((buddy, idx) => {
      const bY = 892 + 20 + idx * 62
      
      // Match Rank
      ctx.textAlign = 'left'
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText(`#${idx + 1}`, 110, bY + 25)
      
      // Name
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(buddy.name, 155, bY + 25)
      
      // Matching visual progress bar
      const pctVal = `${(buddy.jaccard * 100).toFixed(0)}%`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
      drawRoundRect(ctx, 230, bY + 12, 120, 12, 6)
      ctx.fill()
      
      ctx.fillStyle = '#10b981'
      drawRoundRect(ctx, 230, bY + 12, Math.max(12, 120 * buddy.jaccard), 12, 6)
      ctx.fill()
      
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(pctVal, 365, bY + 23)
      
      // Shared interests
      ctx.fillStyle = '#64748b'
      ctx.font = '11px sans-serif'
      ctx.fillText('共同兴趣: ' + buddy.sharedInterests.slice(0, 3).join(', '), 420, bY + 23)
    })
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#64748b'
    ctx.font = '13px sans-serif'
    ctx.fillText('暂时没有找到匹配的搭子，完善您的兴趣圈子试试吧！', 400, 1000)
  }

  // 9. Poster Decal / Footer info
  ctx.textAlign = 'center'
  ctx.fillStyle = '#475569'
  ctx.font = '10px "Outfit", "Inter", sans-serif'
  ctx.fillText('CAMPUS BUDDY · DATA STRUCTURES & ALGORITHMS PROJECT WORK', 400, 1150)
  ctx.fillText('Powered by BFS Connected Components & Jaccard Similarity Algorithms', 400, 1168)

  // Download logic
  const link = document.createElement('a')
  link.download = `${name}_校园活动搭子匹配海报.png`
  link.href = canvas.toDataURL('image/png')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}
</script>

<style scoped src="./ExportModal.css"></style>
