import type { HoveredConnectionDetail } from '@/types'
import { AdjacencyMatrixPainter } from './AdjacencyMatrixPainter'

export interface MatrixCallbacks {
  onNodeClick?: (node: any) => void
  onHover?: (detail: HoveredConnectionDetail | null) => void
}

export class AdjacencyMatrixRenderer {
  private canvasElement: HTMLCanvasElement
  private callbacks: MatrixCallbacks
  private currentConfig: any = null

  // Scroll state
  private scrollTop: number = 0
  private maxScrollTop: number = 0
  private isDraggingScrollbar: boolean = false
  private dragStartMouseY: number = 0
  private dragStartScrollTop: number = 0

  // Interactive Hover state
  private hoveredRowIdx: number | null = null
  private hoveredColIdx: number | null = null

  // Fixed layout metrics (CSS pixels)
  private scrollbarWidth: number = 14

  // Touch state
  private touchStartClientY: number = 0
  private touchStartScrollTop: number = 0
  private isTouching: boolean = false

  // Event handlers references for unbinding
  private handleWheelFn: any = null
  private handleMouseMoveFn: any = null
  private handleMouseDownFn: any = null
  private handleMouseUpFn: any = null
  private handleMouseOutFn: any = null
  private handleClickFn: any = null
  private handleTouchStartFn: any = null
  private handleTouchMoveFn: any = null
  private handleTouchEndFn: any = null

  constructor(canvasElement: HTMLCanvasElement, callbacks: MatrixCallbacks = {}) {
    this.canvasElement = canvasElement
    this.callbacks = callbacks
    this.bindEvents()
  }

  public destroy() {
    this.unbindEvents()
    this.currentConfig = null
  }

