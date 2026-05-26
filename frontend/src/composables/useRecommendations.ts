import { recommendationService } from '@/services/RecommendationService'
import type { BuddyResult, MatchedFriend, PathResult } from '@/types'

export const pathResult = recommendationService.pathResult
export const promotedActivities = recommendationService.promotedActivities

export const activeStudent = recommendationService.activeStudent
export const searchQuery = recommendationService.searchQuery
export const suggestions = recommendationService.suggestions
export const searchFriendQuery = recommendationService.searchFriendQuery
export const activeFilter = recommendationService.activeFilter
export const expandedGroups = recommendationService.expandedGroups

export const recommendations = recommendationService.recommendations

export const runRecommendations = (student: string): void => {
  recommendationService.runRecommendations(student)
}

export const getSharedInterest = (
  student: string,
  other: string,
  otherType: 'student' | 'activity',
): string => recommendationService.getSharedInterest(student, other, otherType)

export const getBuddiesForActivity = (studentName: string, activityName: string): string[] =>
  recommendationService.getBuddiesForActivity(studentName, activityName)

export const onSearchInput = (): void => {
  recommendationService.onSearchInput()
}

export const selectStudent = (name: string): void => {
  recommendationService.selectStudent(name)
}

export const clearSearch = (): void => {
  recommendationService.clearSearch()
}

export const toggleGroupExpand = (interest: string): void => {
  recommendationService.toggleGroupExpand(interest)
}

export const isGroupExpanded = (interest: string): boolean =>
  recommendationService.isGroupExpanded(interest)

export const filterTabs = recommendationService.filterTabs
export const filteredActivitiesGrouped = recommendationService.filteredActivitiesGrouped
export const hasActivities = recommendationService.hasActivities
export const matchedFriends = recommendationService.matchedFriends
