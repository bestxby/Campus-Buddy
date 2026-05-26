import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { GraphStats } from '@/types'
import { countConnectedComponents, nodeKey } from '@/utils/graph-algorithms'

export const useGraphStore = defineStore('graph', () => {
  const graph = ref<Map<string, Set<string>>>(new Map())
  const privateStudents = ref<Set<string>>(new Set())

  function setStudentPrivacy(student: string, isPrivate: boolean): void {
    if (isPrivate) {
      privateStudents.value.add(student)
    } else {
      privateStudents.value.delete(student)
    }
  }
  const stats = reactive<GraphStats>({
    studentsCount: 0,
    interestsCount: 0,
    activitiesCount: 0,
    componentsCount: 0,
  })

  // Set of subscribers to respond to stats/graph updates
  const statsUpdateSubscribers = new Set<() => void>()

  function registerOnStatsUpdate(callback: () => void): void {
    statsUpdateSubscribers.add(callback)
  }

  function addEdge(u: string, v: string): void {
    if (!graph.value.has(u)) graph.value.set(u, new Set())
    if (!graph.value.has(v)) graph.value.set(v, new Set())
    graph.value.get(u)!.add(v)
    graph.value.get(v)!.add(u)
  }

  function updateStats(): void {
    let s = 0, i = 0, a = 0
    for (const node of graph.value.keys()) {
      if (node.startsWith('student:'))       s++
      else if (node.startsWith('interest:')) i++
      else if (node.startsWith('activity:')) a++
    }
    stats.studentsCount   = s
    stats.interestsCount  = i
    stats.activitiesCount = a
    stats.componentsCount = countConnectedComponents(graph.value)

    // Notify all subscribers
    statsUpdateSubscribers.forEach(cb => cb())
  }

  async function loadGraphData(): Promise<void> {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}graph_data.json`)
      if (!res.ok) throw new Error('graph_data.json not found')
      const data = await res.json()

      graph.value.clear()
      privateStudents.value.clear()
      privateStudents.value.add('张子涵')

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
          const sNode = nodeKey('student', student)
          if (!graph.value.has(sNode)) {
            graph.value.set(sNode, new Set())
          }
          continue
        }
        addEdge(nodeKey('student', student), nodeKey('interest', interest))
      }

      // 3. Add activity interests
      for (const [activity, interest] of data.activities) {
        addEdge(nodeKey('activity', activity), nodeKey('interest', interest))
      }

      // 4. Add registrations
      if (data.registrations) {
        for (const [student, activity] of data.registrations) {
          if (isolatedTargets.has(student)) continue
          if (Math.random() > 0.20) {
            addEdge(nodeKey('student', student), nodeKey('activity', activity))
          }
        }
      }

      // 5. Add random registrations
      for (const student of allStudentNames) {
        if (isolatedTargets.has(student)) continue
        if (Math.random() < 0.25) {
          const sNode = nodeKey('student', student)
          const studentInterests = Array.from(graph.value.get(sNode) ?? [])
            .filter(n => n.startsWith('interest:'))
          
          if (studentInterests.length > 0) {
            const randomIntNode = studentInterests[Math.floor(Math.random() * studentInterests.length)]
            const activities = Array.from(graph.value.get(randomIntNode) ?? [])
              .filter(n => n.startsWith('activity:'))
            
            if (activities.length > 0) {
              const randomActNode = activities[Math.floor(Math.random() * activities.length)]
              addEdge(sNode, randomActNode)
            }
          }
        }
      }

      updateStats()
    } catch (err) {
      console.error('[GraphStore] Failed to load graph data:', err)
    }
  }

  function addActivity(name: string, interests: string[]): void {
    const actNode = `activity:${name}`
    if (!graph.value.has(actNode)) {
      graph.value.set(actNode, new Set())
    }
    for (const interest of interests) {
      addEdge(actNode, `interest:${interest}`)
    }
    updateStats()
  }

  function deleteActivity(name: string): void {
    const actNode = `activity:${name}`
    if (!graph.value.has(actNode)) return
    const neighbors = graph.value.get(actNode) ?? new Set()
    for (const neighbor of neighbors) {
      const neighborSet = graph.value.get(neighbor)
      if (neighborSet) {
        neighborSet.delete(actNode)
      }
    }
    graph.value.delete(actNode)
    updateStats()
  }

  return {
    graph,
    stats,
    privateStudents,
    setStudentPrivacy,
    registerOnStatsUpdate,
    addEdge,
    updateStats,
    loadGraphData,
    addActivity,
    deleteActivity,
  }
})

