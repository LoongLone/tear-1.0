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
      <section className="transition-panel panel-sheen">
        <div className="transition-copy">
          <p className="section-kicker">Ingress Sequence</p>
          <h2>眼睛已经捕获这滴泪水，编号样本正在坠入公共泪库。</h2>
          <p>
            这一层是进入二级视框之前的注视和投递。动画结束后会自动进入公共泪库，
            同时你可以把这一段保存成 GIF。
          </p>

          <div className="transition-meta">
            <div className="status-card">
              <span>Latest Tear</span>
              <strong className="tear-id">{tearData.tearId}</strong>
            </div>
            <div className="status-card">
              <span>Export</span>
              <strong>{gifStatus || '准备导出 GIF'}</strong>
            </div>
          </div>

          <div className="transition-actions">
            <button
              type="button"
              className="generate-btn"
              onClick={onSaveGif}
              disabled={isSavingGif}
            >
              {isSavingGif ? '正在编码 GIF' : '保存这颗泪水 GIF'}
            </button>
            <button type="button" className="ghost-btn" onClick={onComplete}>
              直接进入公共泪库
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
