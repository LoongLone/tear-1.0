import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function TearLibrary({
  featuredTear,
  localTears = [],
  onBack,
  refreshKey = 0,
}) {
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
        setRemoteError('公共泪库暂不可达，当前展示本机已生成的泪水。')
      } finally {
        setLoading(false)
      }
    }

    fetchTears()
  }, [endpoint, refreshKey])

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
      setRemoteError('公共泪库暂不可达，当前展示本机已生成的泪水。')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/tears/${id}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`like failed with status ${response.status}`)
      }

      fetchTears()
    } catch (error) {
      console.error('点赞失败:', error)
      setRemoteError('点赞未成功提交，远端接口暂时不可用。')
    }
  }

  const dedupedRemoteTears = tears.filter(
    (tear) => !localTears.some((item) => item.tearId === tear.tearId)
  )
  const combinedTears = [
    ...localTears.map((tear) => ({
      ...tear,
      _id: `local-${tear.tearId}`,
      source: 'local',
      likes: tear.likes || 0,
    })),
    ...dedupedRemoteTears.map((tear) => ({
      ...tear,
      source: 'remote',
    })),
  ]

  return (
    <div className="tear-library">
      <div className="library-hero">
        <div>
          <p className="section-kicker">Archive Confluence</p>
          <h3>二级视框已经展开，所有泪水在这里聚合。</h3>
          <p className="library-copy">
            这里同时显示你刚生成的样本、本机缓存档案，以及接入成功时的公共泪库。
          </p>
        </div>

        <div className="library-toolbar">
          {onBack ? (
            <button type="button" className="ghost-btn" onClick={onBack}>
              返回
            </button>
          ) : null}

          <div className="filter-buttons">
            <button
              type="button"
              className={filter === 'latest' ? 'active' : ''}
              onClick={() => setFilter('latest')}
            >
              最新
            </button>
            <button
              type="button"
              className={filter === 'hot' ? 'active' : ''}
              onClick={() => setFilter('hot')}
            >
              热门
            </button>
          </div>
        </div>
      </div>

      {featuredTear ? (
        <div className="featured-banner panel-inset">
          <span>刚生成的样本</span>
          <strong className="tear-id">{featuredTear.tearId}</strong>
          <p>{featuredTear.text}</p>
        </div>
      ) : null}

      {remoteError ? <div className="library-status">{remoteError}</div> : null}

      {loading && combinedTears.length === 0 ? (
        <div className="library-status">正在加载二级公域...</div>
      ) : combinedTears.length > 0 ? (
        <div className="tear-grid">
          {combinedTears.map((tear) => (
            <article
              key={tear._id}
              className={`tear-card ${tear.source === 'local' ? 'local-card' : ''}`}
            >
              <div className="tear-card-header">
                <span className="tear-id">{tear.tearId}</span>
                <span className="tear-emotion">{tear.emotion}</span>
              </div>

              <div className="tear-card-content">
                <p className="tear-text">
                  “{tear.text.length > 64 ? `${tear.text.slice(0, 64)}...` : tear.text}”
                </p>
                <p className="tear-name">{tear.name}</p>
              </div>

              <div className="tear-card-footer">
                <span className="tear-date">
                  {tear.timestamp
                    ? new Date(tear.timestamp).toLocaleDateString()
                    : 'just now'}
                </span>
                {tear.source === 'remote' ? (
                  <button
                    type="button"
                    className="like-btn"
                    onClick={() => handleLike(tear._id)}
                  >
                    Lift · {tear.likes}
                  </button>
                ) : (
                  <span className="source-tag">本机档案</span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="library-status">暂时还没有泪水进入这个视框。</div>
      )}
    </div>
  )
}

export default TearLibrary
