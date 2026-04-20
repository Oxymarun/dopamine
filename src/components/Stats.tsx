import { useState, useEffect } from 'react'
import { storage, Session } from '../lib/storage'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function last7Dates(): string[] {
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    dates.push(new Date(Date.now() - i * 86400000).toDateString())
  }
  return dates
}

function moodForDate(sessions: Session[], dateStr: string): string {
  const day = sessions.filter(s => new Date(s.date).toDateString() === dateStr && s.type === 'work')
  return day.length > 0 ? day[day.length - 1].mood : ''
}

export default function Stats() {
  const [sessions, setSessions] = useState<Session[]>(() => storage.getSessions())
  const [rewards, setRewards] = useState(() => storage.getRewards())

  useEffect(() => {
    setSessions(storage.getSessions())
    setRewards(storage.getRewards())
  }, [])

  const dates = last7Dates()
  const workSessions = sessions.filter(s => s.type === 'work')
  const todayCount = workSessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length
  const totalMin = workSessions.reduce((acc, s) => acc + s.durationMin, 0)

  return (
    <div className="flex-1 flex flex-col px-3 py-2 gap-3 overflow-y-auto">

      <div className="grid grid-cols-3 gap-2">
        <Chip label="Streak" value={`${rewards.streak}d`} color="var(--warning)" />
        <Chip label="Today" value={`${todayCount} sess`} color="var(--accent)" />
        <Chip label="Focus time" value={totalMin >= 60 ? `${Math.round(totalMin / 60)}h` : `${totalMin}m`} color="var(--success)" />
      </div>

      <div className="bg-surface rounded-btn border border-[var(--border)] px-3 py-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-text-muted">Level</p>
          <p className="text-[14px] font-semibold text-accent">{rewards.level}</p>
        </div>
        <p className="text-[11px] text-text-muted">{workSessions.length} total sessions</p>
      </div>

      <div>
        <p className="text-[10px] text-text-muted mb-1.5">Mood — last 7 days</p>
        <div className="grid grid-cols-7 gap-1">
          {dates.map(d => {
            const mood = moodForDate(sessions, d)
            const isToday = d === new Date().toDateString()
            return (
              <div key={d} className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-text-muted">{DAY_LABELS[new Date(d).getDay()]}</span>
                <div className={`w-8 h-8 rounded-btn bg-surface border flex items-center justify-center text-[16px] ${isToday ? 'border-accent/40' : 'border-[var(--border)]'}`}>
                  {mood ? mood : <span className="w-1.5 h-1.5 rounded-full bg-surface-hover block" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-text-muted mb-1.5">Recent sessions</p>
        <div className="space-y-1">
          {sessions.length === 0 && (
            <p className="text-text-muted text-[12px] text-center py-4">No sessions yet. Start a timer.</p>
          )}
          {sessions.slice(0, 20).map(s => (
            <div key={s.id} className="flex items-center gap-2 bg-surface rounded-btn border border-[var(--border)] px-2.5 py-1.5">
              <span className="text-[14px]">{s.mood || (s.type === 'work' ? '💼' : '☕')}</span>
              <div className="flex-1">
                <p className="text-[11px] text-text-primary capitalize">{s.type}</p>
                <p className="text-[10px] text-text-muted">
                  {new Date(s.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {s.durationMin}m
                </p>
              </div>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-chip"
                style={{
                  background: s.type === 'work' ? 'rgba(123,97,255,0.12)' : 'rgba(52,211,153,0.12)',
                  color: s.type === 'work' ? 'var(--accent)' : 'var(--success)',
                }}
              >
                {s.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface rounded-btn border border-[var(--border)] px-2.5 py-2 flex flex-col gap-0.5">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className="text-[13px] font-semibold" style={{ color }}>{value}</p>
    </div>
  )
}
