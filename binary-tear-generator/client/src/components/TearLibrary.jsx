import { useEffect, useMemo, useRef, useState } from 'react'
import LiquidTearNode from './LiquidTearNode'
import MobileBottomSheet from './MobileBottomSheet'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const COPY = {
  en: {
    kicker: 'Shared body / unstable field',
    title: 'What survives extraction continues to drift here.',
    latest: 'Latest',
    resonant: 'Resonant',
    remoteFail: 'Remote sea unreachable. Local and synthetic residues are now visible.',
    scanning: 'Scanning the public sea...',
    publicSea: 'public sea',
    localResidue: 'local residue',
    unknownSource: 'Unknown Source',
    noTears: 'No visible tears yet.',
    resonate: 'resonate',
    familiar: 'familiar trace',
    contamination: 'contamination',
    holdHint: 'hold to resonate',
    more: 'open archive card',
  },
  zh: {
    kicker: '共享身体 / 不稳定水域',
    title: '所有幸存下来的情绪，都会继续在这里漂浮。',
    latest: '最新',
    resonant: '高共振',
    remoteFail: '远端泪海暂时失联。当前展示本地残留与系统异常体。',
    scanning: '正在扫描公共泪海...',
    publicSea: '公共泪海',
    localResidue: '本地残留',
    unknownSource: '无名来源',
    noTears: '此刻还没有可见泪滴。',
    resonate: '共振',
    familiar: '熟悉残留',
    contamination: '污染值',
    holdHint: '长按共振',
    more: '展开档案卡',
  },
}

function createNodeLayout(index, isMobile) {
  if (isMobile) {
    const pattern = [
      { x: 72, y: 10 },
      { x: 55, y: 18 },
      { x: 72, y: 28 },
      { x: 55, y: 38 },
      { x: 72, y: 49 },
      { x: 55, y: 61 },
      { x: 72, y: 74 },
      { x: 55, y: 87 },
    ]
    const base = pattern[index % pattern.length]
    const cycle = Math.floor(index / pattern.length)

    return {
      x: base.x + ((index % 3) - 1) * 1.6,
      y: base.y + cycle * 82,
      size: 70 + ((index * 9) % 26),
      drift: 4 + (index % 3) * 2,
      delay: (index % 7) * 0.35,
      duration: 7.8 + (index % 5) * 1.2,
      blur: 10 + (index % 4) * 3,
      opacity: 0.16 + (index % 4) * 0.05,
      z: 2 + (index % 4),
    }
  }

  const baseX = 14 + ((index * 11.4) % 74)
  const baseY = 12 + ((index * 15.8) % 70)
  return {
    x: Math.min(baseX, 88),
    y: Math.min(baseY, 84),
    size: 84 + ((index * 17) % 86),
    drift: 8 + (index % 5) * 4,
    delay: (index % 9) * 0.6,
    duration: 10 + (index % 7) * 2.2,
    blur: 14 + (index % 6) * 6,
    opacity: 0.18 + (index % 5) * 0.06,
    z: 2 + (index % 5),
  }
}

function buildLinks(nodes, activeNodeId = null) {
  const links = []
  const maxDistance = 18

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i]
      const b = nodes[j]
      const dx = b.layout.x - a.layout.x
      const dy = b.layout.y - a.layout.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < maxDistance) {
        const midX = (a.layout.x + b.layout.x) / 2
        const midY = (a.layout.y + b.layout.y) / 2
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI
        const activated =
          activeNodeId &&
          (a.tear.tearId === activeNodeId || b.tear.tearId === activeNodeId)

        links.push({
          id: `${a.tear.tearId}-${b.tear.tearId}`,
          x: midX,
          y: midY,
          width: distance,
          angle,
          opacity: Number((0.04 + (1 - distance / maxDistance) * 0.16).toFixed(3)),
          activated,
        })
      }
    }
  }

  return links.slice(0, 20)
}

function computeContamination(tear, activeNodeId, nodes) {
  if (tear.corrupted) return 1
  const current = nodes.find((node) => node.tear.tearId === tear.tearId)
  if (!current) return 0

  let contamination = 0
  nodes.forEach((node) => {
    if (node.tear.tearId === tear.tearId) return
    if (!node.tear.corrupted) return

    const dx = node.layout.x - current.layout.x
    const dy = node.layout.y - current.layout.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 14) contamination = Math.max(contamination, 1 - distance / 14)
  })

  if (activeNodeId) {
    const active = nodes.find((node) => node.tear.tearId === activeNodeId)
    if (active && active.tear.corrupted) {
      const dx = active.layout.x - current.layout.x
      const dy = active.layout.y - current.layout.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 20) contamination = Math.max(contamination, 0.3 + (1 - distance / 20) * 0.5)
    }
  }

  return Number(Math.min(contamination, 1).toFixed(2))
}

function getInlinePlacement(layout, isMobile) {
  if (!isMobile) return 'align-right place-center'

  const horizontal =
    layout.x > 66 ? 'align-left' : layout.x < 42 ? 'align-right' : 'align-center'

  const vertical =
    layout.y < 18 ? 'place-below' : layout.y > 82 ? 'place-above' : 'place-center'

  return `${horizontal} ${vertical}`
}

