import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useAuthStore } from '@/stores/auth'
import { ADMIN_NAME, INTEREST_CATEGORIES, DOMAIN_META } from '@/constants/interests'

export interface CentralityResult {
  name: string
  score: number
}

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

export class GraphAnalyticsService {
  private static instance: GraphAnalyticsService

  public readonly topSocialStudents = ref<CentralityResult[]>([])
  public readonly bridgeStudents = ref<CentralityResult[]>([])
  public readonly isolatedCount = ref(0)
  public readonly popularInterests = ref<InterestStat[]>([])
  public readonly popularActivities = ref<PopularActivityStat[]>([])
  public readonly themeCommunities = ref<ThemeCommunityStat[]>([])

  public readonly connectivityRate = ref(0)
  public readonly averagePathLength = ref(0)
  public readonly clusteringCoefficient = ref(0)
  public readonly networkDensity = ref(0)

  private unsubscribe: (() => void) | null = null
  private debounceTimer: any = null

  private constructor() {}

  public initialize(): void {
    if (this.unsubscribe) return
    try {
      this.unsubscribe = useGraphStore().registerOnStatsUpdate(() => {
        this.recalculateGraphInsights()
      })
      this.recalculateGraphInsights()
    } catch (err) {
      // Ignore errors in test environments where Pinia is not active or has been torn down
    }
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  public static getInstance(): GraphAnalyticsService {
    if (!GraphAnalyticsService.instance) {
      GraphAnalyticsService.instance = new GraphAnalyticsService()
    }
    return GraphAnalyticsService.instance
  }

  private calculateDegreeCentrality(): CentralityResult[] {
    const list: CentralityResult[] = []
    const graph = useGraphStore().graph
    for (const [node, neighbors] of graph.entries()) {
      if (node.startsWith('student:')) {
        const name = node.substring(8) // 'student:'.length is 8
        if (name === ADMIN_NAME) continue
        list.push({ name, score: neighbors.size })
      }
    }
    return list.sort((a, b) => b.score - a.score).slice(0, 10)
  }

  private calculateBetweennessCentrality(sampleSize = 50): CentralityResult[] {
    const graph = useGraphStore().graph
    const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
    if (students.length === 0) return []

    const counts: Record<string, number> = {}
    students.forEach(s => { counts[s] = 0 })
 
    // Unbiased Fisher-Yates Shuffle with Seeded Random for stability
    const shuffled = this.shuffle(students)
    const sample = shuffled.slice(0, Math.min(sampleSize, students.length))

    for (const start of sample) {
      const queue: string[] = [start]
      let head = 0
      const parent: Record<string, string[]> = {}
      const dist: Record<string, number> = { [start]: 0 }

      while (head < queue.length) {
        const u = queue[head++]
        for (const v of graph.get(u) ?? []) {
          if (!dist.hasOwnProperty(v)) {
            dist[v] = dist[u] + 1
            queue.push(v)
            parent[v] = [u]
          } else if (dist[v] === dist[u] + 1) {
            parent[v].push(u)
          }
        }
      }

      const dependency: Record<string, number> = {}
      const nodesSortedByDist = Object.keys(dist).sort((a, b) => dist[b] - dist[a])

      nodesSortedByDist.forEach(w => {
        dependency[w] = 0
      })

      nodesSortedByDist.forEach(w => {
        const pw = parent[w] || []
        pw.forEach(v => {
          dependency[v] += (1 + dependency[w]) / pw.length
        })
        if (w !== start && w.startsWith('student:')) {
          counts[w] += dependency[w]
        }
      })
    }

    return Object.entries(counts)
      .map(([key, score]) => ({
        name: key.includes(':') ? key.substring(key.indexOf(':') + 1) : key,
        score: Math.round(score * 10) / 10
      }))
      .filter(x => x.name !== ADMIN_NAME)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  private countIsolatedStudents(): number {
    let count = 0
    const graph = useGraphStore().graph
    for (const [node, neighbors] of graph.entries()) {
      if (node.startsWith('student:') && node !== `student:${ADMIN_NAME}` && neighbors.size === 0) {
        count++
      }
    }
    return count
  }

  private calculatePopularActivities(): PopularActivityStat[] {
    const list: PopularActivityStat[] = []
    const graph = useGraphStore().graph

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

  private calculateThemeCommunities(): ThemeCommunityStat[] {
    const list: ThemeCommunityStat[] = []
    const graph = useGraphStore().graph

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

  private calculateConnectivityRate(): number {
    const total = useGraphStore().stats.studentsCount
    if (!total) return 0
    return Math.round((1 - this.isolatedCount.value / total) * 1000) / 10
  }

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array]
    let seed = 987654321
    // A simple, fast LCG seeded random function to guarantee reproducible sampling
    const random = () => {
      seed = Math.imul(seed ^ (seed >>> 16), 2246822507)
      seed = Math.imul(seed ^ (seed >>> 13), 3266489909)
      return ((seed ^= seed >>> 16) >>> 0) / 4294967296
    }
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  private calculateAveragePathLength(sampleSize = 30): number {
    const graph = useGraphStore().graph
    const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
    if (students.length < 2) return 0
 
    // Unbiased deterministic sampling shuffle
    const shuffled = this.shuffle(students)
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
 
  /**
   * Note on Clustering Coefficient definition in bipartite/tripartite networks:
   * Since this is an affiliation/heterogeneous network (students connect only to interests/activities),
   * direct triangles do not exist in the raw graph (clustering would be 0).
   * Therefore, we project the network into a student-student social network (where an edge
   * exists if two students share at least one interest or activity), and compute the local
   * clustering coefficient on this projected unipartite graph.
   */
  private calculateClusteringCoefficient(sampleSize = 30): number {
    const graph = useGraphStore().graph
    const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
    if (students.length < 3) return 0
 
    // Unbiased deterministic sampling shuffle
    const shuffled = this.shuffle(students)
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
      for (let i = 0; i < neighborArray.length; i++) {
        const u = neighborArray[i]
        const uNeighbors = graph.get(u) ?? new Set()
        const uInterests = new Set<string>()
        for (const item of uNeighbors) {
          uInterests.add(item)
        }

        for (let j = i + 1; j < neighborArray.length; j++) {
          const v = neighborArray[j]
          const vNeighbors = graph.get(v) ?? new Set()
          let shares = false
          for (const item of vNeighbors) {
            if (uInterests.has(item)) {
              shares = true
              break
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

  /**
   * Note on Network Density definition:
   * Since this is an affiliation/multipartite network (students are only connected to interests/activities,
   * rather than each other), the maximum possible edges is studentNodes * (interestsCount + activitiesCount).
   * Therefore, standard unipartite density 2E / N(N-1) is inappropriate. We compute the bipartite density
   * of student affiliations, i.e., actual student-to-slot edges divided by max potential affiliation edges.
   */
  private calculateNetworkDensity(): number {
    const graph = useGraphStore().graph
    let edgesCount = 0
    let studentNodes = 0
    for (const [node, neighbors] of graph.entries()) {
      if (node.startsWith('student:')) {
        studentNodes++
        edgesCount += neighbors.size
      }
    }
    if (studentNodes < 2) return 0

    const stats = useGraphStore().stats
    const totalSlots = stats.interestsCount + stats.activitiesCount
    if (!totalSlots) return 0
    const density = edgesCount / (studentNodes * totalSlots)
    return Math.round(density * 1000) / 100
  }

  public recalculateGraphInsights(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    // ✅ PERFORMANCE OPTIMIZATION: Do not perform heavy centrality calculations unless the admin is logged in.
    // This prevents thread freezing on the student dashboard and login screen, keeping all action buttons 100% responsive.
    try {
      if (useAuthStore().currentUserRole !== 'admin') {
        this.debounceTimer = null
        return
      }
    } catch (err) {
      // Pinia might not be active in unit testing environments
    }

    this.debounceTimer = setTimeout(() => {
      try {
        this.topSocialStudents.value = this.calculateDegreeCentrality()
        this.bridgeStudents.value    = this.calculateBetweennessCentrality()
        this.isolatedCount.value      = this.countIsolatedStudents()

        this.connectivityRate.value = this.calculateConnectivityRate()
        this.averagePathLength.value = this.calculateAveragePathLength()
        this.clusteringCoefficient.value = this.calculateClusteringCoefficient()
        this.networkDensity.value = this.calculateNetworkDensity()

        const list: InterestStat[] = []
        const graph = useGraphStore().graph
        for (const [node, neighbors] of graph.entries()) {
          if (node.startsWith('interest:')) {
            const name = node.slice('interest:'.length)
            let studentCount = 0
            for (const n of neighbors) {
              if (n.startsWith('student:')) studentCount++
            }
            list.push({ name, count: studentCount })
          }
        }
        this.popularInterests.value = list.sort((a, b) => b.count - a.count)
        this.popularActivities.value = this.calculatePopularActivities()
        this.themeCommunities.value = this.calculateThemeCommunities()
      } catch (err) {
        console.warn('[GraphAnalyticsService] Recalculate failed, probably during HMR or store unmount:', err)
      } finally {
        this.debounceTimer = null
      }
    }, 150)
  }
}

export const graphAnalyticsService = GraphAnalyticsService.getInstance()
