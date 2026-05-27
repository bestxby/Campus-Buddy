import { useRecommendationStore } from '@/stores/recommendation'
import { computed, watch, customRef, ref } from 'vue'
import type { MatchedFriend, PathResult } from '@/types'
import { useGraphStore } from '@/stores/graph'
import { nodeKey } from '@/composables/useGraph'

// Named Constants
const DEBOUNCE_SEARCH_MS = 250
const DEBOUNCE_RECALC_MS = 300
const FRIEND_MATCH_LIMIT = 30

// Domain state delegates to Pinia store with writable computed for pathResult
export const pathResult = computed<PathResult | null>({
  get: () => useRecommendationStore().pathResult,
  set: (val) => { useRecommendationStore().pathResult = val }
})
export const promotedActivities = computed<Set<string>>({
  get: () => useRecommendationStore().promotedActivities,
  set: (val) => { useRecommendationStore().promotedActivities = val }
})
export const recommendations = computed(() => useRecommendationStore().recommendations)

// UI State delegates dynamically to Pinia recommendation store using customRef (no global caching)
export const activeStudent = customRef<string | null>((track, trigger) => ({
  get: () => { track(); try { return useRecommendationStore().activeStudent } catch (err) { console.error('[useRecommendations] Error getting activeStudent:', err); return null } },
  set: (val) => { try { useRecommendationStore().activeStudent = val; trigger() } catch (err) { console.error('[useRecommendations] Error setting activeStudent:', err) } }
}))
export const searchQuery = customRef<string>((track, trigger) => ({
  get: () => { track(); try { return useRecommendationStore().searchQuery } catch (err) { console.error('[useRecommendations] Error getting searchQuery:', err); return '' } },
  set: (val) => { try { useRecommendationStore().searchQuery = val; trigger() } catch (err) { console.error('[useRecommendations] Error setting searchQuery:', err) } }
}))
export const suggestions = customRef<string[]>((track, trigger) => ({
  get: () => { track(); try { return useRecommendationStore().suggestions } catch (err) { console.error('[useRecommendations] Error getting suggestions:', err); return [] } },
  set: (val) => { try { useRecommendationStore().suggestions = val; trigger() } catch (err) { console.error('[useRecommendations] Error setting suggestions:', err) } }
}))
export const searchFriendQuery = customRef<string>((track, trigger) => ({
  get: () => { track(); try { return useRecommendationStore().searchFriendQuery } catch (err) { console.error('[useRecommendations] Error getting searchFriendQuery:', err); return '' } },
  set: (val) => { try { useRecommendationStore().searchFriendQuery = val; trigger() } catch (err) { console.error('[useRecommendations] Error setting searchFriendQuery:', err) } }
}))
export const debouncedSearchFriendQuery = ref('')
let _searchFriendDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => searchFriendQuery.value,
  (newVal) => {
    if (_searchFriendDebounceTimer) clearTimeout(_searchFriendDebounceTimer)
    _searchFriendDebounceTimer = setTimeout(() => {
      debouncedSearchFriendQuery.value = newVal
    }, DEBOUNCE_SEARCH_MS)
  },
  { immediate: true }
)
export const activeFilter = customRef<string>((track, trigger) => ({
  get: () => { track(); try { return useRecommendationStore().activeFilter } catch (err) { console.error('[useRecommendations] Error getting activeFilter:', err); return '全部' } },
  set: (val) => { try { useRecommendationStore().activeFilter = val; trigger() } catch (err) { console.error('[useRecommendations] Error setting activeFilter:', err) } }
}))
export const expandedGroups = customRef<Record<string, boolean>>((track, trigger) => ({
  get: () => { track(); try { return useRecommendationStore().expandedGroups } catch (err) { console.error('[useRecommendations] Error getting expandedGroups:', err); return {} } },
  set: (val) => { try { useRecommendationStore().expandedGroups = val; trigger() } catch (err) { console.error('[useRecommendations] Error setting expandedGroups:', err) } }
}))

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
  if (_searchFriendDebounceTimer) clearTimeout(_searchFriendDebounceTimer)
  debouncedSearchFriendQuery.value = ''
  activeStudent.value = name
  activeFilter.value = '全部'
  expandedGroups.value = {}
  runRecommendations(name)
}

export const clearSearch = (): void => {
  searchQuery.value = ''
  activeStudent.value = null
  searchFriendQuery.value = ''
  if (_searchFriendDebounceTimer) clearTimeout(_searchFriendDebounceTimer)
  debouncedSearchFriendQuery.value = ''
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
  const graphStore = useGraphStore()
  const sNode = nodeKey('student', activeStudent.value)
  const sInterests = Array.from(graphStore.graph.get(sNode) ?? [])
    .filter(n => n.startsWith('interest:'))
  
  for (const act of recommendations.value.activities) {
    const oNode = nodeKey('activity', act)
    const oInterests = new Set(
      Array.from(graphStore.graph.get(oNode) ?? [])
        .filter(n => n.startsWith('interest:'))
    )
    const match = sInterests.find(x => oInterests.has(x))
    const interest = match ? match.replace('interest:', '') : ''
    
    if (activeFilter.value === '全部' || interest === activeFilter.value) {
      if (!groups[interest]) groups[interest] = []
      groups[interest].push(act)
    }
  }
  return groups
})

export const hasActivities = computed(() => recommendations.value.activities.length > 0)

export const matchedFriends = computed((): MatchedFriend[] => {
  const query = debouncedSearchFriendQuery.value.trim().toLowerCase()
  if (!query || !activeStudent.value) return []
  const graphStore = useGraphStore()
  const sNode = nodeKey('student', activeStudent.value)
  const selfInterests = new Set(
    Array.from(graphStore.graph.get(sNode) ?? [])
      .filter(n => n.startsWith('interest:'))
  )
  const results: MatchedFriend[] = []
  for (const node of graphStore.studentsList) {
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
  return results.slice(0, FRIEND_MATCH_LIMIT)
})

// ✅ PERFORMANCE: Debounce Jaccard recommendation recalculation triggered by graph or user changes.
let _recalcDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [
    () => {
      try {
        const store = useGraphStore()
        return [store.graph, store.privateStudents, store.socialStudents]
      } catch {
        return null
      }
    },
    () => activeStudent.value
  ],
  () => {
    if (_recalcDebounceTimer) clearTimeout(_recalcDebounceTimer)
    _recalcDebounceTimer = setTimeout(() => {
      if (activeStudent.value) {
        runRecommendations(activeStudent.value)
      }
      _recalcDebounceTimer = null
    }, DEBOUNCE_RECALC_MS)
  },
  { deep: true }
)

