export interface Particle2D {
  startX: number
  startY: number
  orbitRadius: number
  orbitSpeed: number
  angle: number
  color: string
  baseSize: number
  alpha: number
  swirlSpeed: number
  x?: number
  y?: number
  currentDrawX?: number
  currentDrawY?: number
  distFromCenter?: number
  startRadius?: number // Cache the random start radius for smooth interpolation
}

/**
 * LoadingParticleEngine
 * Manages the custom 2D Canvas particles constellation simulation.
 * Decouples rendering math and simulation steps from Vue SFC component.
 * Highly optimized for 60 FPS rendering and smooth initial entry transitions.
 */
export class LoadingParticleEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null
  private particles: Particle2D[] = []
  private animationFrameId: number | null = null
  private progressPctProvider: () => number
  private exitingProvider: () => boolean
  private onFpsUpdate: (fps: number) => void

  private canvasWidth = 0
  private canvasHeight = 0
  private lastTime = 0
  private fpsTicks = 0
  private fpsLastTime = 0

  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }

  constructor(
    canvas: HTMLCanvasElement,
    options: {
      progressPctProvider: () => number
      exitingProvider: () => boolean
      onFpsUpdate: (fps: number) => void
    }
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.progressPctProvider = options.progressPctProvider
    this.exitingProvider = options.exitingProvider
    this.onFpsUpdate = options.onFpsUpdate
  }

  public init() {
    this.setupDimensions()
    this.initParticles()
    this.lastTime = performance.now()
    this.fpsTicks = 0
    this.fpsLastTime = this.lastTime
    this.tick()
  }

  public resize() {
    this.setupDimensions()
  }

  public handleMouseMove(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect()
    if (rect) {
      this.mouse.targetX = ((clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.targetY = -(((clientY - rect.top) / rect.height) * 2 - 1)
    }
  }

  public replay() {
    this.initParticles()
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  private setupDimensions() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvasWidth = rect.width
    this.canvasHeight = rect.height
    this.canvas.width = this.canvasWidth * dpr
    this.canvas.height = this.canvasHeight * dpr
  }

  private initParticles() {
    this.particles = []
    const count = 600 // Restored to 600 as visual density is important and engine is fully optimized
    const colors = ['#fd971f', '#06b6d4', '#ec4899', '#4ade80', '#a78bfa', '#facc15']
    const w = this.canvasWidth || window.innerWidth
    const h = this.canvasHeight || window.innerHeight

    // Calculate avatar center coordinate for precise coordinate alignment on initialization
    let cx = w / 2
    let cy = h / 2
    const avatarEl = document.querySelector('.avatar-node')
    if (avatarEl) {
      const rect = avatarEl.getBoundingClientRect()
      const canvasRect = this.canvas.getBoundingClientRect()
      cx = rect.left + rect.width / 2 - canvasRect.left
      cy = rect.top + rect.height / 2 - canvasRect.top
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const orbitRadius = 60 + Math.random() * 185
      const swirlSpeed = 1.5 + Math.random() * 2.5
      
      // Calculate exact starting position at t = 0 to prevent initial jumps
      const swirlAngle = angle + swirlSpeed * Math.PI
      const startRadius = Math.max(w, h) * (0.55 + Math.random() * 0.3)
      const startX = cx + Math.cos(swirlAngle) * startRadius
      const startY = cy + Math.sin(swirlAngle) * startRadius

      this.particles.push({
        startX,
        startY,
        orbitRadius,
        orbitSpeed: 0.0015 + Math.random() * 0.004, // Elegant rotation velocity
        angle,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseSize: 1.1 + Math.random() * 2.2,
        alpha: 0.35 + Math.random() * 0.65,
        swirlSpeed,
        startRadius,
        x: startX,
        y: startY,
      })
    }
  }

  private tick = () => {
    const now = performance.now()
    this.fpsTicks++
    if (now - this.fpsLastTime >= 1000) {
      const computedFps = Math.round((this.fpsTicks * 1000) / (now - this.fpsLastTime))
      this.onFpsUpdate(computedFps)
      this.fpsTicks = 0
      this.fpsLastTime = now
    }

    const ctx = this.ctx
    const progress = this.progressPctProvider() / 100
    const exiting = this.exitingProvider()

    if (ctx) {
      // Semi-transparent overlay to draw smooth motion trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.18)'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      const dpr = window.devicePixelRatio || 1
      ctx.save()
      ctx.scale(dpr, dpr)

      // Smooth mouse coordinate tracking
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08
      const mX = (this.mouse.x + 1) * (this.canvasWidth / 2)
      const mY = (-this.mouse.y + 1) * (this.canvasHeight / 2)

      // Key dynamic alignment: central node coordinates
      let cx = this.canvasWidth / 2
      let cy = this.canvasHeight / 2
      const avatarEl = document.querySelector('.avatar-node')
      if (avatarEl) {
        const rect = avatarEl.getBoundingClientRect()
        const canvasRect = this.canvas.getBoundingClientRect()
        cx = rect.left + rect.width / 2 - canvasRect.left
        cy = rect.top + rect.height / 2 - canvasRect.top
      }

      // 1. Update and draw simulated particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]
        p.angle += p.orbitSpeed

        const t = Math.min(Math.max(progress, 0), 1)

        // Spin and spiral in towards center when progress exceeds 80%
        let targetRadius = p.orbitRadius
        let swirlMultiplier = p.swirlSpeed
        if (progress > 0.8) {
          const collapseProgress = (progress - 0.8) / 0.2
          targetRadius = p.orbitRadius * (1 - collapseProgress)
          swirlMultiplier = p.swirlSpeed + collapseProgress * 5
        }

        const swirlAngle = p.angle + (1 - t) * swirlMultiplier * Math.PI
        
        // Corrected radius calculation: smooth transition from startRadius at t=0
        const startRad = p.startRadius ?? Math.max(this.canvasWidth, this.canvasHeight) * 0.55
        const rad = targetRadius * t + startRad * (1 - t)

        const tx = cx + Math.cos(swirlAngle) * rad
        const ty = cy + Math.sin(swirlAngle) * rad

        if (progress === 0 && !exiting) {
          p.x = tx
          p.y = ty
        } else {
          const px = p.x ?? p.startX
          const py = p.y ?? p.startY
          p.x = px + (tx - px) * 0.09
          p.y = py + (ty - py) * 0.09
        }

        // Mouse cursor force field repulsion
        const rx = p.x ?? p.startX
        const ry = p.y ?? p.startY
        const mdx = rx - mX
        const mdy = ry - mY
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
        let repelledX = 0
        let repelledY = 0
        if (mDist < 110) {
          const force = (110 - mDist) * 0.14
          repelledX = (mdx / (mDist || 1)) * force
          repelledY = (mdy / (mDist || 1)) * force
        }

        const drawX = rx + repelledX
        const drawY = ry + repelledY

        p.currentDrawX = drawX
        p.currentDrawY = drawY

        // Transparency calculation based on center distance
        const dxFromCenter = drawX - cx
        const dyFromCenter = drawY - cy
        const distFromCenter = Math.sqrt(dxFromCenter * dxFromCenter + dyFromCenter * dyFromCenter)
        
        // Cache distance to bypass Math.sqrt inside connection double loop
        p.distFromCenter = distFromCenter

        let alphaFade = 1.0
        if (distFromCenter < 60) {
          alphaFade = Math.max(0, (distFromCenter - 6) / 54)
        }
        if (progress > 0.97) {
          alphaFade *= Math.max(0, (1 - progress) / 0.03)
        }

        // Accelerated fade-in: fully visible by 2% progress (visible at 50% opacity at 1%)
        const fadeMultiplier = Math.min(progress * 50, 1)

        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * fadeMultiplier * alphaFade
        ctx.shadowBlur = 4
        ctx.shadowColor = p.color

        ctx.beginPath()
        ctx.arc(drawX, drawY, p.baseSize, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowBlur = 0
        ctx.globalAlpha = 1.0
      }

      // 2. Constellation linkage lines
      ctx.lineWidth = 0.8
      const maxDist = 55
      const maxDistSq = maxDist * maxDist

      // Connection loop: optimized checks step by 2
      for (let i = 0; i < this.particles.length; i += 2) {
        const p1 = this.particles[i]
        if (p1.currentDrawX === undefined || p1.currentDrawY === undefined) continue

        for (let j = i + 1; j < this.particles.length; j += 2) {
          const p2 = this.particles[j]
          if (p2.currentDrawX === undefined || p2.currentDrawY === undefined) continue

          const dx = p1.currentDrawX - p2.currentDrawX
          const dy = p1.currentDrawY - p2.currentDrawY
          const distSq = dx * dx + dy * dy

          if (distSq < maxDistSq) {
            // Read pre-cached center distances to calculate average center distance (zero Math.sqrt cost!)
            const avgDistFromCenter = ((p1.distFromCenter || 0) + (p2.distFromCenter || 0)) / 2

            let alphaFade = 1.0
            if (avgDistFromCenter < 60) {
              alphaFade = Math.max(0, (avgDistFromCenter - 6) / 54)
            }
            if (progress > 0.97) {
              alphaFade *= Math.max(0, (1 - progress) / 0.03)
            }

            // Only run Math.sqrt of distance if the line is actually visible
            if (alphaFade > 0.01) {
              const dist = Math.sqrt(distSq)
              const alpha = (1 - dist / maxDist) * 0.15 * Math.min(progress * 2.5, 1) * alphaFade
              if (alpha > 0.01) {
                ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`
                ctx.beginPath()
                ctx.moveTo(p1.currentDrawX, p1.currentDrawY)
                ctx.lineTo(p2.currentDrawX, p2.currentDrawY)
                ctx.stroke()
              }
            }
          }
        }
      }

      ctx.restore()
    }

    this.animationFrameId = requestAnimationFrame(this.tick)
  }
}
