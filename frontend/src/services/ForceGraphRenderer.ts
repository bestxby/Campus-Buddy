import * as d3 from 'd3'
import type { HoveredConnectionDetail } from '@/types'
import { nodeKey } from '@/composables/useGraph'
import { ForceGraphDataBuilder, type ForceGraphConfig } from './ForceGraphDataBuilder'
import { ForceGraphTooltipHelper } from './ForceGraphTooltipHelper'

export interface ForceGraphCallbacks {
  onNodeClick?: (node: any) => void
  onHover?: (detail: HoveredConnectionDetail | null) => void
}

export class ForceGraphRenderer {
  private svgElement: SVGSVGElement
  private callbacks: ForceGraphCallbacks
  private zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
  private simulation: d3.Simulation<any, any> | null = null

  constructor(svgElement: SVGSVGElement, callbacks: ForceGraphCallbacks = {}) {
    this.svgElement = svgElement
    this.callbacks = callbacks
  }

  public destroy() {
    if (this.simulation) {
      this.simulation.stop()
    }
  }

  public zoomIn() {
    if (!this.zoomBehavior) return
    d3.select(this.svgElement).transition().duration(200).call(this.zoomBehavior.scaleBy, 1.25)
  }

  public zoomOut() {
    if (!this.zoomBehavior) return
    d3.select(this.svgElement).transition().duration(200).call(this.zoomBehavior.scaleBy, 0.8)
  }

  public resetZoom() {
    if (!this.zoomBehavior) return
    d3.select(this.svgElement).transition().duration(300).call(this.zoomBehavior.transform, d3.zoomIdentity)
  }

