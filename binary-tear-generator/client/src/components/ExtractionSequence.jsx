import TearDrop from './TearDrop'

const COPY = {
  en: {
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
  },
  zh: {
    extracting: {
      title: '正在抽取不稳定模式...',
      copy: '腔体正在把语言从你的信号里剥离出去。',
    },
    glitch: {
      title: '信号开始失稳',
      copy: '正在解析情绪残渣。意义还没来得及留下，形式已经先一步碎裂。',
    },
    compress: {
      title: '压缩中',
      copy: '这段表达正在坍缩，最后会被压成一个危险的点。',
    },
    forming: {
      title: '泪滴正在形成',
      copy: '幸存下来的那部分，正在凝结成新的容器。',
    },
    dropping: {
      title: '下坠',
      copy: '新生成的泪滴，正坠向公共身体。',
    },
    sea: {
      title: '正在入海',
      copy: '这滴泪已进入共享泪海，它不再属于你。',
    },
  },
}

function ExtractionSequence({
  stage,
  text,
  tearData,
  emotionColor,
  language = 'en',
  compact = false,
}) {
  const dictionary = COPY[language] || COPY.en
  const meta = dictionary[stage] || dictionary.forming
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
          <p className="section-kicker">
            {language === 'zh' ? '提取电影 / 第一层' : 'Extraction cinema / Layer 01'}
          </p>
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
          <div className="sequence-drop-trail" />
          <div className="sequence-impact-glow" />

          {showTear ? (
            <div className="sequence-tear-vessel">
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
            <div className="sequence-sea">
              <span />
              <span />
              <span />
              <i className="sea-shine" />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default ExtractionSequence
