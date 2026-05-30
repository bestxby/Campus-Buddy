import type { HoveredConnectionDetail } from '@/types'
import { AdjacencyMatrixPainter } from './AdjacencyMatrixPainter'
import { MatrixLayoutCalculator } from './MatrixLayoutCalculator'
import type { MatrixLayoutSpecs } from './MatrixLayoutCalculator'
import { MatrixInteractionHandler } from './MatrixInteractionHandler'

export interface MatrixCallbacks {
  onNodeClick?: (node: { type: 'student' | 'interest' | 'activity'; name: string }) => void
  onHover?: (detail: HoveredConnectionDetail | null) => void
}

export class AdjacencyMatrixRenderer {
  private canvasElement: HTMLCanvasElement
  private callbacks: MatrixCallbacks
  private currentConfig: any = null

  // State variables synchronized with InteractionHandler
  private scrollTop: number = 0
  private maxScrollTop: number = 0
  private scrollLeft: number = 0
  private maxScrollLeft: number = 0
  private isDraggingScrollbar: boolean = false
  private isDraggingHScrollbar: boolean = false
  private hoveredVScrollbar: boolean = false
  private hoveredHScrollbar: boolean = false
  private hoveredRowIdx: number | null = null
  private hoveredColIdx: number | null = null

  private scrollbarWidth: number = 14
  private interactionHandler: MatrixInteractionHandler

  private onThemeChanged = () => {
    requestAnimationFrame(() => {
      this.redraw()
    })
  }

  constructor(canvasElement: HTMLCanvasElement, callbacks: MatrixCallbacks = {}) {
    this.canvasElement = canvasElement
    this.callbacks = callbacks

    // Setup interaction handler
    this.interactionHandler = new MatrixInteractionHandler(
      canvasElement,
      {
        onRedraw: () => this.redraw(),
        onHoverTrigger: (rowIdx, colIdx) => this.triggerHoverCallback(rowIdx, colIdx),
        onRowClick: (rowName) => this.handleRowClick(rowName),
        onColClick: (colName) => this.handleColClick(colName),
        getLayoutSpecs: () => this.getLayoutSpecs(),
        getMaxScrollTop: () => this.maxScrollTop,
        getScrollTop: () => this.scrollTop,
        setScrollTop: (val) => { this.scrollTop = val },
        getMaxScrollLeft: () => this.maxScrollLeft,
        getScrollLeft: () => this.scrollLeft,
        setScrollLeft: (val) => { this.scrollLeft = val },
        isDraggingScrollbar: () => this.isDraggingScrollbar,
        setDraggingScrollbar: (val) => {
          this.isDraggingScrollbar = val
          this.redraw()
        },
        isDraggingHScrollbar: () => this.isDraggingHScrollbar,
        setDraggingHScrollbar: (val) => {
          this.isDraggingHScrollbar = val
          this.redraw()
        },
        setHoveredVScrollbar: (val) => {
          if (this.hoveredVScrollbar !== val) {
            this.hoveredVScrollbar = val
            this.redraw()
          }
        },
        setHoveredHScrollbar: (val) => {
          if (this.hoveredHScrollbar !== val) {
            this.hoveredHScrollbar = val
            this.redraw()
          }
        },
        getHoveredState: () => ({ rowIdx: this.hoveredRowIdx, colIdx: this.hoveredColIdx }),
        setHoveredState: (rowIdx, colIdx) => {
          this.hoveredRowIdx = rowIdx
          this.hoveredColIdx = colIdx
        }
      },
      this.scrollbarWidth
    )
    window.addEventListener('theme-changed', this.onThemeChanged)
  }

  public destroy() {
    window.removeEventListener('theme-changed', this.onThemeChanged)
    this.interactionHandler.destroy()
    this.currentConfig = null
  }

  public draw(config: any) {
    this.currentConfig = config
    this.redraw()
  }

  private redraw() {
    if (!this.currentConfig) return

    const canvas = this.canvasElement
    const parentWidth = canvas.parentElement?.clientWidth
    const parentHeight = canvas.parentElement?.clientHeight

    // If the parent element exists but is not yet laid out (width/height is 0),
    // skip redraw to prevent initial visual glitches and redundant canvas resizes.
    if (canvas.parentElement && (parentWidth === 0 || parentHeight === 0)) {
      return
    }

    const width = parentWidth || canvas.clientWidth || 900
    const height = parentHeight || canvas.clientHeight || 600

    const dpi = window.devicePixelRatio || 1
    const targetW = width * dpi
    const targetH = height * dpi

    const currentW = canvas.width / dpi
    const currentH = canvas.height / dpi
    const diffW = Math.abs(currentW - width)
    const diffH = Math.abs(currentH - height)

    // Only resize canvas if dimensions are uninitialized (0) or have changed significantly (> 30px)
    // to prevent visual flickering caused by subpixel layout shifts during CSS scale transitions.
    if (canvas.width === 0 || canvas.height === 0 || diffW > 30 || diffH > 30) {
      canvas.width = targetW
      canvas.height = targetH
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.resetTransform()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpi, dpi)

    // Calculate specs via delegated Calculator
    const specs = this.getLayoutSpecs()
    const matrixMode = this.currentConfig.matrixMode || 'student-interest'
    const graph = this.currentConfig.graph
    const activeStudent = this.currentConfig.activeStudent || null

    const totalContentHeight = specs.totalRows * specs.cellHeight
    this.maxScrollTop = Math.max(0, totalContentHeight - specs.gridH)
    if (this.scrollTop > this.maxScrollTop) {
      this.scrollTop = this.maxScrollTop
    }

    // Horizontal scroll range
    this.maxScrollLeft = Math.max(0, specs.totalContentWidth - specs.gridW)
    if (this.scrollLeft > this.maxScrollLeft) {
      this.scrollLeft = this.maxScrollLeft
    }

    AdjacencyMatrixPainter.draw(
      ctx,
      specs,
      matrixMode,
      graph,
      activeStudent,
      this.scrollTop,
      this.maxScrollTop,
      this.scrollLeft,
      this.maxScrollLeft,
      this.isDraggingScrollbar,
      this.isDraggingHScrollbar,
      this.hoveredVScrollbar,
      this.hoveredHScrollbar,
      this.hoveredRowIdx,
      this.hoveredColIdx,
      this.scrollbarWidth
    )
  }

