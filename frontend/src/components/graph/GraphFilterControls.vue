<template>
  <div class="canvas-toggles">
    <div class="toggle-group">
      <label class="neon-checkbox" style="display: inline-flex; align-items: center;">
        <input type="checkbox" :checked="hideBuddies" @change="$emit('update:hideBuddies', ($event.target as HTMLInputElement).checked)" />
        <span class="checkbox-box"></span>
        <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        隐藏同学
      </label>
      <label class="neon-checkbox" style="display: inline-flex; align-items: center;">
        <input type="checkbox" :checked="hideActivities" @change="$emit('update:hideActivities', ($event.target as HTMLInputElement).checked)" />
        <span class="checkbox-box"></span>
        <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        隐藏活动
      </label>
    </div>
    <div class="limit-slider-group" v-if="!isGlobalMode">
      <span class="slider-label" style="display: inline-flex; align-items: center; gap: 4px;">
        <svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
        </svg>
        推荐搭子限额: {{ buddyLimit }}人
      </span>
      <input type="range" min="0" :max="maxLimit" step="1" :value="buddyLimit" @input="$emit('update:buddyLimit', Number(($event.target as HTMLInputElement).value))" class="neon-slider" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hideBuddies: boolean
  hideActivities: boolean
  buddyLimit: number
  maxLimit: number
  isGlobalMode: boolean
}>()

defineEmits<{
  (e: 'update:hideBuddies', val: boolean): void
  (e: 'update:hideActivities', val: boolean): void
  (e: 'update:buddyLimit', val: number): void
}>()
</script>

<style scoped src="../GraphModal.css"></style>
