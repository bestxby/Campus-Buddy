import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SearchHeader from '../../components/SearchHeader.vue'
import { searchQuery, suggestions } from '../../composables/useRecommendations'
import * as recommendations from '../../composables/useRecommendations'
import { useGraphStore } from '../../stores/graph'

describe('SearchHeader Interaction', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    searchQuery.value = ''
    suggestions.value = []
    
    // Populate graph store with mock data for autocomplete search
    const graphStore = useGraphStore()
    graphStore.graph.set('student:小明', new Set(['interest:篮球']))
    graphStore.graph.set('student:小刚', new Set(['interest:Python']))
  })

  it('triggers autocomplete suggestions when user types in search input', async () => {
    const wrapper = mount(SearchHeader)
    const input = wrapper.find('input')
    
    await input.setValue('小')
    await input.trigger('input')
    
    // suggestions should contain '小明' and '小刚'
    expect(suggestions.value).toContain('小明')
    expect(suggestions.value).toContain('小刚')
    
    // dropdown list should render the options
    await wrapper.vm.$nextTick()
    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBe(2)
    expect(options[0].text()).toContain('小明')
    expect(options[1].text()).toContain('小刚')
  })

  it('calls selectStudent when a suggestion is clicked', async () => {
    const selectStudentSpy = vi.spyOn(recommendations, 'selectStudent')
    
    suggestions.value = ['小明']
    const wrapper = mount(SearchHeader)
    
    const option = wrapper.find('[role="option"]')
    expect(option.exists()).toBe(true)
    
    // Simulating mousedown trigger on suggestion option
    await option.trigger('mousedown')
    
    expect(selectStudentSpy).toHaveBeenCalledWith('小明')
  })
})
