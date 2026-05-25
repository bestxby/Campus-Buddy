/**
 * composables/useRecommendations.ts
 * Recommendation algorithms, search state, and filter state.
 *
 * Responsibilities: 2-hop BFS matching, Jaccard-ranked buddy sorting,
 *   search autocomplete, interest filter tabs, accordion expand state.
 *
 * Layer: Service (recommendation logic) + View-Model (search/filter state)
 * Depends on: useGraph (graph data only — one-way dependency)
 */
import { ref, reactive, computed } from 'vue'
import { graph, nodeKey, getNodeInterests, findPath } from '@/composables/useGraph'
import type { BuddyResult, MatchedFriend, PathResult } from '@/types'

export const pathResult = ref<PathResult | null>(null)

// ─── State ────────────────────────────────────────────────────────────────────

export const activeStudent   = ref<string | null>(null)
export const searchQuery     = ref('')
export const suggestions     = ref<string[]>([])
export const searchFriendQuery = ref('')
export const activeFilter    = ref('全部')
export const expandedGroups  = ref<Record<string, boolean>>({})

export const recommendations = reactive({
  activities: [] as string[],
  buddies:    [] as BuddyResult[],
})

// ─── 2-Hop BFS + Jaccard Ranking ─────────────────────────────────────────────

/**
 * Runs 2-hop BFS from the given student and populates recommendations.
 *   student → interest → activity    (matched activities, alphabetical)
 *   student → interest → student     (matched buddies, Jaccard-ranked DESC)
 *
 * Jaccard(A, B) = |interests_A ∩ interests_B| / |interests_A ∪ interests_B|
 */
export const runRecommendations = (student: string): void => {
  const start = nodeKey('student', student)
  if (!graph.value.has(start)) return

  const sInterests   = Array.from(graph.value.get(start) ?? []).filter(n => n.startsWith('interest:'))
  const sInterestSet = new Set(sInterests)

  const matchedActivities = new Set<string>()
  const seenBuddies       = new Set<string>()
  const rankedBuddies: BuddyResult[] = []

  for (const interest of sInterests) {
    for (const neighbor of graph.value.get(interest) ?? []) {
      if (neighbor.startsWith('activity:')) {
        matchedActivities.add(neighbor.replace('activity:', ''))
      } else if (neighbor.startsWith('student:') && neighbor !== start) {
        const buddyName = neighbor.replace('student:', '')
        if (seenBuddies.has(buddyName)) continue
        seenBuddies.add(buddyName)

        // Jaccard similarity
        const bInterests     = new Set(Array.from(graph.value.get(neighbor) ?? []).filter(n => n.startsWith('interest:')))
        const intersectCount = sInterests.filter(i => bInterests.has(i)).length
        const unionCount     = new Set([...sInterestSet, ...bInterests]).size
        const jaccard        = unionCount > 0 ? intersectCount / unionCount : 0
        const sharedInterests = sInterests.filter(i => bInterests.has(i)).map(i => i.replace('interest:', ''))

        rankedBuddies.push({ name: buddyName, jaccard, sharedCount: intersectCount, sharedInterests })
      }
    }
  }

  // Sort: Jaccard descending → name ascending (stable)
  rankedBuddies.sort((a, b) => b.jaccard - a.jaccard || a.name.localeCompare(b.name))

  recommendations.activities = Array.from(matchedActivities).sort()
  recommendations.buddies    = rankedBuddies
}

// ─── Shared Interest Helpers ──────────────────────────────────────────────────

/** Returns the first shared interest label between a student and another node */
export const getSharedInterest = (
  student: string,
  other: string,
  otherType: 'student' | 'activity',
): string => {
  const sInterests = getNodeInterests(nodeKey('student', student))
  const oInterests = new Set(getNodeInterests(nodeKey(otherType, other)))
  const match = sInterests.find(x => oInterests.has(x))
  return match ? match.replace('interest:', '') : ''
}

