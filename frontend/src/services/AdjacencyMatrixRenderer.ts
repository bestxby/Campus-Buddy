import type { HoveredConnectionDetail } from '@/types'
import { AdjacencyMatrixPainter } from './AdjacencyMatrixPainter'
import { MatrixLayoutCalculator } from './MatrixLayoutCalculator'
import type { MatrixLayoutSpecs } from './MatrixLayoutCalculator'
import { MatrixInteractionHandler } from './MatrixInteractionHandler'

export interface MatrixCallbacks {
  onNodeClick?: (node: any) => void
  onHover?: (detail: HoveredConnectionDetail | null) => void
}

export class AdjacencyMatrixRenderer {
  private canvasElement: HTMLCanvasElement
  private callbacks: MatrixCallbacks
  private currentConfig: any = null

  // State variables synchronized with InteractionHandler
  private scrollTop: number = 0
  private maxScrollTop: number = 0
  private isDraggingScrollbar: boolean = false
  private hoveredRowIdx: number | null = null
  private hoveredColIdx: number | null = null

  private scrollbarWidth: number = 14
  private interactionHandler: MatrixInteractionHandler

  constructor(canvasElement: HTMLCanvasElement, callbacks: MatrixCallbacks = {}) {
    this.canvasElement = canvasElement
    this.callbacks = callbacks

    // Setup interaction handler
    this.interactionHandler = new MatrixInteractionHandler(
      canvasElement,
      {
        onRedraw: () => this.redraw(),
        onHoverTrigger: (rowIdx, colIdx) => this.triggerHoverCallback(rowIdx, colIdx),
        onNodeClick: (studentName) => this.handleNodeClick(studentName),
        getLayoutSpecs: () => this.getLayoutSpecs(),
        getMaxScrollTop: () => this.maxScrollTop,
        getScrollTop: () => this.scrollTop,
        setScrollTop: (val) => { this.scrollTop = val },
        isDraggingScrollbar: () => this.isDraggingScrollbar,
        setDraggingScrollbar: (val) => { this.isDraggingScrollbar = val },
        getHoveredState: () => ({ rowIdx: this.hoveredRowIdx, colIdx: this.hoveredColIdx }),
        setHoveredState: (rowIdx, colIdx) => {
          this.hoveredRowIdx = rowIdx
          this.hoveredColIdx = colIdx
        }
      },
      this.scrollbarWidth
    )
  }

  public destroy() {
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

    ctx.clearRect(0, 0, width, height)

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

  private getLayoutSpecs(): MatrixLayoutSpecs {
    const canvas = this.canvasElement
    const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.clientWidth
    const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.clientHeight

    const matrixMode = this.currentConfig?.matrixMode || 'student-interest'
    const graph = (this.currentConfig?.graph as Map<string, Set<string>>) || new Map<string, Set<string>>()

    return MatrixLayoutCalculator.getLayoutSpecs(
      width,
      height,
      matrixMode,
      graph,
      this.scrollbarWidth
    )
  }

  private handleNodeClick(studentName: string) {
    const matrixMode = this.currentConfig?.matrixMode || 'student-interest'
    if (matrixMode !== 'interest-cooccurrence' && this.callbacks.onNodeClick) {
      this.callbacks.onNodeClick({ type: 'student', name: studentName })
    }
  }

  private triggerHoverCallback(rowIdx: number | null, colIdx: number | null) {
    if (!this.callbacks.onHover) return

    if (rowIdx === null || colIdx === null) {
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
      if (rowIdx === colIdx) {
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
