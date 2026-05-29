import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BuddyList from '../../components/BuddyList.vue'
import { recommendations, activeStudent } from '../../composables/useRecommendations'
import { useAuthStore } from '../../stores/auth'

describe('BuddyList.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.currentUserRole = 'admin'
    recommendations.value.buddies = [
      { name: 'Bob', jaccard: 0.67, sharedCount: 2, sharedInterests: ['篮球', '编程'] }
    ]
    activeStudent.value = 'Alice'
  })

  it('should render buddies list correctly matches snapshot', () => {
    const wrapper = mount(BuddyList)
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).toContain('67%')
  })

  it('should render empty message when no buddies recommended', () => {
    recommendations.value.buddies = []
    const wrapper = mount(BuddyList)
    expect(wrapper.text()).toContain('暂时没有相同兴趣的搭子。')
  })

  it('should hide pathfinder when role is student', () => {
    const authStore = useAuthStore()
    authStore.currentUserRole = 'student'
    const wrapper = mount(BuddyList)
    expect(wrapper.find('.pathfinder-container').exists()).toBe(false)
  })

  it('should show pathfinder when role is admin', () => {
    const authStore = useAuthStore()
    authStore.currentUserRole = 'admin'
    const wrapper = mount(BuddyList)
    expect(wrapper.find('.pathfinder-container').exists()).toBe(true)
  })
})
