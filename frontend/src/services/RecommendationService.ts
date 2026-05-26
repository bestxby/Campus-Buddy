import { ref, reactive, computed } from 'vue'
import { graphService } from './GraphService'
import type { BuddyResult, MatchedFriend, PathResult } from '@/types'

export class RecommendationService {
  private static instance: RecommendationService

  public readonly pathResult = ref<PathResult | null>(null)
  public readonly promotedActivities = ref<Set<string>>(new Set())

  public readonly activeStudent   = ref<string | null>(null)
  public readonly searchQuery     = ref('')
  public readonly suggestions     = ref<string[]>([])
  public readonly searchFriendQuery = ref('')
  public readonly activeFilter    = ref('全部')
  public readonly expandedGroups  = ref<Record<string, boolean>>({})

  public readonly recommendations = reactive({
    activities: [] as string[],
    buddies:    [] as BuddyResult[],
  })

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  public runRecommendations(student: string): void {
    const graph = graphService.graph.value
    const start = graphService.nodeKey('student', student)
    if (!graph.has(start)) return

    const sInterests   = Array.from(graph.get(start) ?? []).filter(n => n.startsWith('interest:'))
    const sInterestSet = new Set(sInterests)

    const matchedActivities = new Set<string>()
    const seenBuddies       = new Set<string>()
    const rankedBuddies: BuddyResult[] = []

    for (const interest of sInterests) {
      for (const neighbor of graph.get(interest) ?? []) {
        if (neighbor.startsWith('activity:')) {
          matchedActivities.add(neighbor.replace('activity:', ''))
        } else if (neighbor.startsWith('student:') && neighbor !== start) {
          const buddyName = neighbor.replace('student:', '')
          if (seenBuddies.has(buddyName)) continue
          seenBuddies.add(buddyName)

          // Jaccard similarity
          const bInterests     = new Set(Array.from(graph.get(neighbor) ?? []).filter(n => n.startsWith('interest:')))
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

    const sortedActivities = Array.from(matchedActivities).sort((a, b) => {
      const aPromoted = this.promotedActivities.value.has(a) ? 1 : 0
      const bPromoted = this.promotedActivities.value.has(b) ? 1 : 0
      if (aPromoted !== bPromoted) return bPromoted - aPromoted // Promoted to top
      return a.localeCompare(b)
    })

    this.recommendations.activities = sortedActivities
    this.recommendations.buddies    = rankedBuddies
  }

  public getSharedInterest(
    student: string,
    other: string,
    otherType: 'student' | 'activity',
  ): string {
    const sInterests = graphService.getNodeInterests(graphService.nodeKey('student', student))
    const oInterests = new Set(graphService.getNodeInterests(graphService.nodeKey(otherType, other)))
    const match = sInterests.find(x => oInterests.has(x))
    return match ? match.replace('interest:', '') : ''
  }

  public getBuddiesForActivity(studentName: string, activityName: string): string[] {
    const actNode     = graphService.nodeKey('activity', activityName)
    const actNeighbors = graphService.graph.value.get(actNode) ?? new Set<string>()
    const buddyNames  = new Set(this.recommendations.buddies.map(b => b.name))
    const result: string[] = []
    for (const n of actNeighbors) {
      if (n.startsWith('student:')) {
        const name = n.slice('student:'.length)
        if (buddyNames.has(name)) result.push(name)
      }
    }
    return result
  }

  public onSearchInput(): void {
    const query = this.searchQuery.value.trim()
    if (query.length < 1) { this.suggestions.value = []; return }
    const matched: string[] = []
    const graph = graphService.graph.value
    for (const node of graph.keys()) {
      if (node.startsWith('student:')) {
        const name = node.replace('student:', '')
        if (name.toLowerCase().includes(query.toLowerCase())) matched.push(name)
      }
    }
    this.suggestions.value = matched.slice(0, 5)
  }

  public selectStudent(name: string): void {
    this.searchQuery.value      = name
    this.suggestions.value      = []
    this.searchFriendQuery.value = ''
    this.activeStudent.value    = name
    this.activeFilter.value     = '全部'
    this.expandedGroups.value   = {}
    this.runRecommendations(name)
  }

  public clearSearch(): void {
    this.searchQuery.value       = ''
    this.activeStudent.value     = null
    this.searchFriendQuery.value = ''
    this.suggestions.value       = []
    this.activeFilter.value      = '全部'
    this.expandedGroups.value    = {}
    this.recommendations.activities = []
    this.recommendations.buddies    = []
    this.pathResult.value           = null
  }

  public toggleGroupExpand(interest: string): void {
    this.expandedGroups.value[interest] = !this.expandedGroups.value[interest]
  }

  public isGroupExpanded(interest: string): boolean {
    return !!this.expandedGroups.value[interest]
  }

  // Computeds as properties
  public readonly filterTabs = computed((): string[] => {
    if (!this.activeStudent.value) return ['全部']
    const sNode = graphService.nodeKey('student', this.activeStudent.value)
    const interests = Array.from(graphService.graph.value.get(sNode) ?? [])
      .filter(n => n.startsWith('interest:'))
      .map(n => n.replace('interest:', ''))
      .sort()
    return ['全部', ...interests]
  })

  public readonly filteredActivitiesGrouped = computed((): Record<string, string[]> => {
    const groups: Record<string, string[]> = {}
    if (!this.activeStudent.value) return groups
    for (const act of this.recommendations.activities) {
      const interest = this.getSharedInterest(this.activeStudent.value, act, 'activity')
      if (this.activeFilter.value === '全部' || interest === this.activeFilter.value) {
        if (!groups[interest]) groups[interest] = []
        groups[interest].push(act)
      }
    }
    return groups
  })

  public readonly hasActivities = computed(() => this.recommendations.activities.length > 0)

  public readonly matchedFriends = computed((): MatchedFriend[] => {
    const query = this.searchFriendQuery.value.trim().toLowerCase()
    if (!query || !this.activeStudent.value) return []
    const selfInterests = new Set(graphService.getNodeInterests(graphService.nodeKey('student', this.activeStudent.value)))
    const results: MatchedFriend[] = []
    const graph = graphService.graph.value
    for (const node of graph.keys()) {
      if (!node.startsWith('student:')) continue
      const name = node.slice('student:'.length)
      if (name === this.activeStudent.value) continue
      if (!name.toLowerCase().includes(query)) continue
      const shared = graphService.getNodeInterests(node)
        .filter(i => selfInterests.has(i))
        .map(i => i.replace('interest:', ''))
      results.push({ name, sharedCount: shared.length, sharedInterests: shared })
    }
    results.sort((a, b) =>
      b.sharedCount !== a.sharedCount ? b.sharedCount - a.sharedCount : a.name.localeCompare(b.name)
    )
    return results.slice(0, 30)
  })
}

export const recommendationService = RecommendationService.getInstance()
