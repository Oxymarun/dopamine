import { useState, useEffect, useRef } from 'react'

const PHASES = [
  { label: 'Inhale',   duration: 4, scale: 1.4 },
  { label: 'Hold',     duration: 4, scale: 1.4 },
  { label: 'Exhale',   duration: 4, scale: 0.7 },
  { label: 'Hold',     duration: 4, scale: 0.7 },
]

interface Props { onClose: () => void }

export default function BreathingOverlay({ onClose }: Props) {
  const [phase, setPhase] = useState(0)
  const [tick, setTick] = useState(PHASES[0].duration)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clear() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTick(prev => {
        if (prev <= 1) {
          setPhase(p => {
            const next = (p + 1) % PHASES.length
            if (next === 0) setCycles(c => c + 1)
            setTick(PHASES[next].duration)
            return next
          })
          return PHASES[(phase + 1) % PHASES.length].duration
        }
        return prev - 1
      })
    }, 1000)
    return clear
  }, [running, phase])

  function start() {
    setPhase(0)
    setTick(PHASES[0].duration)
    setRunning(true)
  }

  function stop() {
    clear()
    setRunning(false)
    setTick(PHASES[0].duration)
    setPhase(0)
    setCycles(0)
  }

  const currentPhase = PHASES[phase]
  const progress = 1 - (tick / currentPhase.duration)

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 rounded-xl">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-text-muted hover:text-text-primary text-lg leading-none"
      >
        ×
      </button>

      <h2 className="text-[13px] font-semibold text-text-primary mb-1">Box Breathing</h2>
      <p className="text-[10px] text-text-muted mb-6">4-4-4-4 • {cycles} cycle{cycles !== 1 ? 's' : ''}</p>

      {/* Animated circle */}
      <div className="relative flex items-center justify-center mb-6" style={{ width: 140, height: 140 }}>
        {/* Outer ring progress */}
        <svg className="absolute inset-0" width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="62" fill="none" stroke="var(--surface)" strokeWidth="4" />
          <circle
            cx="70" cy="70" r="62"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 62}
            strokeDashoffset={2 * Math.PI * 62 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        {/* Inner pulsing circle */}
        <div
          className="rounded-full bg-accent/20 border-2 border-accent/40 flex flex-col items-center justify-center"
          style={{
            width: 80,
            height: 80,
            transform: `scale(${running ? currentPhase.scale : 1})`,
            transition: `transform ${currentPhase.duration * 0.9}s ease-in-out`,
          }}
        >
          <span className="text-[13px] font-semibold text-accent">{running ? currentPhase.label : '·'}</span>
          {running && <span className="text-[18px] font-bold text-text-primary tabular-nums">{tick}</span>}
        </div>
      </div>

      {running ? (
        <button
          onClick={stop}
          className="px-5 py-1.5 rounded-btn text-[12px] font-medium bg-surface border border-[var(--border)] text-text-muted hover:text-text-primary transition-all"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={start}
          className="px-6 py-1.5 rounded-btn text-[12px] font-semibold bg-accent text-white hover:brightness-110 transition-all"
        >
          Start
        </button>
      )}

      <p className="text-[10px] text-text-muted mt-3 text-center max-w-[180px]">
        Activates parasympathetic nervous system. Do 4+ cycles.
      </p>
    </div>
  )
}