function TearLibrary({
  language = 'en',
  featuredTear,
  localTears = [],
  refreshKey = 0,
  residualSignature = null,
  isMobile = false,
  residualMarks = [],
}) {
  const copy = COPY[language]
  const [tears, setTears] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('latest')
  const [remoteError, setRemoteError] = useState('')
  const [activeNode, setActiveNode] = useState(null)
  const [selectedTear, setSelectedTear] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const holdTimerRef = useRef(null)

  const endpoint =
    filter === 'latest'
      ? `${API_URL}/api/tears/latest`
      : `${API_URL}/api/tears/hot`

  useEffect(() => {
    const fetchTears = async () => {
      setLoading(true)
      try {
        const response = await fetch(endpoint)
        if (!response.ok) throw new Error(`fetch failed with status ${response.status}`)
        const data = await response.json()
        setTears(Array.isArray(data) ? data : [])
        setRemoteError('')
      } catch (error) {
        console.error('fetch tears failed:', error)
        setRemoteError(copy.remoteFail)
      } finally {
        setLoading(false)
      }
    }

    fetchTears()
  }, [copy.remoteFail, endpoint, refreshKey])

  const allTears = useMemo(() => {
    const merged = [...tears, ...localTears]
    const map = new Map()

    merged.forEach((tear) => {
      if (!tear?.tearId) return
      if (!map.has(tear.tearId)) {
        map.set(tear.tearId, {
          ...tear,
          source: tear.source || (tear._id ? 'remote' : 'local'),
          likes: tear.likes || 0,
          isFamiliar: residualSignature?.lastTearId
            ? tear.tearId === residualSignature.lastTearId ||
              tear.emotion === residualSignature.dominantEmotion
            : false,
        })
      }
    })

    const combined = Array.from(map.values())
      .sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))
      .slice(0, isMobile ? 12 : 36)

    if (featuredTear && !combined.some((item) => item.tearId === featuredTear.tearId)) {
      combined.unshift(featuredTear)
    }

    return combined
  }, [featuredTear, localTears, tears, residualSignature, isMobile])

  const featured = featuredTear || allTears[0]
  const field = allTears.filter((tear) => tear.tearId !== featured?.tearId)

  const renderedNodes = useMemo(
    () =>
      field.map((tear, index) => ({
        tear,
        layout: createNodeLayout(index, isMobile),
      })),
    [field, isMobile]
  )

  const enrichedNodes = useMemo(() => {
    return renderedNodes.map((node) => ({
      ...node,
      contamination: computeContamination(node.tear, activeNode, renderedNodes),
    }))
  }, [renderedNodes, activeNode])

  const links = useMemo(() => buildLinks(enrichedNodes, activeNode), [enrichedNodes, activeNode])

  const handleLike = async (tear) => {
    const targetId = tear._id || tear.tearId

    setTears((current) => {
      const hasMatch = current.some((item) => (item._id || item.tearId) === targetId)
      if (!hasMatch) {
        return [
          {
            ...tear,
            likes: (tear.likes || 0) + 1,
            source: tear.source || (tear._id ? 'remote' : 'local'),
          },
          ...current,
        ]
      }

      return current.map((item) =>
        (item._id || item.tearId) === targetId
          ? { ...item, likes: (item.likes || 0) + 1 }
          : item
      )
    })

    setSelectedTear((current) =>
      current && current.tearId === tear.tearId
        ? { ...current, likes: (current.likes || 0) + 1 }
        : current
    )

    if (!tear._id) return

    try {
      const response = await fetch(`${API_URL}/api/tears/${tear._id}/like`, { method: 'POST' })
      if (!response.ok) throw new Error(`like failed with status ${response.status}`)
    } catch (error) {
      console.error('like failed:', error)
      setRemoteError(copy.remoteFail)
    }
  }

  const openNode = (tear, contamination) => {
    setActiveNode(tear.tearId)
    setSelectedTear({ ...tear, contamination })
    setSheetOpen(false)
  }

  const startHold = (tear, contamination) => {
    if (!isMobile) return
    holdTimerRef.current = window.setTimeout(() => {
      handleLike({ ...tear, contamination })
    }, 420)
  }

  const clearHold = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  return (
    <section className={`tear-library immersive-library cult-archive ${isMobile ? 'mobile-archive-library' : ''}`}>
      <div className="library-topline">
        <div>
          <p className="section-kicker">{copy.kicker}</p>
          <h3>{copy.title}</h3>
        </div>

        <div className="library-controls">
          <button type="button" className={filter === 'latest' ? 'ghost-btn active' : 'ghost-btn'} onClick={() => setFilter('latest')}>
            {copy.latest}
          </button>
          <button type="button" className={filter === 'hot' ? 'ghost-btn active' : 'ghost-btn'} onClick={() => setFilter('hot')}>
            {copy.resonant}
          </button>
        </div>
      </div>

      {isMobile ? <div className="mobile-archive-hint">{copy.holdHint}</div> : null}
      {remoteError ? <div className="library-status">{remoteError}</div> : null}
      {loading && allTears.length === 0 ? <div className="library-status">{copy.scanning}</div> : null}

      <div
        className="tear-sea-field liquid-sea-field high-cult-sea"
        onClick={() => {
          setActiveNode(null)
          if (isMobile) {
            setSelectedTear(null)
            setSheetOpen(false)
          }
        }}
      >
        <div className="sea-depth-glow" />
        <div className="sea-fog-layer fog-a" />
        <div className="sea-fog-layer fog-b" />
        <div className="sea-fog-layer fog-c" />
        <div className="sea-runic-grid" />

        <div className="sea-link-layer" aria-hidden="true">
          {links.map((link) => (
            <span
              key={link.id}
              className={`sea-link ${link.activated ? 'is-activated' : ''}`}
              style={{
                '--link-x': `${link.x}%`,
                '--link-y': `${link.y}%`,
                '--link-width': `${link.width}%`,
                '--link-angle': `${link.angle}deg`,
                '--link-opacity': link.opacity,
              }}
            />
          ))}
        </div>

        <div className="residual-mark-layer" aria-hidden="true">
          {residualMarks.map((mark) => (
            <span
              key={mark.id}
              className={`residual-mark ${mark.emotion === 'corrupted' ? 'is-corrupted' : ''}`}
              style={{
                '--mark-x': `${mark.x}%`,
                '--mark-y': `${mark.y}%`,
              }}
            />
          ))}
        </div>

        {enrichedNodes.length > 0 ? (
          enrichedNodes.map(({ tear, layout, contamination }) => (
            <div
              key={tear._id || tear.tearId}
              className={`liquid-node ${activeNode === tear.tearId ? 'is-active' : ''} ${contamination > 0.34 ? 'is-infected' : ''}`}
              style={{
                '--node-x': `${layout.x}%`,
                '--node-y': `${layout.y}%`,
                '--node-size': `${layout.size}px`,
                '--node-drift': `${layout.drift}px`,
                '--node-delay': `${layout.delay}s`,
                '--node-duration': `${layout.duration}s`,
                '--node-blur': `${layout.blur}px`,
                '--node-opacity': layout.opacity,
                '--node-z': layout.z,
                '--contamination': contamination,
              }}
            >
              <LiquidTearNode
                tear={tear}
                active={activeNode === tear.tearId}
                onClick={(event) => {
                  event.stopPropagation()
                  openNode(tear, contamination)
                }}
              >
                {!isMobile && activeNode === tear.tearId ? (
                  <div className="liquid-node-info">
                    <span className="tear-id">{tear.tearId}</span>
                    <p>{tear.text.length > 74 ? `${tear.text.slice(0, 74)}...` : tear.text}</p>
                    <div className="liquid-node-meta">
                      <span>{tear.emotion}</span>
                      <span>
                        {tear.source === 'remote'
                          ? copy.publicSea
                          : tear.systemGenerated
                            ? tear.name || copy.unknownSource
                            : copy.localResidue}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="resonance-btn liquid-resonance-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleLike({ ...tear, contamination })
                      }}
                    >
                      {copy.resonate} {tear.likes || 0}
                    </button>
                  </div>
                ) : null}

                {isMobile && activeNode === tear.tearId ? (
                  <div
                    className={`mobile-inline-tear-info ${getInlinePlacement(layout, isMobile)}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <span className="tear-id">{tear.tearId}</span>
                    <p>{tear.text.length > 42 ? `${tear.text.slice(0, 42)}...` : tear.text}</p>
                    <div className="mobile-inline-meta">
                      <span>{tear.emotion}</span>
                      <span>{Math.round(contamination * 100)}%</span>
                    </div>
                    <button
                      type="button"
                      className="ghost-btn mini-archive-btn"
                      onClick={() => setSheetOpen(true)}
                    >
                      {copy.more}
                    </button>
                  </div>
                ) : null}
              </LiquidTearNode>

              {isMobile ? (
                <div
                  className="mobile-node-touch-layer"
                  onTouchStart={() => startHold(tear, contamination)}
                  onTouchEnd={clearHold}
                  onTouchCancel={clearHold}
                  onMouseDown={() => startHold(tear, contamination)}
                  onMouseUp={clearHold}
                  onMouseLeave={clearHold}
                  onClick={(event) => {
                    event.stopPropagation()
                    openNode(tear, contamination)
                  }}
                />
              ) : null}
            </div>
          ))
        ) : (
          <div className="library-status">{copy.noTears}</div>
        )}

        {isMobile && sheetOpen ? (
          <MobileBottomSheet
            tear={selectedTear}
            language={language}
            residualSignature={residualSignature}
            onResonate={() => selectedTear && handleLike(selectedTear)}
            onClose={() => setSheetOpen(false)}
          />
        ) : null}
      </div>
    </section>
  )
}

export default TearLibrary
