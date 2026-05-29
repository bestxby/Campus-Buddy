import { useGraphStore } from '@/stores/graph'
import { GraphAlgorithms } from './graph-algorithms'
import { graphAnalyticsService } from '@/services/GraphAnalyticsService'

export interface RecommendedBuddy {
  name: string;
  jaccard: number;
  sharedInterests: string[];
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

export function generateHtmlReport(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): string {
  let interestsHtml = ''
  if (userInterests.length > 0) {
    interestsHtml = userInterests.map(interest => `<span class="tag tag-primary">${interest}</span>`).join('')
  } else {
    interestsHtml = '<p class="empty-state">您目前尚未登记 any 兴趣。</p>'
  }

  let actsHtml = ''
  if (acts.length > 0) {
    acts.forEach((actName, idx) => {
      const shared = getSharedInterest(name, actName, 'activity')
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
        <canvas id="interactive-canvas" width="1400" height="800" style="width: 700px; height: 400px; background: rgba(0,0,0,0.15); border-radius: 12px; border: 1px solid var(--border-color);"></canvas>
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
      ctx.scale(2, 2);
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
 
          // Label text styling
          ctx.font = isPrintMode 
            ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' 
            : (isHovered ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' : '10px "Outfit", "Inter", "Fira Sans", sans-serif');
          ctx.textAlign = 'center';

          // Label text vertical offset
          const textY = node.y - size - 8;

          if (!isPrintMode) {
            const textWidth = ctx.measureText(node.label).width;
            ctx.fillStyle = isHovered ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = isHovered ? node.color : 'rgba(6, 182, 212, 0.15)';
            ctx.lineWidth = 1;
            drawRoundRect(ctx, node.x - textWidth / 2 - 6, textY - 11, textWidth + 12, 16, 4);
            ctx.fill();
            ctx.stroke();
          }

          // Label text fill
          ctx.fillStyle = isPrintMode ? '#334155' : (isHovered ? '#ffffff' : '#cbd5e1');
          ctx.fillText(node.label, node.x, textY);
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
  `;
}

export function generateAdminMarkdownReport(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): string {
  let graph: Map<string, Set<string>> = new Map()
  let privateStudents: Set<string> = new Set()
  let bridgeStudents: any[] = []
  
  try {
    const graphStore = useGraphStore()
    graph = graphStore.graph
    privateStudents = graphStore.privateStudents
    bridgeStudents = graphAnalyticsService.bridgeStudents.value
  } catch (e) {
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
  let diagnosisNote = '该生社交连接度一般，建议鼓励其参与更多跨学科活动，拓展人脉边界。'

  if (studentDegree === 0) {
    socialRole = '社交孤立个体 (重点帮扶对象)'
    socialRoleIcon = '🚨'
    diagnosisNote = '警告：该生目前在校园社交图谱中处于完全社交孤立状态（度中心度为0）。建议辅导员/班主任主动介入，引导其进行兴趣登记或推荐加入活动社群，提供社交关怀。'
  } else if (studentRank <= 15) {
    socialRole = '校园领袖型社交达人 (Opinion Leader)'
    socialRoleIcon = '👑'
    diagnosisNote = '诊断：该生在网络中具有极高的度中心性，属于校园社交活跃分子。建议可推荐其担任班组织管理职位，发挥其社交影响力带动周边同学。'
  } else if (isBridge) {
    socialRole = '跨社群社交中介桥梁 (Network Broker)'
    socialRoleIcon = '🌉'
    diagnosisNote = `诊断：该生介数中心性突出（桥梁指数: ${bridgeScore}），处于不同社交群体/兴趣圈子的枢纽位置，起着沟通和桥梁作用。可利用其传播特质，进行跨社群信息分发或活动推广。`
  } else if (studentDegree >= 6) {
    socialRole = '积极社交参与者 (Social Explorer)'
    socialRoleIcon = '🟢'
    diagnosisNote = '诊断：该生积极参与多项活动，兴趣广泛，社交连接度良好。建议保持目前社交习惯，继续深入探索。'
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

  let communityDiagnosis = ''
  if (componentSize === 1) {
    communityDiagnosis = `🚨 **连通状态警告**：该生属于网络中的完全孤立点，社交覆盖率为 0.0%（1/${totalStudents}）。其未被包含在校园任何社交活动与圈子中，建议提供定向活动引流。`
  } else if (Number(compPct) >= 80) {
    communityDiagnosis = `✅ **连通状态良好**：该生已融入全校的核心主社交网络，该网络共覆盖 ${componentSize} 名学生，占全校人数的 **${compPct}%**。在全局拓扑网络中，该生具备优秀的人脉通达性和社交覆盖面。`
  } else {
    communityDiagnosis = `⚠️ **局部社群隔离**：该生当前被局限在一个包含 ${componentSize} 人（全校占比 **${compPct}%**）的局部兴趣小团体中。该圈子与全校主连通社交网络不连通，可能存在信息壁垒或局部社交闭环。`
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
        return `${icon}${label}`
      })
      hubPathStr = elements.join(' ➔ ')
    } else {
      hubPathStr = '❌ 无法建立联系：该生与学校核心达人处于两个互不连通的社交孤立分支中。'
    }
  } else {
    hubPathStr = '👑 该生本身即为全校社交活跃度最高的 Opinion Leader。'
  }

  // Start assembling markdown
  let md: string[] = []
  md.push(`# 📊 Campus Buddy 专业级社交诊断与学术匹配报告 — ${name}`)
  md.push(`\n> **报告生成时间**: ${new Date().toLocaleDateString('zh-CN')} | **管理权限**: 全局管理员`)
  md.push(`\n---\n`)
  
  md.push(`## 🏥 一、网络位置与中心度诊断`)
  md.push(`* **网络定位**: ${socialRoleIcon} **${socialRole}**`)
  md.push(`* **直连度数 (Degree)**: \`${studentDegree}\``)
  md.push(`* **全校排名**: 第 **${studentRank}** 名 (超越全校 \`${studentPercentile}%\` 的学生)`)
  md.push(`* **社群连通覆盖率**: \`${compPct}%\` (共 ${componentSize} 名学生与该生连通)`)
  md.push(`\n**诊断意见**：\n> ${diagnosisNote}`)
  md.push(`\n**连通状态**：\n> ${communityDiagnosis}`)
  md.push(`\n---\n`)

  md.push(`## 🔗 二、与校园核心社交达人的连接路径`)
  md.push(`与学校最活跃 Opinion Leader (**${hubStudent}**) 的最短路径：\n`)
  md.push(`\`${hubPathStr}\``)
  md.push(`\n*注：该路径基于 BFS 最短路径算法生成，已自动屏蔽途中开启了隐私模式的同学节点。*`)
  md.push(`\n---\n`)

  md.push(`## 👤 三、登记的兴趣与个人标签`)
  if (userInterests.length > 0) {
    for (const interest of userInterests) {
      md.push(`* **${interest}**`)
    }
  } else {
    md.push(`该生目前在系统内尚未登记任何兴趣倾向。`)
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
  let graph: Map<string, Set<string>> = new Map()
  let privateStudents: Set<string> = new Set()
  let bridgeStudents: any[] = []
  
  try {
    const graphStore = useGraphStore()
    graph = graphStore.graph
    privateStudents = graphStore.privateStudents
    bridgeStudents = graphAnalyticsService.bridgeStudents.value
  } catch (e) {
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
  let diagnosisNote = '该生社交连接度一般，建议鼓励其参与更多跨学科活动，拓展人脉边界。'

  if (studentDegree === 0) {
    socialRole = '社交孤立个体 (重点帮扶对象)'
    socialRoleIcon = '🚨'
    diagnosisNote = '警告：该生目前在校园社交图谱中处于完全社交孤立状态（度中心度为0）。建议辅导员/班主任主动介入，引导其进行兴趣登记或推荐加入活动社群，提供社交关怀。'
  } else if (studentRank <= 15) {
    socialRole = '校园领袖型社交达人 (Opinion Leader)'
    socialRoleIcon = '👑'
    diagnosisNote = '诊断：该生在网络中具有极高的度中心性，属于校园社交活跃分子。建议可推荐其担任班组织管理职位，发挥其社交影响力带动周边同学。'
  } else if (isBridge) {
    socialRole = '跨社群社交中介桥梁 (Network Broker)'
    socialRoleIcon = '🌉'
    diagnosisNote = `诊断：该生介数中心性突出（桥梁指数: ${bridgeScore}），处于不同社交群体/兴趣圈子的枢纽位置，起着沟通和桥梁作用。可利用其传播特质，进行跨社群信息分发或活动推广。`
  } else if (studentDegree >= 6) {
    socialRole = '积极社交参与者 (Social Explorer)'
    socialRoleIcon = '🟢'
    diagnosisNote = '诊断：该生积极参与多项活动，兴趣广泛，社交连接度良好。建议保持目前社交习惯，继续深入探索。'
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

  let communityDiagnosis = ''
  if (componentSize === 1) {
    communityDiagnosis = `🚨 <strong>连通状态警告</strong>：该生属于网络中的完全孤立点，社交覆盖率为 0.0%（1/${totalStudents}）。其未被包含在校园任何社交活动与圈子中，建议提供心理关注和定向活动引流。`
  } else if (Number(compPct) >= 80) {
    communityDiagnosis = `✅ <strong>连通状态良好</strong>：该生已融入全校的核心主社交网络，该网络共覆盖 ${componentSize} 名学生，占全校人数的 <strong>${compPct}%</strong>。在全局拓扑网络中，该生具备优秀的人脉通达性和社交覆盖面。`
  } else {
    communityDiagnosis = `⚠️ <strong>局部社群隔离</strong>：该生当前被局限在一个包含 ${componentSize} 人（全校占比 <strong>${compPct}%</strong>）的局部兴趣小团体中。该圈子与全校主连通社交网络不连通，可能存在信息壁垒或局部社交闭环。`
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
        return `${icon}${label}`
      })
      hubPathStr = elements.join(' ➔ ')
    } else {
      hubPathStr = '❌ 无法建立联系：该生与学校核心达人处于两个互不连通的社交孤立分支中。'
    }
  } else {
    hubPathStr = '👑 该生本身即为全校社交活跃度最高的 Opinion Leader。'
  }

  let interestsHtml = ''
  if (userInterests.length > 0) {
    interestsHtml = userInterests.map(interest => `<span class="tag tag-primary">${interest}</span>`).join('')
  } else {
    interestsHtml = '<p class="empty-state">目前尚未登记任何兴趣倾向。</p>'
  }

  let actsHtml = ''
  if (acts.length > 0) {
    acts.forEach((actName, idx) => {
      const shared = getSharedInterest(name, actName, 'activity')
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
    actsHtml = '<p class="empty-state">暂时没有基于该生兴趣推荐的活动。</p>'
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
    buddiesHtml = '<p class="empty-state">暂时没有找到具有共同兴趣的搭子。</p>'
  }

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

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Campus Buddy 专业级社交诊断报告 — ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: rgba(30, 41, 59, 0.45);
      --text-color: #f1f5f9;
      --primary-color: #ffb74d;
      --accent-color: #c084fc;
      --border-color: rgba(245, 158, 11, 0.25);
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
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid var(--border-color);
      color: white;
      padding: 30px 40px;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.08);
      margin-bottom: 24px;
      position: relative;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--primary-color);
      text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
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
      background-color: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.25);
      color: var(--primary-color);
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.05);
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
    .diag-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .diag-item-cell {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .diag-item-cell strong {
      color: #94a3b8;
      font-size: 13px;
    }
    .diag-item-cell span {
      float: right;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Campus Buddy 专业级社交诊断报告</h1>
      <p>报告学生: <strong>${name}</strong> &nbsp;|&nbsp; 生成时间: ${new Date().toLocaleDateString('zh-CN')} &nbsp;|&nbsp; 级别: 全局管理员</p>
    </div>

    <!-- Diagnostic Panel -->
    <div class="card" style="border-color: #ffb74d; background: rgba(255, 183, 77, 0.04);">
      <h2 style="color: #ffb74d; border-color: rgba(255, 183, 77, 0.15)">🏥 专业级社交定位与诊断指标</h2>
      <div class="diag-grid">
        <div class="diag-item-cell">
          <strong>网络位置定位</strong>
          <span style="color: #ffb74d;">${socialRoleIcon} ${socialRole}</span>
        </div>
        <div class="diag-item-cell">
          <strong>直连度数 (Degree)</strong>
          <span class="badge-percent" style="background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.2); font-size: 11px; padding: 2px 6px;">${studentDegree}</span>
        </div>
        <div class="diag-item-cell">
          <strong>全校度数排名</strong>
          <span>第 ${studentRank} 名 (超越全校 ${studentPercentile}% 的学生)</span>
        </div>
        <div class="diag-item-cell">
          <strong>社群连通覆盖率</strong>
          <span>${compPct}% (共 ${componentSize} 人)</span>
        </div>
      </div>
      <div style="margin-top: 18px; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; line-height: 1.5; color: #cbd5e1;">
        <strong>诊断意见：</strong>${diagnosisNote}
      </div>
      <div style="margin-top: 12px; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; line-height: 1.5; color: #cbd5e1;">
        <strong>连通状态：</strong>${communityDiagnosis}
      </div>
    </div>

    <!-- Relationship Path to Hub -->
    <div class="card">
      <h2>🔗 与全校核心社交人物的关联路径</h2>
      <div style="padding: 12px; background: rgba(0,0,0,0.25); border-left: 3px solid #ffb74d; border-radius: 6px; font-size: 13px; color: #e2e8f0; font-family: monospace; overflow-x: auto; line-height: 1.4;">
        ${hubPathStr}
      </div>
      <p style="font-size: 11px; color: #64748b; margin-top: 6px; margin-bottom: 0;">* 注：路径通过广度优先搜索 (BFS) 遍历，已自动避开途中开启了隐私保护模式的同学节点。</p>
    </div>
    
    <div class="card">
      <h2>👤 登记兴趣</h2>
      <div>${interestsHtml}</div>
    </div>
 
    <!-- Interactive Canvas Graph Box -->
    <div class="card">
      <h2>📡 局部社交网络图谱 (互动)</h2>
      <div class="graph-container" style="display: flex; flex-direction: column; align-items: center;">
        <canvas id="interactive-canvas" width="1400" height="800" style="width: 700px; height: 400px; background: rgba(0,0,0,0.15); border-radius: 12px; border: 1px solid var(--border-color);"></canvas>
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
      ctx.scale(2, 2);
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
            ctx.strokeStyle = isPrintMode ? '#0284c7' : '#ffb74d';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = isPrintMode ? 'transparent' : '#ffb74d';
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
 
          // Label text styling
          ctx.font = isPrintMode 
            ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' 
            : (isHovered ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' : '10px "Outfit", "Inter", "Fira Sans", sans-serif');
          ctx.textAlign = 'center';
 
          // Label text vertical offset
          const textY = node.y - size - 8;
 
          if (!isPrintMode) {
            const textWidth = ctx.measureText(node.label).width;
            ctx.fillStyle = isHovered ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = isHovered ? node.color : 'rgba(6, 182, 212, 0.15)';
            ctx.lineWidth = 1;
            drawRoundRect(ctx, node.x - textWidth / 2 - 6, textY - 11, textWidth + 12, 16, 4);
            ctx.fill();
            ctx.stroke();
          }
 
          // Label text fill
          ctx.fillStyle = isPrintMode ? '#334155' : (isHovered ? '#ffffff' : '#cbd5e1');
          ctx.fillText(node.label, node.x, textY);
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
  `;
}
