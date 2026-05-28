import { nodeKey } from '@/composables/useGraph'
import type { ForceGraphNode, ForceGraphLink, NodeKind } from '@/types'

export interface ForceGraphConfig {
  graph: Map<string, Set<string>>
  activeStudent: string | null
  recommendations: {
    buddies: Array<{ name: string }>
    activities: string[]
  }
  hideBuddies: boolean
  hideActivities: boolean
  buddyLimit: number
  pathResult: { path: string[] } | null
  currentUser: string | null
  currentUserRole: string
  showGlobal?: boolean
  privateStudents?: Set<string>
}

export interface GraphDataResult {
  nodes: ForceGraphNode[]
  links: ForceGraphLink[]
}

export class ForceGraphDataBuilder {
  public static build(config: ForceGraphConfig): GraphDataResult {
    const {
      activeStudent,
      pathResult,
      showGlobal,
      privateStudents,
    } = config

    const isGlobal = showGlobal || !activeStudent
    if (isGlobal) {
      // Global force graph is disabled to prevent process lag and save memory
      return { nodes: [], links: [] }
    }

    const privateStudentsSet = privateStudents ?? new Set<string>()
    const nodesToDraw: ForceGraphNode[] = []
    const linksMap = new Map<string, ForceGraphLink>()
    const addedNodes = new Set<string>()

    // Helper to add links and prevent duplicates in O(1)
    const addLink = (src: string, tgt: string, type = 'default') => {
      const key = src < tgt ? `${src}->${tgt}` : `${tgt}->${src}`
      if (!linksMap.has(key)) {
        linksMap.set(key, { source: src, target: tgt, type })
      }
    }

    // 1. Add focal student node
    const focalNode = nodeKey('student', activeStudent)
    addedNodes.add(focalNode)
    nodesToDraw.push({ id: focalNode, type: 'student', name: activeStudent })

    // 2. Pre-rank buddies by shared interest overlap and select allowed buddies
    const allowedBuddies = this.getAllowedBuddies(
      activeStudent,
      config.recommendations,
      config.graph,
      config.buddyLimit
    )

    // 3. Map focal student's neighbors (interests and activities)
    this.addFocalNeighbors({
      config,
      focalNode,
      allowedBuddies,
      privateStudentsSet,
      addedNodes,
      nodesToDraw,
      addLink,
    })

    // 4. Connect buddies to their active registered activities
    this.addBuddyActivityEdges(addedNodes, focalNode, config.graph, addLink)

    // 5. Force-include shortest path nodes & links
    if (pathResult) {
      this.injectShortestPath(pathResult, addedNodes, nodesToDraw, linksMap)
    }

    const linksToDraw = Array.from(linksMap.values())
    return { nodes: nodesToDraw, links: linksToDraw }
  }

  /**
   * Pre-ranks recommended buddies by shared interest overlap and returns the allowed set under the limit
   */
  private static getAllowedBuddies(
    activeStudent: string,
    recommendations: ForceGraphConfig['recommendations'],
    graph: Map<string, Set<string>>,
    buddyLimit: number
  ): Set<string> {
    const sNode = nodeKey('student', activeStudent)
    const sInterests = Array.from(graph.get(sNode) ?? []).filter(i => i.startsWith('interest:'))
    const buddyOverlap = recommendations.buddies.map(b => {
      const bNode = nodeKey('student', b.name)
      const bInt = Array.from(graph.get(bNode) ?? []).filter(i => i.startsWith('interest:'))
      return { name: b.name, overlap: sInterests.filter(x => bInt.includes(x)).length }
    })
    buddyOverlap.sort((a, b) => b.overlap - a.overlap)
    return new Set(buddyOverlap.slice(0, buddyLimit).map(x => x.name))
  }

