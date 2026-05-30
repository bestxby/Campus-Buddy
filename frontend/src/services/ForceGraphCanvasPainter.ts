import type { ZoomTransform } from 'd3'
import type { ForceGraphNode, ForceGraphLink } from '@/types'
import { nodeKey } from '@/composables/useGraph'

export class ForceGraphCanvasPainter {
  public static draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    nodes: ForceGraphNode[],
    links: ForceGraphLink[],
    transform: ZoomTransform,
    currentConfig: any,
    hoveredNode: ForceGraphNode | null
  ) {
    // Clear the absolute backing store of the canvas element
    ctx.save()
    ctx.resetTransform()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()

    ctx.save()

    // Apply transform matrix
    ctx.translate(transform.x, transform.y)
    ctx.scale(transform.k, transform.k)

    const activeStudent = currentConfig?.activeStudent
    const focalId = activeStudent ? nodeKey('student', activeStudent) : null
    const graph = currentConfig?.graph
    const pathResult = currentConfig?.pathResult

    // 1. Hover-based fade out logic
    let isFaded = false
    const connectedNodeIds = new Set<string>()
    if (hoveredNode) {
      isFaded = true
      const hoverId = hoveredNode.id
      connectedNodeIds.add(hoverId)

      // Find neighbor connections
      for (const l of links) {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target
        if (sId === hoverId) {
          connectedNodeIds.add(tId)
        } else if (tId === hoverId) {
          connectedNodeIds.add(sId)
        }
      }
    }

    const isPathLink = (sId: string, tId: string): boolean => {
      if (!pathResult) return false
      const path = pathResult.path
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === sId && path[i + 1] === tId) || (path[i] === tId && path[i + 1] === sId)) return true
      }
      return false
    }

    // 2. Batch Links by Visual Style to avoid D3/Canvas draw bottlenecks
    const pathLines: ForceGraphLink[] = []
    const activeRegLines: ForceGraphLink[] = []
    const regLines: ForceGraphLink[] = []
    const studentActLines: ForceGraphLink[] = []
    const defaultLines: ForceGraphLink[] = []

    for (const l of links) {
      const sNode = l.source as ForceGraphNode
      const tNode = l.target as ForceGraphNode
      if (!sNode || !tNode || sNode.x === undefined || sNode.y === undefined || tNode.x === undefined || tNode.y === undefined) continue

      const sId = sNode.id
      const tId = tNode.id

      if (isPathLink(sId, tId)) {
        pathLines.push(l)
      } else if (l.type === 'registration-active') {
        activeRegLines.push(l)
      } else if (l.type === 'registration') {
        regLines.push(l)
      } else {
        const sT = sNode.type
        const tT = tNode.type
        if ((sT === 'student' && tT === 'activity') || (sT === 'activity' && tT === 'student')) {
          studentActLines.push(l)
        } else {
          defaultLines.push(l)
        }
      }
    }

    // High performance batch draw helper
    const drawLinkBatch = (
      batch: ForceGraphLink[],
      baseRGB: string,
      lineWidth: number,
      lineDash: number[] = [],
      baseOpacity: number = 1.0
    ) => {
      if (batch.length === 0) return

      if (isFaded) {
        const connected: ForceGraphLink[] = []
        const unconnected: ForceGraphLink[] = []
        const hoverId = hoveredNode!.id

        for (const l of batch) {
          const sNode = l.source as ForceGraphNode
          const tNode = l.target as ForceGraphNode
          if (sNode.id === hoverId || tNode.id === hoverId) {
            connected.push(l)
          } else {
            unconnected.push(l)
          }
        }

        // Draw unconnected (faded)
        if (unconnected.length > 0) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(${baseRGB}, ${baseOpacity * 0.12})`
          ctx.lineWidth = lineWidth
          ctx.setLineDash(lineDash)
          for (const l of unconnected) {
            ctx.moveTo((l.source as any).x, (l.source as any).y)
            ctx.lineTo((l.target as any).x, (l.target as any).y)
          }
          ctx.stroke()
        }

        // Draw connected (highlighted)
        if (connected.length > 0) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(${baseRGB}, ${baseOpacity})`
          ctx.lineWidth = lineWidth
          ctx.setLineDash(lineDash)
          for (const l of connected) {
            ctx.moveTo((l.source as any).x, (l.source as any).y)
            ctx.lineTo((l.target as any).x, (l.target as any).y)
          }
          ctx.stroke()
        }
      } else {
        // Draw all at once
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${baseRGB}, ${baseOpacity})`
        ctx.lineWidth = lineWidth
        ctx.setLineDash(lineDash)
        for (const l of batch) {
          ctx.moveTo((l.source as any).x, (l.source as any).y)
          ctx.lineTo((l.target as any).x, (l.target as any).y)
        }
        ctx.stroke()
      }
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    // Perform batched drawing
    drawLinkBatch(defaultLines, isDark ? '255, 255, 255' : '29, 24, 22', 1.5, [], 0.08)
    drawLinkBatch(studentActLines, '6, 182, 212', 1.5, [], 0.6)
    drawLinkBatch(regLines, isDark ? '253, 151, 31' : '217, 110, 72', 1.5, [3, 3], 0.45)
    drawLinkBatch(activeRegLines, isDark ? '74, 222, 128' : '21, 128, 61', 2.5, [4, 4], 0.9)
    drawLinkBatch(pathLines, isDark ? '250, 204, 21' : '217, 119, 6', 4.0, [], 1.0)

    // Reset dash array
    ctx.setLineDash([])

    // 3. Draw Node Circles
    for (const d of nodes) {
      if (d.x === undefined || d.y === undefined) continue

      let opacity = 1.0
      if (isFaded) {
        opacity = connectedNodeIds.has(d.id) ? 1.0 : 0.15
      }

      const inPath = pathResult && pathResult.path.includes(d.id)
      const isFocal = focalId && d.id === focalId
      const radius = isFocal ? 22 : d.type === 'interest' ? 14 : 10

      // Calculate fill color
      let fillColor = isDark ? '#0ea5e9' : '#0D9488'
      if (isFocal) {
        fillColor = isDark ? '#ec4899' : '#BE185D'
      } else if (d.type === 'student') {
        fillColor = isDark ? '#fd971f' : '#D96E48'
      } else if (d.type === 'interest') {
        fillColor = isDark ? '#60a5fa' : '#1D4ED8'
      } else if (d.type === 'activity') {
        if (activeStudent && graph?.get(nodeKey('student', activeStudent))?.has(d.id)) {
          fillColor = isDark ? '#4ade80' : '#15803D'
        } else {
          fillColor = isDark ? 'rgba(52, 211, 153, 0.45)' : 'rgba(21, 128, 61, 0.45)'
        }
      }

      // Calculate stroke
      let strokeColor = isDark ? '#0f172a' : '#ffffff'
      let strokeWidth = 2
      if (inPath) {
        strokeColor = isFocal ? '#ec4899' : (isDark ? '#facc15' : '#D96E48')
        strokeWidth = 3.5
      } else if (isFocal) {
        strokeColor = isDark ? '#facc15' : '#D96E48'
        strokeWidth = 3.5
      } else if (activeStudent && d.type === 'activity' && graph?.get(nodeKey('student', activeStudent))?.has(d.id)) {
        strokeColor = '#22c55e'
      }

      ctx.beginPath()
      ctx.arc(d.x, d.y, radius, 0, 2 * Math.PI)

      // Performance optimized glow effect
      const isHovered = hoveredNode && d.id === hoveredNode.id
      const drawGlow = isHovered || isFocal || inPath || (d.type === 'interest' && opacity > 0.5)

      if (drawGlow) {
        ctx.shadowBlur = isFocal || isHovered ? 15 : 8
        ctx.shadowColor = fillColor
      } else {
        ctx.shadowBlur = 0
      }

      ctx.fillStyle = fillColor
      ctx.globalAlpha = opacity
      ctx.fill()

      ctx.shadowBlur = 0 // reset shadow for stroke
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.stroke()
      ctx.globalAlpha = 1.0
    }

    // 4. Draw Labels with Level of Detail (LOD) and Viewport Culling
    for (const d of nodes) {
      if (d.x === undefined || d.y === undefined) continue

      let opacity = 1.0
      if (isFaded) {
        opacity = connectedNodeIds.has(d.id) ? 1.0 : 0.15
      }

      const isFocal = focalId && d.id === focalId
      const inPath = pathResult && pathResult.path.includes(d.id)
      const isHovered = hoveredNode && d.id === hoveredNode.id

      const dx = isFocal ? 26 : d.type === 'interest' ? 18 : 14

      // Viewport bounds culling (in simulation coordinates)
      const buffer = 80
      const left = -transform.x / transform.k - buffer
      const right = (width - transform.x) / transform.k + buffer
      const topBound = -transform.y / transform.k - buffer
      const bottom = (height - transform.y) / transform.k + buffer

      if (d.x < left || d.x > right || d.y < topBound || d.y > bottom) {
        continue
      }

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = isDark ? '#f8fafc' : '#1D1816'
      ctx.font = isFocal || inPath || isHovered ? 'bold 11px "Outfit", "Inter", sans-serif' : '10px "Outfit", "Inter", sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      // text outline to ensure legibility
      ctx.strokeStyle = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 3
      ctx.strokeText(d.name, d.x + dx, d.y)

      ctx.fillText(d.name, d.x + dx, d.y)
      ctx.restore()
    }

    ctx.restore()
  }
}
