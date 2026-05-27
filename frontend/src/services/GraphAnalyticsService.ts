import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useAuthStore } from '@/stores/auth'
import { ADMIN_NAME } from '@/constants/interests'

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

export class GraphAnalyticsService {
  private static instance: GraphAnalyticsService

  public readonly topSocialStudents = ref<CentralityResult[]>([])
  public readonly bridgeStudents = ref<CentralityResult[]>([])
  public readonly isolatedCount = ref(0)
  public readonly popularInterests = ref<InterestStat[]>([])
  public readonly popularActivities = ref<PopularActivityStat[]>([])

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
        const name = node.split(':')[1]
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

    // Fisher-Yates Shuffle for unbiased sampling
    const shuffled = [...students]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
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
        name: key.split(':')[1],
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

  private calculateConnectivityRate(): number {
    const total = useGraphStore().stats.studentsCount
    if (!total) return 0
    return Math.round((1 - this.isolatedCount.value / total) * 1000) / 10
  }

  private calculateAveragePathLength(sampleSize = 30): number {
    const graph = useGraphStore().graph
    const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
    if (students.length < 2) return 0

    const shuffled = [...students].sort(() => 0.5 - Math.random())
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

  private calculateClusteringCoefficient(sampleSize = 30): number {
    const graph = useGraphStore().graph
    const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
    if (students.length < 3) return 0

    const shuffled = [...students].sort(() => 0.5 - Math.random())
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
      this.debounceTimer = null
    }, 150)
  }
}

export const graphAnalyticsService = GraphAnalyticsService.getInstance()