  private cachedSpecs: MatrixLayoutSpecs | null = null
  private cachedWidth: number = 0
  private cachedHeight: number = 0
  private cachedMatrixMode: string = ''
  private cachedGraph: any = null

  private getLayoutSpecs(): MatrixLayoutSpecs {
    const canvas = this.canvasElement
    const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.clientWidth
    const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.clientHeight

    const matrixMode = this.currentConfig?.matrixMode || 'student-interest'
    const graph = (this.currentConfig?.graph as Map<string, Set<string>>) || new Map<string, Set<string>>()

    if (
      this.cachedSpecs &&
      this.cachedWidth === width &&
      this.cachedHeight === height &&
      this.cachedMatrixMode === matrixMode &&
      this.cachedGraph === graph
    ) {
      return this.cachedSpecs
    }

    this.cachedWidth = width
    this.cachedHeight = height
    this.cachedMatrixMode = matrixMode
    this.cachedGraph = graph

    this.cachedSpecs = MatrixLayoutCalculator.getLayoutSpecs(
      width,
      height,
      matrixMode,
      graph,
      this.scrollbarWidth
    )
    
    return this.cachedSpecs
  }

  private handleRowClick(rowName: string) {
    if (!this.currentConfig || !this.callbacks.onNodeClick) return
    const matrixMode = this.currentConfig.matrixMode || 'student-interest'
    if (matrixMode === 'student-interest' || matrixMode === 'student-activity') {
      this.callbacks.onNodeClick({ type: 'student', name: rowName })
    } else if (matrixMode === 'interest-cooccurrence') {
      this.callbacks.onNodeClick({ type: 'interest', name: rowName })
    }
  }

  private handleColClick(colName: string) {
    if (!this.currentConfig || !this.callbacks.onNodeClick) return
    const matrixMode = this.currentConfig.matrixMode || 'student-interest'
    if (matrixMode === 'student-interest') {
      this.callbacks.onNodeClick({ type: 'interest', name: colName })
    } else if (matrixMode === 'student-activity') {
      this.callbacks.onNodeClick({ type: 'activity', name: colName })
    } else if (matrixMode === 'interest-cooccurrence') {
      this.callbacks.onNodeClick({ type: 'interest', name: colName })
    }
  }

  private triggerHoverCallback(rowIdx: number | null, colIdx: number | null) {
    if (!this.callbacks.onHover) return

    if (rowIdx === null || colIdx === null || !this.currentConfig) {
      this.callbacks.onHover(null)
      return
    }

    const { rows, cols } = this.getLayoutSpecs()
    const rowName = rows[rowIdx]
    const colName = cols[colIdx]
    const matrixMode = this.currentConfig.matrixMode || 'student-interest'
    const graph = this.currentConfig.graph

    let details: HoveredConnectionDetail

    if (matrixMode === 'student-interest') {
      const hasInterest = graph.get(`student:${rowName}`)?.has(`interest:${colName}`) || false
      details = {
        title: `${rowName} 与 ${colName}`,
        type: 'student',
        details: hasInterest
          ? `【关联】${rowName} 对兴趣“${colName}”表现出浓厚的兴趣，并在关系网中通过此兴趣建立连线。`
          : `【未关联】${rowName} 目前尚未将“${colName}”设为自己的兴趣标签。`
      }
    } else if (matrixMode === 'student-activity') {
      const hasReg = graph.get(`student:${rowName}`)?.has(`activity:${colName}`) || false
      details = {
        title: `${rowName} 与 ${colName}`,
        type: 'activity',
        details: hasReg
          ? `【报名】${rowName} 已经成功报名参与了校园活动“${colName}”，是活跃的参与者。`
          : `【未报名】${rowName} 目前尚未报名活动“${colName}”。`
      }
    } else {
      // Interest co-occurrence
      if (rowIdx === colIdx) {
        const count = Array.from(graph.get(`interest:${rowName}`) || []).filter((s: any) => s.startsWith('student:')).length
        details = {
          title: `${rowName} (兴趣圈规模)`,
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
        
        let detailsStr = `【兴趣交叉分析】共有 ${overlap} 位同学同时对“${rowName}”和“${colName}”感兴趣。`
        if (overlap > 0) {
          detailsStr += ` 包括：${overlapNames.join('、')}${overlap > 5 ? ' 等人' : ''}。此热力表示了这两个兴趣社群的融合度。`
        } else {
          detailsStr += ` 这两个兴趣社群目前完全独立，没有任何学生交叉，可发布跨界活动来打破社交壁垒。`
        }

        details = {
          title: `${rowName} 与 ${colName}`,
          type: 'interest',
          details: detailsStr
        }
      }
    }

    this.callbacks.onHover(details)
  }
}
