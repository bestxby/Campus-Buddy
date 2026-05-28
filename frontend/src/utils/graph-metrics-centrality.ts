import { ADMIN_NAME } from '@/constants/interests'
import { shuffle } from './seeded-shuffle'

export interface CentralityResult {
  name: string
  score: number
}

export function calculateDegreeCentrality(graph: Map<string, Set<string>>): CentralityResult[] {
  const list: CentralityResult[] = []
  for (const [node, neighbors] of graph.entries()) {
    if (node.startsWith('student:')) {
      const name = node.substring(8) // 'student:'.length is 8
      if (name === ADMIN_NAME) continue
      list.push({ name, score: neighbors.size })
    }
  }
  return list.sort((a, b) => b.score - a.score).slice(0, 10)
}

export function calculateBetweennessCentrality(graph: Map<string, Set<string>>, sampleSize = 50): CentralityResult[] {
  const students = Array.from(graph.keys()).filter(n => n.startsWith('student:'))
  if (students.length === 0) return []

  const counts: Record<string, number> = {}
  students.forEach(s => { counts[s] = 0 })

  // Unbiased Fisher-Yates Shuffle with Seeded Random for stability
  const shuffled = shuffle(students)
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

export function countIsolatedStudents(graph: Map<string, Set<string>>): number {
  let count = 0
  for (const [node, neighbors] of graph.entries()) {
    if (node.startsWith('student:') && node !== `student:${ADMIN_NAME}` && neighbors.size === 0) {
      count++
    }
  }
  return count
}

export function calculateConnectivityRate(isolatedCount: number, studentsCount: number): number {
  if (!studentsCount) return 0
  return Math.round((1 - isolatedCount / studentsCount) * 1000) / 10
}
