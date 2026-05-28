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
      v-if="!isAdmin"
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
        <div class="status-name" v-if="!isAdmin">{{ name || '同学' }}</div>
        
        <!-- Premium Neon Digital Counter -->
        <div class="progress-digital" :class="{ 'digital-success': progressPct >= 100 }">
          <span class="digital-num">{{ progressPct }}</span>
          <span class="digital-unit">%</span>
        </div>

        <transition name="text-fade" mode="out-in">
          <div class="status-msg" :key="progressPct >= 100 ? 'done' : phase" v-if="!isAdmin">
            {{ progressPct >= 100 ? '校园社交图谱接入已完成！' : (statusMessages[phase - 1] || '系统准备中...') }}
          </div>
        </transition>
        
        <template v-if="!isAdmin">
          <div class="status-sub" v-if="progressPct >= 100">
            系统初始化就绪，正在载入系统...
          </div>
          <div class="status-sub" v-else-if="phase === 2">
            已识别 {{ interests.length }} 个兴趣标签
          </div>
          <div class="status-sub" v-else-if="phase === 3">
            正在接入 1,500+ 校园社交节点...
          </div>
        </template>
      </div>

      <!-- Interest tags cloud (Phase 2+) -->
      <div class="tags-cloud" v-if="phase >= 2 && !isAdmin">
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
    <div class="progress-bar-wrap" v-if="!isAdmin">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }" :class="{ 'progress-done': progressPct >= 100 }" />
      </div>
      <div class="progress-label">{{ progressPct }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LoadingParticleEngine } from '@/services/LoadingParticleEngine'

const props = defineProps<{
  name: string
  avatar: string
  interests: string[]
  isAdmin?: boolean
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
let particleEngine: LoadingParticleEngine | null = null

const handleMouseMove = (e: MouseEvent) => {
  particleEngine?.handleMouseMove(e.clientX, e.clientY)
}

const initRenderer = () => {
  if (particleCanvas2D.value) {
    particleEngine = new LoadingParticleEngine(particleCanvas2D.value, {
      progressPctProvider: () => progressPct.value,
      exitingProvider: () => exiting.value,
      onFpsUpdate: (val) => {
        fps.value = val
      }
    })
    particleEngine.init()
  }
}

const handleResize = () => {
  particleEngine?.resize()
}

const replayAnimation = () => {
  runTimeline()
  particleEngine?.replay()
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
  if (particleEngine) {
    particleEngine.destroy()
    particleEngine = null
  }
})
</script>

<style scoped src="./LoginLoadingScreen.css"></style>
