export function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2
}

export function getTransitDuration() {
  return 2600
}

function hexToRGBA(hex, alpha) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(155,176,255,${alpha})`
  }
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

function drawBackground(ctx, width, height) {
  const g = ctx.createLinearGradient(0, 0, 0, height)
  g.addColorStop(0, '#02040b')
  g.addColorStop(0.45, '#050814')
  g.addColorStop(1, '#020309')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  const upperGlow = ctx.createRadialGradient(width * 0.5, height * 0.22, 10, width * 0.5, height * 0.22, width * 0.34)
  upperGlow.addColorStop(0, 'rgba(190,208,255,0.08)')
  upperGlow.addColorStop(1, 'rgba(190,208,255,0)')
  ctx.fillStyle = upperGlow
  ctx.fillRect(0, 0, width, height)

  const lowerGlow = ctx.createRadialGradient(width * 0.5, height * 0.79, 10, width * 0.5, height * 0.79, width * 0.26)
  lowerGlow.addColorStop(0, 'rgba(104,130,255,0.12)')
  lowerGlow.addColorStop(1, 'rgba(104,130,255,0)')
  ctx.fillStyle = lowerGlow
  ctx.fillRect(0, 0, width, height)
}

function drawOpticGate(ctx, width, height, progress, emotionColor) {
  const cx = width * 0.5
  const cy = height * 0.42

  const blink = Math.max(0.18, 1 - Math.sin(progress * Math.PI) * 0.18)
  const twitch = progress > 0.5 && progress < 0.74 ? Math.sin(progress * Math.PI * 30) * 1.8 : 0
  const pupilFocus = 1 - Math.min(1, Math.max(0, (progress - 0.32) / 0.5)) * 0.32

  ctx.save()
  ctx.translate(cx + twitch, cy)

  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = Math.max(1, width * 0.0022)

  ctx.beginPath()
  ctx.ellipse(0, 0, width * 0.24, height * 0.115 * blink, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(0, 0, width * 0.16, height * 0.078 * blink, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(0, 0, width * 0.084 * pupilFocus, height * 0.038 * blink * pupilFocus, 0, 0, Math.PI * 2)
  ctx.stroke()

  const pupilGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, width * 0.08)
  pupilGlow.addColorStop(0, 'rgba(220,232,255,0.14)')
  pupilGlow.addColorStop(0.36, hexToRGBA(emotionColor, 0.16))
  pupilGlow.addColorStop(1, hexToRGBA(emotionColor, 0))
  ctx.fillStyle = pupilGlow
  ctx.beginPath()
  ctx.arc(0, 0, width * 0.082, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 4; i += 1) {
    const dir = i % 2 === 0 ? -1 : 1
    ctx.beginPath()
    ctx.moveTo(dir * width * 0.09, -height * 0.015 + i * 3)
    ctx.quadraticCurveTo(dir * width * 0.16, 0, dir * width * 0.12, height * 0.03)
    ctx.strokeStyle = hexToRGBA(emotionColor, 0.08)
    ctx.stroke()
  }

  ctx.restore()
}

function drawSeaSurface(ctx, width, height) {
  const seaY = height * 0.79
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.ellipse(width * 0.5, seaY, width * 0.2, height * 0.036, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(width * 0.5, seaY, width * 0.12, height * 0.018, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawOrganicAperture(ctx, width, height, progress, emotionColor) {
  const cx = width * 0.5
  const cy = height * 0.79
  const p = Math.sin(progress * Math.PI)

  const funnelWidth = width * (0.035 + p * 0.05)
  const funnelHeight = height * (0.012 + p * 0.045)
  const pulse = 1 + Math.sin(progress * Math.PI * 8) * 0.04

  const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.12)
  outer.addColorStop(0, 'rgba(255,255,255,0.14)')
  outer.addColorStop(0.2, hexToRGBA(emotionColor, 0.18))
  outer.addColorStop(1, hexToRGBA(emotionColor, 0))
  ctx.fillStyle = outer
  ctx.beginPath()
  ctx.ellipse(cx, cy, funnelWidth * 3.2 * pulse, funnelHeight * 4.8 * pulse, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(pulse, pulse)

  ctx.beginPath()
  ctx.moveTo(-funnelWidth, 0)
  ctx.bezierCurveTo(-funnelWidth * 0.7, -funnelHeight * 1.8, funnelWidth * 0.7, -funnelHeight * 1.8, funnelWidth, 0)
  ctx.bezierCurveTo(funnelWidth * 0.7, funnelHeight * 1.9, -funnelWidth * 0.7, funnelHeight * 1.9, -funnelWidth, 0)
  ctx.closePath()

  const slit = ctx.createLinearGradient(0, -funnelHeight * 2.2, 0, funnelHeight * 2.2)
  slit.addColorStop(0, 'rgba(0,0,0,0.84)')
  slit.addColorStop(0.5, 'rgba(0,0,0,0.97)')
  slit.addColorStop(1, 'rgba(0,0,0,0.84)')
  ctx.fillStyle = slit
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.stroke()

  for (let i = 0; i < 4; i += 1) {
    const offset = (i - 1.5) * funnelWidth * 0.36
    ctx.beginPath()
    ctx.moveTo(offset, -funnelHeight * 0.55)
    ctx.quadraticCurveTo(offset + (i % 2 === 0 ? -1 : 1) * funnelWidth * 0.2, 0, offset, funnelHeight * 0.58)
    ctx.strokeStyle = hexToRGBA(emotionColor, 0.11)
    ctx.stroke()
  }

  ctx.restore()
}

function drawTear(ctx, width, height, progress, emotionColor) {
  const cx = width * 0.5
  const startY = height * 0.31
  const targetY = height * 0.79

  let y
  let scale
  let alpha
  let stretch

  if (progress < 0.56) {
    const p = progress / 0.56
    y = startY + (targetY - startY) * (p * 0.74)
    scale = 1
    alpha = 1
    stretch = 1
  } else {
    const p = (progress - 0.56) / 0.44
    y = startY + (targetY - startY) * (0.74 + p * 0.26)
    scale = 1 - p * 0.78
    alpha = 1 - p * 0.97
    stretch = 1 + p * 1.4
  }

  ctx.save()
  ctx.translate(cx, y)
  ctx.scale(scale, scale * stretch)
  ctx.globalAlpha = Math.max(alpha, 0.03)

  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, width * 0.056)
  glow.addColorStop(0, 'rgba(255,255,255,0.18)')
  glow.addColorStop(0.35, hexToRGBA(emotionColor, 0.24))
  glow.addColorStop(1, hexToRGBA(emotionColor, 0))
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(0, 0, width * 0.056, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -height * 0.044)
  ctx.bezierCurveTo(width * 0.028, -height * 0.008, width * 0.026, height * 0.04, 0, height * 0.064)
  ctx.bezierCurveTo(-width * 0.026, height * 0.04, -width * 0.028, -height * 0.008, 0, -height * 0.044)
  ctx.closePath()

  const fill = ctx.createLinearGradient(0, -height * 0.05, 0, height * 0.08)
  fill.addColorStop(0, 'rgba(255,255,255,0.4)')
  fill.addColorStop(0.35, hexToRGBA(emotionColor, 0.34))
  fill.addColorStop(1, 'rgba(255,255,255,0.04)')
  ctx.fillStyle = fill
  ctx.fill()
  ctx.restore()

  if (progress > 0.42 && progress < 0.86) {
    const beamP = (progress - 0.42) / 0.44
    ctx.save()
    ctx.globalAlpha = 0.16 * (1 - Math.abs(0.5 - beamP) * 2)
    const beam = ctx.createLinearGradient(cx, y, cx, targetY)
    beam.addColorStop(0, hexToRGBA(emotionColor, 0))
    beam.addColorStop(0.4, hexToRGBA(emotionColor, 0.18))
    beam.addColorStop(1, hexToRGBA(emotionColor, 0))
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.ellipse(cx, (y + targetY) / 2, width * 0.022, Math.abs(targetY - y) / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawResidualScar(ctx, width, height, progress, emotionColor) {
  if (progress < 0.76) return

  const p = (progress - 0.76) / 0.24
  const cx = width * 0.5
  const cy = height * 0.79

  ctx.save()
  ctx.globalAlpha = p

  const scarGlow = ctx.createRadialGradient(cx, cy, 1, cx, cy, width * 0.08)
  scarGlow.addColorStop(0, hexToRGBA(emotionColor, 0.18))
  scarGlow.addColorStop(1, hexToRGBA(emotionColor, 0))
  ctx.fillStyle = scarGlow
  ctx.beginPath()
  ctx.ellipse(cx, cy, width * 0.08, height * 0.026, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.09)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - width * 0.03, cy)
  ctx.quadraticCurveTo(cx, cy - height * 0.01, cx + width * 0.03, cy)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx - width * 0.018, cy + height * 0.005)
  ctx.quadraticCurveTo(cx, cy + height * 0.012, cx + width * 0.018, cy + height * 0.005)
  ctx.stroke()
  ctx.restore()
}

function drawRipples(ctx, width, height, progress) {
  if (progress < 0.72) return

  const p = (progress - 0.72) / 0.28
  const cx = width * 0.5
  const cy = height * 0.79

  ctx.save()
  ctx.globalAlpha = 1 - p
  ctx.strokeStyle = 'rgba(220,232,255,0.18)'
  ctx.lineWidth = 1

  for (let i = 0; i < 3; i += 1) {
    const scale = 1 + p * (1.1 + i * 0.24)
    ctx.beginPath()
    ctx.ellipse(cx, cy, width * 0.09 * scale, height * 0.012 * scale, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

export function renderTransitFrame(ctx, width, height, progress, tearData, emotionColor) {
  ctx.clearRect(0, 0, width, height)
  drawBackground(ctx, width, height)
  drawOpticGate(ctx, width, height, progress, emotionColor)
  drawSeaSurface(ctx, width, height)
  drawOrganicAperture(ctx, width, height, progress, emotionColor)
  drawTear(ctx, width, height, progress, emotionColor)
  drawResidualScar(ctx, width, height, progress, emotionColor)
  drawRipples(ctx, width, height, progress)
}

export async function renderTransitStill({ tearData, emotionColor, progress = 0.88 }) {
  const canvas = document.createElement('canvas')
  const width = 1600
  const height = 900
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  renderTransitFrame(ctx, width, height, progress, tearData, emotionColor)

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
