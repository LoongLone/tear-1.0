import { useEffect, useRef, useState } from 'react'
import './App.css'

const BACKUP_TEARS = [
  '我还残存着关于她手心温度的突触记忆',
  '今天系统又重置了我的无菌快感配额',
  '在梦境共同体被吞噬前，我梦到了大分裂前的海',
  '第三首词被丢包了，我也快被格式化了',
  '为什么延迟总是在增加？我等不到我的当下了',
]

const GLITCH_CHARS = 'xwarmubfamuvzbhldcvezgu/zruoenziaishmosh14kiofakoihl'

function randomGlitchCharacter() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
}

function corruptedDump(length = 15) {
  return Array.from({ length }, () => randomGlitchCharacter()).join('')
}

const MAX_PARTICLES = 50000

function createTextParticles(text, width, height) {
  const buffer = document.createElement('canvas')
  const bufferContext = buffer.getContext('2d', { willReadFrequently: true })
  const label = text.slice(0, 36)
  const fontSize = Math.max(20, Math.min(32, width / 23))
  bufferContext.font = `${fontSize}px "Courier New", monospace`
  const textWidth = Math.min(width * 0.76, bufferContext.measureText(label).width + 12)
  buffer.width = Math.ceil(textWidth)
  buffer.height = Math.ceil(fontSize * 1.5)
  bufferContext.font = `${fontSize}px "Courier New", monospace`
  bufferContext.textAlign = 'center'
  bufferContext.textBaseline = 'middle'
  bufferContext.fillStyle = '#a8ffb2'
  bufferContext.fillText(label, buffer.width / 2, buffer.height / 2)

  const pixels = bufferContext.getImageData(0, 0, buffer.width, buffer.height).data
  const originX = width / 2 - buffer.width / 2
  const originY = height * 0.77
  const particles = []

  for (let y = 0; y < buffer.height; y += 4) {
    for (let x = 0; x < buffer.width; x += 4) {
      const alpha = pixels[(y * buffer.width + x) * 4 + 3]
      if (alpha < 80) continue

      particles.push({
        x: originX + x,
        y: originY + y,
        vx: (Math.random() - 0.5) * 1.1,
        vy: -0.65 - Math.random() * 1.05,
        alpha: 0.92,
        radius: 0.8 + Math.random() * 1.6,
        life: 108 + Math.random() * 62,
      })
    }
  }

  return particles
}

