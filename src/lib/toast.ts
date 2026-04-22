export type ToastType = 'success' | 'info' | 'warning'

export interface ToastMsg {
  id: string
  text: string
  type: ToastType
}

type Listener = (toasts: ToastMsg[]) => void

let _toasts: ToastMsg[] = []
const _listeners = new Set<Listener>()

function _emit() {
  _listeners.forEach(l => l([..._toasts]))
}

export const toast = {
  show(text: string, type: ToastType = 'info', duration = 2500) {
    const id = crypto.randomUUID()
    _toasts = [{ id, text, type }, ..._toasts]
    _emit()
    setTimeout(() => {
      _toasts = _toasts.filter(t => t.id !== id)
      _emit()
    }, duration)
  },
  subscribe(l: Listener) {
    _listeners.add(l)
    return () => _listeners.delete(l)
  },
}