  public draw(config: ForceGraphConfig) {
    if (this.simulation) {
      this.simulation.stop()
    }

    const {
      graph,
      activeStudent,
      currentUser,
      showGlobal,
    } = config

    const svg = d3.select(this.svgElement)
    svg.selectAll('*').remove()

    const width = this.svgElement.clientWidth || 900
    const height = this.svgElement.clientHeight || 600

    const { nodes: nodesToDraw, links: linksToDraw } = ForceGraphDataBuilder.build(config)
    const isGlobal = showGlobal || !activeStudent

    // Helper for identifying path links
    const isPathLink = (sId: string, tId: string): boolean => {
      if (!config.pathResult) return false
      const path = config.pathResult.path
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === sId && path[i + 1] === tId) || (path[i] === tId && path[i + 1] === sId)) return true
      }
      return false
    }

    // ✅ OPTIMIZED: Tuned alphaDecay (0.028 > default 0.0228) and velocityDecay (0.45 > default 0.4)
    // so the simulation cools ~20% faster and nodes settle sooner, reducing total main-thread tick work.
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
      .force('charge', d3.forceManyBody().strength(isGlobal ? -180 : -260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => {
        if (isGlobal) {
          return d.type === 'interest' ? 16 : 10
        }
        return d.id === nodeKey('student', activeStudent ?? '') ? 35 : 20
      }))
    this.simulation = simulation

    const gContainer = svg.append('g')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', ev => gContainer.attr('transform', ev.transform))
    this.zoomBehavior = zoom
    svg.call(zoom)
    svg.call(zoom.transform, d3.zoomIdentity)

    // Links
    const link = gContainer.append('g').attr('class', 'links')
      .selectAll('line').data(linksToDraw).enter().append('line')
      .attr('stroke', (d: any) => {
        const sId = typeof d.source === 'object' ? d.source.id : d.source
        const tId = typeof d.target === 'object' ? d.target.id : d.target
        if (isPathLink(sId, tId)) return '#facc15'
        if (d.type === 'registration-active') return 'rgba(74,222,128,0.9)'
        if (d.type === 'registration') return 'rgba(253,151,31,0.45)'
        const sT = typeof d.source === 'object' ? d.source.type : (d.source.startsWith('student:') ? 'student' : 'interest')
        const tT = typeof d.target === 'object' ? d.target.type : (d.target.startsWith('student:') ? 'student' : 'interest')
        if ((sT === 'student' && tT === 'activity') || (sT === 'activity' && tT === 'student')) return 'rgba(6,182,212,0.6)'
        return 'rgba(255,255,255,0.08)'
      })
      .attr('stroke-dasharray', (d: any) => {
        const sId = typeof d.source === 'object' ? d.source.id : d.source
        const tId = typeof d.target === 'object' ? d.target.id : d.target
        if (isPathLink(sId, tId)) return null
        return d.type === 'registration-active' ? '4,4' : d.type === 'registration' ? '3,3' : null
      })
      .attr('stroke-width', (d: any) => {
        const sId = typeof d.source === 'object' ? d.source.id : d.source
        const tId = typeof d.target === 'object' ? d.target.id : d.target
        if (isPathLink(sId, tId)) return 4.0
        if (d.type === 'registration-active') return 2.5
        if (d.type === 'registration') return 1.5
        return 1.5
      })

    // Nodes
    const node = gContainer.append('g').attr('class', 'nodes')
      .selectAll('g').data(nodesToDraw).enter().append('g')
      .call(d3.drag<SVGGElement, any>()
        .on('start', (ev, d) => { if (!ev.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y })
        .on('end', (ev, d) => { if (!ev.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (_ev, d) => {
        if (this.callbacks.onNodeClick) {
          this.callbacks.onNodeClick(d)
        }
      })
      .on('mouseover', (_ev, d) => {
        const connectedIds = new Set<string>([d.id])
        link.style('opacity', (l: any) => {
          const connected = l.source.id === d.id || l.target.id === d.id
          if (connected) {
            connectedIds.add(l.source.id)
            connectedIds.add(l.target.id)
          }
          return connected ? 1.0 : 0.12
        })
        node.style('opacity', (n: any) => connectedIds.has(n.id) ? 1.0 : 0.15)

        if (activeStudent && this.callbacks.onHover) {
          const details = ForceGraphTooltipHelper.getTooltipDetails(d, activeStudent, currentUser, graph)
          this.callbacks.onHover(details)
        }
      })
      .on('mouseout', () => {
        link.style('opacity', 1.0)
        node.style('opacity', 1.0)
        if (this.callbacks.onHover) {
          this.callbacks.onHover(null)
        }
      })

    // Node circles
    const focalId = activeStudent ? nodeKey('student', activeStudent) : null
    node.append('circle')
      .attr('r', (d: any) => (focalId && d.id === focalId) ? 22 : d.type === 'interest' ? 14 : 10)
      .attr('fill', (d: any) => {
        if (focalId && d.id === focalId) return '#ec4899'
        if (d.type === 'student') return '#fd971f'
        if (d.type === 'interest') return '#3b82f6'
        if (d.type === 'activity' && activeStudent && graph.get(nodeKey('student', activeStudent))?.has(d.id)) return '#4ade80'
        return '#06b6d4'
      })
      .attr('stroke', (d: any) => {
        if (config.pathResult && config.pathResult.path.includes(d.id)) {
          if (focalId && d.id === focalId) return '#ec4899' // Keep focal node pink
          return '#facc15' // Neon Gold border for other path nodes
        }
        if (focalId && d.id === focalId) return '#facc15'
        if (activeStudent && d.type === 'activity' && graph.get(nodeKey('student', activeStudent))?.has(d.id)) return '#22c55e'
        return '#0f172a'
      })
      .attr('stroke-width', (d: any) => {
        if (config.pathResult && config.pathResult.path.includes(d.id)) return 3.5
        if (focalId && d.id === focalId) return 3.5
        return 2
      })
      .attr('class', (d: any) => {
        if (focalId && d.id === focalId) return 'node-focal-pulse'
        if (activeStudent && d.type === 'activity' && graph.get(nodeKey('student', activeStudent))?.has(d.id)) return 'glow-green'
        return d.type === 'interest' ? 'glow-cyan' : 'glow-orange'
      })
      .style('cursor', 'pointer')

    // Labels
    node.append('text')
      .text((d: any) => d.name)
      .attr('dx', (d: any) => d.id === focalId ? 26 : d.type === 'interest' ? 18 : 14)
      .attr('dy', 4)
      .attr('fill', '#f8fafc')
      .attr('font-size', '10px')
      .attr('font-weight', (d: any) => d.id === focalId ? 'bold' : 'normal')
      .style('pointer-events', 'none')

    // Tick
    simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })
  }
}
