import { useState, useEffect } from 'react'
import { storage, Session, Task, CustomReward } from '../lib/storage'
import { toast } from '../lib/toast'
import { Plus, Trash2, Gift } from 'lucide-react'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const LEVEL_THRESHOLDS = [
  { min: 0,   label: 'Spark' },
  { min: 5,   label: 'Ember' },
  { min: 15,  label: 'Flame' },
  { min: 30,  label: 'Blaze' },
  { min: 60,  label: 'Inferno' },
  { min: 100, label: 'Nova' },
]

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

function focusMinForDate(sessions: Session[], dateStr: string): number {
  return sessions
    .filter(s => new Date(s.date).toDateString() === dateStr && s.type === 'work')
    .reduce((acc, s) => acc + s.durationMin, 0)
}

function xpProgress(totalSessions: number): { pct: number; current: number; next: number | null; label: string } {
  let idx = 0
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalSessions >= LEVEL_THRESHOLDS[i].min) idx = i
  }
  const current = LEVEL_THRESHOLDS[idx].min
  const nextThreshold = LEVEL_THRESHOLDS[idx + 1]
  if (!nextThreshold) return { pct: 1, current, next: null, label: LEVEL_THRESHOLDS[idx].label }
  const pct = (totalSessions - current) / (nextThreshold.min - current)
  return { pct: Math.min(pct, 1), current, next: nextThreshold.min, label: LEVEL_THRESHOLDS[idx].label }
}

