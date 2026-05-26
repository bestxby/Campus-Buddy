import { useLogStore } from '@/stores/log'
import { computed } from 'vue'
import type { LogEntry } from '@/types'

export type { LogEntry }

export const logs = computed(() => useLogStore().logs)

export const addLog = (type: 'info' | 'action' | 'warning', message: string): void => {
  useLogStore().addLog(type, message)
}
