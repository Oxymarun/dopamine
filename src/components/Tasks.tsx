import { useState, useEffect } from 'react'
import { storage, Task } from '../lib/storage'
import { Plus, Trash2, ChevronDown, ChevronRight, Crosshair } from 'lucide-react'

interface TasksProps {
  onFocusTask?: (text: string) => void
}

export default function Tasks({ onFocusTask }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks())
  const [newText, setNewText] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [newStep, setNewStep] = useState<Record<string, string>>({})

  useEffect(() => {
    storage.setTasks(tasks)
  }, [tasks])

  function addTask() {
    if (!newText.trim()) return
    const t: Task = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      done: false,
      steps: [],
      createdAt: Date.now(),
    }
    setTasks(prev => [t, ...prev])
    setNewText('')
  }

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
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

  const pending = tasks.filter(t => !t.done)
  const done = tasks.filter(t => t.done)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-1.5 px-3 mb-2">
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

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {pending.length === 0 && done.length === 0 && (
          <p className="text-text-muted text-[12px] text-center mt-8">No tasks. Add one above.</p>
        )}

        {pending.map(t => (
          <TaskRow
            key={t.id}
            task={t}
            expanded={expanded.has(t.id)}
            stepText={newStep[t.id] || ''}
            onToggle={() => toggleTask(t.id)}
            onDelete={() => deleteTask(t.id)}
            onExpand={() => toggleExpand(t.id)}
            onFocus={onFocusTask ? () => onFocusTask(t.text) : undefined}
            onStepChange={v => setNewStep(prev => ({ ...prev, [t.id]: v }))}
            onAddStep={() => addStep(t.id)}
            onToggleStep={stepId => toggleStep(t.id, stepId)}
          />
        ))}

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
                onStepChange={v => setNewStep(prev => ({ ...prev, [t.id]: v }))}
                onAddStep={() => addStep(t.id)}
                onToggleStep={stepId => toggleStep(t.id, stepId)}
              />
            ))}
          </>
        )}
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
  onFocus?: () => void
  onStepChange: (v: string) => void
  onAddStep: () => void
  onToggleStep: (id: string) => void
}

function TaskRow({ task, expanded, stepText, onToggle, onDelete, onExpand, onFocus, onStepChange, onAddStep, onToggleStep }: TaskRowProps) {
  return (
    <div className="bg-surface rounded-btn border border-[var(--border)]">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button
          onClick={onToggle}
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${task.done ? 'bg-success border-success' : 'border-[var(--border)] hover:border-accent/60'}`}
        />
        <span className={`flex-1 text-[12px] leading-snug ${task.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.text}
        </span>
        {onFocus && !task.done && (
          <button
            onClick={onFocus}
            title="Focus on this task"
            className="text-text-muted hover:text-accent transition-colors"
          >
            <Crosshair size={12} />
          </button>
        )}
        <button onClick={onExpand} className="text-text-muted hover:text-text-primary transition-colors">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <button onClick={onDelete} className="text-text-muted hover:text-danger transition-colors">
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
