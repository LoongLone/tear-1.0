import { useEffect, useMemo, useRef, useState } from 'react'
import {
  acknowledgeDryEvent,
  cleanseTear,
  createResonanceShareText,
  enrichTearForCosmos,
  getTearVisualState,
  resonateTear,
  tickTearState,
} from '../utils/tearCosmos'
import { generateResonanceArtifact } from '../utils/resonanceArtifact'

const COPY = {
  en: {
    title: 'Tear Cosmos',
    subtitle: 'Every tear becomes a coordinate in the shared universe.',
    resonate: 'Resonate',
    cleanse: 'Cleanse',
    share: 'Share',
    dried: 'Dried',
    energy: 'Energy',
    dryness: 'Dryness',
    contamination: 'Contamination',
    resonance: 'Resonance',
    resistance: 'Resistance',
    cannotCleanse: 'You cannot cleanse your own tear.',
    died: 'A tear star dried out.',
  },
  zh: {
    title: '泪宇宙',
    subtitle: '每一滴泪都成为公共宇宙中的一个坐标。',
    resonate: '共振',
    cleanse: '清理污染',
    share: '生成切片',
    dried: '已干涸',
    energy: '能量',
    dryness: '干涸度',
    contamination: '污染值',
    resonance: '共振',
    resistance: '抗污染',
    cannotCleanse: '你不能清理自己的泪。',
    died: '有一颗泪星干涸了。',
  },
}

function TearCosmos({
  tears = [],
  language = 'zh',
  currentTearId = '',
  onTearsChange,
}) {
  const copy = COPY[language] || COPY.en
  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [message, setMessage] = useState('')
  const dragRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 })
  const holdRef = useRef(null)
  const messageRef = useRef(null)

  const cosmosTears = useMemo(
    () => tears.map((tear) => enrichTearForCosmos(tear)),
    [tears]
  )
  const activeSelectedId = cosmosTears.some((tear) => tear.tearId === selectedId)
    ? selectedId
    : null

  const queueMessage = (nextMessage, duration = 2400) => {
    if (messageRef.current) {
      window.clearTimeout(messageRef.current)
    }
    setMessage(nextMessage)
    messageRef.current = window.setTimeout(() => {
      setMessage('')
      messageRef.current = null
    }, duration)
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextTears = cosmosTears.map((tear) => tickTearState(tear))
      const justDried = nextTears.find((tear) => tear.justDried)

      if (justDried) {
        queueMessage(`${copy.died} ${justDried.tearId}`, 2200)
      }

      onTearsChange?.(
        justDried
          ? nextTears.map((tear) =>
              tear.tearId === justDried.tearId ? acknowledgeDryEvent(tear) : tear
            )
          : nextTears
      )
    }, 10000)

    return () => window.clearInterval(timer)
  }, [copy.died, cosmosTears, onTearsChange])

  useEffect(() => {
    return () => {
      if (holdRef.current) {
        window.clearTimeout(holdRef.current)
      }
      if (messageRef.current) {
        window.clearTimeout(messageRef.current)
      }
    }
  }, [])

  const updateTear = (tearId, updater) => {
    const next = cosmosTears.map((tear) =>
      tear.tearId === tearId ? updater(tear) : tear
    )
    onTearsChange?.(next)
  }

  const handleResonate = (tearId) => {
    const tear = cosmosTears.find((item) => item.tearId === tearId)
    if (!tear) return

    updateTear(tearId, (item) => resonateTear(item))
    queueMessage(createResonanceShareText(tear, language))
  }

  const handleCleanse = (tearId) => {
    const tear = cosmosTears.find((item) => item.tearId === tearId)
    if (!tear) return

    if (currentTearId && tear.tearId === currentTearId) {
      queueMessage(copy.cannotCleanse, 1800)
      return
    }

    updateTear(tearId, (item) => cleanseTear(item, currentTearId, tear.tearId))
  }

  const handleShare = (tearId) => {
    const tear = cosmosTears.find((item) => item.tearId === tearId)
    if (!tear) return
    generateResonanceArtifact(tear, language)
  }

  const onPointerDown = (event) => {
    setDragging(true)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      cx: camera.x,
      cy: camera.y,
    }
  }

  const onPointerMove = (event) => {
    if (!dragging) return
    const dx = event.clientX - dragRef.current.x
    const dy = event.clientY - dragRef.current.y
    setCamera({
      x: dragRef.current.cx + dx,
      y: dragRef.current.cy + dy,
    })
  }

  const onPointerUp = () => {
    setDragging(false)
  }

  const startHold = (tearId) => {
    holdRef.current = window.setTimeout(() => {
      handleResonate(tearId)
    }, 420)
  }

  const clearHold = () => {
    if (holdRef.current) {
      window.clearTimeout(holdRef.current)
      holdRef.current = null
    }
  }

  return (
    <section className="tear-cosmos-shell">
      <div className="tear-cosmos-head">
        <div>
          <p className="section-kicker">{copy.title}</p>
          <h2>{copy.subtitle}</h2>
        </div>
        {message ? <div className="cosmos-message">{message}</div> : null}
      </div>

      <div
        className="tear-cosmos-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="tear-cosmos-field"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {cosmosTears.map((tear) => {
            const visual = getTearVisualState(tear)
            const selected = activeSelectedId === tear.tearId

            return (
              <div
                key={tear.tearId}
                className={`cosmos-tear is-${visual} ${selected ? 'is-selected' : ''} ${tear.justDried ? 'is-dying-now' : ''}`}
                style={{
                  left: `calc(50% + ${tear.cosmosX}px)`,
                  top: `calc(50% + ${tear.cosmosY}px)`,
                  '--luminosity': tear.luminosity,
                  '--mass': tear.mass,
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedId(tear.tearId)
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onTouchStart={() => startHold(tear.tearId)}
                onTouchEnd={clearHold}
                onTouchCancel={clearHold}
                onMouseDown={() => startHold(tear.tearId)}
                onMouseUp={clearHold}
                onMouseLeave={clearHold}
              >
                <div className="cosmos-tear-core" />
                <div className="cosmos-tear-halo" />
                <div className="cosmos-tear-ring" />
                <div className="cosmos-tear-label">{tear.tearId.slice(-6)}</div>

                {selected ? (
                  <div
                    className="cosmos-tear-panel"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <strong className="tear-id">{tear.tearId}</strong>
                    <p>{tear.text}</p>

                    <div className="cosmos-stats">
                      <span>{copy.energy} {Math.round(tear.energy)}</span>
                      <span>{copy.dryness} {Math.round(tear.dryness)}</span>
                      <span>{copy.contamination} {Math.round(tear.contamination)}</span>
                      <span>{copy.resonance} {tear.resonance}</span>
                      <span>{copy.resistance} {Math.round(tear.resistance)}</span>
                    </div>

                    <div className="cosmos-actions">
                      <button type="button" className="ghost-btn" onClick={() => handleResonate(tear.tearId)}>
                        {copy.resonate}
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => handleCleanse(tear.tearId)}>
                        {copy.cleanse}
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => handleShare(tear.tearId)}>
                        {copy.share}
                      </button>
                    </div>

                    {tear.state === 'dried' ? (
                      <div className="cosmos-dried-tag">{copy.dried}</div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TearCosmos
