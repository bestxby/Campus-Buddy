import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { BuddyResult, PathResult } from '@/types'
import { useGraphStore } from './graph'
import { GraphAlgorithms, nodeKey } from '@/utils/graph-algorithms'

export const useRecommendationStore = defineStore('recommendation', () => {
  const pathResult = ref<PathResult | null>(null)
  const promotedActivities = ref<Set<string>>(new Set())

  const recommendations = reactive({
    activities: [] as string[],
    buddies: [] as BuddyResult[],
  })

  const activeStudent = ref<string | null>(null)
  const searchQuery = ref('')
  const suggestions = ref<string[]>([])
  const searchFriendQuery = ref('')
  const activeFilter = ref('全部')
  const expandedGroups = ref<Record<string, boolean>>({})

  function runRecommendations(student: string): void {
    const graphStore = useGraphStore()
    const { activities, buddies } = GraphAlgorithms.calculateJaccardSimilarity(
      graphStore.graph,
      student,
      promotedActivities.value,
      graphStore.privateStudents,
      graphStore.socialStudents
    )
    recommendations.activities = activities
    recommendations.buddies = buddies
  }

  function getSharedInterest(
    student: string,
    other: string,
    otherType: 'student' | 'activity'
  ): string {
    const graphStore = useGraphStore()
    const sNode = nodeKey('student', student)
    const oNode = nodeKey(otherType, other)
    const sInterests = Array.from(graphStore.graph.get(sNode) ?? [])
      .filter(n => n.startsWith('interest:'))
    const oInterests = new Set(
      Array.from(graphStore.graph.get(oNode) ?? [])
        .filter(n => n.startsWith('interest:'))
    )
    const match = sInterests.find(x => oInterests.has(x))
    return match ? match.replace('interest:', '') : ''
  }

  function getBuddiesForActivity(studentName: string, activityName: string): string[] {
    const graphStore = useGraphStore()
    const actNode = nodeKey('activity', activityName)
    const actNeighbors = graphStore.graph.get(actNode) ?? new Set<string>()
    const buddyNames = new Set(recommendations.buddies.map(b => b.name))
    const result: string[] = []
    for (const n of actNeighbors) {
      if (n.startsWith('student:')) {
        const name = n.slice('student:'.length)
        if (name !== studentName && buddyNames.has(name)) result.push(name)
      }
    }
    return result
  }

  function calculatePath(studentA: string, studentB: string): void {
    const graphStore = useGraphStore()
    pathResult.value = GraphAlgorithms.findPath(graphStore.graph, studentA, studentB, graphStore.privateStudents)
  }

  function clearRecommendations(): void {
    recommendations.activities = []
    recommendations.buddies = []
    pathResult.value = null
    activeStudent.value = null
    searchQuery.value = ''
    suggestions.value = []
    searchFriendQuery.value = ''
    activeFilter.value = '全部'
    expandedGroups.value = {}
  }

  return {
    pathResult,
    promotedActivities,
    recommendations,
    activeStudent,
    searchQuery,
    suggestions,
    searchFriendQuery,
    activeFilter,
    expandedGroups,
    runRecommendations,
    getSharedInterest,
    getBuddiesForActivity,
    calculatePath,
    clearRecommendations,
  }
})
