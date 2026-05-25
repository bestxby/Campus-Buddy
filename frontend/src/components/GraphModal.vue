<template>
  <div v-show="visible" class="fullscreen-graph-overlay fade-in">
    <div class="fullscreen-modal-card card glow-cyan">
      <!-- Header -->
      <div class="fullscreen-modal-header">
        <div class="vis-title-group">
          <h3>🌐 局域关联拓扑网络 (Fullscreen Topology Canvas)</h3>
          <span class="vis-subtitle">
            {{ currentUserRole === 'admin' ? `${activeStudent} 的双跳聚焦关系网络` : '您的双跳聚焦关系网络' }} (Focal Subgraph)
          </span>
        </div>
        <div class="modal-controls-row">
          <div class="canvas-toggles">
            <div class="toggle-group">
              <label class="neon-checkbox">
                <input type="checkbox" v-model="hideBuddies" />
                <span class="checkbox-box"></span>
                👁️ 隐藏同学
              </label>
              <label class="neon-checkbox">
                <input type="checkbox" v-model="hideActivities" />
                <span class="checkbox-box"></span>
                👁️ 隐藏活动
              </label>
            </div>
            <div class="limit-slider-group">
              <span class="slider-label">👥 推荐搭子限额: {{ buddyLimit }}人</span>
              <input type="range" min="0" max="40" step="1" v-model.number="buddyLimit" class="neon-slider" />
            </div>
          </div>
          <div class="zoom-controls-modal">
            <button @click="zoomIn" class="zoom-btn" title="放大">➕</button>
            <button @click="zoomOut" class="zoom-btn" title="缩小">➖</button>
            <button @click="resetZoom" class="zoom-btn" title="重置">🔄</button>
          </div>
          <button @click="close" class="close-modal-btn" title="关闭拓扑图">❌</button>
        </div>
      </div>

      <!-- Canvas -->
      <div class="fullscreen-canvas-container">
        <svg ref="svgRef" width="100%" height="100%"></svg>
        
        <!-- Hover tooltip -->
        <div v-if="hoveredDetail" class="vis-tooltip fade-in">
          <div class="tooltip-header">
            <span class="tooltip-icon">
              {{ hoveredDetail.type === 'student' ? '👤' : (hoveredDetail.type === 'activity' ? '🎉' : '🎯') }}
            </span>
            <h4>{{ hoveredDetail.title }}</h4>
          </div>
          <div class="tooltip-body">
            <p>{{ hoveredDetail.details }}</p>
          </div>
        </div>
        
        <div class="canvas-hint">
          💡 支持滚动鼠标缩放，拖拽/悬停节点<span v-if="currentUserRole === 'admin'">，点击同学可切换视图</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { graph, nodeKey } from '@/composables/useGraph'
import { activeStudent, recommendations, selectStudent, pathResult } from '@/composables/useRecommendations'
import { currentUser, currentUserRole, signedUpActivities } from '@/composables/useAuth'
import type { HoveredConnectionDetail } from '@/types'

// ─── Local State ───────────────────────────────────────────────────────────────
const visible        = ref(false)
const svgRef         = ref<SVGSVGElement | null>(null)
const hideBuddies    = ref(false)
const hideActivities = ref(false)
const buddyLimit     = ref(30)
const hoveredDetail  = ref<HoveredConnectionDetail | null>(null)
let   zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null

// ─── Public API ────────────────────────────────────────────────────────────────
const open = () => {
  visible.value = true
  setTimeout(drawGraph, 50)
}
const close = () => {
  visible.value = false
}
const redraw = () => {
  if (visible.value) drawGraph()
}
defineExpose({ open, close, redraw })

// ─── Zoom Actions ──────────────────────────────────────────────────────────────
const zoomIn = () => {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().duration(200).call(zoomBehavior.scaleBy, 1.25)
}
const zoomOut = () => {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().duration(200).call(zoomBehavior.scaleBy, 0.8)
}
const resetZoom = () => {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity)
}

