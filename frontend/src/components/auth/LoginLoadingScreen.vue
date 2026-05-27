<template>
  <div class="loading-screen" :class="{ 'loading-exit': exiting }">
    <!-- Aurora sweep (Phase 3 only) -->
    <div class="aurora-sweep" :class="{ 'aurora-active': phase >= 3 }" />

    <div class="loading-center">
      <!-- Avatar with pulse rings -->
      <div class="avatar-area">
        <div class="pulse-ring ring-1" :class="{ 'ring-active': phase >= 1 }" />
        <div class="pulse-ring ring-2" :class="{ 'ring-active': phase >= 1 }" />
        <div class="pulse-ring ring-3" :class="{ 'ring-active': phase >= 1 }" />
        <div class="avatar-node" :class="{ 'avatar-visible': phase >= 1 }">
          {{ avatar }}
        </div>

        <!-- SVG graph lines (Phase 3) -->
        <svg class="graph-svg" viewBox="-180 -180 360 360" v-if="phase >= 3">
          <g v-for="(line, i) in graphLines" :key="i">
            <line
              :x1="0" :y1="0"
              :x2="line.x2" :y2="line.y2"
              class="graph-line"
              :style="{ animationDelay: line.delay + 'ms' }"
            />
            <circle
              :cx="line.x2" :cy="line.y2" r="6"
              class="graph-node"
              :style="{ animationDelay: (line.delay + 300) + 'ms', fill: line.color }"
            />
          </g>
        </svg>
      </div>

      <!-- Status text -->
      <div class="status-area">
        <div class="status-name">{{ name || '同学' }}</div>
        <transition name="text-fade" mode="out-in">
          <div class="status-msg" :key="phase">{{ statusMessages[phase - 1] }}</div>
        </transition>
        <div class="status-sub" v-if="phase === 2">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  name: string
  avatar: string
  interests: string[]
}>()

const emit = defineEmits<{ done: [] }>()

// ── Animation state ─────────────────────────────────────────────────────────
const phase    = ref(0)   // 0 = init, 1 = node spawn, 2 = tags, 3 = graph lines
const exiting  = ref(false)
const progressPct = ref(0)

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

// ── SVG graph lines (8 directions) ───────────────────────────────────────────
const NODE_COLORS = ['#fd971f', '#06b6d4', '#ec4899', '#4ade80', '#a78bfa', '#facc15', '#fb7185', '#34d399']
const graphLines = computed(() => {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    const len = 100 + Math.random() * 50
    return {
      x2: Math.round(Math.cos(angle) * len),
      y2: Math.round(Math.sin(angle) * len),
      delay: i * 80,
      color: NODE_COLORS[i],
    }
  })
})

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

onMounted(() => {
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
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
  if (progressTimer) clearInterval(progressTimer)
})
</script>

<style scoped src="./LoginLoadingScreen.css"></style>
