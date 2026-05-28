import * as d3 from 'd3'
import type { HoveredConnectionDetail, ForceGraphNode, ForceGraphLink } from '@/types'
import { nodeKey } from '@/composables/useGraph'
import { ForceGraphDataBuilder } from './ForceGraphDataBuilder'
import { ForceGraphTooltipHelper } from './ForceGraphTooltipHelper'
import { ForceGraphCanvasPainter } from './ForceGraphCanvasPainter'

// Named Constants for D3 Physics Simulation
const ALPHA_DECAY = 0.028
const VELOCITY_DECAY = 0.45

const LINK_DISTANCE_GLOBAL = 80
const LINK_DISTANCE_FOCAL = 70
const LINK_DISTANCE_DEFAULT = 120

const CHARGE_STRENGTH_GLOBAL_INTEREST = -80
const CHARGE_STRENGTH_GLOBAL_ACTIVITY = -40
const CHARGE_STRENGTH_GLOBAL_STUDENT = -15
const CHARGE_STRENGTH_DEFAULT = -260
const CHARGE_THETA = 1.0

const COLLISION_RADIUS_GLOBAL_INTEREST = 18
const COLLISION_RADIUS_GLOBAL_DEFAULT = 10
const COLLISION_RADIUS_FOCAL = 35
const COLLISION_RADIUS_DEFAULT = 20

const HOVER_FIND_RADIUS = 20

const ZOOM_SCALE_MIN = 0.1
const ZOOM_SCALE_MAX = 5
const ZOOM_DURATION_FAST = 200
const ZOOM_DURATION_NORMAL = 300
const ZOOM_SCALE_IN_FACTOR = 1.25
const ZOOM_SCALE_OUT_FACTOR = 0.8

const PREWARM_TICKS_GLOBAL = 120
const PREWARM_TICKS_FOCAL = 45

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

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('[ForceGraphRenderer] Failed to get 2D context')
      return
    }
    ctx.scale(dpi, dpi)

    const { nodes: nodesToDraw, links: linksToDraw } = ForceGraphDataBuilder.build(config)
    const isGlobal = showGlobal || !activeStudent

    // 1. Map existing coordinates of nodes to preserve positions during redrawing
    const nodeMap = new Map<string, any>()
    if (this.simulation) {
      for (const node of this.simulation.nodes()) {
        nodeMap.set(node.id, { x: node.x, y: node.y, vx: node.vx, vy: node.vy, fx: node.fx, fy: node.fy })
      }
    }

    // 2. Assign coordinates to the new node instances
    for (const node of nodesToDraw) {
      const old = nodeMap.get(node.id)
      if (old) {
        node.x = old.x
        node.y = old.y
        node.vx = old.vx
        node.vy = old.vy
        node.fx = old.fx
        node.fy = old.fy
      }
    }

    // 3. Stop simulation while re-configuring to avoid race conditions
    if (this.simulation) {
      this.simulation.stop()
    } else {
      this.simulation = d3.forceSimulation()
    }

    const simulation = this.simulation

    // Update nodes & simulation constants
    simulation
      .nodes(nodesToDraw)
      .alphaDecay(ALPHA_DECAY)
      .velocityDecay(VELOCITY_DECAY)

    // Set/update force: center
    simulation.force('center', d3.forceCenter(width / 2, height / 2))

    // Set/update force: link
    let linkForce = simulation.force('link') as d3.ForceLink<any, any> | null
    if (!linkForce) {
      linkForce = d3.forceLink().id((d: any) => d.id)
      simulation.force('link', linkForce)
    }
    linkForce.links(linksToDraw).distance((d: any) => {
      if (isGlobal) return LINK_DISTANCE_GLOBAL
      const sId = typeof d.source === 'object' ? d.source.id : d.source
      const tId = typeof d.target === 'object' ? d.target.id : d.target
      const focal = nodeKey('student', activeStudent ?? '')
      return (sId === focal || tId === focal) ? LINK_DISTANCE_FOCAL : LINK_DISTANCE_DEFAULT
    })

    // Set/update force: charge
    let chargeForce = simulation.force('charge') as d3.ForceManyBody<any> | null
    if (!chargeForce) {
      chargeForce = d3.forceManyBody()
      simulation.force('charge', chargeForce)
    }
    chargeForce.strength((d: any) => {
      if (isGlobal) {
        return d.type === 'interest' ? CHARGE_STRENGTH_GLOBAL_INTEREST
             : d.type === 'activity' ? CHARGE_STRENGTH_GLOBAL_ACTIVITY
             : CHARGE_STRENGTH_GLOBAL_STUDENT
      }
      return CHARGE_STRENGTH_DEFAULT
    }).theta(CHARGE_THETA)

    // Set/update force: collision
    let collisionForce = simulation.force('collision') as d3.ForceCollide<any> | null
    if (!collisionForce) {
      collisionForce = d3.forceCollide()
      simulation.force('collision', collisionForce)
    }
    collisionForce.radius((d: any) => {
      if (isGlobal) {
        return d.type === 'interest' ? COLLISION_RADIUS_GLOBAL_INTEREST : COLLISION_RADIUS_GLOBAL_DEFAULT
      }
      return d.id === nodeKey('student', activeStudent ?? '') ? COLLISION_RADIUS_FOCAL : COLLISION_RADIUS_DEFAULT
    })

    // Pre-warm the simulation synchronously to prevent messy "explosion" animations
    const prewarmTicks = isGlobal ? PREWARM_TICKS_GLOBAL : PREWARM_TICKS_FOCAL
    for (let i = 0; i < prewarmTicks; i++) {
      simulation.tick()
    }

    // Set up Zoom
    if (!this.zoomBehavior) {
      this.zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([ZOOM_SCALE_MIN, ZOOM_SCALE_MAX])
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
        // Find nearest node within find radius
        return simulation.find(simX, simY, HOVER_FIND_RADIUS)
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
      const node = simulation.find(simX, simY, HOVER_FIND_RADIUS)
      if (node && this.callbacks.onNodeClick) {
        this.callbacks.onNodeClick(node)
      }
    })

    // Set up Mousemove (Hover)
    d3.select(canvas).on('mousemove', (event: any) => {
      const [mx, my] = d3.pointer(event, canvas)
      const simX = this.transform.invertX(mx)
      const simY = this.transform.invertY(my)
      const node = simulation.find(simX, simY, HOVER_FIND_RADIUS)

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
    ForceGraphCanvasPainter.draw(ctx, width, height, nodes, links, this.transform, this.currentConfig, this.hoveredNode)
  }
}