  /**
   * Helper parameters for focal neighbors addition
   */
  private static addFocalNeighbors(params: {
    config: ForceGraphConfig
    focalNode: string
    allowedBuddies: Set<string>
    privateStudentsSet: Set<string>
    addedNodes: Set<string>
    nodesToDraw: ForceGraphNode[]
    addLink: (src: string, tgt: string, type?: string) => void
  }): void {
    const { config, focalNode, allowedBuddies, privateStudentsSet, addedNodes, nodesToDraw, addLink } = params
    const { graph, hideBuddies, hideActivities, recommendations, currentUser, currentUserRole } = config

    const focalNeighbors = graph.get(focalNode) ?? []
    for (const neighbor of focalNeighbors) {
      if (neighbor.startsWith('activity:')) {
        if (hideActivities) continue
        const name = neighbor.replace('activity:', '')
        if (!addedNodes.has(neighbor)) {
          addedNodes.add(neighbor)
          nodesToDraw.push({ id: neighbor, type: 'activity', name })
        }
        addLink(focalNode, neighbor, 'registration-active')
        continue
      }
      if (neighbor.startsWith('interest:')) {
        if (!addedNodes.has(neighbor)) {
          addedNodes.add(neighbor)
          nodesToDraw.push({ id: neighbor, type: 'interest', name: neighbor.replace('interest:', '') })
        }
        addLink(focalNode, neighbor)
        
        for (const sub of graph.get(neighbor) ?? []) {
          const subName = sub.substring(sub.indexOf(':') + 1)
          const isBuddy = sub.startsWith('student:') && !hideBuddies && allowedBuddies.has(subName)
          const isActivity = sub.startsWith('activity:') && !hideActivities && recommendations.activities.includes(subName)
          if (isBuddy || isActivity) {
            if (isBuddy && privateStudentsSet.has(subName) && subName !== currentUser && currentUserRole !== 'admin') continue
            if (!addedNodes.has(sub)) {
              addedNodes.add(sub)
              nodesToDraw.push({ id: sub, type: sub.startsWith('student:') ? 'student' : 'activity', name: subName })
            }
            addLink(neighbor, sub)
          }
        }
      }
    }
  }

  /**
   * Generates links between the added buddies and activities they have registered for
   */
  private static addBuddyActivityEdges(
    addedNodes: Set<string>,
    focalNode: string,
    graph: Map<string, Set<string>>,
    addLink: (src: string, tgt: string, type?: string) => void
  ): void {
    for (const nodeA of addedNodes) {
      if (nodeA.startsWith('student:') && nodeA !== focalNode) {
        for (const reg of graph.get(nodeA) ?? []) {
          if (reg.startsWith('activity:') && addedNodes.has(reg)) {
            addLink(nodeA, reg, 'registration')
          }
        }
      }
    }
  }

  /**
   * Injects path nodes and overrides link styles along the shortest path
   */
  private static injectShortestPath(
    pathResult: NonNullable<ForceGraphConfig['pathResult']>,
    addedNodes: Set<string>,
    nodesToDraw: ForceGraphNode[],
    linksMap: Map<string, ForceGraphLink>
  ): void {
    const pathNodes = pathResult.path
    for (let i = 0; i < pathNodes.length; i++) {
      const nodeId = pathNodes[i]
      if (!addedNodes.has(nodeId)) {
        addedNodes.add(nodeId)
        const parts = nodeId.split(':')
        nodesToDraw.push({ id: nodeId, type: parts[0] as NodeKind, name: parts.slice(1).join(':') })
      }
      if (i < pathNodes.length - 1) {
        const nextNodeId = pathNodes[i + 1]
        const key = nodeId < nextNodeId ? `${nodeId}->${nextNodeId}` : `${nextNodeId}->${nodeId}`
        const existingLink = linksMap.get(key)
        if (!existingLink) {
          linksMap.set(key, { source: nodeId, target: nextNodeId, type: 'shortest-path' })
        } else {
          existingLink.type = 'shortest-path'
        }
      }
    }
  }
}
