import { useState } from 'react'

const STEPS = [
  {
    q: "What's blocking you right now?",
    hint: "Be specific. Name the thing.",
    placeholder: "e.g. Don't know where to start, feels too big...",
  },
  {
    q: "What's the smallest possible action?",
    hint: "Something you can do in 2 minutes.",
    placeholder: "e.g. Open the file, write one sentence...",
  },
  {
    q: "Ready to try that tiny action?",
    hint: "Set a 5-minute timer. Just start.",
    placeholder: null,
  },
]

interface Props { onClose: () => void; onStartTimer?: () => void }

export default function StuckOverlay({ onClose, onStartTimer }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(['', '', ''])

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  function handleAction() {
    onStartTimer?.()
    onClose()
  }

  const current = STEPS[step]
  const canAdvance = step < 2 ? answers[step].trim().length > 0 : true

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 rounded-xl px-5">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-text-muted hover:text-text-primary text-lg leading-none"
      >
        ×
      </button>

      {/* Step indicator */}
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-5 h-1 rounded-full transition-all ${i <= step ? 'bg-accent' : 'bg-surface-hover'}`}
          />
        ))}
      </div>

      <h2 className="text-[13px] font-semibold text-text-primary text-center mb-1 leading-snug">
        {current.q}
      </h2>
      <p className="text-[10px] text-text-muted text-center mb-4">{current.hint}</p>

      {step < 2 && current.placeholder && (
        <textarea
          value={answers[step]}
          onChange={e => {
            const next = [...answers]
            next[step] = e.target.value
            setAnswers(next)
          }}
          placeholder={current.placeholder}
          rows={3}
          className="w-full bg-surface border border-[var(--border)] rounded-btn px-3 py-2 text-[11px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none mb-4 transition-colors"
        />
      )}

      {step < 2 ? (
        <button
          onClick={next}
          disabled={!canAdvance}
          className="px-6 py-1.5 rounded-btn text-[12px] font-semibold bg-accent text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      ) : (
        <div className="flex flex-col gap-2 w-full items-center">
          <div className="w-full bg-surface border border-[var(--border)] rounded-btn px-3 py-2 text-[11px] text-text-muted text-center mb-1">
            "{answers[1] || 'your tiny action'}"
          </div>
          <button
            onClick={handleAction}
            className="px-6 py-1.5 rounded-btn text-[12px] font-semibold bg-accent text-white hover:brightness-110 transition-all"
          >
            Start 5-min timer
          </button>
          <button
            onClick={onClose}
            className="text-[10px] text-text-muted hover:text-text-primary transition-colors"
          >
            I'll figure it out
          </button>
        </div>
      )}
    </div>
  )
}
