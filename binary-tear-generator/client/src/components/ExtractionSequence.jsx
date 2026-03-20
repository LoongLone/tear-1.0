import TearDrop from './TearDrop'

const stageMeta = {
  extracting: {
    title: 'Extracting unstable pattern...',
    copy: 'The chamber is stripping language from the signal.',
  },
  glitch: {
    title: 'Signal instability',
    copy: 'Parsing emotional residue. Form is breaking before meaning can remain.',
  },
  compress: {
    title: 'Compression',
    copy: 'The confession is collapsing into a single hostile point.',
  },
  forming: {
    title: 'Tear generation',
    copy: 'A vessel is condensing around the residue that survived.',
  },
  dropping: {
    title: 'Descent',
    copy: 'The newly formed tear is dropping toward the public body.',
  },
  sea: {
    title: 'Sea ingress',
    copy: 'The tear has entered the shared sea. It no longer belongs to you.',
  },
}

function ExtractionSequence({ stage, text, tearData, emotionColor, compact = false }) {
  const meta = stageMeta[stage] || stageMeta.forming
  const bits = (tearData?.binary || '')
    .slice(0, compact ? 16 : 24)
    .split('')
    .map((bit, index) => ({
      bit,
      id: `${bit}-${index}`,
      x: Math.cos((index / 20) * Math.PI * 2) * (compact ? 70 : 110),
      y: Math.sin((index / 20) * Math.PI * 2) * (compact ? 54 : 86),
      delay: `${(index % 6) * 80}ms`,
    }))

  const showTear = compact || ['forming', 'dropping', 'sea'].includes(stage)

  return (
    <main className={`extraction-sequence stage-${stage} ${compact ? 'compact' : ''}`}>
      {!compact ? <div className="sequence-flash" /> : null}
      <div className="sequence-noise" />

      {!compact ? (
        <div className="sequence-copy">
          <p className="section-kicker">Extraction cinema / Layer 01</p>
          <h2>{meta.title}</h2>
          <p>{meta.copy}</p>
        </div>
      ) : null}

      <div className="sequence-chamber">
        <div className="sequence-text-shell">
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
          {showTear ? (
            <div className="sequence-tear-vessel">
              <TearDrop
                binaryString={tearData?.binary || ''}
                emotionColor={emotionColor}
              />
            </div>
          ) : null}

          <div className="sequence-ripple" />
          {!compact ? (
            <div className="sequence-sea">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default ExtractionSequence
