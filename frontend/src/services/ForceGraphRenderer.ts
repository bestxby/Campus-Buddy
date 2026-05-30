import * as d3 from 'd3'
import type { HoveredConnectionDetail, ForceGraphNode, ForceGraphLink } from '@/types'
import { nodeKey } from '@/composables/useGraph'
import { ForceGraphDataBuilder } from './ForceGraphDataBuilder'
import { ForceGraphTooltipHelper } from './ForceGraphTooltipHelper'
import { ForceGraphCanvasPainter } from './ForceGraphCanvasPainter'
import { ForceGraphPhysics } from './ForceGraphPhysics'

// Named Constants for D3 Physics Simulation
const HOVER_FIND_RADIUS = 20

const ZOOM_SCALE_MIN = 0.1
const ZOOM_SCALE_MAX = 5
const ZOOM_DURATION_FAST = 200
const ZOOM_DURATION_NORMAL = 300
const ZOOM_SCALE_IN_FACTOR = 1.25
const ZOOM_SCALE_OUT_FACTOR = 0.8

export interface ForceGraphCallbacks {
  onNodeClick?: (node: any) => void
  onHover?: (detail: HoveredConnectionDetail | null) => void
}

export class ForceGraphRenderer {
  private canvasElement: HTMLCanvasElement
  private callbacks: ForceGraphCallbacks
  private physics: ForceGraphPhysics
  private transform: d3.ZoomTransform = d3.zoomIdentity
  private zoomBehavior: d3.ZoomBehavior<HTMLCanvasElement, unknown> | null = null

  // Cache configuration for redrawing on hover, zoom, ticks
  private currentConfig: any = null
  private hoveredNode: ForceGraphNode | null = null
  private quadtree: d3.Quadtree<ForceGraphNode> | null = null

  private lastNodes: ForceGraphNode[] = []
  private lastLinks: ForceGraphLink[] = []

  private onThemeChanged = () => {
    requestAnimationFrame(() => {
      const ctx = this.canvasElement.getContext('2d')
      if (ctx && this.lastNodes.length > 0) {
        const dpi = window.devicePixelRatio || 1
        const width = this.canvasElement.width / dpi
        const height = this.canvasElement.height / dpi
        this.renderCanvas(ctx, width, height, this.lastNodes, this.lastLinks)
      }
    })
  }

  constructor(canvasElement: HTMLCanvasElement, callbacks: ForceGraphCallbacks = {}) {
    this.canvasElement = canvasElement
    this.callbacks = callbacks
    this.physics = new ForceGraphPhysics()
    window.addEventListener('theme-changed', this.onThemeChanged)
  }

  public destroy() {
    window.removeEventListener('theme-changed', this.onThemeChanged)
    this.physics.stop()
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
    d3.select(this.canvasElement).transition().duration(ZOOM_DURATION_FAST).call(this.zoomBehavior.scaleBy, ZOOM_SCALE_IN_FACTOR)
  }

  public zoomOut() {
    if (!this.zoomBehavior) return
    d3.select(this.canvasElement).transition().duration(ZOOM_DURATION_FAST).call(this.zoomBehavior.scaleBy, ZOOM_SCALE_OUT_FACTOR)
  }

  public resetZoom() {
    if (!this.zoomBehavior) return
    d3.select(this.canvasElement).transition().duration(ZOOM_DURATION_NORMAL).call(this.zoomBehavior.transform, d3.zoomIdentity)
  }

