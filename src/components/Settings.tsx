import { useState, useRef } from 'react'
import { storage, AppSettings } from '../lib/storage'
import { toast } from '../lib/toast'

const ACCENT_COLORS = [
  { label: 'Violet', value: '#7B61FF' },
  { label: 'Blue',   value: '#3B82F6' },
  { label: 'Teal',   value: '#14B8A6' },
  { label: 'Rose',   value: '#F43F5E' },
  { label: 'Amber',  value: '#F59E0B' },
]

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings())
  const importRef = useRef<HTMLInputElement>(null)

  function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    storage.setSettings(next)
    if (patch.alwaysOnTop !== undefined) {
      window.widget?.setAlwaysOnTop(patch.alwaysOnTop)
    }
    if (patch.accentColor) {
      document.documentElement.style.setProperty('--accent', patch.accentColor)
    }
  }

  return (
    <div className="flex-1 flex flex-col px-3 py-2 gap-3 overflow-y-auto">

      {/* Timer durations */}
      <Section label="Timer">
        <Row label="Work (min)">
          <NumberInput value={settings.workMin} min={1} max={120} onChange={v => update({ workMin: v })} />
        </Row>
        <Row label="Break (min)">
          <NumberInput value={settings.breakMin} min={1} max={60} onChange={v => update({ breakMin: v })} />
        </Row>
      </Section>

      {/* Accent color */}
      <Section label="Accent color">
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => update({ accentColor: c.value })}
              title={c.label}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                background: c.value,
                borderColor: settings.accentColor === c.value ? '#fff' : 'transparent',
              }}
            />
          ))}
        </div>
      </Section>

      {/* Toggles */}
      <Section label="Behavior">
        <Row label="Sound">
          <Toggle on={settings.soundEnabled} onChange={v => update({ soundEnabled: v })} />
        </Row>
        <Row label="Always on top">
          <Toggle on={settings.alwaysOnTop} onChange={v => update({ alwaysOnTop: v })} />
        </Row>
      </Section>

      {/* Data */}
      <Section label="Data">
        <div className="px-3 py-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const json = storage.exportAll()
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `focusflow-backup-${new Date().toISOString().slice(0,10)}.json`
                a.click()
                setTimeout(() => URL.revokeObjectURL(url), 1000)
                toast.show('Data exported', 'success')
              }}
              className="flex-1 text-[11px] text-text-primary border border-[var(--border)] rounded-btn px-3 py-1.5 hover:bg-surface-hover transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex-1 text-[11px] text-text-primary border border-[var(--border)] rounded-btn px-3 py-1.5 hover:bg-surface-hover transition-colors"
            >
              Import JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => {
                  try {
                    storage.importAll(ev.target!.result as string)
                    toast.show('Data imported — reloading', 'success')
                    setTimeout(() => window.location.reload(), 800)
                  } catch {
                    toast.show('Invalid backup file', 'warning')
                  }
                }
                reader.readAsText(file)
                e.target.value = ''
              }}
            />
          </div>
          <button
            onClick={() => {
              if (confirm('Clear all sessions and rewards? Tasks kept.')) {
                localStorage.removeItem('ff_sessions')
                localStorage.removeItem('ff_rewards')
                window.location.reload()
              }
            }}
            className="text-[11px] text-danger border border-danger/30 rounded-btn px-3 py-1.5 hover:bg-danger/10 transition-colors"
          >
            Clear session history
          </button>
        </div>
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-btn border border-[var(--border)] overflow-hidden">
      <p className="text-[10px] text-text-muted px-3 pt-2 pb-1 uppercase tracking-wide">{label}</p>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-[12px] text-text-primary">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-9 h-5 rounded-full transition-all relative ${on ? 'bg-accent' : 'bg-surface-hover border border-[var(--border)]'}`}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: on ? '18px' : '2px' }}
      />
    </button>
  )
}

function NumberInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 5))}
        className="w-6 h-6 rounded bg-surface-hover text-text-muted hover:text-text-primary text-[14px] flex items-center justify-center transition-colors"
      >
        −
      </button>
      <span className="text-[12px] text-text-primary w-6 text-center tabular-nums">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 5))}
        className="w-6 h-6 rounded bg-surface-hover text-text-muted hover:text-text-primary text-[14px] flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  )
}
