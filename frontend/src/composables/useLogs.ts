import { logService, type LogEntry as ServiceLogEntry } from '@/services/LogService'

export type LogEntry = ServiceLogEntry

export const logs = logService.logs

export const addLog = (type: 'info' | 'action' | 'warning', message: string): void => {
  logService.addLog(type, message)
}
