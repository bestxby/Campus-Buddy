import { useGraphStore } from '@/stores/graph'
import { computed } from 'vue'
import type { PathResult, NodeKind } from '@/types'
import { GraphAlgorithms, nodeKey as pureNodeKey } from '@/utils/graph-algorithms'

export const graph = computed(() => useGraphStore().graph)

export const stats = computed(() => useGraphStore().stats)

export const nodeKey = (kind: NodeKind, name: string): string =>
  pureNodeKey(kind, name)

export const getNodeInterests = (nodeId: string): string[] => {
  const store = useGraphStore()
  return Array.from(store.graph.get(nodeId) ?? []).filter(n => n.startsWith('interest:'))
}

export const addEdge = (u: string, v: string): void => {
  useGraphStore().addEdge(u, v)
}

export const updateStats = (): void => {
  useGraphStore().updateStats()
}

export const findPath = (studentA: string, studentB: string): PathResult | null =>
  GraphAlgorithms.findPath(useGraphStore().graph, studentA, studentB, useGraphStore().privateStudents)

export const loadGraphData = async (): Promise<void> => {
  await useGraphStore().loadGraphData()
}

export const addActivity = (name: string, interests: string[]): void => {
  useGraphStore().addActivity(name, interests)
}

export const deleteActivity = (name: string): void => {
  useGraphStore().deleteActivity(name)
}

