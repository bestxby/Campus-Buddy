import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GraphFilterControls from '@/components/graph/GraphFilterControls.vue'

describe('GraphFilterControls.vue', () => {
  it('should render toggles and range slider when not in global mode', () => {
    const wrapper = mount(GraphFilterControls, {
      props: {
        hideBuddies: false,
        hideActivities: false,
        buddyLimit: 10,
        maxLimit: 30,
        isGlobalMode: false
      }
    })

    // Check checkboxes
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(2)

    // Check slider exists
    const slider = wrapper.find('input[type="range"]')
    expect(slider.exists()).toBe(true)
    expect((slider.element as HTMLInputElement).value).toBe('10')
    expect((slider.element as HTMLInputElement).max).toBe('30')
  })

  it('should hide the slider when isGlobalMode is true', () => {
    const wrapper = mount(GraphFilterControls, {
      props: {
        hideBuddies: false,
        hideActivities: false,
        buddyLimit: 10,
        maxLimit: 30,
        isGlobalMode: true
      }
    })

    const slider = wrapper.find('input[type="range"]')
    expect(slider.exists()).toBe(false)
  })

  it('should emit update:hideBuddies when hide buddies checkbox is changed', async () => {
    const wrapper = mount(GraphFilterControls, {
      props: {
        hideBuddies: false,
        hideActivities: false,
        buddyLimit: 10,
        maxLimit: 30,
        isGlobalMode: false
      }
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    
    // Change first checkbox (hide buddies)
    await checkboxes[0].setValue(true)
    expect(wrapper.emitted('update:hideBuddies')).toBeTruthy()
    expect(wrapper.emitted('update:hideBuddies')![0]).toEqual([true])
  })

  it('should emit update:hideActivities when hide activities checkbox is changed', async () => {
    const wrapper = mount(GraphFilterControls, {
      props: {
        hideBuddies: false,
        hideActivities: false,
        buddyLimit: 10,
        maxLimit: 30,
        isGlobalMode: false
      }
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    
    // Change second checkbox (hide activities)
    await checkboxes[1].setValue(true)
    expect(wrapper.emitted('update:hideActivities')).toBeTruthy()
    expect(wrapper.emitted('update:hideActivities')![0]).toEqual([true])
  })

  it('should emit update:buddyLimit when range slider is changed', async () => {
    const wrapper = mount(GraphFilterControls, {
      props: {
        hideBuddies: false,
        hideActivities: false,
        buddyLimit: 10,
        maxLimit: 30,
        isGlobalMode: false
      }
    })

    const slider = wrapper.find('input[type="range"]')
    
    // Set value and trigger input event
    await slider.setValue(15)
    expect(wrapper.emitted('update:buddyLimit')).toBeTruthy()
    expect(wrapper.emitted('update:buddyLimit')![0]).toEqual([15])
  })
})
