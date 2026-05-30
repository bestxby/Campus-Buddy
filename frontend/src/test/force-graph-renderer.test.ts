import { describe, it, expect, vi } from 'vitest'
import { ForceGraphRenderer } from '../services/ForceGraphRenderer'

describe('ForceGraphRenderer', () => {
  it('should initialize and build quadtree for node queries', () => {
    // 1. Create a dummy canvas element
    const canvas = document.createElement('canvas')
    
    // Mock getContext('2d') using a Proxy to dynamically support all CanvasRenderingContext2D methods
    const rawMockContext: any = {
      canvas: canvas,
    }
    const mockContext = new Proxy(rawMockContext, {
      get(target, prop) {
        if (prop in target) {
          return target[prop]
        }
        if (typeof prop === 'string') {
          target[prop] = vi.fn()
          return target[prop]
        }
        return undefined
      }
    })
    
    canvas.getContext = vi.fn().mockReturnValue(mockContext)
    
    // Mock parentElement with clientWidth/clientHeight
    Object.defineProperty(canvas, 'parentElement', {
      value: {
        clientWidth: 800,
        clientHeight: 600,
      },
      writable: true,
      configurable: true
    })

    // 2. Instantiate ForceGraphRenderer
    const renderer = new ForceGraphRenderer(canvas)

    // 3. Define a mock config
    const mockGraph = new Map<string, Set<string>>()
    mockGraph.set('student:s1', new Set(['interest:i1']))
    mockGraph.set('interest:i1', new Set(['student:s1']))
    
    const mockConfig = {
      graph: mockGraph,
      activeStudent: null,
      currentUser: null,
      registeredStudents: [],
      customActivities: [],
      deletedActivities: new Set(),
      searchQuery: '',
      selectedInterest: null,
      filters: {
        showStudents: true,
        showInterests: true,
        showActivities: true,
      }
    }

    // 4. Draw to initialize structure
    renderer.draw(mockConfig)

    // Cast renderer as any to inspect private properties (quadtree)
    const privRenderer = renderer as any
    expect(privRenderer.quadtree).not.toBeNull()
    
    // Check if quadtree can find a node
    // Populate some mock node coordinates inside renderer's lastNodes
    const testNodes = [
      { id: 'student:s1', x: 100, y: 100, name: 'S1', type: 'student' },
      { id: 'interest:i1', x: 200, y: 200, name: 'I1', type: 'interest' }
    ]
    
    // Explicitly update canvas rendering callback to build quadtree
    privRenderer.renderCanvas(mockContext, 800, 600, testNodes, [])
    
    expect(privRenderer.quadtree).not.toBeNull()
    
    // Find node near (100, 100) within standard hover radius (20px)
    const foundNode = privRenderer.quadtree.find(102, 98, 20)
    expect(foundNode).toBeDefined()
    expect(foundNode.id).toBe('student:s1')
    
    // Find node far away should return undefined/null
    const notFoundNode = privRenderer.quadtree.find(500, 500, 20)
    expect(notFoundNode).toBeUndefined()

    // Clean up
    renderer.destroy()
  })
})
