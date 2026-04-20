/// <reference types="vite/client" />

interface Window {
  widget?: {
    close: () => void
    minimize: () => void
    pin: (v: boolean) => void
    setAlwaysOnTop: (v: boolean) => void
  }
}
