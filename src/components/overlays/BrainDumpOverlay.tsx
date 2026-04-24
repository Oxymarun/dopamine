import { useState } from 'react'
import { storage, BrainDumpItem } from '../../lib/storage'
import { X, Plus } from 'lucide-react'

interface Props { onClose: () => void }

export default function BrainDumpOverlay({ onClose }: Props) {
  const [items, setItems] = useState<BrainDumpItem[]>(() => storage.getBrainDump())
  const [text, setText] = useState('')

  function save(next: BrainDumpItem[]) {
    setItems(next)
    storage.setBrainDump(next)
  }

  function add() {
    if (!text.trim()) return
    const item: BrainDumpItem = { id: crypto.randomUUID(), text: text.trim(), createdAt: Date.now() }
    save([item, ...items])
    setText('')
  }

  function remove(id: string) {
    save(items.filter(i => i.id !== id))
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-bg/95 backdrop-blur-sm rounded-xl">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border)]">
        <div>
          <p className="text-[13px] font-semibold text-text-primary">Brain Dump</p>
          <p className="text-[10px] text-text-muted">Capture anything. Sort it later.</p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary">
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex gap-2">
          <input
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add() }}
            placeholder="What's on your mind?"
            className="flex-1 bg-surface border border-[var(--border)] rounded-btn px-3 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 transition-colors"
          />
          <button
            onClick={add}
            className="bg-accent/20 border border-accent/30 text-accent rounded-btn px-2.5 py-1.5 hover:bg-accent/30 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {items.length === 0 && (
          <p className="text-text-muted text-[12px] text-center py-6">Empty. Good.</p>
        )}
        {items.map(item => (
          <div key={item.id} className="flex items-start gap-2 bg-surface border border-[var(--border)] rounded-btn px-3 py-2 group">
            <span className="flex-1 text-[12px] text-text-primary leading-snug">{item.text}</span>
            <button
              onClick={() => remove(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-danger mt-0.5"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 pt-2 text-center">
        <p className="text-[10px] text-text-muted">{items.length} item{items.length !== 1 ? 's' : ''} · synced to Tasks tab</p>
      </div>
    </div>
  )
}
