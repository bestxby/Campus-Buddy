import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BuddyList from '@/components/BuddyList.vue'
import { recommendations, activeStudent } from '@/composables/useRecommendations'
import { useAuthStore } from '@/stores/auth'
import { currentUserRole } from '@/composables/useAuth'

describe('BuddyList.vue', () => {
  let pinia: any

  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    authStore.currentUserRole = 'admin'
    ;(currentUserRole as any).setMockValue('admin')
    recommendations.value.buddies = [
      { name: 'Bob', jaccard: 0.67, sharedCount: 2, sharedInterests: ['篮球', '编程'] }
    ]
    activeStudent.value = 'Alice'
  })

  it('should render buddies list correctly matches snapshot', () => {
    const wrapper = mount(BuddyList, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).toContain('67%')
  })

  it('should render empty message when no buddies recommended', () => {
    recommendations.value.buddies = []
    const wrapper = mount(BuddyList, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.text()).toContain('暂时没有相同兴趣的搭子。')
  })

  it('should hide pathfinder when role is student', () => {
    ;(currentUserRole as any).setMockValue('student')
    const authStore = useAuthStore()
    authStore.currentUserRole = 'student'
    const wrapper = mount(BuddyList, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.find('.pathfinder-container').exists()).toBe(false)
  })

  it('should show pathfinder when role is admin', () => {
    ;(currentUserRole as any).setMockValue('admin')
    const authStore = useAuthStore()
    authStore.currentUserRole = 'admin'
    const wrapper = mount(BuddyList, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.find('.pathfinder-container').exists()).toBe(true)
  })
})
