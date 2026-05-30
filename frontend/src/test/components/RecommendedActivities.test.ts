import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RecommendedActivities from '@/components/RecommendedActivities.vue'
import { recommendations, activeStudent, activeFilter } from '@/composables/useRecommendations'
import { useGraphStore } from '@/stores/graph'

describe('RecommendedActivities.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    activeStudent.value = 'Alice'
    activeFilter.value = '全部'
    recommendations.value.activities = ['校长杯篮球赛']
    
    // Seed mock graph data
    const graphStore = useGraphStore()
    graphStore.addEdge('student:Alice', 'interest:篮球')
    graphStore.addEdge('activity:校长杯篮球赛', 'interest:篮球')
  })

  it('renders recommended activities list correctly matches snapshot', () => {
    const wrapper = mount(RecommendedActivities, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.text()).toContain('校长杯篮球赛')
    expect(wrapper.text()).toContain('篮球')
  })

  it('handles empty state when no activities match', () => {
    recommendations.value.activities = []
    const wrapper = mount(RecommendedActivities, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.text()).toContain('暂时没有匹配该兴趣推荐的校园活动。')
  })
})
