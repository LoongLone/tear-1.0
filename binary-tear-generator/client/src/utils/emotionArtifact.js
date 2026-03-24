export function generateTearArtifact(tear) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  const width = 1080
  const height = 1920

  canvas.width = width
  canvas.height = height

  const gradient = ctx.createRadialGradient(
    width / 2,
    height * 0.4,
    10,
    width / 2,
    height * 0.6,
    height
  )
  gradient.addColorStop(0, '#05070d')
  gradient.addColorStop(1, '#000000')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const x = width / 2
  const y = height * 0.55
  const radius = 120 + Math.random() * 60

  const tearGradient = ctx.createRadialGradient(
    x - 20,
    y - 40,
    10,
    x,
    y,
    radius
  )

  tearGradient.addColorStop(0, 'rgba(255,255,255,0.9)')
  tearGradient.addColorStop(0.2, 'rgba(180,200,255,0.3)')
  tearGradient.addColorStop(1, 'rgba(50,70,140,0.1)')

  ctx.beginPath()
  ctx.ellipse(x, y, radius * 0.8, radius, 0, 0, Math.PI * 2)
  ctx.fillStyle = tearGradient
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x - radius * 0.2, y - radius * 0.3, 20, 30, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y + radius * 0.8, radius * 1.2, 0, Math.PI)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.textAlign = 'center'

  const text = generateFragment(tear)

  wrapText(ctx, text, width / 2, height * 0.8, 700, 42)

  ctx.font = '16px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillText(tear.tearId || 'NVO-UNKNOWN', width / 2, height * 0.92)

  const link = document.createElement('a')
  link.download = `tear-${tear.tearId || Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function generateFragment(tear) {
  const base = tear.text || ''

  const fragments = [
    'Something remained after it ended.',
    'It did not fully leave.',
    'I thought it was over.',
    'But something stayed.',
    'This was not meant to be kept.',
    'I did not want to remember this.',
    'It felt smaller when I said it.',
    'But it was not.',
    'There was more than I could say.',
    'I stopped before it was finished.',
  ]

  if (base.length > 10) {
    return `${base.slice(0, 60)}...`
  }

  return fragments[Math.floor(Math.random() * fragments.length)]
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  ctx.font = '28px sans-serif'

  const words = text.includes(' ') ? text.split(' ') : text.split('')
  let line = ''
  const lines = []

  for (let n = 0; n < words.length; n += 1) {
    const separator = text.includes(' ') ? ' ' : ''
    const testLine = line + words[n] + separator
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + separator
    } else {
      line = testLine
    }
  }

  lines.push(line)

  lines.forEach((currentLine, i) => {
    ctx.fillText(currentLine, x, y + i * lineHeight)
  })
}
