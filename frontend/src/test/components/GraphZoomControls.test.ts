import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GraphZoomControls from '@/components/graph/GraphZoomControls.vue'

describe('GraphZoomControls.vue', () => {
  it('should render the control buttons', () => {
    const wrapper = mount(GraphZoomControls)
    const buttons = wrapper.findAll('.zoom-btn')
    expect(buttons.length).toBe(3)
  })

  it('should emit zoomIn when the first button (zoom in) is clicked', async () => {
    const wrapper = mount(GraphZoomControls)
    const buttons = wrapper.findAll('.zoom-btn')
    
    await buttons[0].trigger('click')
    expect(wrapper.emitted().zoomIn).toBeTruthy()
    expect(wrapper.emitted().zoomIn.length).toBe(1)
  })

  it('should emit zoomOut when the second button (zoom out) is clicked', async () => {
    const wrapper = mount(GraphZoomControls)
    const buttons = wrapper.findAll('.zoom-btn')
    
    await buttons[1].trigger('click')
    expect(wrapper.emitted().zoomOut).toBeTruthy()
    expect(wrapper.emitted().zoomOut.length).toBe(1)
  })

  it('should emit resetZoom when the third button (reset zoom) is clicked', async () => {
    const wrapper = mount(GraphZoomControls)
    const buttons = wrapper.findAll('.zoom-btn')
    
    await buttons[2].trigger('click')
    expect(wrapper.emitted().resetZoom).toBeTruthy()
    expect(wrapper.emitted().resetZoom.length).toBe(1)
  })
})
