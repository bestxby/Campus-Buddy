import type { PathResult, BuddyResult, NodeKind } from '@/types'
import { INTEREST_CATEGORIES } from '@/constants/interests'

const SOCIAL_BOOST_FACTOR = 1.3
const BOOST_LIMIT = 1.0

export function nodeKey(kind: NodeKind, name: string): string {
  return `${kind}:${name}`
}

/** Get the domain key for an interest tag name */
function getInterestDomain(interestName: string): string | null {
  for (const [domain, tags] of Object.entries(INTEREST_CATEGORIES)) {
    if (tags.includes(interestName)) return domain
  }
  return null
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
          return { path, hops, readable: path.map(n => n.substring(n.indexOf(':') + 1)) }
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
    privateStudents: Set<string> = new Set(),
    socialStudents: Set<string> = new Set()
  ): { activities: string[]; buddies: BuddyResult[] } {
    const start = nodeKey('student', student)
    if (!graph.has(start)) {
      return { activities: [], buddies: [] }
    }

    const sInterests = Array.from(graph.get(start) ?? []).filter(n => n.startsWith('interest:'))
    const sInterestSet = new Set(sInterests)
    
    const matchedActivities = new Set<string>()
    const seenBuddies = new Set<string>()
    const rankedBuddies: BuddyResult[] = []

    for (const interest of sInterests) {
      for (const neighbor of graph.get(interest) ?? []) {
        if (neighbor.startsWith('activity:')) {
          const actName = neighbor.replace('activity:', '')
          matchedActivities.add(actName)
        } else if (neighbor.startsWith('student:') && neighbor !== start) {
          const buddyName = neighbor.replace('student:', '')
          if (privateStudents.has(buddyName)) continue
          if (seenBuddies.has(buddyName)) continue
          seenBuddies.add(buddyName)

          const bNode = nodeKey('student', buddyName)
          const bInterests = new Set<string>()
          for (const n of graph.get(bNode) ?? []) {
            if (n.startsWith('interest:')) {
              bInterests.add(n)
            }
          }

          let intersectCount = 0
          const sharedInterests: string[] = []
          for (const i of sInterests) {
            if (bInterests.has(i)) {
              intersectCount++
              sharedInterests.push(i.replace('interest:', ''))
            }
          }
          const unionCount = sInterestSet.size + bInterests.size - intersectCount
          let jaccard = unionCount > 0 ? intersectCount / unionCount : 0

          // Boost Jaccard similarity score for social/talent mode students, capping at 1.0
          if (socialStudents.has(buddyName)) {
            jaccard = Math.min(BOOST_LIMIT, jaccard * SOCIAL_BOOST_FACTOR)
          }

          rankedBuddies.push({ name: buddyName, jaccard, sharedCount: intersectCount, sharedInterests })
        }
      }
    }

    rankedBuddies.sort((a, b) => b.jaccard - a.jaccard || a.name.localeCompare(b.name))

    // ── Domain-level fallback for unmatched activities ──
    // If an activity's interests have no direct match with the student,
    // but the student shares the same interest domain, still recommend it.
    const sDomains = new Set<string>()
    for (const i of sInterests) {
      const domain = getInterestDomain(i.replace('interest:', ''))
      if (domain) sDomains.add(domain)
    }

    // Collect all activities in the graph
    for (const [node, neighbors] of graph.entries()) {
      if (!node.startsWith('activity:')) continue
      const actName = node.replace('activity:', '')
      if (matchedActivities.has(actName)) continue // already matched by exact interest

      // Check if any of the activity's interests share a domain with the student
      for (const neighbor of neighbors) {
        if (!neighbor.startsWith('interest:')) continue
        const actInterest = neighbor.replace('interest:', '')
        const actDomain = getInterestDomain(actInterest)
        if (actDomain && sDomains.has(actDomain)) {
          matchedActivities.add(actName)
          break
        }
      }
    }

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