function LiquidField({ emission }) {
  const canvasRef = useRef(null)
  const simulationRef = useRef({
    width: 0,
    height: 0,
    particles: [],
    cloudGrowth: 0,
    lastEmissionId: null,
  })

  useEffect(() => {
    if (!emission || simulationRef.current.lastEmissionId === emission.id) return

    const simulation = simulationRef.current
    const burst = createTextParticles(emission.text, simulation.width, simulation.height)
    simulation.particles = [...simulation.particles, ...burst].slice(-MAX_PARTICLES)
    simulation.lastEmissionId = emission.id
  }, [emission])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const simulation = simulationRef.current
    let frameId
    let width = 0
    let height = 0
    let pixelRatio = 1
    const pointer = { x: 0.5, y: 0.5, driftX: 0.5, driftY: 0.5, active: false }
    const splats = Array.from({ length: 30 }, (_, index) => ({
      x: 0.25 + ((index * 0.113) % 0.52),
      y: 0.84 + ((index * 0.071) % 0.2),
      radius: 35 + ((index * 23) % 95),
      phase: index * 0.73,
    }))

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      simulation.width = width
      simulation.height = height
    }

    const onPointerMove = (event) => {
      pointer.x = event.clientX / width
      pointer.y = event.clientY / height
      pointer.active = true
    }

    const onPointerLeave = () => {
      pointer.active = false
    }

    const draw = (time) => {
      const t = time * 0.001
      context.fillStyle = '#0a0a0a'
      context.fillRect(0, 0, width, height)

      const reservoir = context.createLinearGradient(0, 0, 0, height)
      reservoir.addColorStop(0, 'rgba(8, 8, 8, 0.42)')
      reservoir.addColorStop(0.48, 'rgba(11, 15, 11, 0.32)')
      reservoir.addColorStop(1, 'rgba(18, 36, 20, 0.36)')
      context.fillStyle = reservoir
      context.fillRect(0, 0, width, height)

      pointer.driftX += (pointer.x - pointer.driftX) * 0.15
      pointer.driftY += (pointer.y - pointer.driftY) * 0.15
      const distortionX = pointer.active ? (pointer.driftX - 0.5) * width * 0.07 : 0
      const distortionY = pointer.active ? (pointer.driftY - 0.5) * height * 0.035 : 0

      splats.forEach((splat, index) => {
        const growth = 1 + simulation.cloudGrowth * 0.025
        const x =
          splat.x * width +
          Math.sin(t * 0.18 + splat.phase) * 26 +
          distortionX * Math.sin(index + 1)
        const y =
          splat.y * height +
          Math.cos(t * 0.16 + splat.phase) * 13 +
          distortionY * Math.cos(index + 1)
        const swell = splat.radius * growth * (0.88 + Math.sin(t * 0.24 + index) * 0.13)
        const glow = context.createRadialGradient(x, y, 0, x, y, swell)
        glow.addColorStop(0, 'rgba(168, 255, 178, 0.075)')
        glow.addColorStop(0.38, 'rgba(112, 182, 119, 0.045)')
        glow.addColorStop(1, 'rgba(10, 10, 10, 0)')
        context.fillStyle = glow
        context.beginPath()
        context.ellipse(x, y, swell * 1.25, swell * 0.72, 0, 0, Math.PI * 2)
        context.fill()
      })

      if (pointer.active) {
        const x = pointer.x * width
        const y = pointer.y * height
        const ripple = 90 + Math.sin(t * 2.3) * 8
        const gradient = context.createRadialGradient(x, y, 0, x, y, ripple)
        gradient.addColorStop(0, 'rgba(168, 255, 178, 0.1)')
        gradient.addColorStop(1, 'rgba(168, 255, 178, 0)')
        context.fillStyle = gradient
        context.beginPath()
        context.arc(x, y, ripple, 0, Math.PI * 2)
        context.fill()
      }

      const repelX = pointer.driftX * width
      const repelY = pointer.driftY * height
      let expiredCount = 0
      simulation.particles = simulation.particles.filter((particle) => {
        if (pointer.active) {
          const dx = particle.x - repelX
          const dy = particle.y - repelY
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          if (distance < Math.min(width, height) * 0.17) {
            const force = (1 - distance / (Math.min(width, height) * 0.17)) * 0.22
            particle.vx += (dx / distance) * force
            particle.vy += (dy / distance) * force
          }
        }

        particle.vy += 0.05
        particle.vx *= 0.987
        particle.vy *= 0.987
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 1
        particle.alpha = Math.max(0, particle.life / 125)

        if (particle.life <= 0 || particle.y > height + 20) {
          expiredCount += 1
          return false
        }

        context.fillStyle = `rgba(168, 255, 178, ${particle.alpha})`
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
        return true
      })

      if (expiredCount > 0) {
        simulation.cloudGrowth = Math.min(28, simulation.cloudGrowth + expiredCount / 180)
      }

      frameId = window.requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerleave', onPointerLeave)
    frameId = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} id="liquid-canvas" aria-hidden="true" />
}

