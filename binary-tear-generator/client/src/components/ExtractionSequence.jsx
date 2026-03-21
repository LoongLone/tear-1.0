import TearDrop from './TearDrop'

const COPY = {
  en: {
    extracting: {
      title: 'Extraction in progress...',
      copy: 'The chamber is stripping language from the signal.',
    },
    glitch: {
      title: 'Signal instability',
      copy: 'Residual syntax is breaking before meaning can remain.',
    },
    compress: {
      title: 'Compression',
      copy: 'The confession is collapsing into a singular hostile point.',
    },
    forming: {
      title: 'Vessel generation',
      copy: 'The surviving fragment is condensing into a temporary body.',
    },
    dropping: {
      title: 'Descent',
      copy: 'The tear is falling through a secondary liturgy.',
    },
    sea: {
      title: 'Ingress',
      copy: 'The tear has entered the shared sea. It no longer belongs to you.',
    },
  },
  zh: {
    extracting: {
      title: '正在抽取...',
      copy: '腔体正在把语言从信号中剥离出去。',
    },
    glitch: {
      title: '信号失稳',
      copy: '残留语法正在崩解，意义还来不及停留。',
    },
    compress: {
      title: '压缩中',
      copy: '这段表达正在坍缩成一个敌意的点。',
    },
    forming: {
      title: '容器生成',
      copy: '幸存下来的碎片，正在凝结成一具临时身体。',
    },
    dropping: {
      title: '下坠',
      copy: '泪滴正在穿过一层次级仪式。',
    },
    sea: {
      title: '入海',
      copy: '这滴泪已经进入共享泪海，它不再属于你。',
    },
  },
}

function ExtractionSequence({
  stage,
  text,
  tearData,
  emotionColor,
  compact = false,
  language = 'en',
}) {
  const meta = COPY[language][stage] || COPY[language].forming
  const bits = (tearData?.binary || '')
    .slice(0, compact ? 18 : 28)
    .split('')
    .map((bit, index) => ({
      bit,
      id: `${bit}-${index}`,
      x: Math.cos((index / 24) * Math.PI * 2) * (compact ? 76 : 116),
      y: Math.sin((index / 24) * Math.PI * 2) * (compact ? 58 : 88),
      delay: `${(index % 7) * 70}ms`,
    }))

  const showTear = compact || ['forming', 'dropping', 'sea'].includes(stage)

  return (
    <main className={`extraction-sequence stage-${stage} ${compact ? 'compact' : ''}`}>
      {!compact ? (
        <>
          <div className="sequence-flash" />
          <div className="sequence-ritual-grid" />
          <div className="sequence-ritual-circle seq-circle-a" />
          <div className="sequence-ritual-circle seq-circle-b" />
          <div className="sequence-ritual-crosshair" />
        </>
      ) : null}

      <div className="sequence-noise" />

      {!compact ? (
        <div className="sequence-copy cult-sequence-copy">
          <p className="section-kicker">
            {language === 'zh' ? '抽取电影 / 第一层' : 'Extraction cinema / Layer 01'}
          </p>
          <h2>{meta.title}</h2>
          <p>{meta.copy}</p>
        </div>
      ) : null}

      <div className="sequence-chamber cult-sequence-chamber">
        <div className="sequence-text-shell">
          <div className="sequence-text-orbit orbit-a" />
          <div className="sequence-text-orbit orbit-b" />
          <p className="sequence-text">{text}</p>
          <div className="sequence-core" />

          {bits.length > 0 ? (
            <div className="sequence-bits" aria-hidden="true">
              {bits.map((item) => (
                <span
                  key={item.id}
                  style={{
                    '--bit-x': `${item.x}px`,
                    '--bit-y': `${item.y}px`,
                    '--bit-delay': item.delay,
                  }}
                >
                  {item.bit}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="sequence-tear-zone">
          <div className="sequence-drop-trail" />
          <div className="sequence-impact-glow" />
          <div className="sequence-secondary-halo" />

          {showTear ? (
            <div className="sequence-tear-vessel">
              <div className="tear-vessel-rim" />
              <div className="tear-vessel-haze" />
              <TearDrop
                binaryString={tearData?.binary || ''}
                emotionColor={emotionColor}
              />
            </div>
          ) : null}

          <div className="sequence-ripple ripple-a" />
          <div className="sequence-ripple ripple-b" />
          <div className="sequence-ripple ripple-c" />

          {!compact ? (
            <div className="sequence-sea cult-sequence-sea">
              <span />
              <span />
              <span />
              <i className="sea-shine" />
              <i className="sea-mark sea-mark-a" />
              <i className="sea-mark sea-mark-b" />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default ExtractionSequence
