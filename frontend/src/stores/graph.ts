import { defineStore } from 'pinia'
import { ref, reactive, computed, triggerRef } from 'vue'
import type { GraphStats } from '@/types'
import { GraphAlgorithms, nodeKey } from '@/utils/graph-algorithms'
import { ADMIN_NAME, addInterestTagToTaxonomy } from '@/constants/interests'

export const useGraphStore = defineStore('graph', () => {
  const graph = ref<Map<string, Set<string>>>(new Map())
  const privateStudents = ref<Set<string>>(new Set())
  const socialStudents = ref<Set<string>>(new Set())

  function setStudentPrivacy(student: string, isPrivate: boolean): void {
    if (isPrivate) {
      privateStudents.value.add(student)
    } else {
      privateStudents.value.delete(student)
    }
    triggerRef(privateStudents)
  }

  function setStudentSocial(student: string, isSocial: boolean): void {
    if (isSocial) {
      socialStudents.value.add(student)
    } else {
      socialStudents.value.delete(student)
    }
    triggerRef(socialStudents)
  }

  const studentsList = computed<string[]>(() => {
    return Array.from(graph.value.keys()).filter(n => n.startsWith('student:'))
  })

  const allActivitiesList = computed(() => {
    const list: Array<{ name: string; interests: string[]; studentCount: number }> = []
    for (const [node, neighbors] of graph.value.entries()) {
      if (node.startsWith('activity:')) {
        const name = node.slice('activity:'.length)
        const interests: string[] = []
        let studentCount = 0
        for (const neighbor of neighbors) {
          if (neighbor.startsWith('interest:')) {
            interests.push(neighbor.slice('interest:'.length))
          } else if (neighbor.startsWith('student:')) {
            studentCount++
          }
        }
        list.push({ name, interests, studentCount })
      }
    }
    return list.sort((a, b) => b.studentCount - a.studentCount || a.name.localeCompare(b.name))
  })

  const stats = reactive<GraphStats>({
    studentsCount: 0,
    interestsCount: 0,
    activitiesCount: 0,
    componentsCount: 0,
  })

  // Set of subscribers to respond to stats/graph updates
  const statsUpdateSubscribers = new Set<() => void>()

  function registerOnStatsUpdate(callback: () => void): () => void {
    statsUpdateSubscribers.add(callback)
    return () => {
      statsUpdateSubscribers.delete(callback)
    }
  }

  function addEdge(u: string, v: string): void {
    if (!graph.value.has(u)) graph.value.set(u, new Set())
    if (!graph.value.has(v)) graph.value.set(v, new Set())
    graph.value.get(u)!.add(v)
    graph.value.get(v)!.add(u)
  }

  let componentsDebounceTimer: any = null

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

    // Immediately trigger reactive dependencies on the graph Map
    triggerRef(graph)

    // Immediately notify subscribers for basic stats/filters
    statsUpdateSubscribers.forEach(cb => cb())

    // Debounce the heavy BFS connected components computation
    if (componentsDebounceTimer) {
      clearTimeout(componentsDebounceTimer)
    }
    componentsDebounceTimer = setTimeout(() => {
      stats.componentsCount = GraphAlgorithms.countConnectedComponents(graph.value)
      componentsDebounceTimer = null
    }, 100)
  }

  interface GraphDataSchema {
    students: Array<[string, string]>
    activities: Array<[string, string]>
    registrations?: Array<[string, string]>
  }

  async function loadGraphData(): Promise<void> {
    try {
      const res = await fetch(`${(import.meta as any).env.BASE_URL}graph_data.json`)
      if (!res.ok) throw new Error('graph_data.json not found')
      const data = await res.json() as GraphDataSchema

      if (!data || !Array.isArray(data.students) || !Array.isArray(data.activities)) {
        throw new Error('Invalid graph data format: students and activities must be arrays')
      }

      graph.value.clear()
      privateStudents.value.clear()
      privateStudents.value.add('张子涵')

      const allStudentNames = Array.from(new Set(data.students.map((s: any) => s[0]))) as string[]

      socialStudents.value.clear()
      // Seed default social students dynamically: around 15% of the students
      for (const student of allStudentNames) {
        if (student !== '张子涵' && Math.random() < 0.15) {
          socialStudents.value.add(student)
        }
      }

      // 1. Select 4 random students to make them completely isolated (degree 0)
      const isolatedTargets = new Set<string>()
      while (isolatedTargets.size < 4 && allStudentNames.length > 10) {
        const randomName = allStudentNames[Math.floor(Math.random() * allStudentNames.length)]
        if (randomName && randomName !== ADMIN_NAME) {
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

  function addInterestNode(name: string, domain: 'sports' | 'arts' | 'tech' | 'social'): void {
    const interestNode = `interest:${name}`
    if (!graph.value.has(interestNode)) {
      graph.value.set(interestNode, new Set())
    }
    addInterestTagToTaxonomy(name, domain)
    updateStats()
  }

  return {
    graph,
    stats,
    privateStudents,
    setStudentPrivacy,
    socialStudents,
    setStudentSocial,
    registerOnStatsUpdate,
    addEdge,
    updateStats,
    loadGraphData,
    addActivity,
    deleteActivity,
    addInterestNode,
    studentsList,
    allActivitiesList,
  }
})

