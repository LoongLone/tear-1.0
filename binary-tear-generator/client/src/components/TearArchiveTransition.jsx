import { useEffect, useRef } from 'react'
import {
  easeInOutSine,
  getTransitDuration,
  renderTransitFrame,
} from '../utils/tearTransit'

const COPY = {
  en: {
    kicker: 'Ingress Sequence',
    title: 'The tear has been captured. The numbered sample is being transferred into the public body.',
    body:
      'This is not a fall. It is a controlled absorption. The chamber is closing around the residue before the sea accepts it.',
    latest: 'Captured Sample',
    export: 'Event Slice',
    still: 'Archive Still',
    ready: 'Ready to export event slice',
    saving: 'Encoding event slice',
    save: 'Save event slice',
    saveStill: 'Save archive still',
    enter: 'Enter the public sea',
    badge: 'Optic Gate / Absorption Layer',
  },
  zh: {
    kicker: '入海序列',
    title: '这滴泪已经被捕获，编号样本正被转移进公共身体。',
    body:
      '这不是坠落，而是一次受控吸收。泪海接受它之前，腔体会先把残留物包裹起来。',
    latest: '捕获样本',
    export: '事件切片',
    still: '档案静帧',
    ready: '可导出事件切片',
    saving: '正在编码事件切片',
    save: '保存事件切片',
    saveStill: '保存档案静帧',
    enter: '进入公共泪海',
    badge: '光学门 / 吸收层',
  },
}

function TearArchiveTransition({
  tearData,
  emotionColor,
  onComplete,
  onSaveGif,
  onSaveStill,
  gifStatus,
  isSavingGif,
  language = 'en',
}) {
  const copy = COPY[language]
  const canvasRef = useRef(null)
  const completedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !tearData) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const duration = getTransitDuration()
    let frameId = 0
    let startedAt = 0

    const render = (timestamp) => {
      if (!startedAt) startedAt = timestamp

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

      renderTransitFrame(
        ctx,
        canvas.width,
        canvas.height,
        progress,
        tearData,
        emotionColor
      )

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
    return () => window.cancelAnimationFrame(frameId)
  }, [emotionColor, onComplete, tearData])

  useEffect(() => {
    completedRef.current = false
  }, [tearData])

  if (!tearData) return null

  return (
    <main className="transition-shell cult-transition-shell">
      <section className="transition-panel panel-sheen cult-transition-panel">
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
            <button type="button" className="generate-btn" onClick={onSaveGif} disabled={isSavingGif}>
              {isSavingGif ? copy.saving : copy.save}
            </button>
            <button type="button" className="ghost-btn" onClick={onSaveStill} disabled={isSavingGif}>
              {copy.saveStill}
            </button>
            <button type="button" className="ghost-btn" onClick={onComplete}>
              {copy.enter}
            </button>
          </div>
        </div>

        <div className="transition-visual cult-transition-visual optic-gate-shell">
          <div className="transition-grid" />
          <div className="transition-orbit orbit-a" />
          <div className="transition-orbit orbit-b" />

          <div className="optic-lid optic-lid-top" />
          <div className="optic-lid optic-lid-bottom" />
          <div className="optic-ring optic-ring-a" />
          <div className="optic-ring optic-ring-b" />
          <div className="optic-ring optic-ring-c" />
          <div className="optic-gloss" />
          <div className="optic-pupil-shadow" />

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