  private bindEvents() {
    const canvas = this.canvasElement

    this.handleWheelFn = (e: WheelEvent) => {
      if (!this.currentConfig || this.maxScrollTop <= 0) return
      e.preventDefault()
      this.scrollTop = Math.max(0, Math.min(this.maxScrollTop, this.scrollTop + e.deltaY))
      this.redraw()
    }

    this.handleMouseMoveFn = (e: MouseEvent) => {
      if (!this.currentConfig) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const { totalRows, totalCols, gridY, gridX, gridH, gridW, cellWidth, cellHeight } = this.getLayoutSpecs()

      // 1. Handle scrollbar dragging
      if (this.isDraggingScrollbar) {
        const dy = e.clientY - this.dragStartMouseY
        const scrollRange = totalRows * cellHeight - gridH
        const scrollbarRange = gridH - this.getScrollbarThumbHeight(gridH, totalRows, cellHeight)
        if (scrollbarRange > 0) {
          const deltaScroll = (dy / scrollbarRange) * scrollRange
          this.scrollTop = Math.max(0, Math.min(this.maxScrollTop, this.dragStartScrollTop + deltaScroll))
          this.redraw()
        }
        return
      }

      // 2. Identify hovered cell
      let newHoveredRowIdx: number | null = null
      let newHoveredColIdx: number | null = null

      if (mx >= gridX && mx < gridX + gridW && my >= gridY && my < gridY + gridH) {
        newHoveredRowIdx = Math.floor((my - gridY + this.scrollTop) / cellHeight)
        newHoveredColIdx = Math.floor((mx - gridX) / cellWidth)

        if (newHoveredRowIdx >= totalRows) newHoveredRowIdx = null
        if (newHoveredColIdx >= totalCols) newHoveredColIdx = null
      }

      if (newHoveredRowIdx !== this.hoveredRowIdx || newHoveredColIdx !== this.hoveredColIdx) {
        this.hoveredRowIdx = newHoveredRowIdx
        this.hoveredColIdx = newHoveredColIdx
        this.redraw()
        this.triggerHoverCallback()
      }
    }

    this.handleMouseDownFn = (e: MouseEvent) => {
      if (!this.currentConfig) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const { totalRows, gridY, gridH, cellHeight, gridX, gridW } = this.getLayoutSpecs()
      const scrollbarX = gridX + gridW

      // Check if clicked scrollbar
      if (mx >= scrollbarX && mx <= scrollbarX + this.scrollbarWidth && my >= gridY && my <= gridY + gridH) {
        const thumbH = this.getScrollbarThumbHeight(gridH, totalRows, cellHeight)
        const scrollRatio = this.maxScrollTop > 0 ? (this.scrollTop / this.maxScrollTop) : 0
        const thumbY = gridY + scrollRatio * (gridH - thumbH)

        if (my >= thumbY && my <= thumbY + thumbH) {
          this.isDraggingScrollbar = true
          this.dragStartMouseY = e.clientY
          this.dragStartScrollTop = this.scrollTop
          e.preventDefault()
        }
      }
    }

    this.handleMouseUpFn = () => {
      this.isDraggingScrollbar = false
    }

    this.handleMouseOutFn = () => {
      this.isDraggingScrollbar = false
      if (this.hoveredRowIdx !== null || this.hoveredColIdx !== null) {
        this.hoveredRowIdx = null
        this.hoveredColIdx = null
        this.redraw()
        if (this.callbacks.onHover) this.callbacks.onHover(null)
      }
    }

    this.handleClickFn = (e: MouseEvent) => {
      if (!this.currentConfig || this.isDraggingScrollbar) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const { totalRows, gridY, gridX, gridH, gridW, rows, cellHeight } = this.getLayoutSpecs()

      if (mx >= gridX && mx < gridX + gridW && my >= gridY && my < gridY + gridH) {
        const clickedRow = Math.floor((my - gridY + this.scrollTop) / cellHeight)
        if (clickedRow >= 0 && clickedRow < totalRows) {
          const matrixMode = this.currentConfig.matrixMode || 'student-interest'
          if (matrixMode !== 'interest-cooccurrence' && this.callbacks.onNodeClick) {
            // Select student row
            const studentName = rows[clickedRow]
            this.callbacks.onNodeClick({ type: 'student', name: studentName })
          }
        }
      }
    }

    this.handleTouchStartFn = (e: TouchEvent) => {
      if (!this.currentConfig || e.touches.length !== 1) return
      this.isTouching = true
      this.touchStartClientY = e.touches[0].clientY
      this.touchStartScrollTop = this.scrollTop
    }

    this.handleTouchMoveFn = (e: TouchEvent) => {
      if (!this.isTouching || !this.currentConfig || e.touches.length !== 1 || this.maxScrollTop <= 0) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.touches[0].clientX - rect.left
      const my = e.touches[0].clientY - rect.top
      const { gridY, gridH, gridX, gridW } = this.getLayoutSpecs()

      if (mx >= gridX && mx < gridX + gridW && my >= gridY && my < gridY + gridH) {
        e.preventDefault()
        const dy = e.touches[0].clientY - this.touchStartClientY
        this.scrollTop = Math.max(0, Math.min(this.maxScrollTop, this.touchStartScrollTop - dy))
        this.redraw()
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
    const canvas = this.canvasElement
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

  public draw(config: any) {
    this.currentConfig = config
    this.redraw()
  }

  private redraw() {
    if (!this.currentConfig) return

    const canvas = this.canvasElement
    const width = canvas.parentElement?.clientWidth || canvas.clientWidth || 900
    const height = canvas.parentElement?.clientHeight || canvas.clientHeight || 600

    const dpi = window.devicePixelRatio || 1
    canvas.width = width * dpi
    canvas.height = height * dpi
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpi, dpi)

    // Clear Canvas
    ctx.clearRect(0, 0, width, height)

    // Extract dataset & responsive dimensions
    const specs = this.getLayoutSpecs()
    const matrixMode = this.currentConfig.matrixMode || 'student-interest'
    const graph = this.currentConfig.graph
    const activeStudent = this.currentConfig.activeStudent || null

    // Calculate maximum scroll boundaries
    const totalContentHeight = specs.totalRows * specs.cellHeight
    this.maxScrollTop = Math.max(0, totalContentHeight - specs.gridH)
    if (this.scrollTop > this.maxScrollTop) {
      this.scrollTop = this.maxScrollTop
    }

    AdjacencyMatrixPainter.draw(
      ctx,
      specs,
      matrixMode,
      graph,
      activeStudent,
      this.scrollTop,
      this.maxScrollTop,
      this.isDraggingScrollbar,
      this.hoveredRowIdx,
      this.hoveredColIdx,
      this.scrollbarWidth
    )
  }

  private getScrollbarThumbHeight(gridH: number, totalRows: number, cellHeight: number): number {
    const ratio = gridH / (totalRows * cellHeight)
    return Math.max(30, ratio * gridH)
  }

  // Calculate layout specifications reactively
  private getLayoutSpecs() {
    const canvas = this.canvasElement
    const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.clientWidth
    const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.clientHeight

    const matrixMode = this.currentConfig?.matrixMode || 'student-interest'
    const graph = (this.currentConfig?.graph as Map<string, Set<string>>) || new Map<string, Set<string>>()

    const isCooccurrence = matrixMode === 'interest-cooccurrence'
    const rowHeaderWidth = isCooccurrence ? 115 : 75
    const rightMargin = isCooccurrence ? 0 : 30

    const gridX = rowHeaderWidth
    const colHeaderHeight = (matrixMode === 'student-interest' || matrixMode === 'interest-cooccurrence') ? 70 : 90
    const gridY = colHeaderHeight
    const gridW = width - gridX - this.scrollbarWidth - rightMargin
    const gridH = height - gridY

    let rows: string[] = []
    let cols: string[] = []

    if (matrixMode === 'student-interest') {
      rows = Array.from(graph.keys())
        .filter((n: string) => n.startsWith('student:') && !n.endsWith('Admin'))
        .map((n: string) => n.replace('student:', ''))
        .sort((a, b) => a.localeCompare(b, 'zh'))
      cols = Array.from(graph.keys())
        .filter((n: string) => n.startsWith('interest:'))
        .map((n: string) => n.replace('interest:', ''))
        .sort((a, b) => a.localeCompare(b, 'zh'))
    } else if (matrixMode === 'student-activity') {
      rows = Array.from(graph.keys())
        .filter((n: string) => n.startsWith('student:') && !n.endsWith('Admin'))
        .map((n: string) => n.replace('student:', ''))
        .sort((a, b) => a.localeCompare(b, 'zh'))
      cols = Array.from(graph.keys())
        .filter((n: string) => n.startsWith('activity:'))
        .map((n: string) => n.replace('activity:', ''))
        .sort((a, b) => a.localeCompare(b, 'zh'))
    } else {
      // interest co-occurrence
      rows = Array.from(graph.keys())
        .filter((n: string) => n.startsWith('interest:'))
        .map((n: string) => n.replace('interest:', ''))
        .sort((a, b) => a.localeCompare(b, 'zh'))
      cols = rows
    }

    const totalRows = rows.length
    const totalCols = cols.length

    // Dynamic cell width to span exactly the available grid width
    const cellWidth = totalCols > 0 ? gridW / totalCols : 20

    // Dynamic cell height: for interest co-occurrence, make it fit height exactly so no scrolling is needed.
    // Otherwise, use a fixed comfortable height (18px) for long scrollable lists.
    let cellHeight = 18
    if (matrixMode === 'interest-cooccurrence' && totalRows > 0) {
      cellHeight = gridH / totalRows
    }

    return {
      rows,
      cols,
      totalRows,
      totalCols,
      gridX,
      gridY,
      gridW,
      gridH,
      cellWidth,
      cellHeight
    }
  }

  // Trigger hover tooltip callback with customized text descriptions
  private triggerHoverCallback() {
    if (!this.callbacks.onHover) return

    if (this.hoveredRowIdx === null || this.hoveredColIdx === null) {
      this.callbacks.onHover(null)
      return
    }

    const { rows, cols } = this.getLayoutSpecs()
    const rowName = rows[this.hoveredRowIdx]
    const colName = cols[this.hoveredColIdx]
    const matrixMode = this.currentConfig.matrixMode || 'student-interest'
    const graph = this.currentConfig.graph

    let details: HoveredConnectionDetail

    if (matrixMode === 'student-interest') {
      const hasInterest = graph.get(`student:${rowName}`)?.has(`interest:${colName}`) || false
      details = {
        title: `👤 ${rowName} 与 🎯 ${colName}`,
        type: 'student',
        details: hasInterest
          ? `【关联】${rowName} 对兴趣“${colName}”表现出浓厚的兴趣，并在关系网中通过此兴趣建立连线。`
          : `【未关联】${rowName} 目前尚未将“${colName}”设为自己的兴趣标签。`
      }
    } else if (matrixMode === 'student-activity') {
      const hasReg = graph.get(`student:${rowName}`)?.has(`activity:${colName}`) || false
      details = {
        title: `👤 ${rowName} 与 🎉 ${colName}`,
        type: 'activity',
        details: hasReg
          ? `【报名】${rowName} 已经成功报名参与了校园活动“${colName}”，是活跃的参与者。`
          : `【未报名】${rowName} 目前尚未报名活动“${colName}”。`
      }
    } else {
      // Interest co-occurrence
      if (this.hoveredRowIdx === this.hoveredColIdx) {
        const count = Array.from(graph.get(`interest:${rowName}`) || []).filter((s: any) => s.startsWith('student:')).length
        details = {
          title: `🎯 ${rowName} (兴趣圈规模)`,
          type: 'interest',
          details: `全校共有 ${count} 位同学勾选了“${rowName}”作为自己的兴趣爱好圈子。`
        }
      } else {
        const rStudents = graph.get(`interest:${rowName}`) || new Set()
        const cStudents = graph.get(`interest:${colName}`) || new Set()
        let overlap = 0
        const overlapNames: string[] = []
        for (const s of rStudents) {
          if (s.startsWith('student:') && cStudents.has(s)) {
            overlap++
            if (overlapNames.length < 5) overlapNames.push(s.replace('student:', ''))
          }
        }
        
        let detailsStr = `【兴趣交叉诊断】共有 ${overlap} 位同学同时对“${rowName}”和“${colName}”感兴趣。`
        if (overlap > 0) {
          detailsStr += ` 包括：${overlapNames.join('、')}${overlap > 5 ? ' 等人' : ''}。此热力表示了这两个兴趣社群的融合度。`
        } else {
          detailsStr += ` 这两个兴趣社群目前完全独立，没有任何学生交叉，可发布跨界活动来打破社交壁垒。`
        }

        details = {
          title: `🎯 ${rowName} 与 🎯 ${colName}`,
          type: 'interest',
          details: detailsStr
        }
      }
    }

    this.callbacks.onHover(details)
  }
}
