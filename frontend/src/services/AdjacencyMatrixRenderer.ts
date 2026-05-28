import type { HoveredConnectionDetail } from '@/types'

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
    const { rows, cols, totalRows, totalCols, gridX, gridY, gridW, gridH, cellWidth, cellHeight } = this.getLayoutSpecs()
    const matrixMode = this.currentConfig.matrixMode || 'student-interest'
    const graph = this.currentConfig.graph

    // Calculate maximum scroll boundaries
    const totalContentHeight = totalRows * cellHeight
    this.maxScrollTop = Math.max(0, totalContentHeight - gridH)
    if (this.scrollTop > this.maxScrollTop) {
      this.scrollTop = this.maxScrollTop
    }

    // 1.2 Render Virtualized Matrix Cells
    const startRow = Math.floor(this.scrollTop / cellHeight)
    const endRow = Math.min(totalRows, Math.ceil((this.scrollTop + gridH) / cellHeight))

    // 1. Clip Grid Area to prevent cells overflowing above/below the table
    ctx.save()
    ctx.beginPath()
    ctx.rect(gridX, gridY, gridW, gridH)
    ctx.clip()

    // 1.0 Draw Selected Student Row Background Highlight under cells
    for (let r = startRow; r < endRow; r++) {
      const rowName = rows[r]
      const rowY = gridY + r * cellHeight - this.scrollTop
      const isActiveStudent = (matrixMode !== 'interest-cooccurrence') && (rowName === this.currentConfig.activeStudent)
      if (isActiveStudent) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)' // cyan glow bg
        ctx.fillRect(gridX, rowY, gridW, cellHeight)
      }
    }

    // 1.1 Draw Grid Crosshair Highlight Background (draw under matrix cells)
    if (this.hoveredRowIdx !== null && this.hoveredColIdx !== null) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
      // Row highlight
      const hoverY = gridY + this.hoveredRowIdx * cellHeight - this.scrollTop
      ctx.fillRect(gridX, hoverY, gridW, cellHeight)

      // Column highlight
      const hoverX = gridX + this.hoveredColIdx * cellWidth
      ctx.fillRect(hoverX, gridY, cellWidth, gridH)
    }

    // Pre-calculate max co-occurrence overlap count for normalization in mode 3
    let maxOverlap = 1
    if (matrixMode === 'interest-cooccurrence') {
      for (let i = 0; i < totalRows; i++) {
        const rName = rows[i]
        const rStudents = graph.get(`interest:${rName}`) || new Set()
        for (let j = 0; j < totalCols; j++) {
          if (i === j) continue
          const cName = cols[j]
          const cStudents = graph.get(`interest:${cName}`) || new Set()
          let intersectionSize = 0
          for (const s of rStudents) {
            if (s.startsWith('student:') && cStudents.has(s)) {
              intersectionSize++
            }
          }
          if (intersectionSize > maxOverlap) {
            maxOverlap = intersectionSize
          }
        }
      }
    }

    for (let r = startRow; r < endRow; r++) {
      const rowName = rows[r]
      const rowY = gridY + r * cellHeight - this.scrollTop

      for (let c = 0; c < totalCols; c++) {
        const colName = cols[c]
        const cellX = gridX + c * cellWidth

        let isActive = false
        let cellColor = 'rgba(255, 255, 255, 0.02)'
        let cellText = ''

        if (matrixMode === 'student-interest') {
          isActive = graph.get(`student:${rowName}`)?.has(`interest:${colName}`) || false
          cellColor = isActive ? 'rgba(6, 182, 212, 0.85)' : 'rgba(255, 255, 255, 0.02)'
        } else if (matrixMode === 'student-activity') {
          isActive = graph.get(`student:${rowName}`)?.has(`activity:${colName}`) || false
          cellColor = isActive ? 'rgba(74, 222, 128, 0.85)' : 'rgba(255, 255, 255, 0.02)'
        } else if (matrixMode === 'interest-cooccurrence') {
          if (r === c) {
            // Self co-occurrence shows total students in that interest
            const rStudents = Array.from(graph.get(`interest:${rowName}`) || []).filter((s: any) => s.startsWith('student:'))
            cellColor = 'rgba(15, 23, 42, 0.5)'
            cellText = `${rStudents.length}`
          } else {
            const rStudents = graph.get(`interest:${rowName}`) || new Set()
            const cStudents = graph.get(`interest:${colName}`) || new Set()
            let overlapCount = 0
            for (const s of rStudents) {
              if (s.startsWith('student:') && cStudents.has(s)) {
                overlapCount++
              }
            }
            if (overlapCount > 0) {
              const ratio = overlapCount / maxOverlap
              cellColor = `rgba(253, 151, 31, ${0.15 + ratio * 0.85})` // orange intensity
              cellText = `${overlapCount}`
            }
          }
        }

        // Draw Cell
        ctx.fillStyle = cellColor
        ctx.fillRect(cellX + 1, rowY + 1, cellWidth - 2, cellHeight - 2)

        // Draw text inside cell (only for interest-cooccurrence)
        if (cellText && cellWidth >= 16) {
          ctx.save()
          ctx.fillStyle = '#f8fafc'
          ctx.font = 'bold 8.5px "Outfit", "Inter", sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(cellText, cellX + cellWidth / 2, rowY + cellHeight / 2)
          ctx.restore()
        }

        // Highlight Cell Border on Hover
        if (this.hoveredRowIdx === r && this.hoveredColIdx === c) {
          ctx.strokeStyle = '#ffb74d'
          ctx.lineWidth = 1.2
          ctx.strokeRect(cellX + 0.5, rowY + 0.5, cellWidth - 1, cellHeight - 1)
        }
      }
    }
    ctx.restore()

    // 3. Draw Row Headers (Student/Interest Names)
    ctx.save()
    // Clip row headers container to avoid writing text out of bounds
    ctx.beginPath()
    ctx.rect(0, gridY, gridX, gridH)
    ctx.clip()

    for (let r = startRow; r < endRow; r++) {
      const rowName = rows[r]
      const rowY = gridY + r * cellHeight - this.scrollTop
      const isHovered = this.hoveredRowIdx === r
      const isActiveStudent = (matrixMode !== 'interest-cooccurrence') && (rowName === this.currentConfig.activeStudent)

      // Draw active row header background
      if (isActiveStudent) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
        ctx.fillRect(0, rowY, gridX, cellHeight)
      }

      // Draw Row Serial Number on the far left of the row header area
      if (matrixMode !== 'interest-cooccurrence') {
        if (isActiveStudent) {
          ctx.fillStyle = '#06b6d4'
          ctx.font = 'bold 9px "Outfit", monospace'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(`▶`, 10, rowY + cellHeight / 2)
        } else {
          ctx.fillStyle = isHovered ? 'rgba(253, 151, 31, 0.45)' : 'rgba(255, 255, 255, 0.18)'
          ctx.font = '9px "Outfit", monospace'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          const padIndex = String(r + 1).padStart(2, '0')
          ctx.fillText(`#${padIndex}`, 10, rowY + cellHeight / 2)
        }
      }

      if (isActiveStudent) {
        ctx.fillStyle = '#06b6d4'
        ctx.font = 'bold 11px "Outfit", "Inter", sans-serif'
      } else {
        ctx.fillStyle = isHovered ? '#ffb74d' : '#94a3b8'
        ctx.font = isHovered ? 'bold 11px "Outfit", "Inter", sans-serif' : '10px "Outfit", "Inter", sans-serif'
      }
      ctx.textAlign = 'right'
      
      const label = matrixMode === 'interest-cooccurrence' ? `🎯 ${rowName}` : rowName
      ctx.fillText(label, gridX - 8, rowY + cellHeight / 2)
    }
    ctx.restore()

    // 4. Draw Column Headers (Rotated 60 degrees to prevent overlapping)
    ctx.save()
    // Clip col headers container
    ctx.beginPath()
    ctx.rect(gridX, 0, gridW + this.scrollbarWidth, gridY)
    ctx.clip()

    for (let c = 0; c < totalCols; c++) {
      const colName = cols[c]
      const colX = gridX + c * cellWidth + cellWidth / 2
      const isHovered = this.hoveredColIdx === c

      ctx.save()
      ctx.translate(colX, gridY - 8)
      ctx.rotate(-Math.PI / 3) // Rotate 60deg

      ctx.fillStyle = isHovered ? '#ffb74d' : '#94a3b8'
      ctx.font = isHovered ? 'bold 10px "Outfit", "Inter", sans-serif' : '9px "Outfit", "Inter", sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      // Truncate column headers if too long
      let displayName = colName
      if (matrixMode === 'student-activity' && displayName.length > 8) {
        displayName = displayName.substring(0, 7) + '..'
      }

      ctx.fillText(displayName, 0, 0)
      ctx.restore()
    }
    ctx.restore()

    // 5. Draw Scrollbar
    if (this.maxScrollTop > 0) {
      const scrollbarX = gridX + gridW
      const thumbH = this.getScrollbarThumbHeight(gridH, totalRows, cellHeight)
      const thumbY = gridY + (this.scrollTop / this.maxScrollTop) * (gridH - thumbH)

      // Scrollbar Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'
      ctx.fillRect(scrollbarX, gridY, this.scrollbarWidth, gridH)

      // Scrollbar Thumb
      ctx.fillStyle = this.isDraggingScrollbar ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.08)'
      ctx.strokeStyle = this.isDraggingScrollbar ? '#00f0ff' : 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      
      // Draw rounded thumb
      ctx.beginPath()
      ctx.roundRect(scrollbarX + 3, thumbY, this.scrollbarWidth - 6, thumbH, 4)
      ctx.fill()
      ctx.stroke()
    }

    // 6. Draw Grid Boarder Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.strokeRect(gridX, gridY, gridW, gridH)
  }

  // Helper to calculate scrollbar thumb height
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
