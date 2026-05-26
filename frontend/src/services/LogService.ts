import { ref } from 'vue'

export interface LogEntry {
  id: string
  timestamp: string
  type: 'info' | 'action' | 'warning'
  message: string
}

export class LogService {
  private static instance: LogService

  public readonly logs = ref<LogEntry[]>([])

  private constructor() {}

  public static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService()
    }
    return LogService.instance
  }

  public addLog(type: 'info' | 'action' | 'warning', message: string): void {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    }
    this.logs.value.unshift(entry)
  }
}

export const logService = LogService.getInstance()
