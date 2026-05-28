<template>
  <div class="loading-screen" :class="{ 'loading-exit': exiting }">
    <!-- Sliding doors panels -->
    <div class="split-panel panel-left"></div>
    <div class="split-panel panel-right"></div>

    <!-- Aurora sweep (Phase 3 only) -->
    <div class="aurora-sweep" :class="{ 'aurora-active': phase >= 3 }" />

    <!-- Interactive Demo Control Toolbar -->
    <div class="demo-toolbar" v-if="isPreviewMode">
      <div class="demo-controls">
        <span class="demo-title">⚡ 二维粒子星图演示:</span>
        <button
          type="button"
          class="demo-btn btn-active"
        >
          2D 粒子星图 (Canvas 2D)
        </button>
        <button
          type="button"
          class="demo-btn-action"
          @click="replayAnimation"
          title="重新播放加载动画，观察粒子向心汇聚并旋入消失过程"
        >
          🔄 重新播放
        </button>
      </div>
      <div class="demo-stats">
        <span>帧率: {{ fps }} FPS</span>
        <span>|</span>
        <span>粒子数: 600</span>
        <span>|</span>
        <span>框架大小: 0 KB (原生 Canvas)</span>
      </div>
    </div>

    <!-- Background Particle Canvas (Fresh 2D context) -->
    <canvas
      key="canvas2d"
      ref="particleCanvas2D"
      class="particle-canvas"
      @mousemove="handleMouseMove"
    ></canvas>

    <div class="loading-center">
      <!-- Avatar with pulse rings -->
      <div class="avatar-area">
        <div class="pulse-ring ring-1" :class="{ 'ring-active': phase >= 1 }" />
        <div class="pulse-ring ring-2" :class="{ 'ring-active': phase >= 1 }" />
        <div class="pulse-ring ring-3" :class="{ 'ring-active': phase >= 1 }" />
        <div class="avatar-node" :class="{ 'avatar-visible': phase >= 1 }">
          {{ avatar }}
        </div>
      </div>

      <!-- Status text -->
      <div class="status-area">
        <div class="status-name">{{ name || '同学' }}</div>
        
        <!-- Premium Neon Digital Counter -->
        <div class="progress-digital" :class="{ 'digital-success': progressPct >= 100 }">
          <span class="digital-num">{{ progressPct }}</span>
          <span class="digital-unit">%</span>
        </div>

        <transition name="text-fade" mode="out-in">
          <div class="status-msg" :key="progressPct >= 100 ? 'done' : phase">
            {{ progressPct >= 100 ? '校园社交图谱接入已完成！' : (statusMessages[phase - 1] || '系统准备中...') }}
          </div>
        </transition>
        
        <div class="status-sub" v-if="progressPct >= 100">
          系统初始化就绪，正在载入系统...
        </div>
        <div class="status-sub" v-else-if="phase === 2">
          已识别 {{ interests.length }} 个兴趣标签
        </div>
        <div class="status-sub" v-else-if="phase === 3">
          正在接入 1,500+ 校园社交节点...
        </div>
      </div>

      <!-- Interest tags cloud (Phase 2+) -->
      <div class="tags-cloud" v-if="phase >= 2">
        <span
          v-for="(tag, i) in interests"
          :key="tag"
          class="fly-tag"
          :style="{
            '--dx': tagOffsets[i]?.dx + 'px',
            '--dy': tagOffsets[i]?.dy + 'px',
            animationDelay: (i * 60) + 'ms',
          }"
        >
          # {{ tag }}
        </span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar-wrap">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }" :class="{ 'progress-done': progressPct >= 100 }" />
      </div>
      <div class="progress-label">{{ progressPct }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  name: string
  avatar: string
  interests: string[]
}>()

const emit = defineEmits<{ done: [] }>()

// ── Animation state ─────────────────────────────────────────────────────────
const phase = ref(0)   // 0 = init, 1 = node spawn, 2 = tags, 3 = graph lines
const exiting = ref(false)
const progressPct = ref(0)
const isPreviewMode = computed(() => {
  return typeof window !== 'undefined' && window.location.pathname.includes('loader-preview.html')
})
const renderMode = ref<'2d'>('2d')
const fps = ref(60)

const statusMessages = [
  '正在构建您的社交节点...',
  '正在匹配您的兴趣圈层...',
  '正在接入校园社交图谱...',
]

// ── Tag fly-in offsets (random, generated once) ──────────────────────────────
const tagOffsets = computed(() =>
  props.interests.map(() => ({
    dx: (Math.random() - 0.5) * 140,
    dy: (Math.random() - 0.5) * 100,
  }))
)

// ── Progress animation ────────────────────────────────────────────────────────
let progressTimer: ReturnType<typeof setInterval> | null = null
const startProgress = (from: number, to: number, durationMs: number) => {
  if (progressTimer) clearInterval(progressTimer)
  const step = (to - from) / (durationMs / 30)
  let current = from
  progressTimer = setInterval(() => {
    current += step
    if (current >= to) {
      current = to
      if (progressTimer) clearInterval(progressTimer)
      progressTimer = null
    }
    progressPct.value = Math.round(current)
  }, 30)
}

