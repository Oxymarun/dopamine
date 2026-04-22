import { useState, useEffect, useRef, useCallback } from 'react'
import { storage, updateStreak } from '../lib/storage'
import { buildTimerState, formatTime, ringProgress, TimerState } from '../lib/timer'
import { playWorkComplete, playBreakComplete } from '../lib/sound'
import { notify } from '../lib/notify'
import Nura, { NuraMode, NuraRef } from './Nura'
import AmbientNoise from './AmbientNoise'
import BreathingOverlay from './overlays/BreathingOverlay'
import StuckOverlay from './overlays/StuckOverlay'
import OneThingOverlay from './overlays/OneThingOverlay'
import HyperfocusAlert from './overlays/HyperfocusAlert'

const MOODS = ['😶', '😐', '🙂', '😄', '🔥']
const PRESETS = [15, 25, 45, 60]
const RING_R = 54
const RING_CIRC = 2 * Math.PI * RING_R
const HYPERFOCUS_MIN = 90

type Overlay = 'breathing' | 'stuck' | 'onething' | 'hyperfocus' | null

interface FocusProps {
  focusTask?: string
  onSessionComplete?: () => void
  onFocusDone?: () => void
}

export default function Focus({ focusTask, onSessionComplete, onFocusDone }: FocusProps) {
  const settings = storage.getSettings()
  const rewards  = storage.getRewards()
  const [task, setTask] = useState(focusTask ?? '')
  const [mood, setMood] = useState(2)
  const [elapsed, setElapsed] = useState(0)
  const [state, setState] = useState<TimerState>(() =>
    buildTimerState(settings.workMin, settings.breakMin, 'work')
  )
  const [nuraMode, setNuraMode] = useState<NuraMode>('idle')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [hyperfocusDismissed, setHyperfocusDismissed] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nuraRef = useRef<NuraRef>(null)
  const neglectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (focusTask !== undefined) setTask(focusTask)
  }, [focusTask])

  const resetNeglect = useCallback(() => {
    if (neglectTimer.current) clearTimeout(neglectTimer.current)
    neglectTimer.current = setTimeout(() => {
      setState(prev => {
        if (prev.status !== 'running') setNuraMode('neglected')
        return prev
      })
    }, 20 * 60 * 1000)
  }, [])

  useEffect(() => {
    resetNeglect()
    return () => { if (neglectTimer.current) clearTimeout(neglectTimer.current) }
  }, [resetNeglect])

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const complete = useCallback((currentState: TimerState) => {
    clear()
    setElapsed(0)
    elapsedRef.current = 0
    setHyperfocusDismissed(false)
    const cfg = storage.getSettings()

    storage.addSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: currentState.mode,
      durationMin: Math.round((currentState.total - currentState.remaining) / 60) || 1,
      mood: MOODS[mood],
    })

    if (currentState.mode === 'work') updateStreak()
    onSessionComplete?.()

    if (cfg.soundEnabled) {
      currentState.mode === 'work' ? playWorkComplete() : playBreakComplete()
    }

    notify(
      currentState.mode === 'work' ? 'Work session done!' : 'Break over!',
      currentState.mode === 'work' ? 'Time for a break.' : 'Back to work.'
    )

    setNuraMode('celebrate')
    nuraRef.current?.celebrate()
    setTimeout(() => {
      const nextMode = currentState.mode === 'work' ? 'break' : 'work'
      setNuraMode(nextMode === 'break' ? 'break' : 'idle')
    }, 2500)

    const nextMode = currentState.mode === 'work' ? 'break' : 'work'
    const fresh = buildTimerState(cfg.workMin, cfg.breakMin, nextMode)
    setState({
      ...fresh,
      sessions: currentState.sessions + (currentState.mode === 'work' ? 1 : 0),
    })

    resetNeglect()
  }, [clear, mood, onSessionComplete, resetNeglect])

  useEffect(() => {
    if (state.status !== 'running') return
    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.remaining <= 1) return { ...prev, remaining: 0, status: 'idle' }
        return { ...prev, remaining: prev.remaining - 1 }
      })
      setElapsed(prev => {
        const next = prev + 1
        elapsedRef.current = next
        // Hyperfocus alert
        if (
          state.mode === 'work' &&
          next > 0 &&
          next % (HYPERFOCUS_MIN * 60) === 0 &&
          !hyperfocusDismissed
        ) {
          setOverlay('hyperfocus')
        }
        return next
      })
    }, 1000)
    return clear
  }, [state.status, state.mode, clear, hyperfocusDismissed])

  useEffect(() => {
    if (state.status === 'idle' && state.remaining === 0 && state.total > 0) {
      complete(state)
    }
  }, [state, complete])

  function start() {
    if (state.status === 'idle') setElapsed(0)
    if (Math.random() < 0.05) {
      const fn = (window as Window & { nuraZoomies?: () => void }).nuraZoomies
      fn?.()
    }
    setNuraMode('focus')
    resetNeglect()
    setState(prev => ({ ...prev, status: 'running' }))
  }

  function pause() {
    clear()
    setNuraMode('idle')
    setState(prev => ({ ...prev, status: 'paused' }))
  }

  function reset() {
    clear()
    setElapsed(0)
    elapsedRef.current = 0
    setHyperfocusDismissed(false)
    setNuraMode('idle')
    const cfg = storage.getSettings()
    setState(prev => buildTimerState(cfg.workMin, cfg.breakMin, prev.mode))
    resetNeglect()
  }

  function addTime(min: number) {
    setState(prev => ({
      ...prev,
      remaining: prev.remaining + min * 60,
      total: prev.total + min * 60,
    }))
  }

  function setPreset(min: number) {
    clear()
    setElapsed(0)
    const cfg = storage.getSettings()
    const total = min * 60
    setState(prev => ({
      ...buildTimerState(cfg.workMin, cfg.breakMin, prev.mode),
      total,
      remaining: total,
      status: 'idle',
    }))
  }

  function toggleMode() {
    clear()
    setElapsed(0)
    const cfg = storage.getSettings()
    const nextMode = state.mode === 'work' ? 'break' : 'work'
    setNuraMode('idle')
    setState(buildTimerState(cfg.workMin, cfg.breakMin, nextMode))
  }

  function handleDone() {
    onFocusDone?.()
    nuraRef.current?.celebrate()
    setNuraMode('celebrate')
    setTimeout(() => setNuraMode('idle'), 2500)
  }

  // Stuck overlay → sets a 5-min timer
  function handleStuckStartTimer() {
    clear()
    setElapsed(0)
    const total = 5 * 60
    setState(prev => ({ ...prev, total, remaining: total, status: 'running' }))
    setNuraMode('focus')
  }

  // Hyperfocus → take break
  function handleHyperfocusBreak() {
    setOverlay(null)
    pause()
    const cfg = storage.getSettings()
    setState(buildTimerState(cfg.workMin, cfg.breakMin, 'break'))
    setNuraMode('break')
  }

  const progress = ringProgress(state.remaining, state.total)
  const dashoffset = RING_CIRC * (1 - progress)
  const isWork = state.mode === 'work'
  const isRunning = state.status === 'running'

  const dotsInBlock = state.sessions % 4
  const completedBlocks = Math.floor(state.sessions / 4)

  return (
    <div className="flex-1 flex flex-col items-center px-4 pt-2 pb-3 gap-2 overflow-y-auto relative">

      {/* Overlays */}
      {overlay === 'breathing' && (
        <BreathingOverlay onClose={() => setOverlay(null)} />
      )}
      {overlay === 'stuck' && (
        <StuckOverlay
          onClose={() => setOverlay(null)}
          onStartTimer={handleStuckStartTimer}
        />
      )}
      {overlay === 'onething' && (
        <OneThingOverlay
          task={task}
          onClose={() => setOverlay(null)}
          onDone={handleDone}
        />
      )}
      {overlay === 'hyperfocus' && (
        <HyperfocusAlert
          minutesElapsed={Math.floor(elapsedRef.current / 60)}
          onDismiss={() => { setOverlay(null); setHyperfocusDismissed(true) }}
          onTakeBreak={handleHyperfocusBreak}
        />
      )}

      {/* Task input */}
      <input
        type="text"
        value={task}
        onChange={e => setTask(e.target.value)}
        placeholder="What are you working on?"
        className="w-full bg-surface border border-[var(--border)] rounded-btn px-3 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
      />

      {/* Mode toggle */}
      <div className="flex gap-1 bg-surface rounded-btn p-0.5 text-[11px] font-medium w-full">
        <button
          onClick={() => state.mode !== 'work' && toggleMode()}
          className={`flex-1 py-0.5 rounded-[5px] transition-all ${isWork ? 'bg-surface-hover text-text-primary shadow-card' : 'text-text-muted'}`}
        >
          Work
        </button>
        <button
          onClick={() => state.mode !== 'break' && toggleMode()}
          className={`flex-1 py-0.5 rounded-[5px] transition-all ${!isWork ? 'bg-surface-hover text-text-primary shadow-card' : 'text-text-muted'}`}
        >
          Break
        </button>
      </div>

      {/* Ring timer */}
      <div className="relative flex items-center justify-center" style={{ width: 118, height: 118 }}>
        <svg width="118" height="118" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="59" cy="59" r={RING_R} fill="none" stroke="var(--surface)" strokeWidth="7" />
          <g style={{ filter: isRunning ? `drop-shadow(0 0 6px ${isWork ? 'var(--accent)' : 'var(--success)'})` : 'none' }}>
            <circle
              cx="59" cy="59" r={RING_R}
              fill="none"
              stroke={isWork ? 'var(--accent)' : 'var(--success)'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={dashoffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </g>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[26px] font-bold tabular-nums text-text-primary leading-none">
            {formatTime(state.remaining)}
          </span>
          <span className="text-[10px] text-text-muted mt-0.5">
            {isWork ? `session ${state.sessions + 1}` : 'break time'}
          </span>
        </div>
      </div>

      {/* Pomo dots + elapsed */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          {completedBlocks > 0 && (
            <span className="text-[10px] text-text-muted mr-0.5">×{completedBlocks}</span>
          )}
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i < dotsInBlock ? 'bg-success' : 'bg-surface-hover border border-[var(--border)]'}`}
            />
          ))}
        </div>
        {(isRunning || state.status === 'paused') && elapsed > 0 && (
          <span className="text-[10px] text-text-muted">{formatTime(elapsed)} elapsed</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button onClick={() => addTime(5)} className="text-[10px] text-text-muted hover:text-text-primary border border-[var(--border)] rounded-btn px-2 py-1 transition-colors">
          +5m
        </button>
        {isRunning ? (
          <button onClick={pause} className="px-5 py-1.5 rounded-btn text-[12px] font-semibold bg-surface-hover text-text-primary border border-[var(--border)] hover:border-accent/40 transition-all">
            Pause
          </button>
        ) : (
          <button onClick={start} className="px-5 py-1.5 rounded-btn text-[12px] font-semibold bg-accent text-white hover:brightness-110 transition-all">
            {state.status === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        <button onClick={reset} className="text-[10px] text-text-muted hover:text-text-primary border border-[var(--border)] rounded-btn px-2 py-1 transition-colors">
          Reset
        </button>
        {isRunning && (
          <button onClick={() => addTime(10)} className="text-[10px] text-text-muted hover:text-text-primary border border-[var(--border)] rounded-btn px-2 py-1 transition-colors">
            Snooze
          </button>
        )}
      </div>

      {/* Done / Good Enough */}
      {task.trim() && (
        <div className="flex gap-2 w-full">
          <button
            onClick={handleDone}
            className="flex-1 py-1.5 rounded-btn text-[12px] font-medium bg-success/15 text-success border border-success/20 hover:bg-success/25 transition-all"
          >
            ✓ Done
          </button>
          <button
            onClick={handleDone}
            className="flex-1 py-1.5 rounded-btn text-[12px] font-medium bg-surface text-text-muted border border-[var(--border)] hover:text-text-primary transition-all"
          >
            Good Enough
          </button>
        </div>
      )}

      {/* Presets + Mood on same row */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex gap-1.5">
          {PRESETS.map(p => (
            <button key={p} onClick={() => setPreset(p)}
              className="text-[10px] text-text-muted hover:text-text-primary bg-surface rounded-btn px-2 py-0.5 transition-colors">
              {p}m
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {MOODS.map((m, i) => (
            <button key={m} onClick={() => setMood(i)}
              className={`text-[14px] transition-all ${i === mood ? 'scale-125' : 'opacity-35 hover:opacity-60'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Divider before Nura */}
      <div className="w-full" style={{ height: '1px', background: 'var(--border)' }} />

      {/* Nura */}
      <Nura ref={nuraRef} mode={nuraMode} streak={rewards.streak} />

      {/* FABs */}
      <div className="flex items-center gap-1.5 w-full justify-center mt-0.5">
        <button
          onClick={() => setOverlay('breathing')}
          title="Breathing exercise"
          className="text-[10px] text-text-muted hover:text-accent border border-[var(--border)] hover:border-accent/40 rounded-btn px-2.5 py-1 transition-all bg-surface"
        >
          🫁 Breathe
        </button>
        <button
          onClick={() => setOverlay('stuck')}
          title="Stuck flow"
          className="text-[10px] text-text-muted hover:text-accent border border-[var(--border)] hover:border-accent/40 rounded-btn px-2.5 py-1 transition-all bg-surface"
        >
          🧱 Stuck
        </button>
        <button
          onClick={() => setOverlay('onething')}
          title="One thing focus"
          className="text-[10px] text-text-muted hover:text-accent border border-[var(--border)] hover:border-accent/40 rounded-btn px-2.5 py-1 transition-all bg-surface"
        >
          🎯 One Thing
        </button>
      </div>

      {/* Ambient noise */}
      <AmbientNoise />
    </div>
  )
}
