import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useAuthStore } from '@/stores/auth'
import {
  CentralityResult,
  InterestStat,
  PopularActivityStat,
  ThemeCommunityStat,
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  countIsolatedStudents,
  calculatePopularActivities,
  calculateThemeCommunities,
  calculateConnectivityRate,
  calculateAveragePathLength,
  calculateClusteringCoefficient,
  calculateNetworkDensity
} from '@/utils/graph-metrics'

export type { CentralityResult, InterestStat, PopularActivityStat, ThemeCommunityStat }

export class GraphAnalyticsService {
  private static instance: GraphAnalyticsService

  public readonly topSocialStudents = ref<CentralityResult[]>([])
  public readonly bridgeStudents = ref<CentralityResult[]>([])
  public readonly isolatedCount = ref(0)
  public readonly popularInterests = ref<InterestStat[]>([])
  public readonly popularActivities = ref<PopularActivityStat[]>([])
  public readonly themeCommunities = ref<ThemeCommunityStat[]>([])

  public readonly connectivityRate = ref(0)
  public readonly averagePathLength = ref(0)
  public readonly clusteringCoefficient = ref(0)
  public readonly networkDensity = ref(0)

  private unsubscribe: (() => void) | null = null
  private debounceTimer: any = null

  private constructor() {}

  public initialize(): void {
    if (this.unsubscribe) return
    try {
      this.unsubscribe = useGraphStore().registerOnStatsUpdate(() => {
        this.recalculateGraphInsights()
      })
      this.recalculateGraphInsights()
    } catch (err) {
      // Ignore errors in test environments where Pinia is not active or has been torn down
    }
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  public static getInstance(): GraphAnalyticsService {
    if (!GraphAnalyticsService.instance) {
      GraphAnalyticsService.instance = new GraphAnalyticsService()
    }
    return GraphAnalyticsService.instance
  }

  public recalculateGraphInsights(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    try {
      if (useAuthStore().currentUserRole !== 'admin') {
        this.debounceTimer = null
        return
      }
    } catch (err) {
      // Pinia might not be active in unit testing environments
    }

    this.debounceTimer = setTimeout(() => {
      try {
        const graphStore = useGraphStore()
        const graph = graphStore.graph
        const stats = graphStore.stats

        this.topSocialStudents.value = calculateDegreeCentrality(graph)
        this.bridgeStudents.value    = calculateBetweennessCentrality(graph)
        this.isolatedCount.value      = countIsolatedStudents(graph)

        this.connectivityRate.value = calculateConnectivityRate(this.isolatedCount.value, stats.studentsCount)
        this.averagePathLength.value = calculateAveragePathLength(graph)
        this.clusteringCoefficient.value = calculateClusteringCoefficient(graph)
        this.networkDensity.value = calculateNetworkDensity(graph, stats.studentsCount, stats.interestsCount, stats.activitiesCount)

        const list: InterestStat[] = []
        for (const [node, neighbors] of graph.entries()) {
          if (node.startsWith('interest:')) {
            const name = node.slice('interest:'.length)
            let studentCount = 0
            for (const n of neighbors) {
              if (n.startsWith('student:')) studentCount++
            }
            list.push({ name, count: studentCount })
          }
        }
        this.popularInterests.value = list.sort((a, b) => b.count - a.count)
        this.popularActivities.value = calculatePopularActivities(graph)
        this.themeCommunities.value = calculateThemeCommunities(graph)
      } catch (err: any) {
        const msg = err?.message || ''
        if (msg.includes('Active Pinia') || msg.includes('pinia')) {
          console.warn('[GraphAnalyticsService] Recalculate skipped: Pinia is not active (expected during unmount or tests).')
        } else {
          console.error('[GraphAnalyticsService] Recalculate failed with unexpected error:', err)
        }
      } finally {
        this.debounceTimer = null
      }
    }, 150)
  }
}

export const graphAnalyticsService = GraphAnalyticsService.getInstance()
