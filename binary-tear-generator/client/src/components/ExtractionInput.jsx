function ExtractionInput({
  value,
  onChange,
  onSubmit,
  placeholder = '...',
  disabled = false,
}) {
  const trimmedLength = value.trim().length
  const preview =
    value.length > 180 ? `${value.slice(0, 180).trimEnd()}...` : value || placeholder

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !disabled) {
      event.preventDefault()
      onSubmit(value)
    }
  }

  return (
    <div className="extract">
      <div className="extract-frame">
        <div className="extract-frame-header">
          <span>Signal Mirror</span>
          <span>{trimmedLength > 0 ? `${trimmedLength} chars` : 'standby'}</span>
        </div>

        <p className={`extract-preview ${value ? 'filled' : 'placeholder'}`}>
          {preview}
        </p>

        <div className="extract-frame-footer">
          {trimmedLength > 0
            ? 'Cmd/Ctrl + Enter 也可以直接提取'
            : '输入一段情绪，或使用下方语音按钮'}
        </div>
      </div>

      <textarea
        className="extract-editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows="5"
        aria-label="emotion extraction input"
        spellCheck={false}
      />

      <button
        type="button"
        className="generate-btn extract-submit"
        onClick={() => onSubmit(value)}
        disabled={disabled}
      >
        EXTRACT
      </button>
    </div>
  )
}

export default ExtractionInput
