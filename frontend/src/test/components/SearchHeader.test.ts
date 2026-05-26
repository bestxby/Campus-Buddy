import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SearchHeader from '../../components/SearchHeader.vue'
import { searchQuery, suggestions } from '../../composables/useRecommendations'

describe('SearchHeader.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    searchQuery.value = ''
    suggestions.value = []
  })

  it('renders correctly matches snapshot', () => {
    const wrapper = mount(SearchHeader, {
      global: {
        plugins: [createPinia()]
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('shows autocomplete dropdown when suggestions exist', async () => {
    suggestions.value = ['Alice', 'Bob']
    const wrapper = mount(SearchHeader, {
      global: {
        plugins: [createPinia()]
      }
    })
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })
})
