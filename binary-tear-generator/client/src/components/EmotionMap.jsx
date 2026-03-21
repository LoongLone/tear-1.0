import { useEffect, useMemo, useState } from 'react'

const COPY = {
  en: {
    kicker: 'Observation band / live residue',
    title: 'The world is still crying.',
    crying: 'is crying',
  },
  zh: {
    kicker: '观测条 / 实时残留',
    title: '世界仍在哭泣。',
    crying: '正在哭泣',
  },
}

function EmotionMap({ observations = [], language = 'en' }) {
  const copy = COPY[language] || COPY.en
  const [index, setIndex] = useState(0)

  const lines = useMemo(() => {
    if (!observations.length) return []
    return observations.map((item) => ({
      id: item.id,
      text:
        language === 'zh'
          ? `${item.city}${copy.crying}`
          : `${item.city} ${copy.crying}`,
      emotion: item.emotion,
    }))
  }, [observations, language, copy.crying])

  useEffect(() => {
    if (lines.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % lines.length)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [lines])

  const active = lines[index]

  if (!active) return null

  return (
    <section className="observation-band">
      <div className="observation-band-copy">
        <p className="section-kicker">{copy.kicker}</p>
        <h3>{copy.title}</h3>
      </div>

      <div className={`observation-stream emotion-${active.emotion || 'neutral'}`}>
        <span className="observation-dot" />
        <strong>{active.text}</strong>
      </div>
    </section>
  )
}

export default EmotionMap
