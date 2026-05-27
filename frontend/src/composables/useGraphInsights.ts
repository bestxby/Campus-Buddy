import {
  graphAnalyticsService,
  type CentralityResult as ServiceCentralityResult,
  type InterestStat as ServiceInterestStat,
  type IcebreakingStat as ServiceIcebreakingStat
} from '@/services/GraphAnalyticsService'

export type CentralityResult = ServiceCentralityResult
export type InterestStat = ServiceInterestStat
export type IcebreakingStat = ServiceIcebreakingStat

export const topSocialStudents = graphAnalyticsService.topSocialStudents
export const bridgeStudents    = graphAnalyticsService.bridgeStudents
export const isolatedCount      = graphAnalyticsService.isolatedCount
export const popularInterests = graphAnalyticsService.popularInterests
export const icebreakingActivities = graphAnalyticsService.icebreakingActivities

export const connectivityRate = graphAnalyticsService.connectivityRate
export const averagePathLength = graphAnalyticsService.averagePathLength
export const clusteringCoefficient = graphAnalyticsService.clusteringCoefficient
export const networkDensity = graphAnalyticsService.networkDensity

export const recalculateGraphInsights = (): void => {
  graphAnalyticsService.recalculateGraphInsights()
}
