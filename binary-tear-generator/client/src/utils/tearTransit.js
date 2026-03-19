const TRANSITION_MS = 3600

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const mix = (from, to, progress) => from + (to - from) * progress
const normalize = (value, start, end) =>
  clamp((value - start) / Math.max(end - start, Number.EPSILON))
const easeOutCubic = (value) => 1 - (1 - value) ** 3
const easeInCubic = (value) => value ** 3
const easeInOutSine = (value) => -(Math.cos(Math.PI * value) - 1) / 2

function hexToRgb(hex) {
  const normalized = hex.replace('#', '')

  if (normalized.length !== 6) {
    return { r: 188, g: 232, b: 255 }
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function rgba(color, alpha) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
}

function createPalette(emotionColor) {
  const accent = hexToRgb(emotionColor)
  const rose = { r: 255, g: 185, b: 218 }
  const silver = { r: 244, g: 245, b: 251 }
  const violet = { r: 200, g: 192, b: 255 }

  return {
    accent,
    rose,
    silver,
    violet,
    glow: rgba(accent, 0.42),
    accentStrong: rgba(accent, 0.88),
    accentSoft: rgba(accent, 0.16),
    accentMist: rgba(accent, 0.08),
  }
}

function drawBackground(ctx, width, height, progress, palette) {
  const baseGradient = ctx.createLinearGradient(0, 0, width, height)
  baseGradient.addColorStop(0, '#060711')
  baseGradient.addColorStop(0.55, '#0f1426')
  baseGradient.addColorStop(1, '#090b14')
  ctx.fillStyle = baseGradient
  ctx.fillRect(0, 0, width, height)

  const leftGlow = ctx.createRadialGradient(
    width * 0.25,
    height * 0.18,
    0,
    width * 0.25,
    height * 0.18,
    width * 0.42
  )
  leftGlow.addColorStop(0, rgba(palette.accent, 0.28))
  leftGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = leftGlow
  ctx.fillRect(0, 0, width, height)

  const rightGlow = ctx.createRadialGradient(
    width * 0.78,
    height * 0.14,
    0,
    width * 0.78,
    height * 0.14,
    width * 0.38
  )
  rightGlow.addColorStop(0, rgba(palette.rose, 0.2))
  rightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = rightGlow
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
  ctx.lineWidth = 1
  for (let x = 0; x <= width; x += 52) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += 52) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.18
  for (let i = 0; i < 42; i += 1) {
    const x = ((i * 83) % width) + Math.sin(progress * 9 + i) * 18
    const y = ((i * 157) % height) + Math.cos(progress * 6 + i) * 12
    const radius = 1.6 + ((i % 5) + 1) * 0.42

    ctx.beginPath()
    ctx.fillStyle = i % 2 === 0 ? rgba(palette.accent, 0.85) : rgba(palette.rose, 0.55)
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawEye(ctx, width, height, progress, palette) {
  const eyeOpen = easeOutCubic(normalize(progress, 0.02, 0.34))
  const blink = progress > 0.86 ? 1 - easeOutCubic(normalize(progress, 0.86, 1)) : 1
  const aperture = Math.max(0.24, eyeOpen * blink)
  const cx = width * 0.5
  const cy = height * 0.34
  const eyeWidth = width * 0.5
  const eyeHeight = height * 0.15 * aperture + 30

  ctx.save()
  ctx.shadowColor = rgba(palette.accent, 0.3)
  ctx.shadowBlur = 32
  ctx.beginPath()
  ctx.moveTo(cx - eyeWidth / 2, cy)
  ctx.bezierCurveTo(
    cx - eyeWidth * 0.24,
    cy - eyeHeight * 1.2,
    cx + eyeWidth * 0.24,
    cy - eyeHeight * 1.2,
    cx + eyeWidth / 2,
    cy
  )
  ctx.bezierCurveTo(
    cx + eyeWidth * 0.24,
    cy + eyeHeight * 1.2,
    cx - eyeWidth * 0.24,
    cy + eyeHeight * 1.2,
    cx - eyeWidth / 2,
    cy
  )
  const shellGradient = ctx.createLinearGradient(cx, cy - eyeHeight, cx, cy + eyeHeight)
  shellGradient.addColorStop(0, 'rgba(245, 247, 255, 0.96)')
  shellGradient.addColorStop(0.52, 'rgba(225, 233, 255, 0.9)')
  shellGradient.addColorStop(1, 'rgba(187, 198, 231, 0.84)')
  ctx.fillStyle = shellGradient
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx - eyeWidth / 2, cy)
  ctx.bezierCurveTo(
    cx - eyeWidth * 0.24,
    cy - eyeHeight * 1.2,
    cx + eyeWidth * 0.24,
    cy - eyeHeight * 1.2,
    cx + eyeWidth / 2,
    cy
  )
  ctx.bezierCurveTo(
    cx + eyeWidth * 0.24,
    cy + eyeHeight * 1.2,
    cx - eyeWidth * 0.24,
    cy + eyeHeight * 1.2,
    cx - eyeWidth / 2,
    cy
  )
  ctx.clip()

  const irisRadius = eyeHeight * 1.28
  const irisGradient = ctx.createRadialGradient(
    cx,
    cy,
    irisRadius * 0.14,
    cx,
    cy,
    irisRadius
  )
  irisGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  irisGradient.addColorStop(0.2, rgba(palette.silver, 0.92))
  irisGradient.addColorStop(0.38, rgba(palette.accent, 0.9))
  irisGradient.addColorStop(0.7, rgba(palette.violet, 0.86))
  irisGradient.addColorStop(1, 'rgba(9, 12, 22, 0.96)')
  ctx.fillStyle = irisGradient
  ctx.beginPath()
  ctx.arc(cx, cy, irisRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(5, 7, 12, 0.94)'
  ctx.beginPath()
  ctx.arc(cx, cy, irisRadius * 0.34, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.ellipse(
    cx - irisRadius * 0.18,
    cy - irisRadius * 0.24,
    irisRadius * 0.16,
    irisRadius * 0.28,
    -0.4,
    0,
    Math.PI * 2
  )
  ctx.fill()

  ctx.strokeStyle = rgba(palette.rose, 0.2)
  ctx.lineWidth = 1.5
  for (let index = 0; index < 10; index += 1) {
    const angle = (Math.PI * 2 * index) / 10 + progress * 0.25
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * irisRadius * 0.12, cy + Math.sin(angle) * irisRadius * 0.12)
    ctx.lineTo(cx + Math.cos(angle) * irisRadius * 0.78, cy + Math.sin(angle) * irisRadius * 0.78)
    ctx.stroke()
  }

  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(248, 250, 255, 0.2)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - eyeWidth * 0.42, cy - eyeHeight * 1.04)
  ctx.quadraticCurveTo(cx, cy - eyeHeight * 1.7, cx + eyeWidth * 0.42, cy - eyeHeight * 1.04)
  ctx.stroke()
  ctx.restore()
}

function drawPortal(ctx, width, height, progress, palette, tearId) {
  const portalReveal = easeOutCubic(normalize(progress, 0.46, 0.82))
  const cardsReveal = easeOutCubic(normalize(progress, 0.68, 0.98))
  const cx = width * 0.5
  const cy = height * 0.82

  ctx.save()
  ctx.globalAlpha = portalReveal
  const ringGradient = ctx.createRadialGradient(cx, cy, 6, cx, cy, width * 0.24)
  ringGradient.addColorStop(0, rgba(palette.accent, 0.34))
  ringGradient.addColorStop(0.42, rgba(palette.rose, 0.24))
  ringGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = ringGradient
  ctx.beginPath()
  ctx.ellipse(cx, cy, width * 0.28, height * 0.065, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = rgba(palette.silver, 0.42)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, width * 0.22, height * 0.03, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = cardsReveal
  const cards = [-1, 0, 1]
  cards.forEach((offset, index) => {
    const cardWidth = width * 0.18
    const cardHeight = height * 0.16
    const x = cx + offset * width * 0.17 - cardWidth / 2
    const y = height * 0.56 + Math.sin(progress * 7 + index) * 10
    const gradient = ctx.createLinearGradient(x, y, x + cardWidth, y + cardHeight)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.13)')
    gradient.addColorStop(1, 'rgba(12, 16, 28, 0.72)')
    ctx.fillStyle = gradient
    ctx.strokeStyle = index === 1 ? rgba(palette.accent, 0.48) : 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(x, y, cardWidth, cardHeight, 22)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.font = `${Math.round(width * 0.017)}px Inter, sans-serif`
    ctx.fillText(index === 1 ? 'Latest Insertion' : 'Public Fragment', x + 24, y + 34)

    ctx.fillStyle = index === 1 ? rgba(palette.accent, 0.95) : 'rgba(255, 255, 255, 0.68)'
    ctx.font = `${Math.round(width * 0.022)}px "Major Mono Display", monospace`
    ctx.fillText(index === 1 ? tearId : `NVO-${index + 3}4A`, x + 24, y + 70)

    ctx.fillStyle = 'rgba(177, 188, 221, 0.62)'
    ctx.font = `${Math.round(width * 0.016)}px Inter, sans-serif`
    ctx.fillText('Layer 02 / shared memory', x + 24, y + 102)
  })
  ctx.restore()
}

function drawTear(ctx, width, height, progress, palette) {
  const formation = easeOutCubic(normalize(progress, 0.14, 0.34))
  const fallProgress = easeInCubic(normalize(progress, 0.32, 0.78))
  const splashProgress = easeOutCubic(normalize(progress, 0.72, 0.92))
  const cx = width * 0.5 + Math.sin(progress * 10) * width * 0.018
  const startY = height * 0.42
  const endY = height * 0.82
  const cy = mix(startY, endY, fallProgress)
  const scale = 0.48 + formation * 0.68
  const tearHeight = height * 0.095 * scale
  const tearWidth = width * 0.048 * scale

  if (formation <= 0) {
    return
  }

  if (fallProgress > 0.02) {
    ctx.save()
    const trail = ctx.createLinearGradient(cx, startY, cx, cy)
    trail.addColorStop(0, 'rgba(255, 255, 255, 0)')
    trail.addColorStop(1, rgba(palette.accent, 0.32))
    ctx.strokeStyle = trail
    ctx.lineWidth = tearWidth * 0.42
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx, startY + tearHeight * 0.2)
    ctx.lineTo(cx, cy - tearHeight * 0.4)
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.shadowColor = rgba(palette.accent, 0.45)
  ctx.shadowBlur = 26
  ctx.beginPath()
  ctx.moveTo(cx, cy - tearHeight * 0.72)
  ctx.bezierCurveTo(
    cx + tearWidth * 0.92,
    cy - tearHeight * 0.12,
    cx + tearWidth * 0.72,
    cy + tearHeight * 0.92,
    cx,
    cy + tearHeight
  )
  ctx.bezierCurveTo(
    cx - tearWidth * 0.72,
    cy + tearHeight * 0.92,
    cx - tearWidth * 0.92,
    cy - tearHeight * 0.12,
    cx,
    cy - tearHeight * 0.72
  )
  const tearGradient = ctx.createLinearGradient(
    cx,
    cy - tearHeight,
    cx,
    cy + tearHeight
  )
  tearGradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)')
  tearGradient.addColorStop(0.28, rgba(palette.accent, 0.84))
  tearGradient.addColorStop(1, rgba(palette.violet, 0.74))
  ctx.fillStyle = tearGradient
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)'
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
  ctx.beginPath()
  ctx.ellipse(
    cx - tearWidth * 0.18,
    cy - tearHeight * 0.2,
    tearWidth * 0.16,
    tearHeight * 0.18,
    -0.36,
    0,
    Math.PI * 2
  )
  ctx.fill()
  ctx.restore()

  if (splashProgress > 0) {
    ctx.save()
    ctx.globalAlpha = 1 - splashProgress
    ctx.strokeStyle = rgba(palette.accent, 0.62)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(
      width * 0.5,
      endY,
      width * (0.08 + splashProgress * 0.14),
      height * (0.01 + splashProgress * 0.03),
      0,
      0,
      Math.PI * 2
    )
    ctx.stroke()
    ctx.restore()
  }
}

