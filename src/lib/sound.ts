let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function beep(freq: number, duration: number, gain: number) {
  const c = getCtx()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, c.currentTime)
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

export function playWorkComplete() {
  beep(880, 0.15, 0.4)
  setTimeout(() => beep(1100, 0.2, 0.35), 160)
  setTimeout(() => beep(1320, 0.3, 0.3), 320)
}

export function playBreakComplete() {
  beep(660, 0.2, 0.3)
  setTimeout(() => beep(880, 0.25, 0.25), 180)
}

export function playTick() {
  beep(1000, 0.04, 0.08)
}
