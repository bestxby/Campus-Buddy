export interface MatrixLayoutSpecs {
  rows: string[]
  cols: string[]
  totalRows: number
  totalCols: number
  gridX: number
  gridY: number
  gridW: number
  gridH: number
  cellWidth: number
  cellHeight: number
}

export class MatrixLayoutCalculator {
  public static getLayoutSpecs(
    canvasWidth: number,
    canvasHeight: number,
    matrixMode: string,
    graph: Map<string, Set<string>>,
    scrollbarWidth: number
  ): MatrixLayoutSpecs {
    const isCooccurrence = matrixMode === 'interest-cooccurrence'
    const rowHeaderWidth = isCooccurrence ? 115 : 75
    const rightMargin = isCooccurrence ? 0 : 30

    const gridX = rowHeaderWidth
    const colHeaderHeight = (matrixMode === 'student-interest' || matrixMode === 'interest-cooccurrence') ? 70 : 90
    const gridY = colHeaderHeight
    const gridW = canvasWidth - gridX - scrollbarWidth - rightMargin
    const gridH = canvasHeight - gridY

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

  public static getScrollbarThumbHeight(gridH: number, totalRows: number, cellHeight: number): number {
    const ratio = gridH / (totalRows * cellHeight)
    return Math.max(30, ratio * gridH)
  }
}