function drawLabels(ctx, width, height, progress, palette, tearData) {
  ctx.save()
  ctx.fillStyle = 'rgba(181, 193, 226, 0.72)'
  ctx.font = `${Math.round(width * 0.017)}px Inter, sans-serif`
  ctx.fillText('TEAR INGESTION SEQUENCE', width * 0.08, height * 0.1)

  ctx.fillStyle = 'rgba(245, 247, 255, 0.96)'
  ctx.font = `600 ${Math.round(width * 0.05)}px Inter, sans-serif`
  ctx.fillText('A tear enters the public archive.', width * 0.08, height * 0.15)

  ctx.fillStyle = rgba(palette.accent, 0.92)
  ctx.font = `${Math.round(width * 0.025)}px "Major Mono Display", monospace`
  ctx.fillText(tearData.tearId, width * 0.08, height * 0.21)

  const text = tearData.text.length > 58 ? `${tearData.text.slice(0, 58)}...` : tearData.text
  ctx.fillStyle = 'rgba(195, 204, 232, 0.78)'
  ctx.font = `${Math.round(width * 0.02)}px Inter, sans-serif`
  ctx.fillText(`"${text}"`, width * 0.08, height * 0.25)

  const captionAlpha = easeOutCubic(normalize(progress, 0.72, 0.94))
  ctx.globalAlpha = captionAlpha
  ctx.fillStyle = 'rgba(249, 250, 255, 0.82)'
  ctx.font = `500 ${Math.round(width * 0.026)}px Inter, sans-serif`
  ctx.fillText('Layer 02 / Public Tear Library', width * 0.08, height * 0.9)
  ctx.restore()
}

function drawFrame(ctx, width, height, progress, tearData, emotionColor) {
  const palette = createPalette(emotionColor)

  ctx.clearRect(0, 0, width, height)
  drawBackground(ctx, width, height, progress, palette)
  drawEye(ctx, width, height, progress, palette)
  drawPortal(ctx, width, height, progress, palette, tearData.tearId)
  drawTear(ctx, width, height, progress, palette)
  drawLabels(ctx, width, height, progress, palette, tearData)
}

export function renderTransitFrame(ctx, width, height, progress, tearData, emotionColor) {
  drawFrame(ctx, width, height, progress, tearData, emotionColor)
}

export function getTransitDuration() {
  return TRANSITION_MS
}

export { TRANSITION_MS, easeInOutSine }
