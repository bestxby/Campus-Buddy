import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'

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

  private constructor() {
    // Register recalculation callback to break circular dependencies!
    // Defer registration to next tick to ensure Pinia is initialized and active
    setTimeout(() => {
      try {
        useGraphStore().registerOnStatsUpdate(() => {
          this.recalculateGraphInsights()
        })
      } catch (err) {
        // Ignore errors in test environments where Pinia is not active or has been torn down
      }
    }, 0)
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
        if (name === '系统管理员') continue
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

    const sample = students
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(sampleSize, students.length))

    for (const start of sample) {
      const queue: string[] = [start]
      const parent: Record<string, string[]> = {}
      const dist: Record<string, number> = { [start]: 0 }

      while (queue.length > 0) {
        const u = queue.shift()!
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
      .filter(x => x.name !== '系统管理员')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  private countIsolatedStudents(): number {
    let count = 0
    const graph = useGraphStore().graph
    for (const [node, neighbors] of graph.entries()) {
      if (node.startsWith('student:') && node !== 'student:系统管理员' && neighbors.size === 0) {
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
    setTimeout(() => {
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
    }, 0)
  }
}

export const graphAnalyticsService = GraphAnalyticsService.getInstance()
