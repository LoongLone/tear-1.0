import { useState } from 'react'

const COPY = {
  en: {
    kicker: 'TEARS:// entry protocol',
    title: 'This system extracts emotion.',
    line1: 'Once admitted, it cannot be retrieved whole.',
    line2: 'A part of you will remain inside the archive.',
    line3: 'Proceed?',
    yes: 'ENTER',
    leave: 'LEAVE',
    hoverYes: 'Consent recorded. The chamber is unfolding.',
    hoverLeave: 'Exit is still possible. Recovery is not.',
    idle: 'Every entry leaves a residue behind.',
  },
  zh: {
    kicker: 'TEARS:// 进入协议',
    title: '这个系统会抽取你的情绪。',
    line1: '一旦进入档案，它就不会完整返回。',
    line2: '你会有一部分，被留在里面。',
    line3: '要继续吗？',
    yes: '进入',
    leave: '离开',
    hoverYes: '同意已记录。腔体正在展开。',
    hoverLeave: '你仍然可以离开，但已经无法真正复原。',
    idle: '每一次进入，都会留下残留物。',
  },
}

function Gate({ onEnter, language, setLanguage }) {
  const [hover, setHover] = useState(null)
  const copy = COPY[language]

  return (
    <div className={`gate-shell ${hover ? `gate-hover-${hover}` : ''}`}>
      <div className="gate-atmosphere" />
      <div className="gate-grid" />
      <div className="gate-vignette" />

      <div className="lang-toggle">
        <button
          type="button"
          className={language === 'en' ? 'ghost-btn active' : 'ghost-btn'}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>
        <button
          type="button"
          className={language === 'zh' ? 'ghost-btn active' : 'ghost-btn'}
          onClick={() => setLanguage('zh')}
        >
          中文
        </button>
      </div>

      <div className="gate-content">
        <p className="gate-kicker">{copy.kicker}</p>
        <h1 className="gate-title">{copy.title}</h1>
        <p className="gate-line">{copy.line1}</p>
        <p className="gate-line gate-line-dim">{copy.line2}</p>
        <p className="gate-line gate-line-dim">{copy.line3}</p>

        <div className="gate-actions">
          <button
            type="button"
            className={`gate-button ${hover === 'yes' ? 'active' : ''}`}
            onMouseEnter={() => setHover('yes')}
            onMouseLeave={() => setHover(null)}
            onClick={onEnter}
          >
            {copy.yes}
          </button>

          <button
            type="button"
            className={`gate-button gate-button-leave ${hover === 'leave' ? 'active' : ''}`}
            onMouseEnter={() => setHover('leave')}
            onMouseLeave={() => setHover(null)}
            onClick={() => window.history.back()}
          >
            {copy.leave}
          </button>
        </div>

        <p className={`gate-status ${hover ? 'visible' : ''}`}>
          {hover === 'yes' ? copy.hoverYes : hover === 'leave' ? copy.hoverLeave : copy.idle}
        </p>
      </div>
    </div>
  )
}

export default Gate