// ─── D3 Force-directed Graph Renderer ───────────────────────────────────────────
const drawGraph = () => {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const width  = svgRef.value.clientWidth  || 900
  const height = svgRef.value.clientHeight || 600

  let nodesToDraw: any[] = []
  let linksToDraw: any[] = []
  const addedNodes  = new Set<string>()

  if (activeStudent.value) {
    const focalNode   = nodeKey('student', activeStudent.value)
    addedNodes.add(focalNode)
    nodesToDraw.push({ id: focalNode, type: 'student', name: activeStudent.value })

    // Pre-rank buddies by shared interest overlap
    const sNode     = nodeKey('student', activeStudent.value)
    const sInterests = Array.from(graph.value.get(sNode) ?? []).filter(i => i.startsWith('interest:'))
    const buddyOverlap = recommendations.buddies.map(b => {
      const bNode = nodeKey('student', b.name)
      const bInt  = Array.from(graph.value.get(bNode) ?? []).filter(i => i.startsWith('interest:'))
      return { name: b.name, overlap: sInterests.filter(x => bInt.includes(x)).length }
    })
    buddyOverlap.sort((a, b) => b.overlap - a.overlap)
    const allowedBuddies = new Set(buddyOverlap.slice(0, buddyLimit.value).map(x => x.name))

    const focalNeighbors = graph.value.get(focalNode) ?? []
    for (const neighbor of focalNeighbors) {
      if (neighbor.startsWith('activity:')) {
        if (hideActivities.value) continue
        const name = neighbor.replace('activity:', '')
        if (!addedNodes.has(neighbor)) {
          addedNodes.add(neighbor)
          nodesToDraw.push({ id: neighbor, type: 'activity', name })
        }
        linksToDraw.push({ source: focalNode, target: neighbor, type: 'registration-active' })
        continue
      }
      if (neighbor.startsWith('interest:')) {
        if (!addedNodes.has(neighbor)) {
          addedNodes.add(neighbor)
          nodesToDraw.push({ id: neighbor, type: 'interest', name: neighbor.replace('interest:', '') })
        }
        linksToDraw.push({ source: focalNode, target: neighbor })
        for (const sub of graph.value.get(neighbor) ?? []) {
          const subName = sub.split(':')[1]
          const isBuddy    = sub.startsWith('student:') && !hideBuddies.value && allowedBuddies.has(subName)
          const isActivity = sub.startsWith('activity:') && !hideActivities.value && recommendations.activities.includes(subName)
          if (isBuddy || isActivity) {
            if (!addedNodes.has(sub)) {
              addedNodes.add(sub)
              nodesToDraw.push({ id: sub, type: sub.startsWith('student:') ? 'student' : 'activity', name: subName })
            }
            linksToDraw.push({ source: neighbor, target: sub })
          }
        }
      }
    }
    // Buddy→activity registration edges
    for (const nodeA of addedNodes) {
      if (nodeA.startsWith('student:') && nodeA !== focalNode) {
        for (const reg of graph.value.get(nodeA) ?? []) {
          if (reg.startsWith('activity:') && addedNodes.has(reg))
            linksToDraw.push({ source: nodeA, target: reg, type: 'registration' })
        }
      }
    }
  }

  // Force include shortest path nodes and links if path search is active
  if (pathResult.value) {
    const pathNodes = pathResult.value.path
    for (let i = 0; i < pathNodes.length; i++) {
      const nodeId = pathNodes[i]
      if (!addedNodes.has(nodeId)) {
        addedNodes.add(nodeId)
        const parts = nodeId.split(':')
        nodesToDraw.push({ id: nodeId, type: parts[0], name: parts.slice(1).join(':') })
      }
      if (i < pathNodes.length - 1) {
        const nextNodeId = pathNodes[i+1]
        const exists = linksToDraw.some(l => 
          (l.source === nodeId && l.target === nextNodeId) || 
          (l.source === nextNodeId && l.target === nodeId)
        )
        if (!exists) linksToDraw.push({ source: nodeId, target: nextNodeId, type: 'shortest-path' })
      }
    }
  }

  // Helper for identifying path links
  const isPathLink = (sId: string, tId: string): boolean => {
    if (!pathResult.value) return false
    const path = pathResult.value.path
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === sId && path[i+1] === tId) || (path[i] === tId && path[i+1] === sId)) return true
    }
    return false
  }

  // Simulation
  const simulation = d3.forceSimulation(nodesToDraw)
    .force('link', d3.forceLink(linksToDraw).id((d: any) => d.id).distance((d: any) => {
      const sId = typeof d.source === 'object' ? d.source.id : d.source
      const tId = typeof d.target === 'object' ? d.target.id : d.target
      const focal = nodeKey('student', activeStudent.value ?? '')
      return (sId === focal || tId === focal) ? 70 : 120
    }))
    .force('charge', d3.forceManyBody().strength(-260))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius((d: any) =>
      d.id === nodeKey('student', activeStudent.value ?? '') ? 35 : 20
    ))

  const gContainer = svg.append('g')
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 3])
    .on('zoom', ev => gContainer.attr('transform', ev.transform))
  zoomBehavior = zoom
  svg.call(zoom)
  svg.call(zoom.transform, d3.zoomIdentity)

  // Links
  const link = gContainer.append('g').attr('class', 'links')
    .selectAll('line').data(linksToDraw).enter().append('line')
    .attr('stroke', (d: any) => {
      const sId = typeof d.source === 'object' ? d.source.id : d.source
      const tId = typeof d.target === 'object' ? d.target.id : d.target
      if (isPathLink(sId, tId)) return '#facc15'
      if (d.type === 'registration-active') return 'rgba(74,222,128,0.9)'
      if (d.type === 'registration')        return 'rgba(253,151,31,0.45)'
      const sT = typeof d.source === 'object' ? d.source.type : (d.source.startsWith('student:') ? 'student' : 'interest')
      const tT = typeof d.target === 'object' ? d.target.type : (d.target.startsWith('student:') ? 'student' : 'interest')
      if ((sT === 'student' && tT === 'activity') || (sT === 'activity' && tT === 'student')) return 'rgba(6,182,212,0.6)'
      return 'rgba(255,255,255,0.08)'
    })
    .attr('stroke-dasharray', (d: any) => {
      const sId = typeof d.source === 'object' ? d.source.id : d.source
      const tId = typeof d.target === 'object' ? d.target.id : d.target
      if (isPathLink(sId, tId)) return null
      return d.type === 'registration-active' ? '4,4' : d.type === 'registration' ? '3,3' : null
    })
    .attr('stroke-width', (d: any) => {
      const sId = typeof d.source === 'object' ? d.source.id : d.source
      const tId = typeof d.target === 'object' ? d.target.id : d.target
      if (isPathLink(sId, tId)) return 4.0
      if (d.type === 'registration-active') return 2.5
      if (d.type === 'registration') return 1.5
      return 1.5
    })

  // Nodes
  const node = gContainer.append('g').attr('class', 'nodes')
    .selectAll('g').data(nodesToDraw).enter().append('g')
    .call(d3.drag<SVGGElement, any>()
      .on('start', (ev, d) => { if (!ev.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag',  (ev, d) => { d.fx = ev.x; d.fy = ev.y })
      .on('end',   (ev, d) => { if (!ev.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
    )
    .on('click', (_ev, d) => {
      if (d.type === 'student' && currentUserRole.value === 'admin') {
        selectStudent(d.name)
      }
    })
    .on('mouseover', (_ev, d) => {
      const connectedIds = new Set<string>([d.id])
      link.style('opacity', (l: any) => {
        const connected = l.source.id === d.id || l.target.id === d.id
        if (connected) {
          connectedIds.add(l.source.id)
          connectedIds.add(l.target.id)
        }
        return connected ? 1.0 : 0.12
      })
      node.style('opacity', (n: any) => connectedIds.has(n.id) ? 1.0 : 0.15)

      if (activeStudent.value) {
        const focal = nodeKey('student', activeStudent.value)
        if (d.type === 'student') {
          if (d.name === activeStudent.value) {
            hoveredDetail.value = {
              title: `${d.name} (您)`,
              type: 'student',
              details: '当前推荐的起点中心节点。围绕着您的是您勾选的兴趣标签以及报名的校园活动。'
            }
          } else {
            const sInt  = Array.from(graph.value.get(focal) ?? []).filter(i => i.startsWith('interest:'))
            const oInt  = Array.from(graph.value.get(nodeKey('student', d.name)) ?? []).filter(i => i.startsWith('interest:'))
            const oIntS = new Set(oInt)
            const sActs = Array.from(graph.value.get(focal) ?? []).filter(i => i.startsWith('activity:'))
            const oActs = new Set(Array.from(graph.value.get(nodeKey('student', d.name)) ?? []).filter(i => i.startsWith('activity:')))
            const shared     = sInt.filter(x => oIntS.has(x)).map(x => x.replace('interest:', ''))
            const sharedActs = sActs.filter(x => oActs.has(x)).map(x => x.replace('activity:', ''))
            let details = `【活动搭子】您与 ${d.name} 共同关注的兴趣：${shared.join('、') || '暂无'}。`
            details += sharedActs.length > 0 ? ` 你们都报名了相同的活动：${sharedActs.join('、')}。` : ` 匹配度较高，不妨约他一起报名下方的推荐活动吧！`
            hoveredDetail.value = { title: d.name, type: 'student', details }
          }
        } else if (d.type === 'activity') {
          const sInt  = Array.from(graph.value.get(focal) ?? []).filter(i => i.startsWith('interest:'))
          const aInt  = Array.from(graph.value.get(nodeKey('activity', d.name)) ?? []).filter(i => i.startsWith('interest:'))
          const aIntS = new Set(aInt)
          const shared = sInt.filter(x => aIntS.has(x)).map(x => x.replace('interest:', ''))
          const hasReg = graph.value.get(focal)?.has(nodeKey('activity', d.name))
          const isSelf = activeStudent.value === currentUser.value
          let details = hasReg
            ? `【已报名活动】${isSelf ? '您' : activeStudent.value}已成功报名此活动，在图上以绿色虚线直接连接。`
            : isSelf
              ? `【活动推荐】基于您的兴趣「${shared.join('、')}」向您匹配推荐。您尚未报名该活动，一键报名后可在图中建立绿色连接！`
              : `【活动推荐】基于该同学的兴趣「${shared.join('、')}」向其匹配推荐。目前尚未报名该活动。`
          hoveredDetail.value = { title: d.name, type: 'activity', details }
        } else {
          hoveredDetail.value = {
            title: `🎯 兴趣圈：${d.name}`,
            type: 'interest',
            details: `连接您与匹配学生/活动的桥梁纽带节点。通过该兴趣标签进行社交推荐。`
          }
        }
      }
    })
    .on('mouseout', () => {
      link.style('opacity', 1.0)
      node.style('opacity', 1.0)
      hoveredDetail.value = null
    })

  // Node circles
  const focalId = nodeKey('student', activeStudent.value ?? '')
  node.append('circle')
    .attr('r', (d: any) => d.id === focalId ? 22 : d.type === 'interest' ? 14 : 10)
    .attr('fill', (d: any) => {
      if (d.id === focalId) return '#ec4899'
      if (d.type === 'student') return '#fd971f'
      if (d.type === 'interest') return '#3b82f6'
      if (d.type === 'activity' && graph.value.get(nodeKey('student', activeStudent.value ?? ''))?.has(d.id)) return '#4ade80'
      return '#06b6d4'
    })
    .attr('stroke', (d: any) => {
      if (pathResult.value && pathResult.value.path.includes(d.id)) {
        if (d.id === focalId) return '#ec4899' // Keep focal node pink
        return '#facc15' // Neon Gold border for other path nodes
      }
      if (d.id === focalId) return '#facc15'
      if (d.type === 'activity' && graph.value.get(nodeKey('student', activeStudent.value ?? ''))?.has(d.id)) return '#22c55e'
      return '#0f172a'
    })
    .attr('stroke-width', (d: any) => {
      if (pathResult.value && pathResult.value.path.includes(d.id)) return 3.5
      if (d.id === focalId) return 3.5
      return 2
    })
    .attr('class', (d: any) => {
      if (d.id === focalId) return 'node-focal-pulse'
      if (d.type === 'activity' && graph.value.get(nodeKey('student', activeStudent.value ?? ''))?.has(d.id)) return 'glow-green'
      return d.type === 'interest' ? 'glow-cyan' : 'glow-orange'
    })
    .style('cursor', 'pointer')

  // Labels
  node.append('text')
    .text((d: any) => d.name)
    .attr('dx', (d: any) => d.id === focalId ? 26 : d.type === 'interest' ? 18 : 14)
    .attr('dy', 4)
    .attr('fill', '#f8fafc')
    .attr('font-size', '10px')
    .attr('font-weight', (d: any) => d.id === focalId ? 'bold' : 'normal')
    .style('pointer-events', 'none')

  // Tick
  simulation.on('tick', () => {
    link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
}

// Redraw when filter controls change
watch([hideBuddies, hideActivities, buddyLimit], () => {
  if (visible.value) drawGraph()
})

// Auto redraw if visible and activeStudent changes
watch(activeStudent, () => {
  if (visible.value) drawGraph()
})

// Auto redraw on activity signup changes to keep graph fresh
watch(signedUpActivities, () => {
  if (visible.value) drawGraph()
}, { deep: true })

// Auto redraw on pathResult changes to draw/clear highlighted shortest paths
watch(pathResult, () => {
  if (visible.value) drawGraph()
})

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('resize', redraw)
})

onUnmounted(() => {
  window.removeEventListener('resize', redraw)
})
</script>

<style scoped>
.fullscreen-graph-overlay {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(8,12,21,0.7);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}
.fullscreen-modal-card {
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  background: rgba(18,24,38,0.85) !important;
  border: 1px solid rgba(6,182,212,0.25) !important;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(6,182,212,0.15) !important;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 24px !important;
  overflow: hidden;
  box-sizing: border-box;
}
.fullscreen-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}
.vis-title-group {
  display: flex;
  flex-direction: column;
}
.fullscreen-modal-header h3 {
  font-size: 14px;
  margin: 0 0 4px 0;
}
.vis-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
}
.modal-controls-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.canvas-toggles {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
}
.toggle-group {
  display: flex;
  gap: 12px;
}
.neon-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s;
}
.neon-checkbox:hover {
  color: var(--text-primary);
}
.neon-checkbox input {
  display: none;
}
.checkbox-box {
  width: 12px;
  height: 12px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}
.neon-checkbox input:checked + .checkbox-box {
  background-color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 6px rgba(6,182,212,0.6);
}
.neon-checkbox input:checked + .checkbox-box::after {
  content: "";
  position: absolute;
  left: 3px;
  top: 1px;
  width: 4px;
  height: 6px;
  border: solid #090d16;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.limit-slider-group {
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding-left: 12px;
}
.slider-label {
  color: var(--text-secondary);
  white-space: nowrap;
}
.neon-slider {
  -webkit-appearance: none;
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.1);
  outline: none;
  cursor: pointer;
}
.neon-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-cyan);
  box-shadow: 0 0 5px var(--accent-cyan);
  cursor: pointer;
  transition: transform 0.1s;
}
.neon-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}
.zoom-controls-modal {
  display: flex;
  gap: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 4px;
  border-radius: 6px;
}
.zoom-btn {
  background-color: rgba(18,24,38,0.85);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.zoom-btn:hover {
  background-color: rgba(6,182,212,0.2);
  border-color: var(--accent-cyan);
  color: #cffafe;
  box-shadow: 0 0 8px rgba(6,182,212,0.3);
}
.close-modal-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.close-modal-btn:hover {
  color: #ec4899;
  background: rgba(236,72,153,0.1);
  transform: scale(1.1);
}
.fullscreen-canvas-container {
  flex: 1;
  position: relative;
  background-color: rgba(0,0,0,0.3);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
}
.vis-tooltip {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 250px;
  background: rgba(18,24,38,0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(6,182,212,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(6,182,212,0.1);
  border-radius: 8px;
  padding: 12px;
  pointer-events: none;
}
.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 6px;
}
.tooltip-icon {
  font-size: 14px;
}
.tooltip-header h4 {
  margin: 0;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
}
.tooltip-body p {
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.canvas-hint {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  color: var(--text-secondary);
  pointer-events: none;
}
@keyframes focalPulse {
  0% {
    filter: drop-shadow(0 0 8px rgba(236,72,153,0.6));
  }
  100% {
    filter: drop-shadow(0 0 16px rgba(236,72,153,1));
  }
}
:global(.node-focal-pulse) {
  animation: focalPulse 1.5s infinite alternate;
}
</style>