// ── Timeline ──────────────────────────────────────────────────────────────────
const timers: ReturnType<typeof setTimeout>[] = []

const runTimeline = () => {
  // Clear any existing timers/intervals
  timers.forEach(clearTimeout)
  timers.length = 0
  if (progressTimer) clearInterval(progressTimer)
  progressTimer = null

  phase.value = 0
  exiting.value = false
  progressPct.value = 0

  // Phase 1: Avatar appears
  timers.push(setTimeout(() => {
    phase.value = 1
    startProgress(0, 33, 780)
  }, 80))

  // Phase 2: Tags fly in
  timers.push(setTimeout(() => {
    phase.value = 2
    startProgress(33, 66, 980)
  }, 860))

  // Phase 3: Graph lines grow
  timers.push(setTimeout(() => {
    phase.value = 3
    startProgress(66, 100, 980)
  }, 1840))

  // Exit
  timers.push(setTimeout(() => {
    exiting.value = true
  }, 2900))

  // Done
  timers.push(setTimeout(() => {
    emit('done')
  }, 3400))
}

// ── Canvas References ─────────────────────────────────────────────────────────
const particleCanvas2D = ref<HTMLCanvasElement | null>(null)

let animationFrameId: number | null = null
let canvasWidth = 0
let canvasHeight = 0

// Mouse coordinates
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
const handleMouseMove = (e: MouseEvent) => {
  const canvas = particleCanvas2D.value
  const rect = canvas?.getBoundingClientRect()
  if (rect) {
    mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
}

// ── 2D Particle Definition ────────────────────────────────────────────────────
interface Particle2D {
  startX: number
  startY: number
  orbitRadius: number
  orbitSpeed: number
  angle: number
  color: string
  baseSize: number
  alpha: number
  swirlSpeed: number
  x?: number
  y?: number
  currentDrawX?: number
  currentDrawY?: number
}

let particles2D: Particle2D[] = []

const initParticles2D = () => {
  particles2D = []
  const count = 600 // Increased count for richer visual presentation
  const colors = ['#fd971f', '#06b6d4', '#ec4899', '#4ade80', '#a78bfa', '#facc15']
  const w = canvasWidth || window.innerWidth
  const h = canvasHeight || window.innerHeight

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const startRadius = Math.max(w, h) * (0.55 + Math.random() * 0.3)
    const startX = w / 2 + Math.cos(angle) * startRadius
    const startY = h / 2 + Math.sin(angle) * startRadius
    const orbitRadius = 60 + Math.random() * 185

    particles2D.push({
      startX,
      startY,
      orbitRadius,
      orbitSpeed: 0.0015 + Math.random() * 0.004, // slightly slower, elegant rotation
      angle: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      baseSize: 1.1 + Math.random() * 2.2,
      alpha: 0.35 + Math.random() * 0.65,
      swirlSpeed: 1.5 + Math.random() * 2.5,
    })
  }
}

// ── Rendering Loop & Resize ──────────────────────────────────────────────────
let lastTime = 0
let fpsTicks = 0
let fpsLastTime = 0

const initRenderer = () => {
  const canvas = particleCanvas2D.value
  if (!canvas) return

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvasWidth = rect.width
  canvasHeight = rect.height

  canvas.width = canvasWidth * dpr
  canvas.height = canvasHeight * dpr

  initParticles2D()

  lastTime = performance.now()
  fpsTicks = 0
  fpsLastTime = lastTime
  tick()
}

