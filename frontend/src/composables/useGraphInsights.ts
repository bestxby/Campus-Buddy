import {
  graphAnalyticsService,
  type CentralityResult as ServiceCentralityResult,
  type InterestStat as ServiceInterestStat,
  type PopularActivityStat as ServicePopularActivityStat,
  type ThemeCommunityStat as ServiceThemeCommunityStat
} from '@/services/GraphAnalyticsService'

export type CentralityResult = ServiceCentralityResult
export type InterestStat = ServiceInterestStat
export type PopularActivityStat = ServicePopularActivityStat
export type ThemeCommunityStat = ServiceThemeCommunityStat

export const topSocialStudents = graphAnalyticsService.topSocialStudents
export const bridgeStudents    = graphAnalyticsService.bridgeStudents
export const isolatedCount      = graphAnalyticsService.isolatedCount
export const popularInterests = graphAnalyticsService.popularInterests
export const popularActivities = graphAnalyticsService.popularActivities
export const themeCommunities = graphAnalyticsService.themeCommunities

export const connectivityRate = graphAnalyticsService.connectivityRate
export const averagePathLength = graphAnalyticsService.averagePathLength
export const clusteringCoefficient = graphAnalyticsService.clusteringCoefficient
export const networkDensity = graphAnalyticsService.networkDensity

export const recalculateGraphInsights = (immediate = false): void => {
  graphAnalyticsService.recalculateGraphInsights(immediate)
}
