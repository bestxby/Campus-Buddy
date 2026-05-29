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