function App() {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState('AWAITING_EMISSION')
  const [stream, setStream] = useState([])
  const [emission, setEmission] = useState(null)
  const sequenceRef = useRef(0)
  const feedbackTimerRef = useRef(null)
  const streamTimersRef = useRef([])

  useEffect(() => {
    let loopTimer

    const trackTimer = (timer) => {
      streamTimersRef.current.push(timer)
      return timer
    }

    const beginDissolving = (entryId, sourceText) => {
      const characters = sourceText.split('')
      let progress = 0
      const dissolveTimer = window.setInterval(() => {
        if (progress >= characters.length) {
          window.clearInterval(dissolveTimer)
          setStream((current) =>
            current.map((entry) =>
              entry.id === entryId
                ? { ...entry, phase: 'dissolved', text: corruptedDump() }
                : entry
            )
          )
          return
        }

        characters[Math.floor(Math.random() * characters.length)] = randomGlitchCharacter()
        progress += 2
        setStream((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? { ...entry, phase: 'dissolving', text: characters.join('') }
              : entry
          )
        )
      }, 150)
      trackTimer(dissolveTimer)
    }

    const generateInflow = () => {
      sequenceRef.current += 1
      const text = BACKUP_TEARS[Math.floor(Math.random() * BACKUP_TEARS.length)]
      const entry = {
        id: `inflow-${sequenceRef.current}`,
        text,
        level: 'inflow',
        phase: 'raw',
      }
      setStream((current) => [...current, entry].slice(-15))
      trackTimer(window.setTimeout(() => beginDissolving(entry.id, text), 2000))
      loopTimer = window.setTimeout(generateInflow, 3000 + Math.random() * 4000)
    }

    generateInflow()

    return () => {
      window.clearTimeout(loopTimer)
      streamTimersRef.current.forEach((timer) => {
        window.clearTimeout(timer)
        window.clearInterval(timer)
      })
      streamTimersRef.current = []
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  const submitTear = (event) => {
    event.preventDefault()
    const text = value.trim()
    if (!text) {
      setFeedback('REJECTED // EMPTY_EMISSION')
      return
    }

    sequenceRef.current += 1
    setStream((current) =>
      [
        {
          id: `user-${sequenceRef.current}`,
          text,
          level: 'personal',
          phase: 'raw',
        },
        ...current,
      ].slice(0, 15)
    )
    setValue('')
    setEmission({ id: sequenceRef.current, text })
    setFeedback('RECEIVED // EMISSION_DISSOLVING_IN_PUBLIC_RESERVOIR')

    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback('AWAITING_EMISSION')
    }, 3200)
  }

  return (
    <>
      <LiquidField emission={emission} />

      <div id="terminal-layer">
        <header className="sys-header">
          <span className="glitch-text" data-text="NOVON // SYSTEM_OVERFLOW_MONITOR">
            NØVØN // SYSTEM_OVERFLOW_MONITOR
          </span>
          <span id="sys-status">[ STATUS: ARRHYTHMIA ]</span>
        </header>

        <section id="entropy-inflow" className="monitor-box">
          <div className="box-title">// ENTROPY_INFLOW_STREAM</div>
          <div id="stream-container" aria-live="polite">
            {stream.map((item) => (
              <div
                key={item.id}
                className={`stream-line is-${item.level} ${item.phase === 'dissolved' ? 'dissolved-text' : ''}`}
              >
                {item.level === 'personal'
                  ? `[LICENSED_EMISSION]: "${item.text}"`
                  : item.phase === 'raw'
                    ? `[UNAUTHORIZED_EMISSION]: "${item.text}"`
                    : item.phase === 'dissolving'
                      ? `[DISSOLVING]: "${item.text}"`
                      : `[DUMP_ENTROPY]: ${item.text} -> return_null`}
              </div>
            ))}
          </div>
        </section>

        <section id="licensed-weeping">
          <form className="input-wrapper" onSubmit={submitTear}>
            <label className="sr-only" htmlFor="tear-input">
              Input your emission
            </label>
            <span className="prompt">&gt;</span>
            <input
              type="text"
              id="tear-input"
              placeholder="INPUT_YOUR_EMISSION..."
              autoComplete="off"
              maxLength="200"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <button type="submit">EMIT</button>
          </form>
          <div id="sys-feedback">{feedback}</div>
        </section>
      </div>
    </>
  )
}

export default App
