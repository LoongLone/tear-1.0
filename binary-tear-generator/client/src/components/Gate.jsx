import { useState } from 'react'

const hoverCopy = {
  yes: 'Consent accepted. The archive is opening.',
  leave: 'Exit remains possible. Recovery does not.',
}

function Gate({ onEnter }) {
  const [hover, setHover] = useState(null)

  return (
    <div className={`gate-shell ${hover ? `gate-hover-${hover}` : ''}`}>
      <div className="gate-atmosphere" />
      <div className="gate-grid" />
      <div className="gate-vignette" />

      <div className="gate-content">
        <p className="gate-kicker">TEARS:// entry protocol</p>
        <h1 className="gate-title">This system extracts emotion.</h1>
        <p className="gate-line">Once processed, it cannot be retrieved.</p>
        <p className="gate-line gate-line-dim">You will lose something.</p>
        <p className="gate-line gate-line-dim">Proceed?</p>

        <div className="gate-actions">
          <button
            type="button"
            className={`gate-button ${hover === 'yes' ? 'active' : ''}`}
            onMouseEnter={() => setHover('yes')}
            onMouseLeave={() => setHover(null)}
            onClick={onEnter}
          >
            YES
          </button>

          <button
            type="button"
            className={`gate-button gate-button-leave ${hover === 'leave' ? 'active' : ''}`}
            onMouseEnter={() => setHover('leave')}
            onMouseLeave={() => setHover(null)}
            onClick={() => window.history.back()}
          >
            LEAVE
          </button>
        </div>

        <p className={`gate-status ${hover ? 'visible' : ''}`}>
          {hover ? hoverCopy[hover] : 'No archive entry is reversible once encoded.'}
        </p>
      </div>
    </div>
  )
}

export default Gate
