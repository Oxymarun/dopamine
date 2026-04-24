import { useState, useCallback, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import TitleBar from './components/TitleBar'
import Focus from './components/Focus'
import Tasks from './components/Tasks'
import Stats from './components/Stats'
import Settings from './components/Settings'
import BrainDumpOverlay from './components/overlays/BrainDumpOverlay'
import { storage } from './lib/storage'
import { requestPermission } from './lib/notify'
import ToastContainer from './components/Toast'
import { Brain, X } from 'lucide-react'

const TABS = [
  { id: 'focus',    label: 'Focus' },
  { id: 'tasks',    label: 'Tasks' },
  { id: 'stats',    label: 'Stats' },
  { id: 'settings', label: 'Settings' },
]

const SHORTCUTS = [
  { key: '?',      desc: 'Toggle this help' },
  { key: 'B',      desc: 'Brain dump overlay' },
  { key: 'Escape', desc: 'Close overlays' },
]

export default function App() {
  const [tab, setTab] = useState('focus')
  const [rewards, setRewards] = useState(() => storage.getRewards())
  const [focusTask, setFocusTask] = useState<string | undefined>(undefined)
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>(undefined)
  const [statsKey, setStatsKey] = useState(0)
  const [tasksKey, setTasksKey] = useState(0)
  const [showBrainDump, setShowBrainDump] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    requestPermission()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === '?') {
        setShowHelp(h => !h)
        setShowBrainDump(false)
      } else if (e.key === 'b' || e.key === 'B') {
        setShowBrainDump(d => !d)
        setShowHelp(false)
      } else if (e.key === 'Escape') {
        setShowHelp(false)
        setShowBrainDump(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSessionComplete = useCallback(() => {
    setRewards(storage.getRewards())
  }, [])

  const handleFocusTask = useCallback((text: string, id: string) => {
    setFocusTask(text)
    setFocusTaskId(id)
    setTab('focus')
  }, [])

  const handleFocusDone = useCallback(() => {
    if (focusTaskId) {
      const tasks = storage.getTasks()
      storage.setTasks(tasks.map(t =>
        t.id === focusTaskId
          ? { ...t, done: true, pinned: false, completedAt: Date.now() }
          : t
      ))
      setTasksKey(k => k + 1)
    }
    setFocusTask('')
    setFocusTaskId(undefined)
  }, [focusTaskId])

  function handleTabChange(next: string) {
    if (next === 'stats') setStatsKey(k => k + 1)
    setTab(next)
  }

  return (
    <div className="w-full h-full flex flex-col bg-bg overflow-hidden rounded-xl relative">
      <TitleBar streak={rewards.streak} level={rewards.level} />

      <div
        className="mx-3 mb-2"
        style={{ height: '1px', background: 'var(--border)' }}
      />

      <Tabs.Root
        value={tab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <Tabs.List className="flex gap-1 mx-3 mb-2 bg-surface rounded-btn p-0.5">
          {TABS.map(t => (
            <Tabs.Trigger
              key={t.id}
              value={t.id}
              className="
                flex-1 text-[11px] font-medium py-1 rounded-[5px] transition-all
                text-text-muted
                data-[state=active]:bg-surface-hover
                data-[state=active]:text-text-primary
                data-[state=active]:shadow-card
              "
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="focus" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
          <Focus
            focusTask={focusTask}
            onSessionComplete={handleSessionComplete}
            onFocusDone={handleFocusDone}
          />
        </Tabs.Content>
        <Tabs.Content value="tasks" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
          <Tasks key={tasksKey} onFocusTask={handleFocusTask} />
        </Tabs.Content>
        <Tabs.Content value="stats" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
          <Stats key={statsKey} />
        </Tabs.Content>
        <Tabs.Content value="settings" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
          <Settings />
        </Tabs.Content>
      </Tabs.Root>

      {/* Brain dump FAB */}
      {!showBrainDump && !showHelp && (
        <button
          onClick={() => setShowBrainDump(true)}
          title="Brain dump (B)"
          className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-surface border border-[var(--border)] flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-all shadow-card z-30"
        >
          <Brain size={14} />
        </button>
      )}

      {/* Brain dump overlay */}
      {showBrainDump && <BrainDumpOverlay onClose={() => setShowBrainDump(false)} />}

      {/* Keyboard shortcuts help */}
      {showHelp && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/90 backdrop-blur-sm rounded-xl">
          <div className="bg-surface border border-[var(--border)] rounded-btn px-5 py-4 w-52 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-text-primary">Shortcuts</p>
              <button onClick={() => setShowHelp(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={13} />
              </button>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map(s => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-text-primary">{s.desc}</span>
                  <kbd className="text-[10px] bg-surface-hover border border-[var(--border)] rounded px-1.5 py-0.5 text-text-muted font-mono">{s.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
