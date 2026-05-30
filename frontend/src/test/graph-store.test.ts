import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGraphStore } from '../stores/graph'
import { graphDb } from '../utils/indexedDb'

describe('Graph Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    graphDb.clearFallback()
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
    globalThis.fetch = mockFetch

    const store = useGraphStore()
    await store.loadGraphData()

    expect(mockFetch).toHaveBeenCalled()
    // Alice and Bob, Programming and Basketball, Hackathon
    expect(store.stats.studentsCount).toBeGreaterThanOrEqual(2)
    expect(store.stats.interestsCount).toBe(2)
    expect(store.stats.activitiesCount).toBe(1)
  })

  it('should support admin adding custom activities and interests with persistence', async () => {
    const mockData = {
      students: [],
      activities: []
    }
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      } as Response)
    )

    const store = useGraphStore()
    await store.loadGraphData()

    // Add custom interest
    await store.addInterestNode('TypeScript', 'tech')
    expect(store.graph.has('interest:TypeScript')).toBe(true)
    const interests = await graphDb.get<any[]>('campus_buddy_custom_interests')
    expect(interests).toContainEqual({ name: 'TypeScript', domain: 'tech' })

    // Add custom activity linked to interest
    await store.addActivity('TypeScript Workshop', ['TypeScript'])
    expect(store.graph.has('activity:TypeScript Workshop')).toBe(true)
    expect(store.graph.get('activity:TypeScript Workshop')?.has('interest:TypeScript')).toBe(true)
    const activities = await graphDb.get<any[]>('campus_buddy_custom_activities')
    expect(activities).toContainEqual({ name: 'TypeScript Workshop', interests: ['TypeScript'] })

    // Refresh graph and check custom elements are re-loaded
    store.graph.clear()
    await store.loadGraphData()

    expect(store.graph.has('interest:TypeScript')).toBe(true)
    expect(store.graph.has('activity:TypeScript Workshop')).toBe(true)
  })

  it('should support admin deleting activities with persistence', async () => {
    const mockData = {
      students: [],
      activities: [
        ['DefaultActivity', 'Sports']
      ]
    }
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      } as Response)
    )

    const store = useGraphStore()
    await store.loadGraphData()

    expect(store.graph.has('activity:DefaultActivity')).toBe(true)

    // Admin deletes the default activity
    await store.deleteActivity('DefaultActivity')
    expect(store.graph.has('activity:DefaultActivity')).toBe(false)
    const deleted = await graphDb.get<string[]>('campus_buddy_deleted_activities')
    expect(deleted).toContain('DefaultActivity')

    // Reload graph data, verify DefaultActivity is not re-loaded
    await store.loadGraphData()
    expect(store.graph.has('activity:DefaultActivity')).toBe(false)
  })
})
