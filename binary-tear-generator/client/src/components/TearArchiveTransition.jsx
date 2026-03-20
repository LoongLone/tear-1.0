import { useEffect, useRef } from 'react'
import {
  easeInOutSine,
  getTransitDuration,
  renderTransitFrame,
} from '../utils/tearTransit'

function TearArchiveTransition({
  tearData,
  emotionColor,
  onComplete,
  onSaveGif,
  gifStatus,
  isSavingGif,
}) {
  const canvasRef = useRef(null)
  const completedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas || !tearData) {
      return undefined
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return undefined
    }

    const duration = getTransitDuration()
    let frameId = 0
    let startedAt = 0

    const render = (timestamp) => {
      if (!startedAt) {
        startedAt = timestamp
      }

      const elapsed = timestamp - startedAt
      const rawProgress = Math.min(elapsed / duration, 1)
      const progress = easeInOutSine(rawProgress)
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const nextWidth = Math.max(1, Math.round(rect.width * pixelRatio))
      const nextHeight = Math.max(1, Math.round(rect.height * pixelRatio))

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth
        canvas.height = nextHeight
      }

      renderTransitFrame(ctx, canvas.width, canvas.height, progress, tearData, emotionColor)

      if (rawProgress < 1) {
        frameId = window.requestAnimationFrame(render)
        return
      }

      if (!completedRef.current) {
        completedRef.current = true
        onComplete?.()
      }
    }

    frameId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [emotionColor, onComplete, tearData])

  useEffect(() => {
    completedRef.current = false
  }, [tearData])

  if (!tearData) {
    return null
  }

  return (
    <main className="transition-shell">
      <section className="transition-panel">
        <div className="transition-copy">
          <p className="section-kicker">Ingress sequence</p>
          <h2>The watcher has captured the tear. The sample is being lowered into the public sea.</h2>
          <p>
            This layer sits between extraction and archive entry. When the descent ends,
            the interface opens the shared sea and you can keep the transit as a GIF.
          </p>

          <div className="transition-meta">
            <div className="status-card">
              <span>Latest Tear</span>
              <strong className="tear-id">{tearData.tearId}</strong>
            </div>
            <div className="status-card">
              <span>Export</span>
              <strong>{gifStatus || 'Ready to encode GIF'}</strong>
            </div>
          </div>

          <div className="transition-actions">
            <button
              type="button"
              className="generate-btn"
              onClick={onSaveGif}
              disabled={isSavingGif}
            >
              {isSavingGif ? 'Encoding GIF' : 'Save this tear as GIF'}
            </button>
            <button type="button" className="ghost-btn" onClick={onComplete}>
              Enter the public sea
            </button>
          </div>
        </div>

        <div className="transition-visual">
          <canvas
            ref={canvasRef}
            className="transition-canvas"
            aria-label="tear archive transition"
          />
          <div className="transition-overlay">
            <span className="transition-badge">Layer Shift / Forge to Archive</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default TearArchiveTransition
