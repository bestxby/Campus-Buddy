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
  md.push(`## 🎉 智能活动推荐`)
  if (acts.length > 0) {
    md.push(`系统根据您的兴趣，为您推荐了以下尚未报名的活动：\n`)
    for (let idx = 0; idx < acts.length; idx++) {
      const actName = acts[idx]
      const shared = recStore.getSharedInterest(name, actName, 'activity')
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
      const pathStr = `student:${name} --(🎯${shared})--> activity:${actName}`
      actsHtml += `
        <div class="activity-item">
          <div class="activity-name">${idx + 1}. ${actName}</div>
          <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">所属兴趣圈: 🎯 <strong>${shared}</strong></div>
          <div class="activity-path">推荐纽带: ${pathStr}</div>
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
  } else {
    buddiesHtml = '<p class="empty-state">暂时没有找到与您拥有共同兴趣的学生。</p>'
  }

  const displayInterests = userInterests.slice(0, 4)
  const nodesData: any[] = [
    { id: `student:${name}`, label: name, type: 'student', x: 350, y: 200, size: 9, color: '#f43f5e' }
  ]
  const linksData: any[] = []

  displayInterests.forEach((tag, idx) => {
    const angle = (idx * Math.PI * 2) / Math.max(displayInterests.length, 1)
    const x = 350 + Math.cos(angle) * 75
    const y = 200 + Math.sin(angle) * 75
    nodesData.push({ id: `interest:${tag}`, label: tag, type: 'interest', x, y, size: 6.5, color: '#22d3ee' })
    linksData.push({ source: `student:${name}`, target: `interest:${tag}` })
  })

  const outerList: any[] = []
  acts.slice(0, 3).forEach(act => {
    const shared = recStore.getSharedInterest(name, act, 'activity')
    outerList.push({ name: act, type: 'activity', interest: shared, color: '#c084fc' })
  })
  buddiesList.slice(0, 4).forEach(buddy => {
    const shared = buddy.sharedInterests[0] || ''
    outerList.push({ name: buddy.name, type: 'buddy', interest: shared, color: '#10b981' })
  })

  outerList.forEach((item, idx) => {
    const angle = ((idx + 0.5) * Math.PI * 2) / Math.max(outerList.length, 1)
    const x = 350 + Math.cos(angle) * 155
    const y = 200 + Math.sin(angle) * 155
    nodesData.push({ id: `${item.type}:${item.name}`, label: item.name, type: item.type, x, y, size: 5.5, color: item.color })
    if (item.interest) {
      linksData.push({ source: `interest:${item.interest}`, target: `${item.type}:${item.name}` })
    } else {
      linksData.push({ source: `student:${name}`, target: `${item.type}:${item.name}` })
    }
  })

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Campus Buddy 个性化校园推荐报告 — ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: rgba(30, 41, 59, 0.45);
      --text-color: #f1f5f9;
      --primary-color: #22d3ee;
      --accent-color: #c084fc;
      --border-color: rgba(6, 182, 212, 0.25);
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
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
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
      background-color: rgba(6, 182, 212, 0.08);
      border-color: rgba(6, 182, 212, 0.25);
      color: var(--primary-color);
      box-shadow: 0 0 8px rgba(6, 182, 212, 0.05);
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧭 Campus Buddy 匹配推荐报告</h1>
      <p>报告学生: <strong>${name}</strong> &nbsp;|&nbsp; 生成时间: ${new Date().toLocaleDateString('zh-CN')}</p>
    </div>
    
    <div class="card">
      <h2>👤 个人画像与登记兴趣</h2>
      <div>${interestsHtml}</div>
    </div>
 
    <!-- Interactive Canvas Graph Box -->
    <div class="card">
      <h2>📡 我的校园社交圈 (互动图谱)</h2>
      <div class="graph-container" style="display: flex; flex-direction: column; align-items: center;">
        <canvas id="interactive-canvas" width="700" height="400" style="background: rgba(0,0,0,0.15); border-radius: 12px; border: 1px solid var(--border-color);"></canvas>
        <div class="graph-hint">💡 提示：将鼠标悬停在节点上，可以高亮显示并查看兴趣、搭子与活动关联的匹配细节。</div>
      </div>
    </div>
 
    <div class="card">
      <h2>🎉 智能活动推荐</h2>
      <div>${actsHtml}</div>
    </div>
 
    <div class="card">
      <h2>🤝 志同道合的活动搭子</h2>
      <div>${buddiesHtml}</div>
    </div>
  </div>
 
  <script>
    (function() {
      const nodes = ${JSON.stringify(nodesData)};
      const links = ${JSON.stringify(linksData)};
      
      const canvas = document.getElementById('interactive-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let hoveredNode = null;

      const isPrintMode = document.body.classList.contains('print-mode');
      if (isPrintMode) {
        nodes.forEach(node => {
          if (node.type === 'student') node.color = '#e11d48';
          else if (node.type === 'interest') node.color = '#0284c7';
          else if (node.type === 'activity') node.color = '#7c3aed';
          else if (node.type === 'buddy') node.color = '#059669';
        });
      }
 
      function drawRoundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
      }
 
      function draw() {
        ctx.clearRect(0, 0, 700, 400);
 
        // Draw connections
        links.forEach(link => {
          const sourceNode = nodes.find(n => n.id === link.source);
          const targetNode = nodes.find(n => n.id === link.target);
          if (!sourceNode || !targetNode) return;
 
          const isHighlighted = hoveredNode && 
            (hoveredNode.id === link.source || hoveredNode.id === link.target);
 
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          
          if (isHighlighted) {
            ctx.strokeStyle = isPrintMode ? '#0284c7' : '#22d3ee';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = isPrintMode ? 'transparent' : '#22d3ee';
            ctx.shadowBlur = isPrintMode ? 0 : 8;
          } else {
            ctx.strokeStyle = isPrintMode ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1.2;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
 
        // Draw nodes
        nodes.forEach(node => {
          const isHovered = hoveredNode && hoveredNode.id === node.id;
          const size = isHovered ? node.size + 3.5 : node.size;
 
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          if (isHovered && !isPrintMode) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 12;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
 
          // Label
          ctx.fillStyle = isPrintMode ? '#334155' : (isHovered ? '#ffffff' : '#94a3b8');
          ctx.font = isPrintMode ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' : (isHovered ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' : '10px "Outfit", "Inter", "Fira Sans", sans-serif');
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y - size - 6);
        });
 
        // Tooltip
        if (hoveredNode && !isPrintMode) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = hoveredNode.color;
          ctx.lineWidth = 1.5;
          drawRoundRect(ctx, 15, 15, 180, 55, 8);
          ctx.fill();
          ctx.stroke();
 
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(hoveredNode.label, 25, 33);
 
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px "Outfit", "Inter", "Fira Sans", sans-serif';
          const typeLabel = hoveredNode.type === 'student' ? '个人姓名' : 
                            (hoveredNode.type === 'interest' ? '兴趣标签' : 
                            (hoveredNode.type === 'activity' ? '推荐活动' : '匹配同学'));
          ctx.fillText('类型: ' + typeLabel, 25, 48);
        }
      }
 
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (700 / rect.width);
        const my = (e.clientY - rect.top) * (400 / rect.height);
 
        let found = null;
        for (const node of nodes) {
          const dx = node.x - mx;
          const dy = node.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < node.size + 6) {
            found = node;
            break;
          }
        }
 
        if (found !== hoveredNode) {
          hoveredNode = found;
          draw();
        }
      });
 
      draw();
    })();
  </script>
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
          font-family: 'Outfit', 'Inter', 'Fira Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif !important;
          background-color: #f8fafc !important;
          color: #0f172a !important;
          padding: 0 !important;
          margin: 15mm 15mm !important;
        }
        .container {
          box-shadow: none !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        .header {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 20px 24px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          margin-bottom: 20px !important;
        }
        .header h1 {
          color: #0f172a !important;
          font-size: 22px !important;
          font-weight: 800 !important;
          margin-bottom: 6px !important;
        }
        .header p {
          color: #64748b !important;
          font-size: 13px !important;
        }
        .card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 20px 24px !important;
          margin-bottom: 20px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          page-break-inside: avoid !important;
        }
        .card h2 {
          font-size: 15px !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          padding-bottom: 10px !important;
          margin-top: 0 !important;
          margin-bottom: 15px !important;
        }
        .tag {
          border: 1px solid #e2e8f0 !important;
          background-color: #f1f5f9 !important;
          color: #334155 !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          display: inline-block !important;
          margin-right: 8px !important;
          margin-bottom: 8px !important;
        }
        .activity-item {
          padding: 12px 0 !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .activity-item:last-child {
          border-bottom: none !important;
        }
        .activity-name {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        .activity-path {
          background-color: #f8fafc !important;
          border-left: 3px solid #0ea5e9 !important;
          border-radius: 6px !important;
          color: #475569 !important;
          padding: 8px 12px !important;
          font-size: 11px !important;
          font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace !important;
          margin-top: 6px !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-top: 10px !important;
        }
        th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          border-bottom: 2px solid #cbd5e1 !important;
          padding: 10px 12px !important;
          font-size: 12px !important;
        }
        td {
          padding: 10px 12px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 13px !important;
          color: #334155 !important;
        }
        .badge-percent {
          background-color: #f0fdf4 !important;
          border: 1px solid #bbf7d0 !important;
          color: #16a34a !important;
          padding: 2px 8px !important;
          border-radius: 6px !important;
          font-weight: 700 !important;
          font-size: 12px !important;
        }
        .graph-hint {
          display: none !important;
        }
        #interactive-canvas {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
        }
      }
    </style>
  `
  
  const finalDoc = htmlContent
    .replace('<body>', '<body class="print-mode">')
    .replace('</head>', `${printStyles}</head>`)

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

  // Poster Size (High-Res 1200x1800)
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 1800
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 1. Dark Neon Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1800)
  bgGrad.addColorStop(0, '#090d16')
  bgGrad.addColorStop(0.3, '#0b1120')
  bgGrad.addColorStop(0.8, '#1e1b4b')
  bgGrad.addColorStop(1, '#080710')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1200, 1800)

  // 2. Tech Decal / Grid Background
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)'
  ctx.lineWidth = 1
  for (let i = 0; i < 1200; i += 60) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 1800)
    ctx.stroke()
  }
  for (let j = 0; j < 1800; j += 60) {
    ctx.beginPath()
    ctx.moveTo(0, j)
    ctx.lineTo(1200, j)
    ctx.stroke()
  }

  // 3. Cybernetic Constellation / Point Cloud matching visualizer
  const nodes: { x: number; y: number; size: number; color: string; label?: string }[] = []
  
  // User Focus Node (Rose pink glow)
  nodes.push({ x: 600, y: 625, size: 15, color: '#f43f5e', label: `我: ${name}` })
  
  // Interest nodes (Cyan neon glow)
  const displayInterests = userInterests.slice(0, 3)
  displayInterests.forEach((interest, idx) => {
    const angle = (idx * Math.PI * 2) / Math.max(displayInterests.length, 1)
    const dist = 140
    nodes.push({
      x: 600 + Math.cos(angle) * dist,
      y: 625 + Math.sin(angle) * dist,
      size: 10,
      color: '#06b6d4',
      label: interest
    })
  })

  // Buddy nodes (Emerald green glow)
  const displayBuddies = buddiesList.slice(0, 3)
  displayBuddies.forEach((buddy, idx) => {
    const angle = ((idx + 0.5) * Math.PI * 2) / Math.max(displayBuddies.length, 1)
    const dist = 245
    nodes.push({
      x: 600 + Math.cos(angle) * dist,
      y: 625 + Math.sin(angle) * dist,
      size: 8.5,
      color: '#10b981',
      label: buddy.name
    })
  })

  // Random decorative point cloud stars in background (within network widget box bounds)
  for (let i = 0; i < 40; i++) {
    nodes.push({
      x: 150 + Math.random() * 900,
      y: 405 + Math.random() * 440,
      size: 2 + Math.random() * 2.5,
      color: Math.random() > 0.55 ? 'rgba(34, 211, 238, 0.25)' : 'rgba(168, 85, 247, 0.25)'
    })
  }

  // Draw node connectors (constellation lines)
  ctx.lineWidth = 1.5
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < 200) {
        const opacity = (1 - dist / 200) * 0.16
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.stroke()
      }
    }
  }

  // Draw visual network widget box boundary
  ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)'
  ctx.lineWidth = 2
  drawRoundRect(ctx, 120, 375, 960, 500, 18)
  ctx.fill()
  ctx.stroke()

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
      ctx.font = 'bold 14px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y - node.size - 10)
    }
  })

  // Network Widget Box Hint Text
  ctx.textAlign = 'left'
  ctx.fillStyle = '#64748b'
  ctx.font = '14px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText('💡 该图谱基于您的兴趣和报名情况计算生成，展示您的直接兴趣圈及搭子关联关系', 150, 840)

  // 4. Header Section
  ctx.textAlign = 'center'
  ctx.fillStyle = '#22d3ee'
  ctx.font = 'bold 32px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText('🧭 CAMPUS BUDDY', 600, 100)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '16px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText('— 校园智能活动与社交匹配网络图谱 —', 600, 140)

  // 5. Profile card at the top
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)'
  ctx.lineWidth = 1
  drawRoundRect(ctx, 120, 180, 960, 110, 18)
  ctx.fill()
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffb74d'
  ctx.font = 'bold 30px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText(name, 160, 246)

  // Persona Badge
  ctx.fillStyle = '#a855f7'
  const nameWidth = ctx.measureText(name).width
  drawRoundRect(ctx, 160 + nameWidth + 20, 212, 120, 36, 18)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(persona, 160 + nameWidth + 20 + 60, 236)

  // Report Time info
  ctx.textAlign = 'right'
  ctx.fillStyle = '#64748b'
  ctx.font = '16px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText(`匹配报告生成时间: ${new Date().toLocaleDateString('zh-CN')}`, 1040, 236)

  // 6. Visual Network Title
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 22px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText('📡 我的校园社交关系图谱', 120, 350)

  // 6. Statistics Row
  const boxW = 290
  const boxH = 95
  const boxG = 45
  const startX = 120
  
  const stats = [
    { value: userInterests.length.toString(), label: '登记兴趣倾向' },
    { value: acts.length.toString(), label: '推荐校园活动' },
    { value: buddiesList.length.toString(), label: '智能匹配搭子' }
  ]

  stats.forEach((stat, idx) => {
    const sX = startX + idx * (boxW + boxG)
    const sY = 910
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    drawRoundRect(ctx, sX, sY, boxW, boxH, 14)
    ctx.fill()
    ctx.stroke()
    
    ctx.textAlign = 'center'
    ctx.fillStyle = '#22d3ee'
    ctx.font = 'bold 32px "Outfit", "Inter", "Fira Sans", sans-serif'
    ctx.fillText(stat.value, sX + boxW / 2, sY + 44)
    
    ctx.fillStyle = '#94a3b8'
    ctx.font = '16px "Outfit", "Inter", "Fira Sans", sans-serif'
    ctx.fillText(stat.label, sX + boxW / 2, sY + 74)
  })

  // 7. Activity Recommendations Box
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 22px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText('🎯 智能活动推荐', 120, 1055)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)'
  drawRoundRect(ctx, 120, 1080, 960, 260, 18)
  ctx.fill()
  ctx.stroke()

  if (acts.length > 0) {
    const drawActs = acts.slice(0, 2)
    drawActs.forEach((actName, idx) => {
      const aY = 1080 + 30 + idx * 110
      const shared = recStore.getSharedInterest(name, actName, 'activity')
      const pathStr = `student:${name} --(🎯${shared})--> activity:${actName}`
      
      // Index Circle Icon
      ctx.fillStyle = 'rgba(34, 211, 238, 0.08)'
      ctx.beginPath()
      ctx.arc(165, aY + 25, 22, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.textAlign = 'center'
      ctx.fillStyle = '#22d3ee'
      ctx.font = 'bold 18px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.fillText((idx + 1).toString(), 165, aY + 31)
      
      // Activity Title
      ctx.textAlign = 'left'
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 20px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.fillText(actName, 210, aY + 20)
      
      // Connection Hops
      ctx.fillStyle = '#94a3b8'
      ctx.font = '15px "Fira Code", Menlo, Monaco, Consolas, monospace'
      ctx.fillText(pathStr, 210, aY + 48)
    })
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#64748b'
    ctx.font = '16px "Outfit", "Inter", "Fira Sans", sans-serif'
    ctx.fillText('您目前尚未登记兴趣，去侧边栏添加兴趣来获取匹配吧！', 600, 1210)
  }

  // 8. Match Buddies Box
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 22px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText('🤝 志同道合的活动搭子匹配', 120, 1385)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)'
  drawRoundRect(ctx, 120, 1410, 960, 290, 18)
  ctx.fill()
  ctx.stroke()

  if (buddiesList.length > 0) {
    const drawBuddies = buddiesList.slice(0, 3)
    drawBuddies.forEach((buddy, idx) => {
      const bY = 1410 + 25 + idx * 85
      
      // Match Rank
      ctx.textAlign = 'left'
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 20px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.fillText(`#${idx + 1}`, 160, bY + 32)
      
      // Name
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 20px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.fillText(buddy.name, 220, bY + 32)
      
      // Matching visual progress bar
      const pctVal = `${(buddy.jaccard * 100).toFixed(0)}%`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
      drawRoundRect(ctx, 330, bY + 14, 220, 18, 9)
      ctx.fill()
      
      ctx.fillStyle = '#10b981'
      drawRoundRect(ctx, 330, bY + 14, Math.max(18, 220 * buddy.jaccard), 18, 9)
      ctx.fill()
      
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 16px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.fillText(pctVal, 575, bY + 28)
      
      // Shared interests
      ctx.fillStyle = '#64748b'
      ctx.font = '16px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.fillText('共同兴趣: ' + buddy.sharedInterests.slice(0, 3).join(', '), 650, bY + 28)
    })
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#64748b'
    ctx.font = '16px "Outfit", "Inter", "Fira Sans", sans-serif'
    ctx.fillText('暂时没有找到匹配的搭子，完善您的兴趣圈子试试吧！', 600, 1555)
  }

  // 9. Poster Decal / Footer info
  ctx.textAlign = 'center'
  ctx.fillStyle = '#475569'
  ctx.font = '14px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText('CAMPUS BUDDY · 智能校园活动与社交关系图谱', 600, 1740)
  ctx.fillText('帮助你在校园里结识志同道合的朋友', 600, 1765)

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