const tick = () => {
  const now = performance.now()
  fpsTicks++
  if (now - fpsLastTime >= 1000) {
    fps.value = Math.round((fpsTicks * 1000) / (now - fpsLastTime))
    fpsTicks = 0
    fpsLastTime = now
  }

  const canvas = particleCanvas2D.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    const progress = progressPct.value / 100

    if (ctx) {
      // Semi-transparent background for fluid light trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const dpr = window.devicePixelRatio || 1
      ctx.save()
      ctx.scale(dpr, dpr)

      // Smooth mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.08
      mouse.y += (mouse.targetY - mouse.y) * 0.08
      const mX = (mouse.x + 1) * (canvasWidth / 2)
      const mY = (-mouse.y + 1) * (canvasHeight / 2)

      // KEY ALIGNMENT: Dynamically find the exact center of the .avatar-node in pixels
      let cx = canvasWidth / 2
      let cy = canvasHeight / 2
      const avatarEl = document.querySelector('.avatar-node')
      if (avatarEl) {
        const rect = avatarEl.getBoundingClientRect()
        const canvasRect = canvas.getBoundingClientRect()
        cx = rect.left + rect.width / 2 - canvasRect.left
        cy = rect.top + rect.height / 2 - canvasRect.top
      }

      // 1. Update and draw particles
      for (let i = 0; i < particles2D.length; i++) {
        const p = particles2D[i]
        p.angle += p.orbitSpeed

        const t = Math.min(Math.max(progress, 0), 1)

        // Collapse orbit radius to 0 from 80% to 100% progress (spiral into center)
        let targetRadius = p.orbitRadius
        let swirlMultiplier = p.swirlSpeed
        if (progress > 0.8) {
          const collapseProgress = (progress - 0.8) / 0.2 // 0.0 to 1.0
          targetRadius = p.orbitRadius * (1 - collapseProgress)
          swirlMultiplier = p.swirlSpeed + collapseProgress * 5 // spin faster as they get sucked in
        }

        // Swirling inwards
        const swirlAngle = p.angle + (1 - t) * swirlMultiplier * Math.PI
        const rad = targetRadius * t + Math.max(canvasWidth, canvasHeight) * 0.55 * (1 - t)

        const tx = cx + Math.cos(swirlAngle) * rad
        const ty = cy + Math.sin(swirlAngle) * rad

        if (progress === 0 && !exiting.value) {
          p.x = tx
          p.y = ty
        } else {
          const px = p.x ?? p.startX
          const py = p.y ?? p.startY
          p.x = px + (tx - px) * 0.09
          p.y = py + (ty - py) * 0.09
        }

        // Mouse repulsion
        const rx = p.x ?? p.startX
        const ry = p.y ?? p.startY
        const mdx = rx - mX
        const mdy = ry - mY
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
        let repelledX = 0
        let repelledY = 0
        if (mDist < 110) {
          const force = (110 - mDist) * 0.14
          repelledX = (mdx / (mDist || 1)) * force
          repelledY = (mdy / (mDist || 1)) * force
        }

        const drawX = rx + repelledX
        const drawY = ry + repelledY

        p.currentDrawX = drawX
        p.currentDrawY = drawY

        // Dynamic Opacity calculation
        // Calculate particle distance to the computed avatar center
        const dxFromCenter = drawX - cx
        const dyFromCenter = drawY - cy
        const distFromCenter = Math.sqrt(dxFromCenter * dxFromCenter + dyFromCenter * dyFromCenter)

        let alphaFade = 1.0
        // Fade out as they fly deep inside the central avatar circle (radius ~ 70px)
        if (distFromCenter < 60) {
          alphaFade = Math.max(0, (distFromCenter - 6) / 54)
        }
        // Only fade out globally when the progress is at the absolute end (97%+),
        // giving particles maximum time to reach the center!
        if (progress > 0.97) {
          alphaFade *= Math.max(0, (1 - progress) / 0.03)
        }

        // Render point
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * Math.min(progress * 3, 1) * alphaFade
        ctx.shadowBlur = 4
        ctx.shadowColor = p.color

        ctx.beginPath()
        ctx.arc(drawX, drawY, p.baseSize, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowBlur = 0
        ctx.globalAlpha = 1.0
      }

      // 2. Draw connections (network lines)
      ctx.lineWidth = 0.8
      const maxDist = 55 // tighter distance limit to keep constellation clean when dense
      const maxDistSq = maxDist * maxDist

      // To keep performance high with 600 particles, we step by 2 in both loops
      for (let i = 0; i < particles2D.length; i += 2) {
        const p1 = particles2D[i]
        if (p1.currentDrawX === undefined || p1.currentDrawY === undefined) continue

        for (let j = i + 1; j < particles2D.length; j += 2) {
          const p2 = particles2D[j]
          if (p2.currentDrawX === undefined || p2.currentDrawY === undefined) continue

          const dx = p1.currentDrawX - p2.currentDrawX
          const dy = p1.currentDrawY - p2.currentDrawY
          const distSq = dx * dx + dy * dy

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq)
            
            // Calculate average distance from center to fade out connection lines near center
            const avgDistFromCenter = (
              Math.sqrt((p1.currentDrawX - cx) ** 2 + (p1.currentDrawY - cy) ** 2) +
              Math.sqrt((p2.currentDrawX - cx) ** 2 + (p2.currentDrawY - cy) ** 2)
            ) / 2
            
            let alphaFade = 1.0
            if (avgDistFromCenter < 60) {
              alphaFade = Math.max(0, (avgDistFromCenter - 6) / 54)
            }
            if (progress > 0.97) {
              alphaFade *= Math.max(0, (1 - progress) / 0.03)
            }

            const alpha = (1 - dist / maxDist) * 0.15 * Math.min(progress * 2.5, 1) * alphaFade
            if (alpha > 0.01) {
              ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`
              ctx.beginPath()
              ctx.moveTo(p1.currentDrawX, p1.currentDrawY)
              ctx.lineTo(p2.currentDrawX, p2.currentDrawY)
              ctx.stroke()
            }
          }
        }
      }

      ctx.restore()
    }
  }

  animationFrameId = requestAnimationFrame(tick)
}

const handleResize = () => {
  const canvas = particleCanvas2D.value
  if (!canvas) return
  const w = window.innerWidth
  const h = window.innerHeight
  canvasWidth = w
  canvasHeight = h
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr
}

const replayAnimation = () => {
  runTimeline()
  initParticles2D()
}

// ── Lifecycle Hooks ───────────────────────────────────────────────────────────
onMounted(() => {
  runTimeline()
  initRenderer()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
  if (progressTimer) clearInterval(progressTimer)
  window.removeEventListener('resize', handleResize)

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped src="./LoginLoadingScreen.css"></style>
