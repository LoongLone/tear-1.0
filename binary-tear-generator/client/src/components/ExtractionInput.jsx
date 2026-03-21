import { useMemo } from 'react'

const COPY = {
  en: {
    signalMirror: 'Signal mirror',
    standby: 'standby',
    remaining: 'the remaining 30% will be lost to the system',
    retention: 'Retention 70%',
    shortcut: 'Cmd/Ctrl + Enter to extract',
    button: 'EXTRACT',
    fractureLayer: 'Fracture layer',
    unstableText: 'unstable text',
    strippedLayer: 'Stripped layer',
    residualNoise: 'residual noise',
  },
  zh: {
    signalMirror: '信号镜面',
    standby: '静默待机',
    remaining: '剩下的 30% 会被系统吞没',
    retention: '保留率 70%',
    shortcut: 'Cmd/Ctrl + Enter 抽取',
    button: '开始抽取',
    fractureLayer: '裂解层',
    unstableText: '不稳定文本',
    strippedLayer: '剥离层',
    residualNoise: '残余噪声',
  },
}

function scrambleLoss(text) {
  return text
    .split('')
    .map((char, index) => {
      if (char === ' ') return ' '
      if (/[，。！？；：“”‘’、,.!?;:'"()[\]{}]/.test(char)) return char
      return index % 5 === 0 ? '░' : index % 3 === 0 ? '1' : index % 2 === 0 ? '0' : '¦'
    })
    .join('')
}

function createFragments(text) {
  if (!text) return []
  const chars = text.split('')
  const size = Math.max(4, Math.floor(chars.length / 4))
  const result = []
  for (let i = 0; i < chars.length; i += size) {
    result.push(chars.slice(i, i + size).join(''))
  }
  return result.slice(0, 4)
}

function ExtractionInput({
  value,
  onChange,
  onSubmit,
  placeholder = '...',
  disabled = false,
  language = 'en',
}) {
  const copy = COPY[language]
  const normalized = value.replace(/\s+/g, ' ').trim()
  const keepCount = normalized ? Math.max(1, Math.floor(normalized.length * 0.7)) : 0
  const retained = normalized.slice(0, keepCount)
  const discardedRaw = normalized.slice(keepCount)
  const discarded = scrambleLoss(discardedRaw)

  const fractureFragments = useMemo(() => {
    return createFragments(retained || placeholder)
  }, [retained, placeholder])

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !disabled) {
      event.preventDefault()
      onSubmit(value)
    }
  }

  return (
    <div className="extract-panel ritual-input-panel unified-mobile-input">
      <div className="extract-overlay cool-panel ritual-extract-shell unified-input-shell">
        <div className="ritual-grid" />
        <div className="ritual-crosshair" />
        <div className="ritual-orbit ritual-orbit-a" />
        <div className="ritual-orbit ritual-orbit-b" />
        <div className="ritual-orbit ritual-orbit-c" />

        <div className="extract-head ritual-head">
          <span>{copy.signalMirror}</span>
          <span>{normalized ? `${normalized.length} chars` : copy.standby}</span>
        </div>

        <div className="unified-preview-stack">
          <div className="ritual-label-row">
            <span>{copy.fractureLayer}</span>
            <span>{copy.unstableText}</span>
          </div>

          <div className="extract-preview-shell ritual-preview-shell compact-preview-shell">
            <p className={`extract-preview ritual-preview ${retained ? 'filled' : 'placeholder'}`}>
              {retained || placeholder}
            </p>

            <div className="ritual-fragments" aria-hidden="true">
              {fractureFragments.map((fragment, index) => (
                <span
                  key={`${fragment}-${index}`}
                  className={`ritual-fragment ritual-fragment-${index + 1}`}
                >
                  {fragment}
                </span>
              ))}
            </div>
          </div>

          <div className="ritual-label-row second-row">
            <span>{copy.strippedLayer}</span>
            <span>{copy.residualNoise}</span>
          </div>

          <div className="ritual-loss-shell compact-loss-shell">
            <p className={`extract-loss ritual-loss ${discarded ? 'visible' : ''}`}>
              {discarded || copy.remaining}
            </p>
          </div>
        </div>

        <div className="unified-editor-zone">
          <div className="ritual-editor-shell">
            <div className="ritual-editor-frame" />
            <textarea
              className="extract-editor ritual-editor"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows="4"
              aria-label="emotion extraction input"
              spellCheck={false}
            />
          </div>

          <div className="extract-footer ritual-footer">
            <span>{copy.retention}</span>
            <span>{copy.shortcut}</span>
          </div>

          <button
            type="button"
            className="generate-btn extract-submit ritual-submit"
            onClick={() => onSubmit(value)}
            disabled={disabled}
          >
            <span>{copy.button}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExtractionInput
