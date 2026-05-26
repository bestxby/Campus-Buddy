import { graphService } from '@/services/GraphService'
import type { GraphStats, PathResult } from '@/types'

export const graph = graphService.graph

export const stats = graphService.stats

export const nodeKey = (kind: string, name: string): string =>
  graphService.nodeKey(kind, name)

export const getNodeInterests = (nodeId: string): string[] =>
  graphService.getNodeInterests(nodeId)

export const addEdge = (u: string, v: string): void => {
  graphService.addEdge(u, v)
}

export const updateStats = (): void => {
  graphService.updateStats()
}

export const findPath = (studentA: string, studentB: string): PathResult | null =>
  graphService.findPath(studentA, studentB)

export const loadGraphData = async (): Promise<void> => {
  await graphService.loadGraphData()
}
