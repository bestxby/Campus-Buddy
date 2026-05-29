import { RecommendedBuddy } from './reportGenerator';

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

export function drawAndDownloadPng(
  name: string,
  userInterests: string[],
  acts: string[],
  buddiesList: RecommendedBuddy[],
  persona: string,
  getSharedInterest: (name: string, actName: string, type: 'activity' | 'student') => string
): void {
  // Poster Size (4K Ultra-HD 3600x5400)
  const canvas = document.createElement('canvas')
  canvas.width = 3600
  canvas.height = 5400
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(3, 3)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

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
    const dist = 120
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
    const dist = 210
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
      ctx.font = 'bold 14px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.textAlign = 'center'
      const textY = node.y - node.size - 12
      const textWidth = ctx.measureText(node.label).width
      
      // Draw capsule background to ensure text readability
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'
      ctx.lineWidth = 1
      drawRoundRect(ctx, node.x - textWidth / 2 - 8, textY - 14, textWidth + 16, 20, 6)
      ctx.fill()
      ctx.stroke()
      
      // Draw text
      ctx.fillStyle = '#cbd5e1'
      ctx.fillText(node.label, node.x, textY)
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
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffb74d'
  ctx.font = 'bold 30px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText(name, 160, 235)

  // Persona Badge
  ctx.fillStyle = '#a855f7'
  const nameWidth = ctx.measureText(name).width
  drawRoundRect(ctx, 160 + nameWidth + 20, 217, 120, 36, 18)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(persona, 160 + nameWidth + 20 + 60, 235)

  // Report Time info
  ctx.textAlign = 'right'
  ctx.fillStyle = '#64748b'
  ctx.font = '16px "Outfit", "Inter", "Fira Sans", sans-serif'
  ctx.fillText(`匹配报告生成时间: ${new Date().toLocaleDateString('zh-CN')}`, 1040, 235)
  ctx.textBaseline = 'alphabetic'

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
      const shared = getSharedInterest(name, actName, 'activity')
      const pathStr = `student:${name} --(🎯${shared})--> activity:${actName}`
      
      // Index Circle Icon
      ctx.fillStyle = 'rgba(34, 211, 238, 0.08)'
      ctx.beginPath()
      ctx.arc(165, aY + 25, 22, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#22d3ee'
      ctx.font = 'bold 18px "Outfit", "Inter", "Fira Sans", sans-serif'
      ctx.fillText((idx + 1).toString(), 165, aY + 25)
      ctx.textBaseline = 'alphabetic'
      
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
