import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AllActivities from '@/components/AllActivities.vue'
import { useGraphStore } from '@/stores/graph'
import { activeStudent } from '@/composables/useRecommendations'

describe('AllActivities.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    activeStudent.value = 'Alice'
    
    // Seed mock graph data
    const graphStore = useGraphStore()
    graphStore.addEdge('activity:创新沙龙', 'interest:技术')
    graphStore.addEdge('student:Bob', 'activity:创新沙龙')
  })

  it('renders all activities list correctly matches snapshot', () => {
    const wrapper = mount(AllActivities, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.text()).toContain('创新沙龙')
    expect(wrapper.text()).toContain('1 人已报名')
  })
})
