export async function generateResonanceVideo(primaryTear, secondaryTear) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx || typeof MediaRecorder === 'undefined') return

  const width = 720
  const height = 1280
  canvas.width = width
  canvas.height = height

  const stream = canvas.captureStream(30)
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm',
  })

  const chunks = []
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }

  recorder.start()

  const start = performance.now()
  const duration = 6000

  const left = { x: width * 0.36, y: height * 0.5 }
  const right = { x: width * 0.64, y: height * 0.54 }

  function drawFrame(time) {
    const t = (time - start) / duration

    drawBackground(ctx, width, height, t)
    drawTear(ctx, left.x, left.y, 78, t, '#b7c8ff', 0)
    drawTear(ctx, right.x, right.y, 68, t, '#d9deff', 0.22)
    drawResonance(ctx, left, right, t)

    const textAlpha = clamp((t - 0.38) * 2.2, 0, 1) * (1 - clamp((t - 0.84) * 5, 0, 1))
    const phrase = generateResonancePhrase(primaryTear, secondaryTear)

    ctx.textAlign = 'center'
    ctx.fillStyle = `rgba(255,255,255,${0.88 * textAlpha})`
    ctx.font = '24px sans-serif'
    wrapText(ctx, phrase, width / 2, height * 0.77, 520, 36)

    ctx.font = '12px monospace'
    ctx.fillStyle = `rgba(255,255,255,${0.26 * textAlpha})`
    ctx.fillText(
      `${primaryTear?.tearId || 'UNKNOWN'} / ${secondaryTear?.tearId || 'UNKNOWN'}`,
      width / 2,
      height * 0.9
    )

    if (t < 1) {
      window.requestAnimationFrame(drawFrame)
    } else {
      recorder.stop()
    }
  }

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `resonance-${primaryTear?.tearId || 'tear'}-${secondaryTear?.tearId || 'tear'}.webm`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  window.requestAnimationFrame(drawFrame)
}

function drawBackground(ctx, width, height, t) {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    20,
    width / 2,
    height * 0.55,
    height
  )
  gradient.addColorStop(0, '#05070d')
  gradient.addColorStop(1, '#000000')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const fade = 1 - clamp((t - 0.9) * 8, 0, 1)
  ctx.fillStyle = `rgba(255,255,255,${0.02 * fade})`
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath()
    ctx.ellipse(
      width * 0.5,
      height * (0.3 + i * 0.1),
      width * (0.1 + i * 0.12),
      14 + i * 6,
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
}

function drawTear(ctx, x, y, baseRadius, t, color, delay = 0) {
  const tt = clamp((t - delay) / (1 - delay), 0, 1)
  const appear = clamp(tt * 2, 0, 1)
  const dissolve = clamp((tt - 0.82) * 6, 0, 1)
  const pulse = Math.sin(tt * 7) * 2.4

  const radius = baseRadius * (appear - dissolve * 0.72)
  if (radius <= 0) return

  const glow = ctx.createRadialGradient(x - 16, y - 28, 10, x, y, radius)
  glow.addColorStop(0, `rgba(255,255,255,${0.8 * appear})`)
  glow.addColorStop(0.3, hexToRGBA(color, 0.24 * appear))
  glow.addColorStop(1, hexToRGBA(color, 0.04 * appear))

  ctx.save()
  ctx.translate(x, y + dissolve * 10)

  ctx.beginPath()
  ctx.moveTo(0, -radius * 0.9)
  ctx.bezierCurveTo(
    radius * 0.46,
    -radius * 0.22,
    radius * 0.42,
    radius * 0.6,
    0,
    radius
  )
  ctx.bezierCurveTo(
    -radius * 0.42,
    radius * 0.6,
    -radius * 0.46,
    -radius * 0.22,
    0,
    -radius * 0.9
  )
  ctx.closePath()
  ctx.fillStyle = glow
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(0, radius * 0.84, radius * 0.9 + pulse, radius * 0.22, 0, 0, Math.PI)
  ctx.strokeStyle = `rgba(255,255,255,${0.05 * appear})`
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(-radius * 0.16, -radius * 0.24, 14, 22, -0.22, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${0.16 * appear})`
  ctx.fill()

  ctx.restore()
}

function drawResonance(ctx, a, b, t) {
  const alpha = clamp((t - 0.24) * 2, 0, 1) * (1 - clamp((t - 0.88) * 6, 0, 1))
  if (alpha <= 0) return

  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const wobble = Math.sin(t * 18) * 12

  ctx.save()
  ctx.strokeStyle = `rgba(196,210,255,${0.16 * alpha})`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.quadraticCurveTo(mx, my - 26 + wobble, b.x, b.y)
  ctx.stroke()

  ctx.strokeStyle = `rgba(255,255,255,${0.08 * alpha})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(a.x, a.y + 4)
  ctx.quadraticCurveTo(mx, my + 12 - wobble * 0.4, b.x, b.y + 4)
  ctx.stroke()

  const p = clamp((t - 0.34) * 1.5, 0, 1)
  const px = a.x + (b.x - a.x) * p
  const py = a.y + (b.y - a.y) * p + Math.sin(t * 18) * 8

  const orb = ctx.createRadialGradient(px, py, 2, px, py, 24)
  orb.addColorStop(0, `rgba(255,255,255,${0.7 * alpha})`)
  orb.addColorStop(0.45, `rgba(180,200,255,${0.18 * alpha})`)
  orb.addColorStop(1, 'rgba(180,200,255,0)')
  ctx.fillStyle = orb
  ctx.beginPath()
  ctx.arc(px, py, 24, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function generateResonancePhrase(primaryTear, secondaryTear) {
  const phrases = [
    'Another tear moved when this one appeared.',
    'Something in the sea answered back.',
    'Two fragile traces recognized each other.',
    'This was not held alone.',
    'A second silence opened beside it.',
    'Someone else had already been here.',
  ]

  const a = primaryTear?.text?.trim() || ''
  const b = secondaryTear?.text?.trim() || ''

  if (a.length > 8 && b.length > 8 && Math.random() > 0.55) {
    return `${a.slice(0, 28)}... / ${b.slice(0, 28)}...`
  }

  return phrases[Math.floor(Math.random() * phrases.length)]
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.includes(' ') ? text.split(' ') : text.split('')
  let line = ''
  const lines = []

  for (let i = 0; i < words.length; i += 1) {
    const separator = text.includes(' ') ? ' ' : ''
    const test = line + words[i] + separator
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      lines.push(line)
      line = words[i] + separator
    } else {
      line = test
    }
  }
  lines.push(line)

  lines.forEach((currentLine, i) => {
    ctx.fillText(currentLine, x, y + i * lineHeight)
  })
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function hexToRGBA(hex, alpha) {
  const fallback = `rgba(180,200,255,${alpha})`
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return fallback
  const clean = hex.replace('#', '')
  const value =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
