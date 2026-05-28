export class AdjacencyMatrixPainter {
  public static draw(
    ctx: CanvasRenderingContext2D,
    layoutSpecs: {
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
      totalContentWidth: number
      needsHorizontalScroll: boolean
    },
    matrixMode: string,
    graph: Map<string, Set<string>>,
    activeStudent: string | null,
    scrollTop: number,
    maxScrollTop: number,
    scrollLeft: number,
    maxScrollLeft: number,
    isDraggingScrollbar: boolean,
    hoveredRowIdx: number | null,
    hoveredColIdx: number | null,
    scrollbarWidth: number
  ) {
    const { rows, cols, totalRows, totalCols, gridX, gridY, gridW, gridH, cellWidth, cellHeight, needsHorizontalScroll } = layoutSpecs

    // Reserve space for horizontal scrollbar at bottom if needed
    const hScrollbarHeight = needsHorizontalScroll ? 14 : 0
    const effectiveGridH = gridH - hScrollbarHeight

    // 1.2 Render Virtualized Matrix Cells
    const startRow = Math.floor(scrollTop / cellHeight)
    const endRow = Math.min(totalRows, Math.ceil((scrollTop + effectiveGridH) / cellHeight))

    // Horizontal virtualization: only render visible columns
    const startCol = Math.floor(scrollLeft / cellWidth)
    const endCol = Math.min(totalCols, Math.ceil((scrollLeft + gridW) / cellWidth))

    // 1. Clip Grid Area to prevent cells overflowing above/below the table
    ctx.save()
    ctx.beginPath()
    ctx.rect(gridX, gridY, gridW, effectiveGridH)
    ctx.clip()

    // 1.0 Draw Selected Student Row Background Highlight under cells
    for (let r = startRow; r < endRow; r++) {
      const rowName = rows[r]
      const rowY = gridY + r * cellHeight - scrollTop
      const isActiveStudent = (matrixMode !== 'interest-cooccurrence') && (rowName === activeStudent)
      if (isActiveStudent) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)' // cyan glow bg
        ctx.fillRect(gridX, rowY, gridW, cellHeight)
      }
    }

    // 1.1 Draw Grid Crosshair Highlight Background (draw under matrix cells)
    if (hoveredRowIdx !== null && hoveredColIdx !== null) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
      // Row highlight
      const hoverY = gridY + hoveredRowIdx * cellHeight - scrollTop
      ctx.fillRect(gridX, hoverY, gridW, cellHeight)

      // Column highlight
      const hoverX = gridX + hoveredColIdx * cellWidth - scrollLeft
      ctx.fillRect(hoverX, gridY, cellWidth, effectiveGridH)
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
      const rowY = gridY + r * cellHeight - scrollTop

      for (let c = startCol; c < endCol; c++) {
        const colName = cols[c]
        const cellX = gridX + c * cellWidth - scrollLeft

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
        if (hoveredRowIdx === r && hoveredColIdx === c) {
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
    ctx.rect(0, gridY, gridX, effectiveGridH)
    ctx.clip()

    for (let r = startRow; r < endRow; r++) {
      const rowName = rows[r]
      const rowY = gridY + r * cellHeight - scrollTop
      const isHovered = hoveredRowIdx === r
      const isActiveStudent = (matrixMode !== 'interest-cooccurrence') && (rowName === activeStudent)

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
    // Clip col headers container — clip to gridW to hide headers scrolled out of view
    ctx.beginPath()
    ctx.rect(gridX, 0, gridW, gridY)
    ctx.clip()

    for (let c = startCol; c < endCol; c++) {
      const colName = cols[c]
      const colX = gridX + c * cellWidth - scrollLeft + cellWidth / 2
      const isHovered = hoveredColIdx === c

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

    // 5. Draw Vertical Scrollbar
    if (maxScrollTop > 0) {
      const scrollbarX = gridX + gridW
      const ratio = effectiveGridH / (totalRows * cellHeight)
      const thumbH = Math.max(30, ratio * effectiveGridH)
      const thumbY = gridY + (scrollTop / maxScrollTop) * (effectiveGridH - thumbH)

      // Scrollbar Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'
      ctx.fillRect(scrollbarX, gridY, scrollbarWidth, effectiveGridH)

      // Scrollbar Thumb
      ctx.fillStyle = isDraggingScrollbar ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.08)'
      ctx.strokeStyle = isDraggingScrollbar ? '#00f0ff' : 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      
      // Draw rounded thumb
      ctx.beginPath()
      ctx.roundRect(scrollbarX + 3, thumbY, scrollbarWidth - 6, thumbH, 4)
      ctx.fill()
      ctx.stroke()
    }

    // 5b. Draw Horizontal Scrollbar (when content overflows horizontally)
    if (needsHorizontalScroll && maxScrollLeft > 0) {
      const hBarY = gridY + effectiveGridH
      const hBarH = hScrollbarHeight
      const hThumbRatio = gridW / layoutSpecs.totalContentWidth
      const hThumbW = Math.max(30, hThumbRatio * gridW)
      const hThumbX = gridX + (scrollLeft / maxScrollLeft) * (gridW - hThumbW)

      // Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'
      ctx.fillRect(gridX, hBarY, gridW, hBarH)

      // Thumb
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(hThumbX, hBarY + 3, hThumbW, hBarH - 6, 4)
      ctx.fill()
      ctx.stroke()
    }

    // 6. Draw Grid Border Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.strokeRect(gridX, gridY, gridW, effectiveGridH)
  }
}
