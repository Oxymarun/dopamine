export type TimerMode = 'work' | 'break'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  remaining: number
  total: number
  sessions: number
}

export function buildTimerState(workMin: number, breakMin: number, mode: TimerMode = 'work'): TimerState {
  const total = (mode === 'work' ? workMin : breakMin) * 60
  return { mode, status: 'idle', remaining: total, total, sessions: 0 }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function ringProgress(remaining: number, total: number): number {
  if (total === 0) return 1
  return remaining / total
}
