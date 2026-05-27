import * as d3 from 'd3'
import type { HoveredConnectionDetail, ForceGraphNode, ForceGraphLink } from '@/types'
import { nodeKey } from '@/composables/useGraph'
import { ForceGraphDataBuilder } from './ForceGraphDataBuilder'
import { ForceGraphTooltipHelper } from './ForceGraphTooltipHelper'

export interface ForceGraphCallbacks {
  onNodeClick?: (node: any) => void
  onHover?: (detail: HoveredConnectionDetail | null) => void
}

export class ForceGraphRenderer {
  private canvasElement: HTMLCanvasElement
  private callbacks: ForceGraphCallbacks
  private simulation: d3.Simulation<any, any> | null = null
  private transform: d3.ZoomTransform = d3.zoomIdentity
  private zoomBehavior: d3.ZoomBehavior<HTMLCanvasElement, unknown> | null = null

  // Cache configuration for redrawing on hover, zoom, ticks
  private currentConfig: any = null
  private hoveredNode: ForceGraphNode | null = null

  constructor(canvasElement: HTMLCanvasElement, callbacks: ForceGraphCallbacks = {}) {
    this.canvasElement = canvasElement
    this.callbacks = callbacks
  }

  public destroy() {
    if (this.simulation) {
      this.simulation.stop()
      this.simulation.on('tick', null)
      this.simulation = null
    }
    if (this.zoomBehavior) {
      this.zoomBehavior.on('zoom', null)
      this.zoomBehavior = null
    }
    const canvas = d3.select(this.canvasElement)
    canvas.on('.zoom', null)
    canvas.on('.drag', null)
    canvas.on('click', null)
    canvas.on('mousemove', null)
    canvas.on('mouseout', null)
    this.currentConfig = null
    this.hoveredNode = null
  }

  public zoomIn() {
    if (!this.zoomBehavior) return
    d3.select(this.canvasElement).transition().duration(200).call(this.zoomBehavior.scaleBy, 1.25)
  }

  public zoomOut() {
    if (!this.zoomBehavior) return
    d3.select(this.canvasElement).transition().duration(200).call(this.zoomBehavior.scaleBy, 0.8)
  }

  public resetZoom() {
    if (!this.zoomBehavior) return
    d3.select(this.canvasElement).transition().duration(300).call(this.zoomBehavior.transform, d3.zoomIdentity)
  }

  public draw(config: any) {
    this.currentConfig = config

    if (this.simulation) {
      this.simulation.stop()
      this.simulation.on('tick', null)
    }

    const graph = config.graph as Map<string, Set<string>>
    const {
      activeStudent,
      currentUser,
      showGlobal,
    } = config

    const currentFocalId = activeStudent ? nodeKey('student', activeStudent) : 'global'
    const lastFocalId = this.canvasElement.getAttribute('data-focal-id')
    const focalChanged = currentFocalId !== lastFocalId
    this.canvasElement.setAttribute('data-focal-id', currentFocalId)

    const canvas = this.canvasElement
    const width = canvas.parentElement?.clientWidth || canvas.clientWidth || 900
    const height = canvas.parentElement?.clientHeight || canvas.clientHeight || 600

    const dpi = window.devicePixelRatio || 1
    canvas.width = width * dpi
    canvas.height = height * dpi
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpi, dpi)

    const { nodes: nodesToDraw, links: linksToDraw } = ForceGraphDataBuilder.build(config)
    const isGlobal = showGlobal || !activeStudent

