import { INTEREST_CATEGORIES, DOMAIN_META } from '@/constants/interests'
import { shuffle } from './seeded-shuffle'

export interface InterestStat {
  name: string
  count: number
}

export interface PopularActivityStat {
  name: string
  interest: string
  count: number
}

export interface ThemeCommunityStat {
  domain: string
  label: string
  icon: string
  color: string
  size: number
  percentage: number
  avgDegree: number
  tagsCount: number
}

export function calculatePopularActivities(graph: Map<string, Set<string>>): PopularActivityStat[] {
  const list: PopularActivityStat[] = []

  for (const [node, neighbors] of graph.entries()) {
    if (!node.startsWith('activity:')) continue
    const actName = node.slice('activity:'.length)

    let interestNode: string | undefined
    for (const n of neighbors) {
      if (n.startsWith('interest:')) { interestNode = n; break }
    }
    if (!interestNode) continue
    const interestName = interestNode.slice('interest:'.length)

    let studentCount = 0
    for (const n of neighbors) {
      if (n.startsWith('student:')) studentCount++
    }

    list.push({
      name: actName,
      interest: interestName,
      count: studentCount
    })
  }

  return list.sort((a, b) => b.count - a.count).slice(0, 5)
}

export function calculateThemeCommunities(graph: Map<string, Set<string>>): ThemeCommunityStat[] {
  const list: ThemeCommunityStat[] = []

  // First, pass over domains to compute sizes and average degrees
  const domainStats = DOMAIN_META.map(meta => {
    const tags = INTEREST_CATEGORIES[meta.key] || []
    const tagsSet = new Set(tags.map(t => `interest:${t}`))

    const domainStudents = new Set<string>()
    let totalDegree = 0

    for (const [node, neighbors] of graph.entries()) {
      if (!node.startsWith('student:')) continue
      
      let hasInterest = false
      for (const n of neighbors) {
        if (tagsSet.has(n)) {
          hasInterest = true
          break
        }
      }

      if (hasInterest) {
        domainStudents.add(node)
        totalDegree += neighbors.size
      }
    }

    const size = domainStudents.size
    const avgDegree = size > 0 ? Math.round((totalDegree / size) * 10) / 10 : 0

    return {
      meta,
      size,
      avgDegree,
      tagsCount: tags.length
    }
  })

  const totalSize = domainStats.reduce((sum, item) => sum + item.size, 0)
  let sumPercentages = 0

  const listWithRawPercents = domainStats.map(stat => {
    const rawPercent = totalSize > 0 ? (stat.size / totalSize) * 100 : 0
    const percentage = Math.round(rawPercent)
    sumPercentages += percentage
    return {
      stat,
      percentage,
      error: rawPercent - percentage
    }
  })

  // Adjust to exactly 100 if sumPercentages is not 100 and totalSize > 0
  if (totalSize > 0 && sumPercentages !== 100) {
    const diff = 100 - sumPercentages
    if (diff > 0) {
      const sorted = [...listWithRawPercents].sort((a, b) => b.error - a.error)
      if (sorted[0]) sorted[0].percentage += diff
    } else {
      const sorted = [...listWithRawPercents].sort((a, b) => a.error - b.error)
      if (sorted[0]) sorted[0].percentage += diff
    }
  }

  for (const item of listWithRawPercents) {
    list.push({
      domain: item.stat.meta.key,
      label: item.stat.meta.label,
      icon: item.stat.meta.icon,
      color: item.stat.meta.color,
      size: item.stat.size,
      percentage: item.percentage,
      avgDegree: item.stat.avgDegree,
      tagsCount: item.stat.tagsCount
    })
  }

  return list
}

export function calculateAveragePathLength(graph: Map<string, Set<string>>, sampleSize = 30): number {
  const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
  if (students.length < 2) return 0

  // Unbiased deterministic sampling shuffle
  const shuffled = shuffle(students)
  const sample = shuffled.slice(0, Math.min(sampleSize, students.length))

  let totalDist = 0
  let pathCount = 0

  for (const start of sample) {
    const dist: Record<string, number> = { [start]: 0 }
    const queue = [start]
    let head = 0

    while (head < queue.length) {
      const u = queue[head++]
      const d = dist[u]
      for (const v of graph.get(u) ?? []) {
        if (!dist.hasOwnProperty(v)) {
          dist[v] = d + 1
          queue.push(v)
          if (v.startsWith('student:')) {
            totalDist += (d + 1) / 2
            pathCount++
          }
        }
      }
    }
  }

  return pathCount > 0 ? Math.round((totalDist / pathCount) * 100) / 100 : 0
}

export function calculateClusteringCoefficient(graph: Map<string, Set<string>>, sampleSize = 30): number {
  const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
  if (students.length < 3) return 0

  // Unbiased deterministic sampling shuffle
  const shuffled = shuffle(students)
  const sample = shuffled.slice(0, Math.min(sampleSize, students.length))

  let totalCoef = 0
  let validNodes = 0

  for (const s of sample) {
    const neighbors = new Set<string>()
    const sNeighbors = graph.get(s) ?? new Set()
    for (const n of sNeighbors) {
      for (const neighbor of graph.get(n) ?? []) {
        if (neighbor !== s && neighbor.startsWith('student:')) {
          neighbors.add(neighbor)
        }
      }
    }

    if (neighbors.size < 2) continue

    let neighborEdges = 0
    const neighborArray = Array.from(neighbors)

    // Pre-calculate filtered interest/activity sets for all 2-hop neighbors
    const studentToInterestsMap = new Map<string, Set<string>>()
    for (const student of neighborArray) {
      const interests = new Set<string>()
      const studentNeighbors = graph.get(student) ?? new Set()
      for (const n of studentNeighbors) {
        if (n.startsWith('interest:') || n.startsWith('activity:')) {
          interests.add(n)
        }
      }
      studentToInterestsMap.set(student, interests)
    }

    for (let i = 0; i < neighborArray.length; i++) {
      const u = neighborArray[i]
      const uInterests = studentToInterestsMap.get(u)!
      if (uInterests.size === 0) continue

      for (let j = i + 1; j < neighborArray.length; j++) {
        const v = neighborArray[j]
        const vInterests = studentToInterestsMap.get(v)!

        let shares = false
        // Intersect the smaller set to save comparisons
        if (uInterests.size < vInterests.size) {
          for (const item of uInterests) {
            if (vInterests.has(item)) {
              shares = true
              break
            }
          }
        } else {
          for (const item of vInterests) {
            if (uInterests.has(item)) {
              shares = true
              break
            }
          }
        }
        if (shares) neighborEdges++
      }
    }

    const k = neighbors.size
    const maxEdges = (k * (k - 1)) / 2
    totalCoef += neighborEdges / maxEdges
    validNodes++
  }

  return validNodes > 0 ? Math.round((totalCoef / validNodes) * 100) / 100 : 0
}

export function calculateNetworkDensity(graph: Map<string, Set<string>>, studentNodesCount: number, interestsCount: number, activitiesCount: number): number {
  if (studentNodesCount < 2) return 0
  let edgesCount = 0
  for (const [node, neighbors] of graph.entries()) {
    if (node.startsWith('student:')) {
      edgesCount += neighbors.size
    }
  }

  const totalSlots = interestsCount + activitiesCount
  if (!totalSlots) return 0
  const density = edgesCount / (studentNodesCount * totalSlots)
  return Math.round(density * 1000) / 100
}
