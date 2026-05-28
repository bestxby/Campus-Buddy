import * as d3 from 'd3'
import { nodeKey } from '@/composables/useGraph'
import type { ForceGraphNode, ForceGraphLink } from '@/types'

// Constants for D3 Physics Simulation
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

const PREWARM_TICKS_GLOBAL = 120
const PREWARM_TICKS_FOCAL = 45

export class ForceGraphPhysics {
  private simulation: d3.Simulation<any, any> | null = null

  public getSimulation(): d3.Simulation<any, any> | null {
    return this.simulation
  }

  public setup(
    nodesToDraw: ForceGraphNode[],
    linksToDraw: ForceGraphLink[],
    width: number,
    height: number,
    config: any
  ): d3.Simulation<any, any> {
    const { activeStudent, showGlobal } = config
    const isGlobal = showGlobal || !activeStudent

    // 1. Map existing coordinates of nodes to preserve positions during redrawing
    const nodeMap = new Map<string, any>()
    if (this.simulation) {
      for (const node of this.simulation.nodes()) {
        nodeMap.set(node.id, { x: node.x, y: node.y, vx: node.vx, vy: node.vy, fx: node.fx, fy: node.fy })
      }
      this.simulation.stop()
    } else {
      this.simulation = d3.forceSimulation()
    }

    const simulation = this.simulation

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

    return simulation
  }

  public stop(): void {
    if (this.simulation) {
      this.simulation.stop()
      this.simulation.on('tick', null)
      this.simulation = null
    }
  }
}
