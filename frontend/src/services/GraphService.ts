import { ref, reactive } from 'vue'
import type { GraphStats, PathResult } from '@/types'

export class GraphService {
  private static instance: GraphService

  public readonly graph = ref<Map<string, Set<string>>>(new Map())
  public readonly stats = reactive<GraphStats>({
    studentsCount: 0,
    interestsCount: 0,
    activitiesCount: 0,
    componentsCount: 0,
  })

  private onStatsUpdateCallbacks: Array<() => void> = []

  private constructor() {}

  public static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService()
    }
    return GraphService.instance
  }

  public registerOnStatsUpdate(callback: () => void): void {
    this.onStatsUpdateCallbacks.push(callback)
  }

  public nodeKey(kind: string, name: string): string {
    return `${kind}:${name}`
  }

  public getNodeInterests(nodeId: string): string[] {
    return Array.from(this.graph.value.get(nodeId) ?? []).filter(n => n.startsWith('interest:'))
  }

  public addEdge(u: string, v: string): void {
    if (!this.graph.value.has(u)) this.graph.value.set(u, new Set())
    if (!this.graph.value.has(v)) this.graph.value.set(v, new Set())
    this.graph.value.get(u)!.add(v)
    this.graph.value.get(v)!.add(u)
  }

  private countConnectedComponents(): number {
    const visited = new Set<string>()
    let count = 0
    for (const node of this.graph.value.keys()) {
      if (visited.has(node)) continue
      count++
      const queue = [node]
      visited.add(node)
      while (queue.length > 0) {
        const current = queue.shift()!
        for (const neighbor of this.graph.value.get(current) ?? []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
          }
        }
      }
    }
    return count
  }

  public updateStats(): void {
    let s = 0, i = 0, a = 0
    for (const node of this.graph.value.keys()) {
      if (node.startsWith('student:'))       s++
      else if (node.startsWith('interest:')) i++
      else if (node.startsWith('activity:')) a++
    }
    this.stats.studentsCount   = s
    this.stats.interestsCount  = i
    this.stats.activitiesCount = a
    this.stats.componentsCount = this.countConnectedComponents()

    // Trigger all registered callbacks (e.g. recalculating insights)
    this.onStatsUpdateCallbacks.forEach(cb => cb())
  }

  public findPath(studentA: string, studentB: string): PathResult | null {
    const start = this.nodeKey('student', studentA)
    const end   = this.nodeKey('student', studentB)

    if (!this.graph.value.has(start) || !this.graph.value.has(end)) return null
    if (start === end) return { path: [start], hops: 0, readable: [studentA] }

    // ✅ OPTIMIZED: Use parent-map BFS instead of spreading arrays at each step.
    // Memory: O(V) instead of O(path_len × V). No temporary array allocations during traversal.
    const parent = new Map<string, string>()
    const queue: string[] = [start]
    parent.set(start, '')

    while (queue.length > 0) {
      const current = queue.shift()!
      for (const neighbor of this.graph.value.get(current) ?? []) {
        if (parent.has(neighbor)) continue
        parent.set(neighbor, current)
        if (neighbor === end) {
          // Reconstruct path by walking the parent chain backwards
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

  public async loadGraphData(): Promise<void> {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}graph_data.json`)
      if (!res.ok) throw new Error('graph_data.json not found')
      const data = await res.json()

      this.graph.value.clear()

      // 1. Select 4 random students to make them completely isolated (degree 0)
      const allStudentNames = Array.from(new Set(data.students.map((s: any) => s[0]))) as string[]
      const isolatedTargets = new Set<string>()
      while (isolatedTargets.size < 4 && allStudentNames.length > 10) {
        const randomName = allStudentNames[Math.floor(Math.random() * allStudentNames.length)]
        if (randomName && randomName !== '系统管理员') {
          isolatedTargets.add(randomName)
        }
      }

      // 2. Add interests for students (excluding isolated ones)
      for (const [student, interest] of data.students) {
        if (isolatedTargets.has(student)) {
          const sNode = this.nodeKey('student', student)
          if (!this.graph.value.has(sNode)) {
            this.graph.value.set(sNode, new Set())
          }
          continue
        }
        this.addEdge(this.nodeKey('student', student), this.nodeKey('interest', interest))
      }

      // 3. Add activity interests
      for (const [activity, interest] of data.activities) {
        this.addEdge(this.nodeKey('activity', activity), this.nodeKey('interest', interest))
      }

      // 4. Add registrations
      if (data.registrations) {
        for (const [student, activity] of data.registrations) {
          if (isolatedTargets.has(student)) continue
          if (Math.random() > 0.20) {
            this.addEdge(this.nodeKey('student', student), this.nodeKey('activity', activity))
          }
        }
      }

      // 5. Add random registrations
      for (const student of allStudentNames) {
        if (isolatedTargets.has(student)) continue
        if (Math.random() < 0.25) {
          const sNode = this.nodeKey('student', student)
          const studentInterests = Array.from(this.graph.value.get(sNode) ?? [])
            .filter(n => n.startsWith('interest:'))
          
          if (studentInterests.length > 0) {
            const randomIntNode = studentInterests[Math.floor(Math.random() * studentInterests.length)]
            const activities = Array.from(this.graph.value.get(randomIntNode) ?? [])
              .filter(n => n.startsWith('activity:'))
            
            if (activities.length > 0) {
              const randomActNode = activities[Math.floor(Math.random() * activities.length)]
              this.addEdge(sNode, randomActNode)
            }
          }
        }
      }

      this.updateStats()
    } catch (err) {
      console.error('[GraphService] Failed to load graph data:', err)
    }
  }
}

export const graphService = GraphService.getInstance()
