import TearDrop from './TearDrop'

const stageMeta = {
  extracting: {
    title: 'Extracting...',
    copy: 'The chamber is stripping the text down to a readable emotional signal.',
  },
  glitch: {
    title: 'Signal Instability',
    copy: 'Language is distorting. Meaning is being cut away from form.',
  },
  compress: {
    title: 'Compression',
    copy: 'The confession is collapsing into a single luminous point.',
  },
  forming: {
    title: 'Tear Generation',
    copy: 'A vessel is condensing around the extracted emotional residue.',
  },
  dropping: {
    title: 'Descent',
    copy: 'The newly formed tear is dropping toward the shared sea.',
  },
  sea: {
    title: 'Sea Ingress',
    copy: 'The tear has entered the public ocean and begins to merge with others.',
  },
}

function ExtractionSequence({ stage, text, tearData, emotionColor }) {
  const meta = stageMeta[stage] || stageMeta.extracting
  const bits = (tearData?.binary || '')
    .slice(0, 20)
    .split('')
    .map((bit, index) => ({
      bit,
      id: `${bit}-${index}`,
      x: Math.cos((index / 20) * Math.PI * 2) * (110 + (index % 3) * 18),
      y: Math.sin((index / 20) * Math.PI * 2) * (82 + (index % 4) * 12),
      delay: `${(index % 6) * 70}ms`,
    }))

  const showTear = ['forming', 'dropping', 'sea'].includes(stage)

  return (
    <main className={`extraction-sequence stage-${stage}`}>
      <div className="sequence-flash" />
      <div className="sequence-noise" />

      <div className="sequence-copy">
        <p className="section-kicker">Extraction Cinema / Layer 01</p>
        <h2>{meta.title}</h2>
        <p>{meta.copy}</p>
      </div>

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
          <div className="sequence-sea">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </main>
  )
}

export default ExtractionSequence
