import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGraphStore } from '../stores/graph'

describe('Graph Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('should add edges correctly', () => {
    const store = useGraphStore()
    store.addEdge('student:Alice', 'interest:Programming')
    expect(store.graph.has('student:Alice')).toBe(true)
    expect(store.graph.get('student:Alice')?.has('interest:Programming')).toBe(true)
    expect(store.graph.get('interest:Programming')?.has('student:Alice')).toBe(true)
  })

  it('should load graph data and compute statistics', async () => {
    const mockData = {
      students: [
        ['Alice', 'Programming'],
        ['Bob', 'Basketball']
      ],
      activities: [
        ['Hackathon', 'Programming']
      ],
      registrations: [
        ['Alice', 'Hackathon']
      ]
    }

    // Mock global fetch
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      } as Response)
    )
    global.fetch = mockFetch

    const store = useGraphStore()
    await store.loadGraphData()

    expect(mockFetch).toHaveBeenCalled()
    // Alice and Bob, Programming and Basketball, Hackathon
    expect(store.stats.studentsCount).toBeGreaterThanOrEqual(2)
    expect(store.stats.interestsCount).toBe(2)
    expect(store.stats.activitiesCount).toBe(1)
  })
})