/** Returns buddies (from current recommendations) who also connected to an activity */
export const getBuddiesForActivity = (studentName: string, activityName: string): string[] => {
  const actNode     = nodeKey('activity', activityName)
  const actNeighbors = graph.value.get(actNode) ?? new Set<string>()
  const buddyNames  = new Set(recommendations.buddies.map(b => b.name))
  const result: string[] = []
  for (const n of actNeighbors) {
    if (n.startsWith('student:')) {
      const name = n.slice('student:'.length)
      if (buddyNames.has(name)) result.push(name)
    }
  }
  return result
}

// ─── Search ───────────────────────────────────────────────────────────────────

export const onSearchInput = (): void => {
  const query = searchQuery.value.trim()
  if (query.length < 1) { suggestions.value = []; return }
  const matched: string[] = []
  for (const node of graph.value.keys()) {
    if (node.startsWith('student:')) {
      const name = node.replace('student:', '')
      if (name.toLowerCase().includes(query.toLowerCase())) matched.push(name)
    }
  }
  suggestions.value = matched.slice(0, 5)
}

export const selectStudent = (name: string): void => {
  searchQuery.value      = name
  suggestions.value      = []
  searchFriendQuery.value = ''
  activeStudent.value    = name
  activeFilter.value     = '全部'
  expandedGroups.value   = {}
  runRecommendations(name)
}

export const clearSearch = (): void => {
  searchQuery.value       = ''
  activeStudent.value     = null
  searchFriendQuery.value = ''
  suggestions.value       = []
  activeFilter.value      = '全部'
  expandedGroups.value    = {}
  recommendations.activities = []
  recommendations.buddies    = []
  pathResult.value           = null
}

// ─── Accordion ────────────────────────────────────────────────────────────────

export const toggleGroupExpand = (interest: string): void => {
  expandedGroups.value[interest] = !expandedGroups.value[interest]
}
export const isGroupExpanded = (interest: string): boolean =>
  !!expandedGroups.value[interest]

// ─── Computed ─────────────────────────────────────────────────────────────────

/** Filter tabs: ['全部', ...student's interest names sorted] */
export const filterTabs = computed((): string[] => {
  if (!activeStudent.value) return ['全部']
  const sNode = nodeKey('student', activeStudent.value)
  const interests = Array.from(graph.value.get(sNode) ?? [])
    .filter(n => n.startsWith('interest:'))
    .map(n => n.replace('interest:', ''))
    .sort()
  return ['全部', ...interests]
})

/** Activities grouped by their matching interest, filtered by activeFilter */
export const filteredActivitiesGrouped = computed((): Record<string, string[]> => {
  const groups: Record<string, string[]> = {}
  if (!activeStudent.value) return groups
  for (const act of recommendations.activities) {
    const interest = getSharedInterest(activeStudent.value, act, 'activity')
    if (activeFilter.value === '全部' || interest === activeFilter.value) {
      if (!groups[interest]) groups[interest] = []
      groups[interest].push(act)
    }
  }
  return groups
})

export const hasActivities = computed(() => recommendations.activities.length > 0)

/** Students matched by the buddy search input, sorted by shared interest count */
export const matchedFriends = computed((): MatchedFriend[] => {
  const query = searchFriendQuery.value.trim().toLowerCase()
  if (!query || !activeStudent.value) return []
  const selfInterests = new Set(getNodeInterests(nodeKey('student', activeStudent.value)))
  const results: MatchedFriend[] = []
  for (const node of graph.value.keys()) {
    if (!node.startsWith('student:')) continue
    const name = node.slice('student:'.length)
    if (name === activeStudent.value) continue
    if (!name.toLowerCase().includes(query)) continue
    const shared = getNodeInterests(node)
      .filter(i => selfInterests.has(i))
      .map(i => i.replace('interest:', ''))
    results.push({ name, sharedCount: shared.length, sharedInterests: shared })
  }
  results.sort((a, b) =>
    b.sharedCount !== a.sharedCount ? b.sharedCount - a.sharedCount : a.name.localeCompare(b.name)
  )
  return results.slice(0, 30)
})
