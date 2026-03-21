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
    anomaly: 'This tear should not exist.',
    density: 'density',
    unknownSource: 'Unknown Source',
    recoveredFragment: 'Recovered fragment',
    lost: 'lost to extraction',
    publicSea: 'public sea',
    localResidue: 'local residue',
    noTears: 'No visible tears yet.',
    resonate: 'resonate',
    systemClass: 'system class',
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
    anomaly: '这滴泪本不该存在。',
    density: '密度',
    unknownSource: '无名来源',
    recoveredFragment: '幸存碎片',
    lost: '已被提取吞没',
    publicSea: '公共泪海',
    localResidue: '本地残留',
    noTears: '此刻还没有可见泪滴。',
    resonate: '共振',
    systemClass: '系统类别',
    familiar: '熟悉残留',
    contamination: '污染值',
    holdHint: '长按共振',
    more: '展开档案卡',
  },
}

function createNodeLayout(index, isMobile) {
  if (isMobile) {
    const col = index % 2
    const row = Math.floor(index / 2)
    return {
      x: col === 0 ? 32 : 68,
      y: 12 + row * 12.6,
      size: 84 + ((index * 13) % 42),
      drift: 5 + (index % 4) * 3,
      delay: (index % 8) * 0.45,
      duration: 9 + (index % 6) * 1.8,
      blur: 12 + (index % 5) * 4,
      opacity: 0.2 + (index % 4) * 0.05,
      z: 2 + (index % 4),
    }
  }

  const baseX = 11 + ((index * 11.9) % 78)
  const baseY = 10 + ((index * 16.8) % 74)
  const size = 88 + ((index * 19) % 94)
  const drift = 8 + (index % 5) * 4
  const delay = (index % 9) * 0.6
  const duration = 10 + (index % 7) * 2.2
  const blur = 14 + (index % 6) * 6
  const opacity = 0.18 + (index % 5) * 0.06

  return {
    x: Math.min(baseX, 88),
    y: Math.min(baseY, 84),
    size,
    drift,
    delay,
    duration,
    blur,
    opacity,
    z: 2 + (index % 5),
  }
}

function buildLinks(nodes, activeNodeId = null) {
  const links = []
  const maxDistance = 21

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
        const corrupted = a.tear.corrupted || b.tear.corrupted
        const familiar = a.tear.isFamiliar || b.tear.isFamiliar
        const activated =
          activeNodeId &&
          (a.tear.tearId === activeNodeId || b.tear.tearId === activeNodeId)

        links.push({
          id: `${a.tear.tearId}-${b.tear.tearId}`,
          x: midX,
          y: midY,
          width: distance,
          angle,
          opacity: Number((0.05 + (1 - distance / maxDistance) * 0.22).toFixed(3)),
          corrupted,
          familiar,
          activated,
        })
      }
    }
  }

  return links.slice(0, 32)
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
    if (distance < 16) contamination = Math.max(contamination, 1 - distance / 16)
  })

  if (activeNodeId) {
    const active = nodes.find((node) => node.tear.tearId === activeNodeId)
    if (active && active.tear.corrupted) {
      const dx = active.layout.x - current.layout.x
      const dy = active.layout.y - current.layout.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 24) contamination = Math.max(contamination, 0.35 + (1 - distance / 24) * 0.5)
    }
  }

  return Number(Math.min(contamination, 1).toFixed(2))
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
      .slice(0, isMobile ? 18 : 40)

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

      {!isMobile && featured ? (
        <article className={`featured-anomaly featured-anomaly-liquid ${featured.corrupted ? 'is-corrupted' : ''}`}>
          <div className="featured-liquid-core" />
          <div className="featured-liquid-haze" />
          <div className="featured-anomaly-copy">
            <span className="featured-label">{copy.anomaly}</span>
            <strong className="tear-id">{featured.tearId}</strong>
            <p className="featured-text">{featured.text}</p>
            <div className="featured-meta">
              <span>{featured.emotion}</span>
              <span>{copy.density} {featured.density || featured.intensity || 0}</span>
              <span>{featured.systemGenerated ? featured.name || copy.unknownSource : copy.recoveredFragment}</span>
            </div>
          </div>
          <div className="featured-loss-panel">
            <span>{copy.lost}</span>
            <p>{featured.lostText || '░01░0░11░0░1'}</p>
          </div>
        </article>
      ) : null}

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
        <div className="sea-orbit-trace orbit-a" />
        <div className="sea-orbit-trace orbit-b" />

        <div className="sea-link-layer" aria-hidden="true">
          {links.map((link) => (
            <span
              key={link.id}
              className={`sea-link ${link.corrupted ? 'is-corrupted' : ''} ${link.familiar ? 'is-familiar' : ''} ${link.activated ? 'is-activated' : ''}`}
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
              className={`liquid-node ${tear.corrupted ? 'is-corrupted' : ''} ${tear.systemGenerated ? 'is-system' : ''} ${tear.isFamiliar ? 'is-familiar' : ''} ${activeNode === tear.tearId ? 'is-active' : ''} ${contamination > 0.34 ? 'is-infected' : ''}`}
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
                {!isMobile ? (
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

                    {tear.isFamiliar ? (
                      <div className="liquid-node-meta liquid-node-meta-secondary">
                        <span>{copy.familiar}</span>
                        <span>{residualSignature?.id?.slice(0, 8)}</span>
                      </div>
                    ) : null}

                    {tear.systemGenerated ? (
                      <div className="liquid-node-meta liquid-node-meta-secondary">
                        <span>{copy.systemClass}</span>
                        <span>{tear.sourceType || 'synthetic'}</span>
                      </div>
                    ) : null}

                    <div className="liquid-node-meta liquid-node-meta-secondary">
                      <span>{copy.contamination}</span>
                      <span>{Math.round(contamination * 100)}%</span>
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
                ) : (
                  activeNode === tear.tearId ? (
                    <div
                      className={`mobile-inline-tear-info ${layout.x > 50 ? 'align-left' : 'align-right'}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="tear-id">{tear.tearId}</span>
                      <p>{tear.text.length > 46 ? `${tear.text.slice(0, 46)}...` : tear.text}</p>
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
                  ) : null
                )}
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
