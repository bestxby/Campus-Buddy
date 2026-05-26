import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { BuddyResult, PathResult } from '@/types'
import { useGraphStore } from './graph'
import { calculateJaccardSimilarity, findPath, nodeKey } from '@/utils/graph-algorithms'

export const useRecommendationStore = defineStore('recommendation', () => {
  const pathResult = ref<PathResult | null>(null)
  const promotedActivities = ref<Set<string>>(new Set())

  const recommendations = reactive({
    activities: [] as string[],
    buddies: [] as BuddyResult[],
  })

  function runRecommendations(student: string): void {
    const graphStore = useGraphStore()
    const { activities, buddies } = calculateJaccardSimilarity(
      graphStore.graph,
      student,
      promotedActivities.value
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
        if (buddyNames.has(name)) result.push(name)
      }
    }
    return result
  }

  function calculatePath(studentA: string, studentB: string): void {
    const graphStore = useGraphStore()
    pathResult.value = findPath(graphStore.graph, studentA, studentB)
  }

  function clearRecommendations(): void {
    recommendations.activities = []
    recommendations.buddies = []
    pathResult.value = null
  }

  return {
    pathResult,
    promotedActivities,
    recommendations,
    runRecommendations,
    getSharedInterest,
    getBuddiesForActivity,
    calculatePath,
    clearRecommendations,
  }
})
