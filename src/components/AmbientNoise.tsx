import { useState, useEffect } from 'react'
import { ambientEngine, NoiseType } from '../lib/ambient'

const NOISES: { id: NoiseType; label: string }[] = [
  { id: 'rain',  label: '🌧 Rain'  },
  { id: 'brown', label: '🌊 Brown' },
  { id: 'cafe',  label: '☕ Cafe'  },
  { id: 'white', label: '📺 White' },
]

export default function AmbientNoise() {
  const [active, setActive] = useState<NoiseType | null>(null)
  const [volume, setVolume] = useState(ambientEngine.volume)

  useEffect(() => {
    return () => { ambientEngine.pause() }
  }, [])

  function toggle(type: NoiseType) {
    if (active === type) {
      ambientEngine.pause()
      setActive(null)
    } else {
      ambientEngine.play(type)
      setActive(type)
    }
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value)
    setVolume(v)
    ambientEngine.setVolume(v)
  }

  return (
    <div className="w-full flex flex-col gap-1.5 pt-2 border-t border-[var(--border)]">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Ambient</span>
        {active && (
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolume}
            className="w-20 accent-[var(--accent)] h-1 cursor-pointer"
          />
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {NOISES.map(n => (
          <button
            key={n.id}
            onClick={() => toggle(n.id)}
            className={`text-[11px] px-2.5 py-1 rounded-btn border transition-all ${
              active === n.id
                ? 'bg-accent/15 text-accent border-accent/40'
                : 'bg-surface text-text-muted border-[var(--border)] hover:text-text-primary'
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  )
}
