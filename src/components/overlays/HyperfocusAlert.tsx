interface Props {
  minutesElapsed: number
  onDismiss: () => void
  onTakeBreak: () => void
}

export default function HyperfocusAlert({ minutesElapsed, onDismiss, onTakeBreak }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 rounded-xl px-5">
      <div className="text-3xl mb-3">⚡</div>

      <h2 className="text-[14px] font-bold text-text-primary mb-1 text-center">
        Hyperfocus detected
      </h2>
      <p className="text-[11px] text-text-muted text-center mb-2">
        You've been focused for <span className="text-text-primary font-medium">{minutesElapsed} minutes</span> straight.
      </p>
      <p className="text-[10px] text-text-muted text-center mb-6 max-w-[180px]">
        Your brain needs a break to consolidate. 5 minutes now = better output later.
      </p>

      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={onTakeBreak}
          className="w-full py-1.5 rounded-btn text-[12px] font-semibold bg-accent text-white hover:brightness-110 transition-all"
        >
          Take a 5-min break
        </button>
        <button
          onClick={onDismiss}
          className="w-full py-1.5 rounded-btn text-[11px] text-text-muted bg-surface border border-[var(--border)] hover:text-text-primary transition-all"
        >
          I'm fine, keep going
        </button>
      </div>
    </div>
  )
}
