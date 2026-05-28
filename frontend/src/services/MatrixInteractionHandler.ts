import type { MatrixLayoutSpecs } from './MatrixLayoutCalculator'
import { MatrixLayoutCalculator } from './MatrixLayoutCalculator'

export interface InteractionCallbacks {
  onRedraw: () => void
  onHoverTrigger: (rowIdx: number | null, colIdx: number | null) => void
  onNodeClick: (studentName: string) => void
  getLayoutSpecs: () => MatrixLayoutSpecs
  getMaxScrollTop: () => number
  getScrollTop: () => number
  setScrollTop: (val: number) => void
  isDraggingScrollbar: () => boolean
  setDraggingScrollbar: (val: boolean) => void
  getHoveredState: () => { rowIdx: number | null; colIdx: number | null }
  setHoveredState: (rowIdx: number | null, colIdx: number | null) => void
}

export class MatrixInteractionHandler {
  private canvas: HTMLCanvasElement
  private callbacks: InteractionCallbacks
  private scrollbarWidth: number

  // Temp drag state
  private dragStartMouseY = 0
  private dragStartScrollTop = 0

  // Touch state
  private touchStartClientY = 0
  private touchStartScrollTop = 0
  private isTouching = false

  // Listener function caches
  private handleWheelFn: any = null
  private handleMouseMoveFn: any = null
  private handleMouseDownFn: any = null
  private handleMouseUpFn: any = null
  private handleMouseOutFn: any = null
  private handleClickFn: any = null
  private handleTouchStartFn: any = null
  private handleTouchMoveFn: any = null
  private handleTouchEndFn: any = null

  constructor(canvas: HTMLCanvasElement, callbacks: InteractionCallbacks, scrollbarWidth: number) {
    this.canvas = canvas
    this.callbacks = callbacks
    this.scrollbarWidth = scrollbarWidth
    this.bindEvents()
  }

  public destroy() {
    this.unbindEvents()
  }

  private bindEvents() {
    const canvas = this.canvas

    this.handleWheelFn = (e: WheelEvent) => {
      const maxScroll = this.callbacks.getMaxScrollTop()
      if (maxScroll <= 0) return
      e.preventDefault()
      const newScroll = Math.max(0, Math.min(maxScroll, this.callbacks.getScrollTop() + e.deltaY))
      this.callbacks.setScrollTop(newScroll)
      this.callbacks.onRedraw()
    }

    this.handleMouseMoveFn = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const specs = this.callbacks.getLayoutSpecs()
      const { totalRows, totalCols, gridY, gridX, gridH, gridW, cellWidth, cellHeight } = specs

      // Handle scrollbar dragging
      if (this.callbacks.isDraggingScrollbar()) {
        const dy = e.clientY - this.dragStartMouseY
        const scrollRange = totalRows * cellHeight - gridH
        const scrollbarRange = gridH - MatrixLayoutCalculator.getScrollbarThumbHeight(gridH, totalRows, cellHeight)
        if (scrollbarRange > 0) {
          const deltaScroll = (dy / scrollbarRange) * scrollRange
          const maxScroll = this.callbacks.getMaxScrollTop()
          const newScroll = Math.max(0, Math.min(maxScroll, this.dragStartScrollTop + deltaScroll))
          this.callbacks.setScrollTop(newScroll)
          this.callbacks.onRedraw()
        }
        return
      }

      // Identify hovered cell
      let newHoveredRowIdx: number | null = null
      let newHoveredColIdx: number | null = null

      if (mx >= gridX && mx < gridX + gridW && my >= gridY && my < gridY + gridH) {
        newHoveredRowIdx = Math.floor((my - gridY + this.callbacks.getScrollTop()) / cellHeight)
        newHoveredColIdx = Math.floor((mx - gridX) / cellWidth)

        if (newHoveredRowIdx >= totalRows) newHoveredRowIdx = null
        if (newHoveredColIdx >= totalCols) newHoveredColIdx = null
      }

      const currentHover = this.callbacks.getHoveredState()
      if (newHoveredRowIdx !== currentHover.rowIdx || newHoveredColIdx !== currentHover.colIdx) {
        this.callbacks.setHoveredState(newHoveredRowIdx, newHoveredColIdx)
        this.callbacks.onRedraw()
        this.callbacks.onHoverTrigger(newHoveredRowIdx, newHoveredColIdx)
      }
    }

    this.handleMouseDownFn = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const specs = this.callbacks.getLayoutSpecs()
      const { totalRows, gridY, gridH, cellHeight, gridX, gridW } = specs
      const scrollbarX = gridX + gridW

