import type { MatrixLayoutSpecs } from './MatrixLayoutCalculator'
import { MatrixLayoutCalculator } from './MatrixLayoutCalculator'

export interface InteractionCallbacks {
  onRedraw: () => void
  onHoverTrigger: (rowIdx: number | null, colIdx: number | null) => void
  onRowClick: (rowName: string) => void
  onColClick: (colName: string) => void
  getLayoutSpecs: () => MatrixLayoutSpecs
  getMaxScrollTop: () => number
  getScrollTop: () => number
  setScrollTop: (val: number) => void
  getMaxScrollLeft: () => number
  getScrollLeft: () => number
  setScrollLeft: (val: number) => void
  isDraggingScrollbar: () => boolean
  setDraggingScrollbar: (val: boolean) => void
  isDraggingHScrollbar: () => boolean
  setDraggingHScrollbar: (val: boolean) => void
  setHoveredVScrollbar: (val: boolean) => void
  setHoveredHScrollbar: (val: boolean) => void
  getHoveredState: () => { rowIdx: number | null; colIdx: number | null }
  setHoveredState: (rowIdx: number | null, colIdx: number | null) => void
}

export class MatrixInteractionHandler {
  private canvas: HTMLCanvasElement
  private callbacks: InteractionCallbacks
  private scrollbarWidth: number

  // Temp drag state (scrollbar thumb)
  private dragStartMouseY = 0
  private dragStartScrollTop = 0

  // Temp drag state (horizontal scrollbar thumb)
  private hDragStartMouseX = 0
  private hDragStartScrollLeft = 0

  // Temp drag state (content pan)
  private isDraggingContent = false
  private panStartMouseX = 0
  private panStartMouseY = 0
  private panStartScrollLeft = 0
  private panStartScrollTop = 0
  private hasPanned = false // distinguish pan from click

  // Height reserved for the horizontal scrollbar (must match AdjacencyMatrixPainter)
  private readonly hScrollbarHeight = 14

  // Touch state
  private touchStartClientX = 0
  private touchStartClientY = 0
  private touchStartScrollTop = 0
  private touchStartScrollLeft = 0
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
      const maxScrollV = this.callbacks.getMaxScrollTop()
      const maxScrollH = this.callbacks.getMaxScrollLeft()
      if (maxScrollV <= 0 && maxScrollH <= 0) return
      e.preventDefault()

