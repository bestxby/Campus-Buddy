import { nodeKey } from '@/composables/useGraph'

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
  nodes: any[]
  links: any[]
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

    let nodesToDraw: any[] = []
    let linksToDraw: any[] = []
    const addedNodes = new Set<string>()

    const isGlobal = showGlobal || !activeStudent

    if (isGlobal) {
      // 1. Gather all interest and activity nodes
      for (const node of graph.keys()) {
        if (node.startsWith('interest:')) {
          addedNodes.add(node)
          nodesToDraw.push({ id: node, type: 'interest', name: node.replace('interest:', '') })
        } else if (node.startsWith('activity:')) {
          if (hideActivities) continue
          addedNodes.add(node)
          nodesToDraw.push({ id: node, type: 'activity', name: node.replace('activity:', '') })
        }
      }

      // 2. Select top 80 most active students by degree (excluding admin)
      if (!hideBuddies) {
        const studentDegrees: Array<{ node: string; name: string; deg: number }> = []
        for (const [node, neighbors] of graph.entries()) {
          if (node.startsWith('student:') && node !== 'student:系统管理员') {
            studentDegrees.push({
              node,
              name: node.replace('student:', ''),
              deg: neighbors.size
            })
          }
        }
        studentDegrees.sort((a, b) => b.deg - a.deg)
        const topStudents = studentDegrees.slice(0, 80)
        for (const s of topStudents) {
          if (privateStudentsSet.has(s.name) && s.name !== currentUser && currentUserRole !== 'admin') continue
          addedNodes.add(s.node)
          nodesToDraw.push({ id: s.node, type: 'student', name: s.name })
        }
      }

      // 3. Add edges between the drawn nodes
      for (const nodeA of addedNodes) {
        const neighbors = graph.get(nodeA) ?? []
        for (const neighbor of neighbors) {
          if (addedNodes.has(neighbor)) {
            if (nodeA < neighbor) {
              let type = 'default'
              if (nodeA.startsWith('student:') && neighbor.startsWith('activity:')) {
                type = 'registration'
              } else if (neighbor.startsWith('student:') && nodeA.startsWith('activity:')) {
                type = 'registration'
              }
              linksToDraw.push({ source: nodeA, target: neighbor, type })
            }
          }
        }
      }
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

      const focalNeighbors = graph.get(focalNode) ?? []
      for (const neighbor of focalNeighbors) {
        if (neighbor.startsWith('activity:')) {
          if (hideActivities) continue
          const name = neighbor.replace('activity:', '')
          if (!addedNodes.has(neighbor)) {
            addedNodes.add(neighbor)
            nodesToDraw.push({ id: neighbor, type: 'activity', name })
          }
          linksToDraw.push({ source: focalNode, target: neighbor, type: 'registration-active' })
          continue
        }
        if (neighbor.startsWith('interest:')) {
          if (!addedNodes.has(neighbor)) {
            addedNodes.add(neighbor)
            nodesToDraw.push({ id: neighbor, type: 'interest', name: neighbor.replace('interest:', '') })
          }
          linksToDraw.push({ source: focalNode, target: neighbor })
          for (const sub of graph.get(neighbor) ?? []) {
            const subName = sub.split(':')[1]
            const isBuddy = sub.startsWith('student:') && !hideBuddies && allowedBuddies.has(subName)
            const isActivity = sub.startsWith('activity:') && !hideActivities && recommendations.activities.includes(subName)
            if (isBuddy || isActivity) {
              if (isBuddy && privateStudentsSet.has(subName) && subName !== currentUser && currentUserRole !== 'admin') continue
              if (!addedNodes.has(sub)) {
                addedNodes.add(sub)
                nodesToDraw.push({ id: sub, type: sub.startsWith('student:') ? 'student' : 'activity', name: subName })
              }
              linksToDraw.push({ source: neighbor, target: sub })
            }
          }
        }
      }
      // Buddy→activity registration edges
      for (const nodeA of addedNodes) {
        if (nodeA.startsWith('student:') && nodeA !== focalNode) {
          for (const reg of graph.get(nodeA) ?? []) {
            if (reg.startsWith('activity:') && addedNodes.has(reg))
              linksToDraw.push({ source: nodeA, target: reg, type: 'registration' })
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
          nodesToDraw.push({ id: nodeId, type: parts[0], name: parts.slice(1).join(':') })
        }
        if (i < pathNodes.length - 1) {
          const nextNodeId = pathNodes[i + 1]
          const exists = linksToDraw.some(l =>
            (l.source === nodeId && l.target === nextNodeId) ||
            (l.source === nextNodeId && l.target === nodeId)
          )
          if (!exists) linksToDraw.push({ source: nodeId, target: nextNodeId, type: 'shortest-path' })
        }
      }
    }

    return { nodes: nodesToDraw, links: linksToDraw }
  }
}
