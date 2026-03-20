const COPY = {
  en: {
    signalMirror: 'Signal mirror',
    standby: 'standby',
    remaining: 'the remaining 30% will be lost to the system',
    retention: 'Retention 70%',
    shortcut: 'Cmd/Ctrl + Enter to extract',
    button: 'EXTRACT',
  },
  zh: {
    signalMirror: '信号镜面',
    standby: '静默待机',
    remaining: '剩下的 30% 会被系统吞没',
    retention: '保留率 70%',
    shortcut: 'Cmd/Ctrl + Enter 抽取',
    button: '开始抽取',
  },
}

function ExtractionInput({
  value,
  onChange,
  onSubmit,
  placeholder = '...',
  disabled = false,
  language = 'en',
}) {
  const copy = COPY[language] || COPY.en
  const normalized = value.replace(/\s+/g, ' ').trim()
  const keepCount = normalized ? Math.max(1, Math.floor(normalized.length * 0.7)) : 0
  const retained = normalized.slice(0, keepCount)
  const discarded = normalized
    .slice(keepCount)
    .split('')
    .map((char, index) => {
      if (char === ' ') return ' '
      return index % 3 === 0 ? '░' : index % 2 === 0 ? '0' : '1'
    })
    .join('')

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !disabled) {
      event.preventDefault()
      onSubmit(value)
    }
  }

  return (
    <div className="extract-panel">
      <div className="extract-overlay cool-panel">
        <div className="extract-head">
          <span>{copy.signalMirror}</span>
          <span>{normalized ? `${normalized.length} chars` : copy.standby}</span>
        </div>

        <div className="extract-preview-shell">
          <p className={`extract-preview ${retained ? 'filled' : 'placeholder'}`}>
            {retained || placeholder}
          </p>
          <p className={`extract-loss ${discarded ? 'visible' : ''}`}>
            {discarded || copy.remaining}
          </p>
        </div>

        <div className="extract-footer">
          <span>{copy.retention}</span>
          <span>{copy.shortcut}</span>
        </div>
      </div>

      <textarea
        className="extract-editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows="6"
        aria-label="emotion extraction input"
        spellCheck={false}
      />

      <button
        type="button"
        className="generate-btn extract-submit"
        onClick={() => onSubmit(value)}
        disabled={disabled}
      >
        {copy.button}
      </button>
    </div>
  )
}

export default ExtractionInput
