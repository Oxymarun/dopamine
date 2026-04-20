import { useState, useEffect } from 'react'
import { Pin, PinOff } from 'lucide-react'

interface TitleBarProps {
  streak: number
  level: string
}

export default function TitleBar({ streak, level }: TitleBarProps) {
  const [pinned, setPinned] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function togglePin() {
    const next = !pinned
    setPinned(next)
    window.widget?.pin(next)
  }

  return (
    <div
      className="flex items-center justify-between px-3 py-2 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Traffic lights */}
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.widget?.close()}
          className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
          aria-label="Close"
        />
        <button
          onClick={() => window.widget?.minimize()}
          className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all"
          aria-label="Minimize"
        />
      </div>

      {/* App name */}
      <span className="text-[11px] font-semibold tracking-tight text-text-primary/70">
        Dopamine
      </span>

      {/* Right side: streak + level + clock + pin */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {streak > 0 && (
          <span className="text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded-chip">
            🔥{streak}
          </span>
        )}
        <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-chip">
          {level}
        </span>
        <span className="text-[11px] text-text-muted tabular-nums">{time}</span>
        <button
          onClick={togglePin}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label={pinned ? 'Unpin' : 'Pin on top'}
        >
          {pinned ? <Pin size={12} /> : <PinOff size={12} />}
        </button>
      </div>
    </div>
  )
}
