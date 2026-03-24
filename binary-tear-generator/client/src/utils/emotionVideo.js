export async function generateTearVideo(tear) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return

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

  function drawFrame(time) {
    const t = (time - start) / 5000

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    const x = width / 2
    const y = height * 0.55

    const appear = clamp(t * 1.5, 0, 1)
    const stable = clamp((t - 0.3) * 2, 0, 1)
    const dissolve = clamp((t - 0.75) * 4, 0, 1)

    const baseRadius = 80
    const radius = baseRadius * (appear - dissolve * 0.8)

    const gradient = ctx.createRadialGradient(
      x - 20,
      y - 40,
      10,
      x,
      y,
      radius
    )

    gradient.addColorStop(0, `rgba(255,255,255,${0.9 * appear})`)
    gradient.addColorStop(0.3, `rgba(160,180,255,${0.25 * appear})`)
    gradient.addColorStop(1, `rgba(40,60,120,${0.08 * appear})`)

    ctx.beginPath()
    ctx.ellipse(
      x,
      y,
      radius * 0.75,
      radius,
      0,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = gradient
    ctx.fill()

    const pulse = Math.sin(t * 6) * 2
    ctx.beginPath()
    ctx.ellipse(
      x,
      y + radius * 0.7,
      radius * 1.1 + pulse,
      radius * 0.3,
      0,
      0,
      Math.PI
    )
    ctx.strokeStyle = `rgba(255,255,255,${0.05 * stable})`
    ctx.stroke()

    const text = generateFragment(tear)
    const alpha = clamp((t - 0.3) * 2, 0, 1) * (1 - dissolve)

    ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`
    ctx.textAlign = 'center'
    ctx.font = '24px sans-serif'

    wrapText(ctx, text, width / 2, height * 0.8, 500, 36)

    ctx.font = '12px monospace'
    ctx.fillStyle = `rgba(255,255,255,${0.3 * alpha})`
    ctx.fillText(tear.tearId || 'UNKNOWN', width / 2, height * 0.92)

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
    anchor.download = `tear-${tear.tearId}.webm`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  window.requestAnimationFrame(drawFrame)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function generateFragment(tear) {
  const base = tear.text || ''

  const fragments = [
    'It did not fully disappear.',
    'Something stayed.',
    'I thought I said everything.',
    'But I did not.',
    'It felt smaller when I said it.',
    'But it was not.',
    'There was more than I could hold.',
    'I stopped too early.',
  ]

  if (base.length > 10) {
    return `${base.slice(0, 60)}...`
  }

  return fragments[Math.floor(Math.random() * fragments.length)]
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.includes(' ') ? text.split(' ') : text.split('')
  let line = ''
  const lines = []

  for (let n = 0; n < words.length; n += 1) {
    const separator = text.includes(' ') ? ' ' : ''
    const testLine = line + words[n] + separator
    const width = ctx.measureText(testLine).width

    if (width > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + separator
    } else {
      line = testLine
    }
  }

  lines.push(line)

  lines.forEach((currentLine, index) => {
    ctx.fillText(currentLine, x, y + index * lineHeight)
  })
}
