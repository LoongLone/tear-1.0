import GIF from 'gif.js.optimized/dist/gif.js'
import gifWorkerUrl from 'gif.js.optimized/dist/gif.worker.js?url'
import { renderTransitFrame } from './tearTransit'

export async function exportTransitGif({
  tearData,
  emotionColor,
  onProgress,
  frameCount = 22,
  fps = 14,
  progressStart = 0.42,
  progressEnd = 0.96,
}) {
  const width = 720
  const height = 960

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('2d canvas context is unavailable')
  }

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width,
    height,
    workerScript: gifWorkerUrl,
  })

  const start = progressStart
  const end = progressEnd
  const frames = Math.max(2, frameCount)
  const frameDelay = Math.max(20, Math.round(1000 / Math.max(1, fps)))

  for (let i = 0; i < frames; i += 1) {
    const t = start + ((end - start) * i) / (frames - 1)
    renderTransitFrame(ctx, width, height, t, tearData, emotionColor)

    gif.addFrame(ctx, {
      copy: true,
      delay: i === frames - 1 ? Math.max(180, frameDelay) : frameDelay,
    })

    if (onProgress) {
      onProgress(((i + 1) / frames) * 0.7)
    }
  }

  return await new Promise((resolve, reject) => {
    gif.on('progress', (p) => {
      if (onProgress) {
        onProgress(0.7 + p * 0.3)
      }
    })

    gif.on('finished', (blob) => resolve(blob))
    gif.on('abort', () => reject(new Error('GIF generation aborted')))
    gif.render()
  })
}
