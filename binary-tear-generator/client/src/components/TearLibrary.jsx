import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function TearLibrary({ featuredTear, localTears = [], refreshKey = 0 }) {
  const [tears, setTears] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('latest')
  const [remoteError, setRemoteError] = useState('')

  const endpoint =
    filter === 'latest'
      ? `${API_URL}/api/tears/latest`
      : `${API_URL}/api/tears/hot`

  useEffect(() => {
    const fetchTears = async () => {
      setLoading(true)
      try {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`fetch failed with status ${response.status}`)
        }

        const data = await response.json()
        setTears(Array.isArray(data) ? data : [])
        setRemoteError('')
      } catch (error) {
        console.error('获取泪库失败:', error)
        setRemoteError('Remote sea unreachable. Showing local and synthetic residue.')
      } finally {
        setLoading(false)
      }
    }

    fetchTears()
  }, [endpoint, refreshKey])

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
        })
      }
    })

    const combined = Array.from(map.values())
      .sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))
      .slice(0, 32)

    if (featuredTear && !combined.some((item) => item.tearId === featuredTear.tearId)) {
      combined.unshift(featuredTear)
    }

    return combined
  }, [featuredTear, localTears, tears])

  const featured = featuredTear || allTears[0]
  const field = allTears.filter((tear) => tear.tearId !== featured?.tearId)

  const handleLike = async (id) => {
    setTears((current) =>
      current.map((tear) =>
        tear._id === id ? { ...tear, likes: (tear.likes || 0) + 1 } : tear
      )
    )

    try {
      const response = await fetch(`${API_URL}/api/tears/${id}/like`, { method: 'POST' })
      if (!response.ok) {
        throw new Error(`like failed with status ${response.status}`)
      }
    } catch (error) {
      console.error('点赞失败:', error)
      setRemoteError('Resonance could not be submitted to the remote sea.')
    }
  }

  return (
    <section className="tear-library immersive-library">
      <div className="library-topline">
        <div>
          <p className="section-kicker">Shared body / moving archive</p>
          <h3>The sea is populated by what survived extraction.</h3>
        </div>

        <div className="library-controls">
          <button
            type="button"
            className={filter === 'latest' ? 'ghost-btn active' : 'ghost-btn'}
            onClick={() => setFilter('latest')}
          >
            Latest
          </button>
          <button
            type="button"
            className={filter === 'hot' ? 'ghost-btn active' : 'ghost-btn'}
            onClick={() => setFilter('hot')}
          >
            Resonant
          </button>
        </div>
      </div>

      {remoteError ? <div className="library-status">{remoteError}</div> : null}
      {loading && allTears.length === 0 ? <div className="library-status">Scanning the sea...</div> : null}

      {featured ? (
        <article className={`featured-anomaly ${featured.corrupted ? 'is-corrupted' : ''}`}>
          <div className="featured-anomaly-copy">
            <span className="featured-label">This tear should not exist.</span>
            <strong className="tear-id">{featured.tearId}</strong>
            <p className="featured-text">{featured.text}</p>
            <div className="featured-meta">
              <span>{featured.emotion}</span>
              <span>density {featured.density || featured.intensity || 0}</span>
              <span>{featured.systemGenerated ? 'Unknown Source' : 'Recovered fragment'}</span>
            </div>
          </div>
          <div className="featured-loss-panel">
            <span>lost to extraction</span>
            <p>{featured.lostText || '░01░0░11░0░1'}</p>
          </div>
        </article>
      ) : null}

      <div className="tear-sea-field">
        {field.length > 0 ? (
          field.map((tear, index) => (
            <article
              key={tear._id || tear.tearId}
              className={`sea-node ${tear.corrupted ? 'is-corrupted' : ''} ${tear.systemGenerated ? 'is-system' : ''}`}
              style={{
                '--x': `${(index * 17) % 82}%`,
                '--y': `${(index * 29) % 72}%`,
                '--delay': `${(index % 7) * 0.7}s`,
              }}
            >
              <div className="sea-node-core" />
              <div className="sea-node-copy">
                <span className="tear-id">{tear.tearId}</span>
                <p>{tear.text.length > 88 ? `${tear.text.slice(0, 88)}...` : tear.text}</p>
                <div className="sea-node-meta">
                  <span>{tear.emotion}</span>
                  <span>{tear.source === 'remote' ? 'public sea' : tear.systemGenerated ? 'unknown source' : 'local residue'}</span>
                </div>
              </div>

              {tear._id && !tear.systemGenerated ? (
                <button type="button" className="resonance-btn" onClick={() => handleLike(tear._id)}>
                  resonate {tear.likes || 0}
                </button>
              ) : null}
            </article>
          ))
        ) : (
          <div className="library-status">No tears are visible yet.</div>
        )}
      </div>
    </section>
  )
}

export default TearLibrary
