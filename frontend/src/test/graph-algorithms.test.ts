import { describe, it, expect } from 'vitest'
import {
  countConnectedComponents,
  findPath,
  calculateJaccardSimilarity,
  nodeKey
} from '../utils/graph-algorithms'

describe('Graph Algorithms', () => {
  describe('Connected Components', () => {
    it('should return 0 for an empty graph', () => {
      const graph = new Map<string, Set<string>>()
      expect(countConnectedComponents(graph)).toBe(0)
    })

    it('should correctly count connected components', () => {
      const graph = new Map<string, Set<string>>()
      // Component 1: A - B - C
      graph.set('student:A', new Set(['interest:X']))
      graph.set('interest:X', new Set(['student:A', 'student:B']))
      graph.set('student:B', new Set(['interest:X', 'interest:Y']))
      graph.set('interest:Y', new Set(['student:B', 'student:C']))
      graph.set('student:C', new Set(['interest:Y']))

      // Component 2: D - E
      graph.set('student:D', new Set(['interest:Z']))
      graph.set('interest:Z', new Set(['student:D', 'student:E']))
      graph.set('student:E', new Set(['interest:Z']))

      // Isolated Student F (Component 3)
      graph.set('student:F', new Set())

      expect(countConnectedComponents(graph)).toBe(3)
    })
  })

  describe('BFS Path Finding', () => {
    it('should find shortest path between two connected nodes', () => {
      const graph = new Map<string, Set<string>>()
      graph.set('student:A', new Set(['interest:X']))
      graph.set('interest:X', new Set(['student:A', 'student:B']))
      graph.set('student:B', new Set(['interest:X', 'interest:Y']))
      graph.set('interest:Y', new Set(['student:B', 'student:C']))
      graph.set('student:C', new Set(['interest:Y']))

      const path = findPath(graph, 'A', 'C')
      expect(path).not.toBeNull()
      expect(path?.hops).toBe(2)
      expect(path?.readable).toEqual(['A', 'X', 'B', 'Y', 'C'])
      expect(path?.path).toEqual(['student:A', 'interest:X', 'student:B', 'interest:Y', 'student:C'])
    })

    it('should return null if no path exists', () => {
      const graph = new Map<string, Set<string>>()
      graph.set('student:A', new Set(['interest:X']))
      graph.set('interest:X', new Set(['student:A']))
      graph.set('student:B', new Set(['interest:Y']))
      graph.set('interest:Y', new Set(['student:B']))

      expect(findPath(graph, 'A', 'B')).toBeNull()
    })

    it('should handle start and end being same node', () => {
      const graph = new Map<string, Set<string>>()
      graph.set('student:A', new Set(['interest:X']))

      const path = findPath(graph, 'A', 'A')
      expect(path).not.toBeNull()
      expect(path?.hops).toBe(0)
      expect(path?.readable).toEqual(['A'])
    })
  })

  describe('Jaccard Similarity Recommendations', () => {
    it('should correctly calculate similarities and rank buddies and activities', () => {
      const graph = new Map<string, Set<string>>()
      // student:A has X, Y, Z
      graph.set('student:A', new Set(['interest:X', 'interest:Y', 'interest:Z']))
      graph.set('interest:X', new Set(['student:A', 'student:B', 'activity:Act1']))
      graph.set('interest:Y', new Set(['student:A', 'student:B', 'student:C', 'activity:Act2']))
      graph.set('interest:Z', new Set(['student:A', 'student:C']))

      // student:B has X, Y (overlap: X, Y. union: A (3) + B (2) = 3 -> similarity: 2/3)
      graph.set('student:B', new Set(['interest:X', 'interest:Y']))
      // student:C has Y, Z, W (overlap: Y, Z. union: A (3) + C (3) = 4 -> similarity: 2/4 = 0.5)
      graph.set('student:C', new Set(['interest:Y', 'interest:Z', 'interest:W']))

      const promoted = new Set<string>(['Act2'])
      const results = calculateJaccardSimilarity(graph, 'A', promoted)

      // Buddies should be ranked: B (0.667) then C (0.5)
      expect(results.buddies.length).toBe(2)
      expect(results.buddies[0].name).toBe('B')
      expect(results.buddies[0].jaccard).toBeCloseTo(2 / 3)
      expect(results.buddies[1].name).toBe('C')
      expect(results.buddies[1].jaccard).toBe(0.5)

      // Activities should be ranked: Act2 (promoted) then Act1
      expect(results.activities).toEqual(['Act2', 'Act1'])
    })
  })
})