      // Use deltaY for vertical, deltaX for horizontal
      if (maxScrollV > 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        const newScroll = Math.max(0, Math.min(maxScrollV, this.callbacks.getScrollTop() + e.deltaY))
        this.callbacks.setScrollTop(newScroll)
      }
      if (maxScrollH > 0 && Math.abs(e.deltaX) > 0) {
        const newScroll = Math.max(0, Math.min(maxScrollH, this.callbacks.getScrollLeft() + e.deltaX))
        this.callbacks.setScrollLeft(newScroll)
      }
      // Also allow shift+wheel for horizontal scroll
      if (maxScrollH > 0 && e.shiftKey && Math.abs(e.deltaY) > 0) {
        const newScroll = Math.max(0, Math.min(maxScrollH, this.callbacks.getScrollLeft() + e.deltaY))
        this.callbacks.setScrollLeft(newScroll)
      }
      this.callbacks.onRedraw()
    }

    this.handleMouseMoveFn = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const specs = this.callbacks.getLayoutSpecs()
      const { totalRows, totalCols, gridY, gridX, gridH, gridW, cellWidth, cellHeight } = specs
      const effectiveGridH = gridH - (specs.needsHorizontalScroll ? this.hScrollbarHeight : 0)

      const maxScrollTop = this.callbacks.getMaxScrollTop()
      const maxScrollLeft = this.callbacks.getMaxScrollLeft()

      // Handle scrollbar thumb dragging (vertical)
      if (this.callbacks.isDraggingScrollbar()) {
        const dy = e.clientY - this.dragStartMouseY
        const scrollRange = totalRows * cellHeight - gridH
        const scrollbarRange = gridH - MatrixLayoutCalculator.getScrollbarThumbHeight(gridH, totalRows, cellHeight)
        if (scrollbarRange > 0) {
          const deltaScroll = (dy / scrollbarRange) * scrollRange
          const newScroll = Math.max(0, Math.min(maxScrollTop, this.dragStartScrollTop + deltaScroll))
          this.callbacks.setScrollTop(newScroll)
          this.callbacks.onRedraw()
        }
        if (canvas.style.cursor !== 'ns-resize') {
          canvas.style.cursor = 'ns-resize'
        }
        return
      }

      // Handle horizontal scrollbar thumb dragging
      if (this.callbacks.isDraggingHScrollbar()) {
        const dx = e.clientX - this.hDragStartMouseX
        if (specs.needsHorizontalScroll && maxScrollLeft > 0) {
          const hThumbRatio = specs.gridW / specs.totalContentWidth
          const hThumbW = Math.max(30, hThumbRatio * specs.gridW)
          const scrollbarRange = specs.gridW - hThumbW
          if (scrollbarRange > 0) {
            const deltaScroll = (dx / scrollbarRange) * maxScrollLeft
            const newScroll = Math.max(0, Math.min(maxScrollLeft, this.hDragStartScrollLeft + deltaScroll))
            this.callbacks.setScrollLeft(newScroll)
            this.callbacks.onRedraw()
          }
        }
        if (canvas.style.cursor !== 'ew-resize') {
          canvas.style.cursor = 'ew-resize'
        }
        return
      }

      // Handle content pan dragging (both axes)
      if (this.isDraggingContent) {
        const dx = e.clientX - this.panStartMouseX
        const dy = e.clientY - this.panStartMouseY
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          this.hasPanned = true
        }
        if (maxScrollLeft > 0) {
          const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, this.panStartScrollLeft - dx))
          this.callbacks.setScrollLeft(newScrollLeft)
        }
        if (maxScrollTop > 0) {
          const newScrollTop = Math.max(0, Math.min(maxScrollTop, this.panStartScrollTop - dy))
          this.callbacks.setScrollTop(newScrollTop)
        }
        if (canvas.style.cursor !== 'grabbing') {
          canvas.style.cursor = 'grabbing'
        }
        this.callbacks.onRedraw()
        return
      }

      // Set cursor and update scrollbar hovers when not dragging
      let targetCursor = 'default'
      let overVThumb = false
      let overHThumb = false

      // 1. Check Vertical Scrollbar Hover
      const scrollbarX = gridX + gridW
      const isOverVScrollbar = maxScrollTop > 0 &&
        mx >= scrollbarX && mx <= scrollbarX + this.scrollbarWidth &&
        my >= gridY && my <= gridY + effectiveGridH

      if (isOverVScrollbar) {
        const thumbH = MatrixLayoutCalculator.getScrollbarThumbHeight(effectiveGridH, totalRows, cellHeight)
        const scrollRatio = maxScrollTop > 0 ? (this.callbacks.getScrollTop() / maxScrollTop) : 0
        const thumbY = gridY + scrollRatio * (effectiveGridH - thumbH)
        if (my >= thumbY && my <= thumbY + thumbH) {
          overVThumb = true
          targetCursor = 'pointer'
        } else {
          targetCursor = 'default'
        }
      }

      // 2. Check Horizontal Scrollbar Hover
      const hBarY = gridY + effectiveGridH
      const isOverHScrollbar = specs.needsHorizontalScroll && maxScrollLeft > 0 &&
        mx >= gridX && mx <= gridX + gridW &&
        my >= hBarY && my <= hBarY + this.hScrollbarHeight

      if (isOverHScrollbar) {
        const hThumbRatio = gridW / specs.totalContentWidth
        const hThumbW = Math.max(30, hThumbRatio * gridW)
        const hThumbX = gridX + (this.callbacks.getScrollLeft() / maxScrollLeft) * (gridW - hThumbW)
        if (mx >= hThumbX && mx <= hThumbX + hThumbW) {
          overHThumb = true
          targetCursor = 'pointer'
        } else {
          targetCursor = 'default'
        }
      }

      this.callbacks.setHoveredVScrollbar(overVThumb)
      this.callbacks.setHoveredHScrollbar(overHThumb)

      // 3. Check Headers and Grid Cells if not hovering scrollbars
      if (!isOverVScrollbar && !isOverHScrollbar) {
        const isOverColHeaders = mx >= gridX && mx < gridX + gridW && my >= 0 && my < gridY
        const isOverContent = mx >= 0 && mx < gridX + gridW && my >= gridY && my < gridY + effectiveGridH

        if (isOverColHeaders) {
          targetCursor = 'pointer'
        } else if (isOverContent) {
          if (maxScrollTop > 0 || maxScrollLeft > 0) {
            targetCursor = 'grab'
          } else {
            targetCursor = 'pointer'
          }
        }
      }

      if (canvas.style.cursor !== targetCursor) {
        canvas.style.cursor = targetCursor
      }

      // Identify hovered cell (accounting for horizontal scroll)
      let newHoveredRowIdx: number | null = null
      let newHoveredColIdx: number | null = null

      if (!isOverVScrollbar && !isOverHScrollbar) {
        const scrollLeft = this.callbacks.getScrollLeft()
        if (mx >= gridX && mx < gridX + gridW && my >= gridY && my < gridY + effectiveGridH) {
          newHoveredRowIdx = Math.floor((my - gridY + this.callbacks.getScrollTop()) / cellHeight)
          newHoveredColIdx = Math.floor((mx - gridX + scrollLeft) / cellWidth)

          if (newHoveredRowIdx >= totalRows) newHoveredRowIdx = null
          if (newHoveredColIdx >= totalCols) newHoveredColIdx = null
        }
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
      const { totalRows, gridY, gridH, cellHeight, gridX, gridW, needsHorizontalScroll } = specs
      const scrollbarX = gridX + gridW
      const effectiveGridH = gridH - (needsHorizontalScroll ? this.hScrollbarHeight : 0)

      // Priority 1: Vertical scrollbar thumb
      if (mx >= scrollbarX && mx <= scrollbarX + this.scrollbarWidth && my >= gridY && my <= gridY + effectiveGridH) {
        const thumbH = MatrixLayoutCalculator.getScrollbarThumbHeight(effectiveGridH, totalRows, cellHeight)
        const maxScroll = this.callbacks.getMaxScrollTop()
        const scrollRatio = maxScroll > 0 ? (this.callbacks.getScrollTop() / maxScroll) : 0
        const thumbY = gridY + scrollRatio * (effectiveGridH - thumbH)

        if (my >= thumbY && my <= thumbY + thumbH) {
          this.callbacks.setDraggingScrollbar(true)
          this.dragStartMouseY = e.clientY
          this.dragStartScrollTop = this.callbacks.getScrollTop()
          e.preventDefault()
        }
        return
      }

      // Priority 2: Horizontal scrollbar strip (bottom of grid)
      const hBarY = gridY + effectiveGridH
      const maxScrollH = this.callbacks.getMaxScrollLeft()
      if (needsHorizontalScroll && maxScrollH > 0 &&
          mx >= gridX && mx <= gridX + gridW &&
          my >= hBarY && my <= hBarY + this.hScrollbarHeight) {
        // Compute thumb position to check if click is on thumb
        const hThumbRatio = gridW / specs.totalContentWidth
        const hThumbW = Math.max(30, hThumbRatio * gridW)
        const hThumbX = gridX + (this.callbacks.getScrollLeft() / maxScrollH) * (gridW - hThumbW)

        if (mx >= hThumbX && mx <= hThumbX + hThumbW) {
          // Dragging the thumb
          this.callbacks.setDraggingHScrollbar(true)
          this.hDragStartMouseX = e.clientX
          this.hDragStartScrollLeft = this.callbacks.getScrollLeft()
          canvas.style.cursor = 'ew-resize'
        } else {
          // Click on track — jump to position
          const clickRatio = (mx - gridX - hThumbW / 2) / (gridW - hThumbW)
          const newScroll = Math.max(0, Math.min(maxScrollH, clickRatio * maxScrollH))
          this.callbacks.setScrollLeft(newScroll)
          this.callbacks.onRedraw()
        }
        e.preventDefault()
        return
      }

      // Priority 3: Content pan inside matrix grid (excluding h-scrollbar strip)
      const maxScrollV = this.callbacks.getMaxScrollTop()
      if ((maxScrollH > 0 || maxScrollV > 0) && mx >= 0 && mx <= gridX + gridW && my >= gridY && my <= gridY + effectiveGridH) {
        this.isDraggingContent = true
        this.hasPanned = false
        this.panStartMouseX = e.clientX
        this.panStartMouseY = e.clientY
        this.panStartScrollLeft = this.callbacks.getScrollLeft()
        this.panStartScrollTop = this.callbacks.getScrollTop()
        canvas.style.cursor = 'grab'
        e.preventDefault()
      }
    }

    this.handleMouseUpFn = () => {
      this.callbacks.setDraggingScrollbar(false)
      if (this.callbacks.isDraggingHScrollbar()) {
        this.callbacks.setDraggingHScrollbar(false)
      }
      if (this.isDraggingContent) {
        this.isDraggingContent = false
      }
      canvas.style.cursor = 'default'
    }

    this.handleMouseOutFn = () => {
      this.callbacks.setDraggingScrollbar(false)
      if (this.callbacks.isDraggingHScrollbar()) {
        this.callbacks.setDraggingHScrollbar(false)
      }
      if (this.isDraggingContent) {
        this.isDraggingContent = false
      }
      this.callbacks.setHoveredVScrollbar(false)
      this.callbacks.setHoveredHScrollbar(false)
      canvas.style.cursor = 'default'

      const currentHover = this.callbacks.getHoveredState()
      if (currentHover.rowIdx !== null || currentHover.colIdx !== null) {
        this.callbacks.setHoveredState(null, null)
        this.callbacks.onRedraw()
        this.callbacks.onHoverTrigger(null, null)
      }
    }

    this.handleClickFn = (e: MouseEvent) => {
      // Suppress click if the user was dragging/panning
      if (this.callbacks.isDraggingScrollbar()) return
      if (this.callbacks.isDraggingHScrollbar()) return
      if (this.hasPanned) {
        this.hasPanned = false
        return
      }
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const specs = this.callbacks.getLayoutSpecs()
      const { totalRows, totalCols, gridY, gridX, gridH, gridW, rows, cols, cellWidth, cellHeight } = specs
      const effectiveGridH = gridH - (specs.needsHorizontalScroll ? this.hScrollbarHeight : 0)
      const scrollLeft = this.callbacks.getScrollLeft()

      // 1. Click on grid cells or row headers -> Row click
      if (mx >= 0 && mx < gridX + gridW && my >= gridY && my < gridY + effectiveGridH) {
        const clickedRow = Math.floor((my - gridY + this.callbacks.getScrollTop()) / cellHeight)
        if (clickedRow >= 0 && clickedRow < totalRows) {
          const rowName = rows[clickedRow]
          this.callbacks.onRowClick(rowName)
        }
      }
      // 2. Click on column headers -> Column click (accounting for scrollLeft)
      else if (mx >= gridX && mx < gridX + gridW && my >= 0 && my < gridY) {
        const clickedCol = Math.floor((mx - gridX + scrollLeft) / cellWidth)
        if (clickedCol >= 0 && clickedCol < totalCols) {
          const colName = cols[clickedCol]
          this.callbacks.onColClick(colName)
        }
      }
    }

    this.handleTouchStartFn = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      this.isTouching = true
      this.touchStartClientX = e.touches[0].clientX
      this.touchStartClientY = e.touches[0].clientY
      this.touchStartScrollTop = this.callbacks.getScrollTop()
      this.touchStartScrollLeft = this.callbacks.getScrollLeft()
    }

    this.handleTouchMoveFn = (e: TouchEvent) => {
      const maxScrollV = this.callbacks.getMaxScrollTop()
      const maxScrollH = this.callbacks.getMaxScrollLeft()
      if (!this.isTouching || e.touches.length !== 1 || (maxScrollV <= 0 && maxScrollH <= 0)) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.touches[0].clientX - rect.left
      const my = e.touches[0].clientY - rect.top
      const { gridY, gridH, gridX, gridW } = this.callbacks.getLayoutSpecs()

      if (mx >= gridX && mx < gridX + gridW && my >= gridY && my <= gridY + gridH) {
        e.preventDefault()
        const dy = e.touches[0].clientY - this.touchStartClientY
        const dx = e.touches[0].clientX - this.touchStartClientX

        // Vertical scroll
        if (maxScrollV > 0) {
          const newScrollV = Math.max(0, Math.min(maxScrollV, this.touchStartScrollTop - dy))
          this.callbacks.setScrollTop(newScrollV)
        }

        // Horizontal scroll
        if (maxScrollH > 0) {
          const newScrollH = Math.max(0, Math.min(maxScrollH, this.touchStartScrollLeft - dx))
          this.callbacks.setScrollLeft(newScrollH)
        }

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