  public draw(config: any) {
    this.currentConfig = config

    const graph = config.graph as Map<string, Set<string>>
    const {
      activeStudent,
      currentUser,
    } = config

    const currentFocalId = activeStudent ? nodeKey('student', activeStudent) : 'global'
    const lastFocalId = this.canvasElement.getAttribute('data-focal-id')
    const focalChanged = currentFocalId !== lastFocalId
    this.canvasElement.setAttribute('data-focal-id', currentFocalId)

    const canvas = this.canvasElement
    const parentWidth = canvas.parentElement?.clientWidth
    const parentHeight = canvas.parentElement?.clientHeight

    // If the parent element exists but is not yet laid out (width/height is 0),
    // skip redraw to prevent initial visual glitches and redundant canvas resizes.
    if (canvas.parentElement && (parentWidth === 0 || parentHeight === 0)) {
      return
    }

    const width = parentWidth || canvas.clientWidth || 900
    const height = parentHeight || canvas.clientHeight || 600

    const dpi = window.devicePixelRatio || 1
    const targetW = width * dpi
    const targetH = height * dpi

    const currentW = canvas.width / dpi
    const currentH = canvas.height / dpi
    const diffW = Math.abs(currentW - width)
    const diffH = Math.abs(currentH - height)

    // Only resize canvas if dimensions are uninitialized (0) or have changed significantly (> 30px)
    // to prevent visual flickering caused by subpixel layout shifts during CSS scale transitions.
    if (canvas.width === 0 || canvas.height === 0 || diffW > 30 || diffH > 30) {
      canvas.width = targetW
      canvas.height = targetH
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('[ForceGraphRenderer] Failed to get 2D context')
      return
    }
    ctx.resetTransform()
    ctx.scale(dpi, dpi)

    const { nodes: nodesToDraw, links: linksToDraw } = ForceGraphDataBuilder.build(config)

    // Call physics setup
    const simulation = this.physics.setup(nodesToDraw, linksToDraw, width, height, config)

    // Set up Zoom
    if (!this.zoomBehavior) {
      this.zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([ZOOM_SCALE_MIN, ZOOM_SCALE_MAX])
        .filter((event: any) => {
          // Block zoom panning/gestures when clicking directly on graph nodes
          // to let D3 drag listeners process node translations without canvas scrolling.
          const sim = this.physics.getSimulation()
          if (sim) {
            const [mx, my] = d3.pointer(event, canvas)
            const simX = this.transform.invertX(mx)
            const simY = this.transform.invertY(my)
            const matchedNode = this.quadtree
              ? this.quadtree.find(simX, simY, HOVER_FIND_RADIUS)
              : sim.find(simX, simY, HOVER_FIND_RADIUS)
            if (matchedNode) {
              return false // Disable zoom event processing on this node click
            }
          }
          // Fall back to default D3 zoom event filter conditions (!event.ctrlKey && !event.button)
          return !event.ctrlKey && !event.button
        })
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
        // Find nearest node within find radius using quadtree if available
        return this.quadtree
          ? this.quadtree.find(simX, simY, HOVER_FIND_RADIUS)
          : simulation.find(simX, simY, HOVER_FIND_RADIUS)
      })
      .on('start', (event: any) => {
        if (!event.subject) return
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event: any) => {
        if (!event.subject) return
        const [mx, my] = d3.pointer(event, canvas)
        event.subject.fx = this.transform.invertX(mx)
        event.subject.fy = this.transform.invertY(my)
      })
      .on('end', (event: any) => {
        if (!event.subject) return
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
      const node = this.quadtree
        ? this.quadtree.find(simX, simY, HOVER_FIND_RADIUS)
        : simulation.find(simX, simY, HOVER_FIND_RADIUS)
      if (node && this.callbacks.onNodeClick) {
        this.callbacks.onNodeClick(node)
      }
    })

    // Set up Mousemove (Hover)
    d3.select(canvas).on('mousemove', (event: any) => {
      const [mx, my] = d3.pointer(event, canvas)
      const simX = this.transform.invertX(mx)
      const simY = this.transform.invertY(my)
      const node = this.quadtree
        ? this.quadtree.find(simX, simY, HOVER_FIND_RADIUS)
        : simulation.find(simX, simY, HOVER_FIND_RADIUS)

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

    // Restart simulation to reheat it
    simulation.alpha(1).restart()
  }

  private renderCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    nodes: ForceGraphNode[],
    links: ForceGraphLink[]
  ) {
    this.lastNodes = nodes
    this.lastLinks = links
    
    // Rebuild spatial quadtree index for O(log N) queries
    this.quadtree = d3.quadtree<ForceGraphNode>()
      .x(d => d.x ?? 0)
      .y(d => d.y ?? 0)
      .addAll(nodes)

    ForceGraphCanvasPainter.draw(ctx, width, height, nodes, links, this.transform, this.currentConfig, this.hoveredNode)
  }
}
