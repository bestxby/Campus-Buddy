import { createPinia, setActivePinia } from 'pinia'
const pinia = createPinia()
setActivePinia(pinia)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useGraphStore } from '../stores/graph'
import { useRecommendationStore } from '../stores/recommendation'
import {
  activeStudent,
  searchQuery,
  suggestions,
  searchFriendQuery,
  debouncedSearchFriendQuery,
  activeFilter,
  expandedGroups,
  runRecommendations,
  getSharedInterest,
  getBuddiesForActivity,
  onSearchInput,
  selectStudent,
  clearSearch,
  toggleGroupExpand,
  isGroupExpanded,
  filterTabs,
  filteredActivitiesGrouped,
  hasActivities,
  matchedFriends,
} from '../composables/useRecommendations'

describe('useRecommendations Composable', () => {
  let recStore: ReturnType<typeof useRecommendationStore>
  let graphStore: ReturnType<typeof useGraphStore>

  beforeEach(() => {
    recStore = useRecommendationStore()
    graphStore = useGraphStore()

    // Clean up stores before each test to maintain isolation while reusing the Pinia instance
    recStore.clearRecommendations()
    graphStore.graph.clear()
    graphStore.privateStudents.clear()
    graphStore.socialStudents.clear()
    graphStore.updateStats(true)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default empty/null states', () => {
    expect(activeStudent.value).toBeNull()
    expect(searchQuery.value).toBe('')
    expect(suggestions.value).toEqual([])
    expect(searchFriendQuery.value).toBe('')
    expect(debouncedSearchFriendQuery.value).toBe('')
    expect(activeFilter.value).toBe('全部')
    expect(expandedGroups.value).toEqual({})
  })

  it('should handle search input suggestions', () => {
    graphStore.graph.set('student:Alice', new Set())
    graphStore.graph.set('student:Alex', new Set())
    graphStore.graph.set('student:Bob', new Set())
    graphStore.updateStats(true)

    // 1. Empty query should clear suggestions
    searchQuery.value = ''
    onSearchInput()
    expect(suggestions.value).toEqual([])

    // 2. Matching prefix should return suggestions
    searchQuery.value = 'al'
    onSearchInput()
    // It should match Alice and Alex case-insensitively, but not Bob
    expect(suggestions.value).toContain('Alice')
    expect(suggestions.value).toContain('Alex')
    expect(suggestions.value).not.toContain('Bob')
  })

  it('should select student, reset queries, and compute recommendations', () => {
    const runSpy = vi.spyOn(recStore, 'runRecommendations')

    selectStudent('Alice')

    expect(searchQuery.value).toBe('Alice')
    expect(suggestions.value).toEqual([])
    expect(searchFriendQuery.value).toBe('')
    expect(debouncedSearchFriendQuery.value).toBe('')
    expect(activeStudent.value).toBe('Alice')
    expect(activeFilter.value).toBe('全部')
    expect(expandedGroups.value).toEqual({})
    expect(runSpy).toHaveBeenCalledWith('Alice')
  })

  it('should clear search and reset recommendations', () => {
    const clearSpy = vi.spyOn(recStore, 'clearRecommendations')

    selectStudent('Alice')
    clearSearch()

    expect(searchQuery.value).toBe('')
    expect(activeStudent.value).toBeNull()
    expect(searchFriendQuery.value).toBe('')
    expect(debouncedSearchFriendQuery.value).toBe('')
    expect(suggestions.value).toEqual([])
    expect(activeFilter.value).toBe('全部')
    expect(expandedGroups.value).toEqual({})
    expect(clearSpy).toHaveBeenCalled()
  })

  it('should toggle and inspect group expansion', () => {
    expandedGroups.value = {}
    expect(isGroupExpanded('篮球')).toBe(false)

    toggleGroupExpand('篮球')
    expect(isGroupExpanded('篮球')).toBe(true)

    toggleGroupExpand('篮球')
    expect(isGroupExpanded('篮球')).toBe(false)
  })

  it('should compute filter tabs correctly based on student interests', () => {
    // Active student is null
    activeStudent.value = null
    expect(filterTabs.value).toEqual(['全部'])

    // With active student
    activeStudent.value = 'Alice'
    graphStore.graph.set('student:Alice', new Set(['interest:篮球', 'interest:编程', 'activity:CodingChallenge']))
    graphStore.updateStats(true)
    
    // '篮球' (Basketball) starts with a lower Unicode value than '编程' (Programming)
    expect(filterTabs.value).toEqual(['全部', '篮球', '编程'])
  })

  it('should group filtered activities by student interest alignment', () => {
    activeStudent.value = 'Alice'
    graphStore.graph.set('student:Alice', new Set(['interest:编程']))
    
    // Set up activity nodes and their interests
    graphStore.graph.set('activity:Act1', new Set(['interest:编程']))
    graphStore.graph.set('activity:Act2', new Set(['interest:足球']))
    graphStore.updateStats(true)

    recStore.recommendations.activities = ['Act1', 'Act2']

    // When filter is '全部'
    activeFilter.value = '全部'
    expect(filteredActivitiesGrouped.value).toEqual({
      '编程': ['Act1'],
      '': ['Act2']
    })

    // When filter is '编程'
    activeFilter.value = '编程'
    expect(filteredActivitiesGrouped.value).toEqual({
      '编程': ['Act1']
    })
  })

  it('should report hasActivities correctly', () => {
    recStore.recommendations.activities = []
    expect(hasActivities.value).toBe(false)

    recStore.recommendations.activities = ['Act1']
    expect(hasActivities.value).toBe(true)
  })

  it('should debounce friend search query changes', async () => {
    searchFriendQuery.value = 'Bo'
    await nextTick()
    expect(debouncedSearchFriendQuery.value).toBe('')

    // Fast-forward debounce timer (250ms)
    vi.advanceTimersByTime(250)
    expect(debouncedSearchFriendQuery.value).toBe('Bo')
  })

  it('should calculate matched friends list sorted by overlapping interests count', () => {
    activeStudent.value = 'Alice'
    graphStore.graph.set('student:Alice', new Set(['interest:编程', 'interest:篮球']))
    
    graphStore.graph.set('student:Bob', new Set(['interest:编程', 'interest:篮球']))
    graphStore.graph.set('student:Cole', new Set(['interest:编程']))
    graphStore.graph.set('student:Dave', new Set(['interest:篮球', 'interest:绘画']))
    graphStore.updateStats(true)

    // Set debounced query
    debouncedSearchFriendQuery.value = ''
    expect(matchedFriends.value).toEqual([]) // empty if no query

    debouncedSearchFriendQuery.value = 'o' // matches Bob ('Bob'), Cole ('Cole') but not Dave
    
    const results = matchedFriends.value
    expect(results.length).toBe(2)
    // Bob has 2 shared interests, Cole has 1. Bob should be ranked first.
    expect(results[0].name).toBe('Bob')
    expect(results[0].sharedCount).toBe(2)
    expect(results[1].name).toBe('Cole')
    expect(results[1].sharedCount).toBe(1)
  })

  it('should delegate helper methods to recommendation store', () => {
    const getSharedSpy = vi.spyOn(recStore, 'getSharedInterest')
    const getBuddiesSpy = vi.spyOn(recStore, 'getBuddiesForActivity')

    getSharedInterest('Alice', 'Act1', 'activity')
    expect(getSharedSpy).toHaveBeenCalledWith('Alice', 'Act1', 'activity')

    getBuddiesForActivity('Alice', 'Act1')
    expect(getBuddiesSpy).toHaveBeenCalledWith('Alice', 'Act1')
  })
})
