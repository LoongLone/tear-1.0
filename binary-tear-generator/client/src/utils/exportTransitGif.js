import GIF from 'gif.js.optimized/dist/gif.js'
import gifWorkerUrl from 'gif.js.optimized/dist/gif.worker.js?url'
import { renderTransitFrame } from './tearTransit'

const GIF_WIDTH = 960
const GIF_HEIGHT = 1280
const FRAME_COUNT = 34

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const mix = (from, to, progress) => from + (to - from) * progress

export async function exportTransitGif({ tearData, emotionColor, onProgress }) {
  const canvas = document.createElement('canvas')
  canvas.width = GIF_WIDTH
  canvas.height = GIF_HEIGHT
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('2d canvas context is unavailable')
  }

  const gif = new GIF({
    workers: 2,
    quality: 8,
    width: GIF_WIDTH,
    height: GIF_HEIGHT,
    workerScript: gifWorkerUrl,
    background: '#060711',
    repeat: 0,
  })

  for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
    const progress = frameIndex / (FRAME_COUNT - 1)
    renderTransitFrame(ctx, GIF_WIDTH, GIF_HEIGHT, progress, tearData, emotionColor)
    gif.addFrame(ctx, {
      copy: true,
      delay: progress > 0.68 ? 96 : 82,
    })

    onProgress?.(mix(0.08, 0.42, frameIndex / Math.max(FRAME_COUNT - 1, 1)))
  }

  return new Promise((resolve, reject) => {
    gif.on('progress', (value) => {
      onProgress?.(mix(0.42, 1, clamp(value)))
    })

    gif.on('finished', (blob) => resolve(blob))

    try {
      gif.render()
    } catch (error) {
      reject(error)
    }
  })
}
