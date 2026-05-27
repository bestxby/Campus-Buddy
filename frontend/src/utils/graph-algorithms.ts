import type { PathResult, BuddyResult, NodeKind } from '@/types'

export function nodeKey(kind: NodeKind, name: string): string {
  return `${kind}:${name}`
}

export class GraphAlgorithms {
  public static countConnectedComponents(graph: Map<string, Set<string>>): number {
    const visited = new Set<string>()
    let count = 0
    for (const node of graph.keys()) {
      if (visited.has(node)) continue
      count++
      const queue = [node]
      let head = 0
      visited.add(node)
      while (head < queue.length) {
        const current = queue[head++]
        for (const neighbor of graph.get(current) ?? []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
          }
        }
      }
    }
    return count
  }

  public static findPath(
    graph: Map<string, Set<string>>,
    studentA: string,
    studentB: string,
    privateStudents: Set<string> = new Set()
  ): PathResult | null {
    const start = nodeKey('student', studentA)
    const end = nodeKey('student', studentB)

    if (!graph.has(start) || !graph.has(end)) return null
    if (start === end) return { path: [start], hops: 0, readable: [studentA] }

    // If target is private, do not allow finding a path to them
    if (privateStudents.has(studentB)) return null

    const parent = new Map<string, string>()
    const queue: string[] = [start]
    let head = 0
    parent.set(start, '')

    while (head < queue.length) {
      const current = queue[head++]
      for (const neighbor of graph.get(current) ?? []) {
        if (neighbor.startsWith('student:')) {
          const name = neighbor.slice('student:'.length)
          // Skip intermediate private students
          if (privateStudents.has(name) && neighbor !== start) continue
        }
        if (parent.has(neighbor)) continue
        parent.set(neighbor, current)
        if (neighbor === end) {
          const path: string[] = []
          let node: string = end
          while (node !== '') {
            path.push(node)
            node = parent.get(node)!
          }
          path.reverse()
          const hops = path.filter(n => n.startsWith('student:')).length - 1
          return { path, hops, readable: path.map(n => n.split(':')[1]) }
        }
        queue.push(neighbor)
      }
    }
    return null
  }

  public static calculateJaccardSimilarity(
    graph: Map<string, Set<string>>,
    student: string,
    promotedActivities: Set<string>,
    privateStudents: Set<string> = new Set()
  ): { activities: string[]; buddies: BuddyResult[] } {
    const start = nodeKey('student', student)
    if (!graph.has(start)) {
      return { activities: [], buddies: [] }
    }

    const sInterests = Array.from(graph.get(start) ?? []).filter(n => n.startsWith('interest:'))
    const sInterestSet = new Set(sInterests)
    
    // Find registered activities to exclude them
    const registeredActivities = new Set(
      Array.from(graph.get(start) ?? [])
        .filter(n => n.startsWith('activity:'))
        .map(n => n.replace('activity:', ''))
    )

    const matchedActivities = new Set<string>()
    const seenBuddies = new Set<string>()
    const rankedBuddies: BuddyResult[] = []

    for (const interest of sInterests) {
      for (const neighbor of graph.get(interest) ?? []) {
        if (neighbor.startsWith('activity:')) {
          const actName = neighbor.replace('activity:', '')
          if (!registeredActivities.has(actName)) {
            matchedActivities.add(actName)
          }
        } else if (neighbor.startsWith('student:') && neighbor !== start) {
          const buddyName = neighbor.replace('student:', '')
          if (privateStudents.has(buddyName)) continue
          if (seenBuddies.has(buddyName)) continue
          seenBuddies.add(buddyName)

          const bNode = nodeKey('student', buddyName)
          const bInterests = new Set(
            Array.from(graph.get(bNode) ?? []).filter(n => n.startsWith('interest:'))
          )
          const intersectCount = sInterests.filter(i => bInterests.has(i)).length
          const unionCount = new Set([...sInterestSet, ...bInterests]).size
          const jaccard = unionCount > 0 ? intersectCount / unionCount : 0
          const sharedInterests = sInterests
            .filter(i => bInterests.has(i))
            .map(i => i.replace('interest:', ''))

          rankedBuddies.push({ name: buddyName, jaccard, sharedCount: intersectCount, sharedInterests })
        }
      }
    }

    rankedBuddies.sort((a, b) => b.jaccard - a.jaccard || a.name.localeCompare(b.name))

    const sortedActivities = Array.from(matchedActivities).sort((a, b) => {
      const aPromoted = promotedActivities.has(a) ? 1 : 0
      const bPromoted = promotedActivities.has(b) ? 1 : 0
      if (aPromoted !== bPromoted) return bPromoted - aPromoted
      return a.localeCompare(b)
    })

    return {
      activities: sortedActivities,
      buddies: rankedBuddies,
    }
  }
}
