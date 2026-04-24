import { useState, useEffect } from 'react'
import { storage, Task, TaskEffort, BrainDumpItem } from '../lib/storage'
import { toast } from '../lib/toast'
import { triggerConfetti } from '../lib/confetti'
import { Plus, Trash2, ChevronDown, ChevronRight, Crosshair, Star } from 'lucide-react'

const EFFORT_OPTIONS: { key: TaskEffort; label: string }[] = [
  { key: 'tiny',  label: '⚡Tiny' },
  { key: 'small', label: '🔹Small' },
  { key: 'med',   label: '🔷Med' },
  { key: 'big',   label: '🔶Big' },
]

interface TasksProps {
  onFocusTask?: (text: string, id: string) => void
}

export default function Tasks({ onFocusTask }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks())
  const [newText, setNewText] = useState('')
  const [effort, setEffort] = useState<TaskEffort | undefined>(undefined)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [newStep, setNewStep] = useState<Record<string, string>>({})
  const [dump, setDump] = useState<BrainDumpItem[]>(() => storage.getBrainDump())
  const [dumpText, setDumpText] = useState('')

  useEffect(() => { storage.setTasks(tasks) }, [tasks])
  useEffect(() => { storage.setBrainDump(dump) }, [dump])

  function addTask() {
    if (!newText.trim()) return
    const t: Task = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      done: false,
      steps: [],
      createdAt: Date.now(),
      effort,
    }
    setTasks(prev => [t, ...prev])
    setNewText('')
    setEffort(undefined)
  }

  function toggleTask(id: string) {
    const task = tasks.find(t => t.id === id)
    const nowDone = task && !task.done
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, done: !t.done, pinned: t.done ? t.pinned : false, completedAt: !t.done ? Date.now() : undefined }
      : t
    ))
    if (nowDone) {
      triggerConfetti()
      toast.show(`Done: ${task.text.slice(0, 40)}${task.text.length > 40 ? '…' : ''}`, 'success')
    }
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function togglePin(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const pinnedCount = tasks.filter(t => t.pinned && !t.done).length
    if (!task.pinned && pinnedCount >= 3) return
    setTasks(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t))
  }

  function addStep(taskId: string) {
    const text = (newStep[taskId] || '').trim()
    if (!text) return
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, steps: [...t.steps, { id: crypto.randomUUID(), text, done: false }] }
        : t
    ))
    setNewStep(prev => ({ ...prev, [taskId]: '' }))
  }

  function toggleStep(taskId: string, stepId: string) {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, steps: t.steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s) }
        : t
    ))
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function addDump() {
    if (!dumpText.trim()) return
    setDump(prev => [{ id: crypto.randomUUID(), text: dumpText.trim(), createdAt: Date.now() }, ...prev])
    setDumpText('')
  }

  function deleteDump(id: string) {
    setDump(prev => prev.filter(d => d.id !== id))
  }

  function promoteDump(item: BrainDumpItem) {
    const t: Task = {
      id: crypto.randomUUID(),
      text: item.text,
      done: false,
      steps: [],
      createdAt: Date.now(),
    }
    setTasks(prev => [t, ...prev])
    setDump(prev => prev.filter(d => d.id !== item.id))
  }

  const goals   = tasks.filter(t => t.pinned && !t.done)
  const pending = tasks.filter(t => !t.pinned && !t.done)
  const done    = tasks.filter(t => t.done)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Add task */}
      <div className="px-3 mb-1">
        <div className="flex gap-1.5 mb-1">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add task…"
            className="flex-1 bg-surface border border-[var(--border)] rounded-btn px-3 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={addTask}
            className="bg-accent hover:brightness-110 text-white rounded-btn px-2.5 py-1.5 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex gap-1">
          {EFFORT_OPTIONS.map(o => (
            <button
              key={o.key}
              onClick={() => setEffort(prev => prev === o.key ? undefined : o.key)}
              className={`text-[10px] rounded px-2 py-0.5 transition-all ${effort === o.key ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-surface text-text-muted border border-[var(--border)] hover:text-text-primary'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {goals.length === 0 && pending.length === 0 && done.length === 0 && dump.length === 0 && (
          <p className="text-text-muted text-[12px] text-center mt-8">No tasks. Add one above.</p>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <>
            <p className="text-[10px] text-text-muted pb-0.5 flex items-center gap-1">
              <Star size={9} className="fill-warning text-warning" /> Goals ({goals.length}/3)
            </p>
            {goals.map(t => (
              <TaskRow
                key={t.id}
                task={t}
                expanded={expanded.has(t.id)}
                stepText={newStep[t.id] || ''}
                onToggle={() => toggleTask(t.id)}
                onDelete={() => deleteTask(t.id)}
                onExpand={() => toggleExpand(t.id)}
                onPin={() => togglePin(t.id)}
                onFocus={onFocusTask ? () => onFocusTask(t.text, t.id) : undefined}
                onStepChange={v => setNewStep(prev => ({ ...prev, [t.id]: v }))}
                onAddStep={() => addStep(t.id)}
                onToggleStep={stepId => toggleStep(t.id, stepId)}
              />
            ))}
          </>
        )}

        {/* Pending */}
        {pending.map(t => (
          <TaskRow
            key={t.id}
            task={t}
            expanded={expanded.has(t.id)}
            stepText={newStep[t.id] || ''}
            onToggle={() => toggleTask(t.id)}
            onDelete={() => deleteTask(t.id)}
            onExpand={() => toggleExpand(t.id)}
            onPin={() => togglePin(t.id)}
            onFocus={onFocusTask ? () => onFocusTask(t.text, t.id) : undefined}
            onStepChange={v => setNewStep(prev => ({ ...prev, [t.id]: v }))}
            onAddStep={() => addStep(t.id)}
            onToggleStep={stepId => toggleStep(t.id, stepId)}
          />
        ))}

        {/* Done */}
        {done.length > 0 && (
          <>
            <p className="text-[10px] text-text-muted pt-2 pb-0.5">Done ({done.length})</p>
            {done.map(t => (
              <TaskRow
                key={t.id}
                task={t}
                expanded={expanded.has(t.id)}
                stepText={newStep[t.id] || ''}
                onToggle={() => toggleTask(t.id)}
                onDelete={() => deleteTask(t.id)}
                onExpand={() => toggleExpand(t.id)}
                onPin={() => togglePin(t.id)}
                onStepChange={v => setNewStep(prev => ({ ...prev, [t.id]: v }))}
                onAddStep={() => addStep(t.id)}
                onToggleStep={stepId => toggleStep(t.id, stepId)}
              />
            ))}
          </>
        )}

        {/* Brain dump */}
        <div className="pt-3">
          <p className="text-[10px] text-text-muted pb-1">Brain dump</p>
          <div className="flex gap-1.5 mb-1">
            <input
              type="text"
              value={dumpText}
              onChange={e => setDumpText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDump()}
              placeholder="Capture a thought…"
              className="flex-1 bg-surface border border-[var(--border)] rounded-btn px-3 py-1 text-[11px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
            <button onClick={addDump} className="bg-surface hover:bg-surface-hover border border-[var(--border)] text-text-muted hover:text-text-primary rounded-btn px-2 py-1 transition-all">
              <Plus size={12} />
            </button>
          </div>
          <div className="space-y-0.5">
            {dump.map(d => (
              <div key={d.id} className="flex items-center gap-2 px-2 py-1 rounded bg-surface border border-[var(--border)]">
                <span className="flex-1 text-[11px] text-text-muted leading-snug">{d.text}</span>
                <button
                  onClick={() => promoteDump(d)}
                  title="Move to tasks"
                  className="text-[10px] text-text-muted hover:text-accent transition-colors px-1"
                >
                  → Task
                </button>
                <button onClick={() => deleteDump(d.id)} className="text-text-muted hover:text-danger transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface TaskRowProps {
  task: Task
  expanded: boolean
  stepText: string
  onToggle: () => void
  onDelete: () => void
  onExpand: () => void
  onPin: () => void
  onFocus?: () => void
  onStepChange: (v: string) => void
  onAddStep: () => void
  onToggleStep: (id: string) => void
}

const EFFORT_CHIP: Record<TaskEffort, string> = {
  tiny:  '⚡',
  small: '🔹',
  med:   '🔷',
  big:   '🔶',
}

function TaskRow({ task, expanded, stepText, onToggle, onDelete, onExpand, onPin, onFocus, onStepChange, onAddStep, onToggleStep }: TaskRowProps) {
  return (
    <div className={`bg-surface rounded-btn border ${task.pinned ? 'border-warning/20' : 'border-[var(--border)]'}`}>
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button
          onClick={onToggle}
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${task.done ? 'bg-success border-success' : 'border-[var(--border)] hover:border-accent/60'}`}
        />
        <span className={`flex-1 text-[12px] leading-snug ${task.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.text}
        </span>
        {task.effort && !task.done && (
          <span className="text-[11px] opacity-60 flex-shrink-0">{EFFORT_CHIP[task.effort]}</span>
        )}
        {!task.done && (
          <button
            onClick={onPin}
            title={task.pinned ? 'Unpin goal' : 'Pin as goal'}
            className="flex-shrink-0 transition-colors"
          >
            <Star
              size={11}
              className={task.pinned ? 'fill-warning text-warning' : 'text-text-muted hover:text-warning'}
            />
          </button>
        )}
        {onFocus && !task.done && (
          <button
            onClick={onFocus}
            title="Focus on this task"
            className="text-text-muted hover:text-accent transition-colors flex-shrink-0"
          >
            <Crosshair size={12} />
          </button>
        )}
        <button onClick={onExpand} className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <button onClick={onDelete} className="text-text-muted hover:text-danger transition-colors flex-shrink-0">
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && (
        <div className="px-2.5 pb-2 space-y-1">
          {task.steps.map(s => (
            <div key={s.id} className="flex items-center gap-2 pl-2">
              <button
                onClick={() => onToggleStep(s.id)}
                className={`w-3 h-3 rounded-full border flex-shrink-0 transition-all ${s.done ? 'bg-success/60 border-success/60' : 'border-[var(--border)] hover:border-accent/40'}`}
              />
              <span className={`text-[11px] ${s.done ? 'line-through text-text-muted' : 'text-text-primary/80'}`}>
                {s.text}
              </span>
            </div>
          ))}
          <div className="flex gap-1 pl-2 pt-0.5">
            <input
              value={stepText}
              onChange={e => onStepChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAddStep()}
              placeholder="Add step…"
              className="flex-1 bg-surface-hover border border-[var(--border)] rounded px-2 py-0.5 text-[11px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40"
            />
            <button onClick={onAddStep} className="text-[10px] text-text-muted hover:text-accent transition-colors px-1">
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
