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
      graph,
      activeStudent,
      recommendations,
      hideBuddies,
      hideActivities,
      buddyLimit,
      pathResult,
      currentUser,
      currentUserRole,
      showGlobal,
      privateStudents,
    } = config

    const privateStudentsSet = privateStudents ?? new Set<string>()

    let nodesToDraw: ForceGraphNode[] = []
    const linksMap = new Map<string, ForceGraphLink>()
    const addedNodes = new Set<string>()

    const isGlobal = showGlobal || !activeStudent
    if (isGlobal) {
      // Global force graph is disabled to prevent process lag and save memory
      return { nodes: [], links: [] }
    } else {
      const focalNode = nodeKey('student', activeStudent)
      addedNodes.add(focalNode)
      nodesToDraw.push({ id: focalNode, type: 'student', name: activeStudent })

      // Pre-rank buddies by shared interest overlap
      const sNode = nodeKey('student', activeStudent)
      const sInterests = Array.from(graph.get(sNode) ?? []).filter(i => i.startsWith('interest:'))
      const buddyOverlap = recommendations.buddies.map(b => {
        const bNode = nodeKey('student', b.name)
        const bInt = Array.from(graph.get(bNode) ?? []).filter(i => i.startsWith('interest:'))
        return { name: b.name, overlap: sInterests.filter(x => bInt.includes(x)).length }
      })
      buddyOverlap.sort((a, b) => b.overlap - a.overlap)
      const allowedBuddies = new Set(buddyOverlap.slice(0, buddyLimit).map(x => x.name))

      // Helper to add links and prevent duplicates in O(1)
      const addLink = (src: string, tgt: string, type = 'default') => {
        const key = src < tgt ? `${src}->${tgt}` : `${tgt}->${src}`
        if (!linksMap.has(key)) {
          linksMap.set(key, { source: src, target: tgt, type })
        }
      }

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
      // Buddy→activity registration edges
      for (const nodeA of addedNodes) {
        if (nodeA.startsWith('student:') && nodeA !== focalNode) {
          for (const reg of graph.get(nodeA) ?? []) {
            if (reg.startsWith('activity:') && addedNodes.has(reg))
              addLink(nodeA, reg, 'registration')
          }
        }
      }
    }

    // Force include shortest path nodes and links if path search is active
    if (pathResult) {
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

    const linksToDraw = Array.from(linksMap.values())
    return { nodes: nodesToDraw, links: linksToDraw }
  }
}

