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

export interface IcebreakingStat {
  name: string
  interest: string
  score: number
  unregisteredCount: number
}

export class GraphAnalyticsService {
  private static instance: GraphAnalyticsService

  public readonly topSocialStudents = ref<CentralityResult[]>([])
  public readonly bridgeStudents = ref<CentralityResult[]>([])
  public readonly isolatedCount = ref(0)
  public readonly popularInterests = ref<InterestStat[]>([])
  public readonly icebreakingActivities = ref<IcebreakingStat[]>([])

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
    return list.sort((a, b) => b.score - a.score).slice(0, 5)
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
      .slice(0, 3)
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

  private calculateIcebreakingPotential(): IcebreakingStat[] {
    const list: IcebreakingStat[] = []
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

      const interestNeighbors = graph.get(interestNode) ?? new Set<string>()
      const interestStudents: string[] = []
      for (const n of interestNeighbors) {
        if (n.startsWith('student:')) interestStudents.push(n)
      }

      const unregistered = interestStudents.filter(s => {
        const sNeighbors = graph.get(s) ?? new Set<string>()
        return !sNeighbors.has(node)
      })

      if (unregistered.length < 2) {
        list.push({ name: actName, interest: interestName, score: 0, unregisteredCount: unregistered.length })
        continue
      }

      let unconnectedPairs = 0
      const neighborSets = unregistered.map(s => graph.get(s) ?? new Set<string>())

      for (let i = 0; i < unregistered.length; i++) {
        const setI = neighborSets[i]
        for (let j = i + 1; j < unregistered.length; j++) {
          const setJ = neighborSets[j]
          const [smaller, larger] = setI.size <= setJ.size ? [setI, setJ] : [setJ, setI]
          let sharesNeighbor = false
          for (const n of smaller) {
            if (larger.has(n)) { sharesNeighbor = true; break }
          }
          if (!sharesNeighbor) unconnectedPairs++
        }
      }

      const score = Math.min(100, Math.round(unconnectedPairs * 15))
      list.push({
        name: actName,
        interest: interestName,
        score,
        unregisteredCount: unregistered.length
      })
    }

    return list.sort((a, b) => b.score - a.score || b.unregisteredCount - a.unregisteredCount).slice(0, 5)
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
      this.icebreakingActivities.value = this.calculateIcebreakingPotential()
      this.debounceTimer = null
    }, 150)
  }
}

export const graphAnalyticsService = GraphAnalyticsService.getInstance()
