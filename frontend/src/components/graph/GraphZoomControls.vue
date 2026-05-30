<template>
  <div class="zoom-controls-modal">
    <button @click="$emit('zoomIn')" class="zoom-btn" title="放大" aria-label="放大" style="display: inline-flex; align-items: center; justify-content: center;">
      <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
    <button @click="$emit('zoomOut')" class="zoom-btn" title="缩小" aria-label="缩小" style="display: inline-flex; align-items: center; justify-content: center;">
      <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
    <button @click="$emit('resetZoom')" class="zoom-btn" title="重置" aria-label="重置" style="display: inline-flex; align-items: center; justify-content: center;">
      <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'resetZoom'): void
}>()
</script>

<style scoped src="../GraphModal.css"></style>
