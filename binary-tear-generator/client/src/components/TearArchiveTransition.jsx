import { useEffect, useRef } from 'react'
import {
  easeInOutSine,
  getTransitDuration,
  renderTransitFrame,
} from '../utils/tearTransit'

const COPY = {
  en: {
    kicker: 'Ingress Sequence',
    title:
      'The eye has captured this tear. The numbered sample is descending into the public archive.',
    body:
      'This layer is the final stare before entry into the secondary field. When the animation ends, you will enter the public sea. You can also save this transit as a GIF.',
    latest: 'Latest Tear',
    export: 'Export',
    ready: 'Ready to export GIF',
    saving: 'Encoding GIF',
    save: 'Save this tear as GIF',
    enter: 'Enter the public sea',
    badge: 'Layer Shift / Forge to Archive',
  },
  zh: {
    kicker: '入海序列',
    title: '这滴泪已经被眼睛捕获，编号样本正缓慢坠入公共档案。',
    body:
      '这是进入第二视层之前的最后一次凝视。动画结束后，你会进入公共泪海；你也可以把这段过渡保存下来。',
    latest: '最新样本',
    export: '导出状态',
    ready: '可导出 GIF',
    saving: '正在编码 GIF',
    save: '保存这滴泪的 GIF',
    enter: '进入公共泪海',
    badge: '层切换 / Forge to Archive',
  },
}

function TearArchiveTransition({
  tearData,
  emotionColor,
  onComplete,
  onSaveGif,
  gifStatus,
  isSavingGif,
  language = 'en',
}) {
  const copy = COPY[language] || COPY.en
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
          <p className="section-kicker">{copy.kicker}</p>
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>

          <div className="transition-meta">
            <div className="status-card">
              <span>{copy.latest}</span>
              <strong className="tear-id">{tearData.tearId}</strong>
            </div>
            <div className="status-card">
              <span>{copy.export}</span>
              <strong>{gifStatus || copy.ready}</strong>
            </div>
          </div>

          <div className="transition-actions">
            <button
              type="button"
              className="generate-btn"
              onClick={onSaveGif}
              disabled={isSavingGif}
            >
              {isSavingGif ? copy.saving : copy.save}
            </button>
            <button type="button" className="ghost-btn" onClick={onComplete}>
              {copy.enter}
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
            <span className="transition-badge">{copy.badge}</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default TearArchiveTransition
