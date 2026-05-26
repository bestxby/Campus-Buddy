import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'

// Mock global fetch for graph loading
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ students: [], activities: [], registrations: [] })
  } as Response)
)

describe('App.vue Mount Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('should mount App.vue successfully without throwing runtime exceptions', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()]
      }
    })
    expect(wrapper).toBeTruthy()
    console.log('App wrapper HTML content length:', wrapper.html().length)
  })
})
