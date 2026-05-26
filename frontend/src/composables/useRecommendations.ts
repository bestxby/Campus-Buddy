import { useRecommendationStore } from '@/stores/recommendation'
import { ref, computed, watch } from 'vue'
import type { BuddyResult, MatchedFriend, PathResult } from '@/types'
import { useGraphStore } from '@/stores/graph'
import { nodeKey } from '@/composables/useGraph'
import { useAuthStore } from '@/stores/auth'

// Domain state delegates to Pinia store with writable computed for pathResult
export const pathResult = computed<PathResult | null>({
  get: () => useRecommendationStore().pathResult,
  set: (val) => { useRecommendationStore().pathResult = val }
})
export const promotedActivities = computed(() => useRecommendationStore().promotedActivities)
export const recommendations = computed(() => useRecommendationStore().recommendations)

// UI State resides locally in the composable (shared ref instances)
export const activeStudent = ref<string | null>(null)
export const searchQuery = ref('')
export const suggestions = ref<string[]>([])
export const searchFriendQuery = ref('')
export const activeFilter = ref('全部')
export const expandedGroups = ref<Record<string, boolean>>({})

// Helper functions/actions
export const runRecommendations = (student: string): void => {
  useRecommendationStore().runRecommendations(student)
}

export const getSharedInterest = (
  student: string,
  other: string,
  otherType: 'student' | 'activity',
): string => useRecommendationStore().getSharedInterest(student, other, otherType)

export const getBuddiesForActivity = (studentName: string, activityName: string): string[] =>
  useRecommendationStore().getBuddiesForActivity(studentName, activityName)

export const onSearchInput = (): void => {
  const query = searchQuery.value.trim()
  if (query.length < 1) { suggestions.value = []; return }
  const matched: string[] = []
  const graphStore = useGraphStore()
  for (const node of graphStore.graph.keys()) {
    if (node.startsWith('student:')) {
      const name = node.replace('student:', '')
      if (name.toLowerCase().includes(query.toLowerCase())) matched.push(name)
    }
  }
  suggestions.value = matched.slice(0, 5)
}

export const selectStudent = (name: string): void => {
  searchQuery.value = name
  suggestions.value = []
  searchFriendQuery.value = ''
  activeStudent.value = name
  activeFilter.value = '全部'
  expandedGroups.value = {}
  runRecommendations(name)
}

export const clearSearch = (): void => {
  searchQuery.value = ''
  activeStudent.value = null
  searchFriendQuery.value = ''
  suggestions.value = []
  activeFilter.value = '全部'
  expandedGroups.value = {}
  useRecommendationStore().clearRecommendations()
}

export const toggleGroupExpand = (interest: string): void => {
  expandedGroups.value[interest] = !expandedGroups.value[interest]
}

export const isGroupExpanded = (interest: string): boolean =>
  !!expandedGroups.value[interest]

// Computed UI helpers
export const filterTabs = computed((): string[] => {
  if (!activeStudent.value) return ['全部']
  const sNode = nodeKey('student', activeStudent.value)
  const graphStore = useGraphStore()
  const interests = Array.from(graphStore.graph.get(sNode) ?? [])
    .filter(n => n.startsWith('interest:'))
    .map(n => n.replace('interest:', ''))
    .sort()
  return ['全部', ...interests]
})

export const filteredActivitiesGrouped = computed((): Record<string, string[]> => {
  const groups: Record<string, string[]> = {}
  if (!activeStudent.value) return groups
  for (const act of recommendations.value.activities) {
    const interest = getSharedInterest(activeStudent.value, act, 'activity')
    if (activeFilter.value === '全部' || interest === activeFilter.value) {
      if (!groups[interest]) groups[interest] = []
      groups[interest].push(act)
    }
  }
  return groups
})

export const hasActivities = computed(() => recommendations.value.activities.length > 0)

export const matchedFriends = computed((): MatchedFriend[] => {
  const query = searchFriendQuery.value.trim().toLowerCase()
  if (!query || !activeStudent.value) return []
  const graphStore = useGraphStore()
  const sNode = nodeKey('student', activeStudent.value)
  const selfInterests = new Set(
    Array.from(graphStore.graph.get(sNode) ?? [])
      .filter(n => n.startsWith('interest:'))
  )
  const results: MatchedFriend[] = []
  for (const node of graphStore.graph.keys()) {
    if (!node.startsWith('student:')) continue
    const name = node.slice('student:'.length)
    if (name === activeStudent.value) continue
    if (!name.toLowerCase().includes(query)) continue
    const shared = Array.from(graphStore.graph.get(node) ?? [])
      .filter(i => selfInterests.has(i))
      .map(i => i.replace('interest:', ''))
    results.push({ name, sharedCount: shared.length, sharedInterests: shared })
  }
  results.sort((a, b) =>
    b.sharedCount !== a.sharedCount ? b.sharedCount - a.sharedCount : a.name.localeCompare(b.name)
  )
  return results.slice(0, 30)
})

watch(
  () => {
    try {
      return useAuthStore().signedUpActivities
    } catch {
      return []
    }
  },
  () => {
    if (activeStudent.value) {
      runRecommendations(activeStudent.value)
    }
  },
  { deep: true }
)

