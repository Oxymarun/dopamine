import { useState, useEffect } from 'react'
import { toast, ToastMsg } from '../lib/toast'

const TYPE_STYLES: Record<ToastMsg['type'], string> = {
  success: 'border-[var(--success)] text-[var(--success)]',
  info:    'border-accent text-accent',
  warning: 'border-[var(--warning)] text-[var(--warning)]',
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  useEffect(() => toast.subscribe(setToasts), [])

  if (toasts.length === 0) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-1.5 items-center z-50 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`bg-surface border rounded-btn px-3 py-1.5 text-[11px] font-medium shadow-card whitespace-nowrap ${TYPE_STYLES[t.type]}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}