      if (mx >= scrollbarX && mx <= scrollbarX + this.scrollbarWidth && my >= gridY && my <= gridY + gridH) {
        const thumbH = MatrixLayoutCalculator.getScrollbarThumbHeight(gridH, totalRows, cellHeight)
        const maxScroll = this.callbacks.getMaxScrollTop()
        const scrollRatio = maxScroll > 0 ? (this.callbacks.getScrollTop() / maxScroll) : 0
        const thumbY = gridY + scrollRatio * (gridH - thumbH)

        if (my >= thumbY && my <= thumbY + thumbH) {
          this.callbacks.setDraggingScrollbar(true)
          this.dragStartMouseY = e.clientY
          this.dragStartScrollTop = this.callbacks.getScrollTop()
          e.preventDefault()
        }
      }
    }

    this.handleMouseUpFn = () => {
      this.callbacks.setDraggingScrollbar(false)
    }

    this.handleMouseOutFn = () => {
      this.callbacks.setDraggingScrollbar(false)
      const currentHover = this.callbacks.getHoveredState()
      if (currentHover.rowIdx !== null || currentHover.colIdx !== null) {
        this.callbacks.setHoveredState(null, null)
        this.callbacks.onRedraw()
        this.callbacks.onHoverTrigger(null, null)
      }
    }

    this.handleClickFn = (e: MouseEvent) => {
      if (this.callbacks.isDraggingScrollbar()) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const specs = this.callbacks.getLayoutSpecs()
      const { totalRows, gridY, gridX, gridH, gridW, rows, cellHeight } = specs

      if (mx >= gridX && mx < gridX + gridW && my >= gridY && my < gridY + gridH) {
        const clickedRow = Math.floor((my - gridY + this.callbacks.getScrollTop()) / cellHeight)
        if (clickedRow >= 0 && clickedRow < totalRows) {
          const studentName = rows[clickedRow]
          this.callbacks.onNodeClick(studentName)
        }
      }
    }

    this.handleTouchStartFn = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      this.isTouching = true
      this.touchStartClientY = e.touches[0].clientY
      this.touchStartScrollTop = this.callbacks.getScrollTop()
    }

    this.handleTouchMoveFn = (e: TouchEvent) => {
      const maxScroll = this.callbacks.getMaxScrollTop()
      if (!this.isTouching || e.touches.length !== 1 || maxScroll <= 0) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.touches[0].clientX - rect.left
      const my = e.touches[0].clientY - rect.top
      const { gridY, gridH, gridX, gridW } = this.callbacks.getLayoutSpecs()

      if (mx >= gridX && mx < gridX + gridW && my >= gridY && my <= gridY + gridH) {
        e.preventDefault()
        const dy = e.touches[0].clientY - this.touchStartClientY
        const newScroll = Math.max(0, Math.min(maxScroll, this.touchStartScrollTop - dy))
        this.callbacks.setScrollTop(newScroll)
        this.callbacks.onRedraw()
      }
    }

    this.handleTouchEndFn = () => {
      this.isTouching = false
    }

    canvas.addEventListener('wheel', this.handleWheelFn, { passive: false })
    canvas.addEventListener('mousemove', this.handleMouseMoveFn)
    canvas.addEventListener('mousedown', this.handleMouseDownFn)
    window.addEventListener('mouseup', this.handleMouseUpFn)
    canvas.addEventListener('mouseout', this.handleMouseOutFn)
    canvas.addEventListener('click', this.handleClickFn)
    canvas.addEventListener('touchstart', this.handleTouchStartFn, { passive: true })
    canvas.addEventListener('touchmove', this.handleTouchMoveFn, { passive: false })
    canvas.addEventListener('touchend', this.handleTouchEndFn, { passive: true })
  }

  private unbindEvents() {
    const canvas = this.canvas
    if (this.handleWheelFn) canvas.removeEventListener('wheel', this.handleWheelFn)
    if (this.handleMouseMoveFn) canvas.removeEventListener('mousemove', this.handleMouseMoveFn)
    if (this.handleMouseDownFn) canvas.removeEventListener('mousedown', this.handleMouseDownFn)
    window.removeEventListener('mouseup', this.handleMouseUpFn)
    if (this.handleMouseOutFn) canvas.removeEventListener('mouseout', this.handleMouseOutFn)
    if (this.handleClickFn) canvas.removeEventListener('click', this.handleClickFn)
    if (this.handleTouchStartFn) canvas.removeEventListener('touchstart', this.handleTouchStartFn)
    if (this.handleTouchMoveFn) canvas.removeEventListener('touchmove', this.handleTouchMoveFn)
    if (this.handleTouchEndFn) canvas.removeEventListener('touchend', this.handleTouchEndFn)
  }
}
