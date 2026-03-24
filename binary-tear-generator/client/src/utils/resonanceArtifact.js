export function generateResonanceArtifact(tear, language = 'zh') {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = 1080
  const height = 1920
  canvas.width = width
  canvas.height = height

  const g = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    10,
    width / 2,
    height * 0.58,
    height
  )
  g.addColorStop(0, '#05070d')
  g.addColorStop(1, '#000000')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  const x = width / 2
  const y = height * 0.48

  const outer = ctx.createRadialGradient(x, y, 20, x, y, 180)
  outer.addColorStop(0, 'rgba(255,255,255,0.18)')
  outer.addColorStop(0.3, 'rgba(166,190,255,0.16)')
  outer.addColorStop(1, 'rgba(166,190,255,0)')
  ctx.fillStyle = outer
  ctx.beginPath()
  ctx.arc(x, y, 180, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(220,232,255,0.14)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(x, y, 138, 96, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(x, y, 74, 52, 0, 0, Math.PI * 2)
  ctx.stroke()

  const core = ctx.createRadialGradient(x, y, 4, x, y, 54)
  core.addColorStop(0, 'rgba(255,255,255,0.95)')
  core.addColorStop(0.35, 'rgba(190,210,255,0.42)')
  core.addColorStop(1, 'rgba(190,210,255,0)')
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(x, y, 54, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.textAlign = 'center'
  ctx.font = '600 34px sans-serif'
  ctx.fillText(
    language === 'zh' ? '你照亮了一颗泪星' : 'You resonated with a tear star',
    width / 2,
    height * 0.72
  )

  ctx.font = '28px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.fillText(
    tear.state === 'dried'
      ? (language === 'zh' ? '它已经来不及被挽回。' : 'It was already too late.')
      : (tear.dryness > 72
          ? (language === 'zh' ? '它差一点就干涸了。' : 'It was close to drying out.')
          : (language === 'zh' ? '它在宇宙里回应了你。' : 'It answered back.')),
    width / 2,
    height * 0.76
  )

  ctx.font = '18px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillText(tear.tearId || 'UNKNOWN', width / 2, height * 0.9)

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `resonance-${tear.tearId || Date.now()}.png`
  a.click()
}
