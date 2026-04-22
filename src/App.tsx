import { useState, useCallback, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import TitleBar from './components/TitleBar'
import Focus from './components/Focus'
import Tasks from './components/Tasks'
import Stats from './components/Stats'
import Settings from './components/Settings'
import { storage } from './lib/storage'
import { requestPermission } from './lib/notify'
import ToastContainer from './components/Toast'

const TABS = [
  { id: 'focus',    label: 'Focus' },
  { id: 'tasks',    label: 'Tasks' },
  { id: 'stats',    label: 'Stats' },
  { id: 'settings', label: 'Settings' },
]

export default function App() {
  const [tab, setTab] = useState('focus')
  const [rewards, setRewards] = useState(() => storage.getRewards())
  const [focusTask, setFocusTask] = useState<string | undefined>(undefined)
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>(undefined)
  const [statsKey, setStatsKey] = useState(0)
  const [tasksKey, setTasksKey] = useState(0)

  useEffect(() => {
    requestPermission()
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
      storage.setTasks(tasks.map(t => t.id === focusTaskId ? { ...t, done: true, pinned: false } : t))
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
      <ToastContainer />
    </div>
  )
}
