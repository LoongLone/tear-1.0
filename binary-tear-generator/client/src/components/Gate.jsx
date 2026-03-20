import { useState } from 'react'

const hoverCopy = {
  yes: 'Consent accepted. Layer 01 is opening.',
  leave: 'Exit vector armed. You can still turn back.',
}

function Gate({ onEnter }) {
  const [hover, setHover] = useState(null)

  return (
    <div className="gate-shell">
      <div className="gate-atmosphere" />
      <div className="gate-grid" />

      <div className="gate-content">
        <p className="gate-kicker">Entry Protocol / Emotional Extraction</p>
        <h1 className="gate-title">This system extracts emotion.</h1>
        <p className="gate-line gate-line-dim">
          Are you willing to lose a part of yourself?
        </p>

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
            onClick={() => {
              window.location.href = 'https://google.com'
            }}
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
