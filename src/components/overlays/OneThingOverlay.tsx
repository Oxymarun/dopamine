interface Props {
  task: string
  onClose: () => void
  onDone?: () => void
}

export default function OneThingOverlay({ task, onClose, onDone }: Props) {
  function handleDone() {
    onDone?.()
    onClose()
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/97 rounded-xl px-6">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-text-muted hover:text-text-primary text-lg leading-none"
      >
        ×
      </button>

      <p className="text-[10px] text-text-muted uppercase tracking-widest mb-4">Right now, only this</p>

      <div className="w-full bg-surface border border-accent/30 rounded-xl px-4 py-4 mb-6 text-center">
        <span className="text-[18px] font-bold text-text-primary leading-snug">
          {task || 'No task set'}
        </span>
      </div>

      <div
        className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 mb-6"
        style={{ animation: 'pulse 3s ease-in-out infinite' }}
      />

      <div className="flex gap-2 w-full">
        <button
          onClick={handleDone}
          className="flex-1 py-1.5 rounded-btn text-[12px] font-medium bg-success/15 text-success border border-success/20 hover:bg-success/25 transition-all"
        >
          ✓ Done
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-1.5 rounded-btn text-[12px] font-medium bg-surface text-text-muted border border-[var(--border)] hover:text-text-primary transition-all"
        >
          Keep going
        </button>
      </div>
    </div>
  )
}
