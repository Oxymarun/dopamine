const COLORS = ['#7B61FF', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#FB923C']

interface Particle {
  x: number; y: number
  vx: number; vy: number
  color: string
  size: number
  rotation: number
  rotSpeed: number
  alpha: number
}

export function triggerConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const particles: Particle[] = []

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.6 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 8 + 4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 5 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      alpha: 1,
    })
  }

  const start = performance.now()
  const duration = 1600

  function frame(now: number) {
    const elapsed = now - start
    const progress = elapsed / duration
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.25
      p.rotation += p.rotSpeed
      p.alpha = Math.max(0, 1 - progress * 1.2)

      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5)
      ctx.restore()
    }

    if (elapsed < duration) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }

  requestAnimationFrame(frame)
}
