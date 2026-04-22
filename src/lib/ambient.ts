type NoiseType = 'white' | 'brown' | 'rain' | 'cafe'

class AmbientEngine {
  private ctx: AudioContext | null = null
  private sourceNode: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private lfoNode: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private currentType: NoiseType | null = null
  private _volume = 0.4

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private buildNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const sr = ctx.sampleRate
    const buf = ctx.createBuffer(1, sr * 2, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buf
  }

  private buildBrownBuffer(ctx: AudioContext): AudioBuffer {
    const sr = ctx.sampleRate
    const buf = ctx.createBuffer(1, sr * 2, sr)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      data[i] = last * 3.5
    }
    return buf
  }

  private stop() {
    try { this.lfoNode?.stop() } catch (_) {}
    try { this.sourceNode?.stop() } catch (_) {}
    this.lfoNode?.disconnect()
    this.lfoGain?.disconnect()
    this.sourceNode?.disconnect()
    this.filterNode?.disconnect()
    this.gainNode?.disconnect()
    this.lfoNode = null
    this.lfoGain = null
    this.sourceNode = null
    this.filterNode = null
    this.gainNode = null
  }

  play(type: NoiseType) {
    this.stop()
    this.currentType = type
    const ctx = this.getCtx()

    const gain = ctx.createGain()
    gain.gain.value = this._volume
    gain.connect(ctx.destination)
    this.gainNode = gain

    const src = ctx.createBufferSource()
    src.loop = true
    this.sourceNode = src

    if (type === 'white') {
      src.buffer = this.buildNoiseBuffer(ctx)
      src.connect(gain)
    } else if (type === 'brown') {
      src.buffer = this.buildBrownBuffer(ctx)
      src.connect(gain)
    } else if (type === 'rain') {
      src.buffer = this.buildNoiseBuffer(ctx)
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 700
      filter.Q.value = 0.6
      this.filterNode = filter

      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.5
      this.lfoGain = lfoGain

      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.8
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      lfo.start()
      this.lfoNode = lfo

      src.connect(filter)
      filter.connect(gain)
    } else if (type === 'cafe') {
      // layered brown + thin bandpass hiss at low volume
      src.buffer = this.buildBrownBuffer(ctx)
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 800
      this.filterNode = filter

      gain.gain.value = this._volume * 0.7
      src.connect(filter)
      filter.connect(gain)
    }

    src.start()
  }

  pause() {
    if (this.gainNode) this.gainNode.gain.value = 0
    try { this.sourceNode?.stop() } catch (_) {}
    this.currentType = null
  }

  setVolume(v: number) {
    this._volume = v
    if (this.gainNode) {
      this.gainNode.gain.value = this.currentType === 'cafe' ? v * 0.7 : v
    }
  }

  get volume() { return this._volume }
  get active() { return this.currentType !== null }
  get type() { return this.currentType }
}

export const ambientEngine = new AmbientEngine()
export type { NoiseType }
