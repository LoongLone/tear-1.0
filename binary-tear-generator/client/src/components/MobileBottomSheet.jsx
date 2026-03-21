const COPY = {
  en: {
    resonate: 'resonate',
    contamination: 'contamination',
    systemClass: 'system class',
    familiar: 'familiar trace',
    publicSea: 'public sea',
    localResidue: 'local residue',
    unknownSource: 'Unknown Source',
  },
  zh: {
    resonate: '共振',
    contamination: '污染值',
    systemClass: '系统类别',
    familiar: '熟悉残留',
    publicSea: '公共泪海',
    localResidue: '本地残留',
    unknownSource: '无名来源',
  },
}

function MobileBottomSheet({
  tear,
  language = 'en',
  residualSignature = null,
  onResonate,
  onClose,
}) {
  const copy = COPY[language]

  if (!tear) return null

  return (
    <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()}>
      <div className="mobile-bottom-sheet-handle" />
      <div className="mobile-bottom-sheet-header">
        <span className="tear-id">{tear.tearId}</span>
        <button type="button" className="ghost-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <p className="mobile-bottom-sheet-text">{tear.text}</p>

      <div className="mobile-bottom-sheet-meta">
        <span>{tear.emotion}</span>
        <span>
          {tear.source === 'remote'
            ? copy.publicSea
            : tear.systemGenerated
              ? tear.name || copy.unknownSource
              : copy.localResidue}
        </span>
      </div>

      {tear.isFamiliar ? (
        <div className="mobile-bottom-sheet-meta secondary">
          <span>{copy.familiar}</span>
          <span>{residualSignature?.id?.slice(0, 8)}</span>
        </div>
      ) : null}

      {tear.systemGenerated ? (
        <div className="mobile-bottom-sheet-meta secondary">
          <span>{copy.systemClass}</span>
          <span>{tear.sourceType || 'synthetic'}</span>
        </div>
      ) : null}

      <div className="mobile-bottom-sheet-meta secondary">
        <span>{copy.contamination}</span>
        <span>{Math.round((tear.contamination || 0) * 100)}%</span>
      </div>

      <button
        type="button"
        className="generate-btn mobile-resonate-btn"
        onClick={onResonate}
      >
        {copy.resonate} {tear.likes || 0}
      </button>
    </div>
  )
}

export default MobileBottomSheet