export default function Stats() {
  const [sessions, setSessions] = useState<Session[]>(() => storage.getSessions())
  const [rewards, setRewards] = useState(() => storage.getRewards())
  const [wins, setWins] = useState<Task[]>(() => storage.getTasks().filter(t => t.done))
  const [shop, setShop] = useState<CustomReward[]>(() => storage.getShop())
  const [newRewardName, setNewRewardName] = useState('')
  const [newRewardCost, setNewRewardCost] = useState(5)
  const [showAddReward, setShowAddReward] = useState(false)

  useEffect(() => {
    setSessions(storage.getSessions())
    setRewards(storage.getRewards())
    setWins(storage.getTasks().filter(t => t.done))
    setShop(storage.getShop())
  }, [])

  const dates = last7Dates()
  const workSessions = sessions.filter(s => s.type === 'work')
  const todayCount = workSessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length
  const totalMin = workSessions.reduce((acc, s) => acc + s.durationMin, 0)

  const focusByDay = dates.map(d => focusMinForDate(sessions, d))
  const maxFocus = Math.max(...focusByDay, 1)

  const xp = xpProgress(rewards.totalSessions)
  const xpBalance = rewards.totalSessions - (rewards.xpSpent ?? 0)

  function addReward() {
    if (!newRewardName.trim()) return
    const r: CustomReward = {
      id: crypto.randomUUID(),
      name: newRewardName.trim(),
      cost: newRewardCost,
      createdAt: Date.now(),
    }
    const next = [...shop, r]
    setShop(next)
    storage.setShop(next)
    setNewRewardName('')
    setNewRewardCost(5)
    setShowAddReward(false)
  }

  function deleteReward(id: string) {
    const next = shop.filter(r => r.id !== id)
    setShop(next)
    storage.setShop(next)
  }

  function redeemReward(r: CustomReward) {
    if (xpBalance < r.cost) {
      toast.show(`Need ${r.cost} XP (have ${xpBalance})`, 'warning')
      return
    }
    const updated = { ...rewards, xpSpent: (rewards.xpSpent ?? 0) + r.cost }
    storage.setRewards(updated)
    setRewards(updated)
    toast.show(`Redeemed: ${r.name}`, 'success')
  }

  return (
    <div className="flex-1 flex flex-col px-3 py-2 gap-3 overflow-y-auto">

      {/* Top chips */}
      <div className="grid grid-cols-3 gap-2">
        <Chip label="Streak" value={`${rewards.streak}d`} color="var(--warning)" />
        <Chip label="Today" value={`${todayCount} sess`} color="var(--accent)" />
        <Chip label="Focus time" value={totalMin >= 60 ? `${Math.round(totalMin / 60)}h` : `${totalMin}m`} color="var(--success)" />
      </div>

      {/* Level + XP bar */}
      <div className="bg-surface rounded-btn border border-[var(--border)] px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <p className="text-[10px] text-text-muted">Level</p>
            <p className="text-[14px] font-semibold text-accent">{rewards.level}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-text-muted">{rewards.totalSessions} sessions</p>
            <p className="text-[10px] text-text-muted">{xpBalance} XP available</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${xp.pct * 100}%`, background: 'var(--accent)' }}
          />
        </div>
        {xp.next !== null && (
          <p className="text-[10px] text-text-muted mt-1">
            {rewards.totalSessions - xp.current} / {xp.next - xp.current} XP to next level
          </p>
        )}
        {xp.next === null && (
          <p className="text-[10px] text-text-muted mt-1">Max level reached</p>
        )}
      </div>

      {/* Weekly focus bar chart */}
      <div>
        <p className="text-[10px] text-text-muted mb-2">Focus — last 7 days</p>
        <div className="flex items-end gap-1 h-16">
          {dates.map((d, i) => {
            const mins = focusByDay[i]
            const barH = Math.max((mins / maxFocus) * 100, mins > 0 ? 6 : 0)
            const isToday = d === new Date().toDateString()
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end" style={{ height: '48px' }}>
                  <div
                    className="w-full rounded-sm transition-all duration-300"
                    style={{
                      height: `${barH}%`,
                      minHeight: mins > 0 ? '4px' : '0',
                      background: 'var(--accent)',
                      opacity: isToday ? 1 : 0.4,
                    }}
                  />
                </div>
                <span className="text-[9px] text-text-muted">{DAY_LABELS[new Date(d).getDay()]}</span>
                {mins > 0 && <span className="text-[9px] text-text-muted">{mins}m</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mood grid */}
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

      {/* Reward shop */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-text-muted">Reward shop</p>
          <button
            onClick={() => setShowAddReward(s => !s)}
            className="text-[10px] text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
          >
            <Plus size={10} /> Add
          </button>
        </div>

        {showAddReward && (
          <div className="bg-surface border border-[var(--border)] rounded-btn px-3 py-2 mb-2 space-y-2">
            <input
              autoFocus
              value={newRewardName}
              onChange={e => setNewRewardName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addReward() }}
              placeholder="Reward name (e.g. Coffee break)"
              className="w-full bg-surface-hover border border-[var(--border)] rounded-btn px-2.5 py-1.5 text-[11px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 transition-colors"
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted">Cost:</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setNewRewardCost(c => Math.max(1, c - 1))} className="w-5 h-5 rounded bg-surface-hover text-text-muted hover:text-text-primary text-[12px] flex items-center justify-center">−</button>
                <span className="text-[11px] text-text-primary w-5 text-center tabular-nums">{newRewardCost}</span>
                <button onClick={() => setNewRewardCost(c => c + 1)} className="w-5 h-5 rounded bg-surface-hover text-text-muted hover:text-text-primary text-[12px] flex items-center justify-center">+</button>
              </div>
              <span className="text-[10px] text-text-muted">XP</span>
              <button onClick={addReward} className="ml-auto text-[11px] bg-accent/20 border border-accent/30 text-accent rounded-btn px-2.5 py-1 hover:bg-accent/30 transition-colors">Save</button>
            </div>
          </div>
        )}

        {shop.length === 0 && !showAddReward && (
          <p className="text-text-muted text-[11px] text-center py-2">No rewards yet. Add something worth working for.</p>
        )}

        <div className="space-y-1.5">
          {shop.map(r => (
            <div key={r.id} className="flex items-center gap-2 bg-surface border border-[var(--border)] rounded-btn px-3 py-2 group">
              <Gift size={12} className="text-accent flex-shrink-0" />
              <span className="flex-1 text-[12px] text-text-primary">{r.name}</span>
              <span className="text-[10px] text-text-muted">{r.cost} XP</span>
              <button
                onClick={() => redeemReward(r)}
                disabled={xpBalance < r.cost}
                className="text-[10px] px-2 py-0.5 rounded-chip border transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-accent/30 text-accent hover:bg-accent/10"
              >
                Redeem
              </button>
              <button
                onClick={() => deleteReward(r.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-danger"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Wall of wins */}
      <div>
        <p className="text-[10px] text-text-muted mb-1.5">Wall of wins</p>
        {wins.length === 0 && (
          <p className="text-text-muted text-[11px] text-center py-2">Complete tasks to see your wins here.</p>
        )}
        <div className="space-y-1">
          {wins.slice(0, 20).map(t => (
            <div key={t.id} className="flex items-start gap-2 bg-surface border border-[var(--border)] rounded-btn px-2.5 py-1.5">
              <span className="text-[13px] mt-0.5">🏆</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-primary leading-snug truncate">{t.text}</p>
                {t.completedAt && (
                  <p className="text-[10px] text-text-muted">
                    {new Date(t.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
              {t.effort && <EffortBadge effort={t.effort} />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
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

function EffortBadge({ effort }: { effort: string }) {
  const map: Record<string, string> = { tiny: '⚡', small: '🔹', med: '🔷', big: '🔶' }
  return <span className="text-[11px] flex-shrink-0">{map[effort] ?? ''}</span>
}
