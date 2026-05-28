import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LogEntry } from '@/types'

export const useLogStore = defineStore('log', () => {
  const logs = ref<LogEntry[]>([])
  let idCounter = 0

  function addLog(type: 'info' | 'action' | 'warning' | 'query', message: string): void {
    const entry: LogEntry = {
      id: `log-${++idCounter}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    }
    logs.value.unshift(entry)
  }

  return {
    logs,
    addLog,
  }
})
