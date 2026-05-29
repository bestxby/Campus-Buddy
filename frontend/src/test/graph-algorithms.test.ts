import { describe, it, expect } from 'vitest'
import { GraphAlgorithms } from '../utils/graph-algorithms'

describe('Graph Algorithms', () => {
  describe('Connected Components', () => {
    it('should return 0 for an empty graph', () => {
      const graph = new Map<string, Set<string>>()
      expect(GraphAlgorithms.countConnectedComponents(graph)).toBe(0)
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

      expect(GraphAlgorithms.countConnectedComponents(graph)).toBe(3)
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

      const path = GraphAlgorithms.findPath(graph, 'A', 'C')
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

      expect(GraphAlgorithms.findPath(graph, 'A', 'B')).toBeNull()
    })

    it('should handle start and end being same node', () => {
      const graph = new Map<string, Set<string>>()
      graph.set('student:A', new Set(['interest:X']))

      const path = GraphAlgorithms.findPath(graph, 'A', 'A')
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
      const results = GraphAlgorithms.calculateJaccardSimilarity(graph, 'A', promoted)

      // Buddies should be ranked: B (0.667) then C (0.5)
      expect(results.buddies.length).toBe(2)
      expect(results.buddies[0].name).toBe('B')
      expect(results.buddies[0].jaccard).toBeCloseTo(2 / 3)
      expect(results.buddies[1].name).toBe('C')
      expect(results.buddies[1].jaccard).toBe(0.5)

      // Activities should be ranked: Act2 (promoted) then Act1
      expect(results.activities).toEqual(['Act2', 'Act1'])
    })

    it('should boost buddy Jaccard score for social mode students and cap at 0.95', () => {
      const graph = new Map<string, Set<string>>()
      // student:A has X, Y
      graph.set('student:A', new Set(['interest:X', 'interest:Y']))
      graph.set('interest:X', new Set(['student:A', 'student:B', 'student:C']))
      graph.set('interest:Y', new Set(['student:A', 'student:B', 'student:C']))

      // student:B has X, Y (Jaccard: 2/2 = 1.0)
      graph.set('student:B', new Set(['interest:X', 'interest:Y']))
      // student:C has X, Y (Jaccard: 2/2 = 1.0)
      graph.set('student:C', new Set(['interest:X', 'interest:Y']))

      const promoted = new Set<string>()
      const privateStudents = new Set<string>()
      const socialStudents = new Set<string>(['C']) // C has social mode enabled

      // Let's run without social boost first
      const normalResults = GraphAlgorithms.calculateJaccardSimilarity(graph, 'A', promoted)
      expect(normalResults.buddies[0].jaccard).toBe(1.0)
      expect(normalResults.buddies[1].jaccard).toBe(1.0)

      // Run with social boost (C should be boosted but capped at 1.0)
      const boostedResults = GraphAlgorithms.calculateJaccardSimilarity(graph, 'A', promoted, privateStudents, socialStudents)
      expect(boostedResults.buddies.find(b => b.name === 'C')?.jaccard).toBe(1.0)

      // Test D who has overlap but lower score (Jaccard: 1/2 = 0.5)
      graph.set('student:D', new Set(['interest:X']))
      graph.get('interest:X')?.add('student:D')

      const socialStudents2 = new Set<string>(['D'])
      const boostedResults2 = GraphAlgorithms.calculateJaccardSimilarity(graph, 'A', promoted, privateStudents, socialStudents2)

      const dBuddy = boostedResults2.buddies.find(b => b.name === 'D')
      expect(dBuddy?.jaccard).toBeCloseTo(0.5 * 1.3) // 0.65

      const bBuddy = boostedResults2.buddies.find(b => b.name === 'B')
      expect(bBuddy?.jaccard).toBe(1.0) // B not boosted, stays 1.0

      // B boosted (1.0 * 1.3 = 1.3 -> capped at 1.0)
      const boostedResults3 = GraphAlgorithms.calculateJaccardSimilarity(graph, 'A', promoted, privateStudents, new Set(['B']))
      const bBuddyBoosted = boostedResults3.buddies.find(b => b.name === 'B')
      expect(bBuddyBoosted?.jaccard).toBe(1.0)
    })
  })
})