    // Configure simulation with optimized force strengths for large networks
    const simulation = d3.forceSimulation(nodesToDraw)
      .alphaDecay(0.028)
      .velocityDecay(0.45)
      .force('link', d3.forceLink(linksToDraw).id((d: any) => d.id).distance((d: any) => {
        if (isGlobal) return 80
        const sId = typeof d.source === 'object' ? d.source.id : d.source
        const tId = typeof d.target === 'object' ? d.target.id : d.target
        const focal = nodeKey('student', activeStudent ?? '')
        return (sId === focal || tId === focal) ? 70 : 120
      }))
      .force('charge', d3.forceManyBody().strength((d: any) => {
        if (isGlobal) {
          // Keep charge force light for student nodes so they don't blow up the layout
          return d.type === 'interest' ? -80 : d.type === 'activity' ? -40 : -15
        }
        return -260
      }).theta(1.0))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => {
        if (isGlobal) {
          return d.type === 'interest' ? 18 : 10
        }
        return d.id === nodeKey('student', activeStudent ?? '') ? 35 : 20
      }))
    this.simulation = simulation

    // Pre-warm the simulation synchronously to prevent messy "explosion" animations
    const prewarmTicks = isGlobal ? 120 : 45
    for (let i = 0; i < prewarmTicks; i++) {
      simulation.tick()
    }

    // Set up Zoom
    if (!this.zoomBehavior) {
      this.zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([0.1, 5])
      d3.select(canvas).call(this.zoomBehavior)
    }

    // Always update zoom listener to capture current draw closures
    this.zoomBehavior.on('zoom', (event: any) => {
      this.transform = event.transform
      this.renderCanvas(ctx, width, height, nodesToDraw, linksToDraw)
    })

    if (focalChanged) {
      d3.select(canvas).call(this.zoomBehavior.transform, d3.zoomIdentity)
      this.transform = d3.zoomIdentity
    }

    // Set up Drag
    d3.select(canvas).call(d3.drag<HTMLCanvasElement, any>()
      .subject((event: any) => {
        const [mx, my] = d3.pointer(event, canvas)
        const simX = this.transform.invertX(mx)
        const simY = this.transform.invertY(my)
        // Find nearest node within 20px
        return simulation.find(simX, simY, 20)
      })
      .on('start', (event: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event: any) => {
        const [mx, my] = d3.pointer(event, canvas)
        event.subject.fx = this.transform.invertX(mx)
        event.subject.fy = this.transform.invertY(my)
      })
      .on('end', (event: any) => {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      })
    )

    // Set up Click
    d3.select(canvas).on('click', (event: any) => {
      const [mx, my] = d3.pointer(event, canvas)
      const simX = this.transform.invertX(mx)
      const simY = this.transform.invertY(my)
      const node = simulation.find(simX, simY, 20)
      if (node && this.callbacks.onNodeClick) {
        this.callbacks.onNodeClick(node)
      }
    })

    // Set up Mousemove (Hover)
    d3.select(canvas).on('mousemove', (event: any) => {
      const [mx, my] = d3.pointer(event, canvas)
      const simX = this.transform.invertX(mx)
      const simY = this.transform.invertY(my)
      const node = simulation.find(simX, simY, 20)

      if (node !== this.hoveredNode) {
        this.hoveredNode = node as ForceGraphNode | null
        this.renderCanvas(ctx, width, height, nodesToDraw, linksToDraw)

        if (this.callbacks.onHover) {
          if (node) {
            let details: HoveredConnectionDetail
            if (activeStudent) {
              details = ForceGraphTooltipHelper.getTooltipDetails(node, activeStudent, currentUser, graph)
            } else {
              // Custom safety tooltips in system administrator mode (activeStudent is null)
              if (node.type === 'student') {
                const sInt = Array.from(graph.get(node.id) ?? []).filter((i: string) => i.startsWith('interest:')).map((i: string) => i.replace('interest:', ''))
                const sActs = Array.from(graph.get(node.id) ?? []).filter((i: string) => i.startsWith('activity:')).map((i: string) => i.replace('activity:', ''))
                details = {
                  title: `👤 同学: ${node.name}`,
                  type: 'student',
                  details: `拥有的兴趣圈：${sInt.join('、') || '暂无'}。已报名活动：${sActs.join('、') || '暂无'}。`
                }
              } else if (node.type === 'activity') {
                const aInt = Array.from(graph.get(node.id) ?? []).filter((i: string) => i.startsWith('interest:')).map((i: string) => i.replace('interest:', ''))
                const participants = Array.from(graph.get(node.id) ?? []).filter((i: string) => i.startsWith('student:')).map((i: string) => i.replace('student:', ''))
                details = {
                  title: `🎉 活动: ${node.name}`,
                  type: 'activity',
                  details: `分类标签：${aInt.join('、') || '暂无'}。目前已报名学生人数：${participants.length} 人。`
                }
              } else {
                details = {
                  title: `🎯 兴趣圈: ${node.name}`,
                  type: 'interest',
                  details: `校园兴趣主题标签。连接具有此共同爱好的学生与相关活动。`
                }
              }
            }
            this.callbacks.onHover(details)
          } else {
            this.callbacks.onHover(null)
          }
        }
      }
    })

    // Set up Mouseout
    d3.select(canvas).on('mouseout', () => {
      if (this.hoveredNode !== null) {
        this.hoveredNode = null
        this.renderCanvas(ctx, width, height, nodesToDraw, linksToDraw)
        if (this.callbacks.onHover) {
          this.callbacks.onHover(null)
        }
      }
    })

    // Animation frames update on simulation ticks
    simulation.on('tick', () => {
      this.renderCanvas(ctx, width, height, nodesToDraw, linksToDraw)
    })
  }

  private renderCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    nodes: ForceGraphNode[],
    links: ForceGraphLink[]
  ) {
    ctx.clearRect(0, 0, width, height)
    ctx.save()

    // Apply transform matrix
    ctx.translate(this.transform.x, this.transform.y)
    ctx.scale(this.transform.k, this.transform.k)

    const activeStudent = this.currentConfig?.activeStudent
    const focalId = activeStudent ? nodeKey('student', activeStudent) : null
    const graph = this.currentConfig?.graph
    const pathResult = this.currentConfig?.pathResult

    // 1. Hover-based fade out logic
    let isFaded = false
    const connectedNodeIds = new Set<string>()
    if (this.hoveredNode) {
      isFaded = true
      const hoverId = this.hoveredNode.id
      connectedNodeIds.add(hoverId)

      // Find neighbor connections
      for (const l of links) {
        const sId = typeof l.source === 'object' ? l.source.id : l.source
        const tId = typeof l.target === 'object' ? l.target.id : l.target
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
        const hoverId = this.hoveredNode!.id

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

    // Perform batched drawing
    drawLinkBatch(defaultLines, '255, 255, 255', 1.5, [], 0.08)
    drawLinkBatch(studentActLines, '6, 182, 212', 1.5, [], 0.6)
    drawLinkBatch(regLines, '253, 151, 31', 1.5, [3, 3], 0.45)
    drawLinkBatch(activeRegLines, '74, 222, 128', 2.5, [4, 4], 0.9)
    drawLinkBatch(pathLines, '250, 204, 21', 4.0, [], 1.0)

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
      let fillColor = '#06b6d4'
      if (isFocal) {
        fillColor = '#ec4899'
      } else if (d.type === 'student') {
        fillColor = '#fd971f'
      } else if (d.type === 'interest') {
        fillColor = '#3b82f6'
      } else if (d.type === 'activity' && activeStudent && graph?.get(nodeKey('student', activeStudent))?.has(d.id)) {
        fillColor = '#4ade80'
      }

      // Calculate stroke
      let strokeColor = '#0f172a'
      let strokeWidth = 2
      if (inPath) {
        strokeColor = isFocal ? '#ec4899' : '#facc15'
        strokeWidth = 3.5
      } else if (isFocal) {
        strokeColor = '#facc15'
        strokeWidth = 3.5
      } else if (activeStudent && d.type === 'activity' && graph?.get(nodeKey('student', activeStudent))?.has(d.id)) {
        strokeColor = '#22c55e'
      }

      ctx.beginPath()
      ctx.arc(d.x, d.y, radius, 0, 2 * Math.PI)

      // Performance optimized glow effect
      const isHovered = this.hoveredNode && d.id === this.hoveredNode.id
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
      const isHovered = this.hoveredNode && d.id === this.hoveredNode.id

      // LOD visibility rules:
      // - Interest and Activity labels are always shown.
      // - Student labels are only shown when zoomed in (scale >= 1.3), or if they are focal/hovered/part of path/connected to hover.
      let showLabel = true
      if (d.type === 'student') {
        showLabel = (this.transform.k >= 1.3) || isFocal || isHovered || (pathResult && inPath) || (isFaded && connectedNodeIds.has(d.id))
      }

      if (!showLabel) continue

      const dx = isFocal ? 26 : d.type === 'interest' ? 18 : 14

      // Viewport bounds culling (in simulation coordinates)
      const buffer = 80
      const left = -this.transform.x / this.transform.k - buffer
      const right = (width - this.transform.x) / this.transform.k + buffer
      const topBound = -this.transform.y / this.transform.k - buffer
      const bottom = (height - this.transform.y) / this.transform.k + buffer

      if (d.x < left || d.x > right || d.y < topBound || d.y > bottom) {
        continue
      }

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = '#f8fafc'
      ctx.font = isFocal || inPath ? 'bold 11px "Outfit", "Inter", sans-serif' : '10px "Outfit", "Inter", sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      // Dark text outline to ensure legibility
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)'
      ctx.lineWidth = 3
      ctx.strokeText(d.name, d.x + dx, d.y)

      ctx.fillText(d.name, d.x + dx, d.y)
      ctx.restore()
    }

    ctx.restore()
  }
}
