<template>
  <button
    class="theme-toggle-btn"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="toggle"
  >
    <!-- Sun icon (shown in dark mode to switch to light) -->
    <svg v-if="isDark" class="icon-svg theme-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <!-- Moon icon (shown in light mode to switch to dark) -->
    <svg v-else class="icon-svg theme-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <span class="theme-label">切换为{{ isDark ? '亮色模式' : '暗色模式' }}</span>
  </button>

  <!-- Full-screen theme transition reveal overlay portal -->
  <Teleport to="body">
    <div v-if="isTransitioning" class="theme-transition-overlay" :class="transitionClass">
      <div class="reveal-layer layer-1"></div>
      <div class="reveal-layer layer-2"></div>
      <div class="reveal-layer layer-3"></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)
const isTransitioning = ref(false)
const transitionClass = ref('')

const applyTheme = (dark: boolean) => {
  isDark.value = dark
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  localStorage.setItem('campus-buddy-theme', dark ? 'dark' : 'light')
  window.dispatchEvent(new Event('theme-changed'))
}

const toggle = () => {
  if (isTransitioning.value) return
  
  const targetDark = !isDark.value
  isTransitioning.value = true
  transitionClass.value = targetDark ? 'swipe-to-left' : 'swipe-to-right'
  
  // Disable all transitions during theme transition to avoid visual delay lag and color flash
  document.documentElement.classList.add('no-transitions')

  // Switch actual theme when the target color layer completely covers the viewport
  setTimeout(() => {
    applyTheme(targetDark)
  }, 520)

  // Reset transition state and restore normal transitions after animation finishes
  setTimeout(() => {
    isTransitioning.value = false
    transitionClass.value = ''
    document.documentElement.classList.remove('no-transitions')
  }, 1150) // Increased buffer to ensure layers are fully out-of-screen before DOM destruction
}

onMounted(() => {
  const saved = localStorage.getItem('campus-buddy-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(saved ? saved === 'dark' : prefersDark)
})
</script>

<!-- Scoped button design -->
<style scoped>
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}
.theme-toggle-btn:hover {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.theme-toggle-btn:active {
  transform: translateY(0);
}
.theme-icon {
  flex-shrink: 0;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.theme-toggle-btn:hover .theme-icon {
  transform: rotate(360deg) scale(1.1);
}
.theme-label {
  line-height: 1;
  letter-spacing: 0.5px;
}
</style>

<!-- Global transitions (unscoped) since it teleports to body -->
<style>
.theme-transition-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999999;
  pointer-events: none;
  overflow: hidden;
}

.reveal-layer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  transform: translate3d(100%, 0, 0);
  will-change: transform;
}

/* ─── Swipe to Left: Light -> Dark ─── */
.swipe-to-left .layer-1 {
  background: var(--color-accent, #D96E48);
  animation: swipeLeftReveal 0.8s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.swipe-to-left .layer-2 {
  background: #0284C7;
  animation: swipeLeftReveal 0.8s cubic-bezier(0.76, 0, 0.24, 1) 60ms forwards;
}
.swipe-to-left .layer-3 {
  background: #020617; /* Slate dark background */
  animation: swipeLeftReveal 0.8s cubic-bezier(0.76, 0, 0.24, 1) 120ms forwards;
}

/* ─── Swipe to Right: Dark -> Light ─── */
.swipe-to-right .layer-1 {
  background: var(--color-accent, #FD971F);
  animation: swipeRightReveal 0.8s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.swipe-to-right .layer-2 {
  background: #0EA5E9;
  animation: swipeRightReveal 0.8s cubic-bezier(0.76, 0, 0.24, 1) 60ms forwards;
}
.swipe-to-right .layer-3 {
  background: #FBF9F6; /* Ivory light background */
  animation: swipeRightReveal 0.8s cubic-bezier(0.76, 0, 0.24, 1) 120ms forwards;
}

@keyframes swipeLeftReveal {
  0% {
    transform: translate3d(100%, 0, 0) skewX(8deg);
  }
  40%, 60% {
    transform: translate3d(0, 0, 0) skewX(0deg);
  }
  100% {
    transform: translate3d(-100%, 0, 0) skewX(8deg);
  }
}

@keyframes swipeRightReveal {
  0% {
    transform: translate3d(-100%, 0, 0) skewX(-8deg);
  }
  40%, 60% {
    transform: translate3d(0, 0, 0) skewX(0deg);
  }
  100% {
    transform: translate3d(100%, 0, 0) skewX(-8deg);
  }
}

/* Disable transitions temporarily during theme switch to prevent color flashing */
.no-transitions,
.no-transitions * {
  transition: none !important;
}
</style>

