import { useEffect, useState } from 'react'
import Gate from './components/Gate'
import ExtractionInput from './components/ExtractionInput'
import ExtractionSequence from './components/ExtractionSequence'
import TearArchiveTransition from './components/TearArchiveTransition'
import TearDrop from './components/TearDrop'
import TearLibrary from './components/TearLibrary'
import VoiceInput from './components/VoiceInput'
import {
  analyzeEmotion,
  emotionColors,
  generateTearId,
  textToBinary,
} from './utils/binaryConverter'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const LOCAL_TEAR_STORAGE_KEY = 'novon.local.tears'
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

function createTearIdFallback(text) {
  return generateTearId(text)
}

function loadLocalTears() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(LOCAL_TEAR_STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function MainApp() {
  const [mode, setMode] = useState('forge')
  const [stage, setStage] = useState('idle')
  const [inputText, setInputText] = useState('')
  const [tearData, setTearData] = useState(null)
  const [tearId, setTearId] = useState('')
  const [emotion, setEmotion] = useState('neutral')
  const [saveMessage, setSaveMessage] = useState('')
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0)
  const [localTears, setLocalTears] = useState(loadLocalTears)
  const [gifStatus, setGifStatus] = useState('')
  const [isSavingGif, setIsSavingGif] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      LOCAL_TEAR_STORAGE_KEY,
      JSON.stringify(localTears.slice(0, 24))
    )
  }, [localTears])

  const previewText =
    inputText.trim() || 'the archive keeps every feeling suspended in chrome'
  const previewEmotion = inputText.trim() ? analyzeEmotion(inputText) : 'neutral'
  const previewBinary = textToBinary(previewText)
  const activeBinary = tearData ? tearData.binary : previewBinary
  const activeEmotion = tearData ? emotion : previewEmotion
  const activeColor = emotionColors[activeEmotion]
  const isExtracting = mode === 'sequence'

  const saveTearToCloud = async (nextTear) => {
    try {
      const response = await fetch(`${API_URL}/api/tears`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextTear),
      })

      if (!response.ok) {
        throw new Error(`save failed with status ${response.status}`)
      }

      const payload = await response.json()
      const remoteId = payload?.id ? String(payload.id) : ''

      if (remoteId) {
        setTearData((current) =>
          current?.tearId === nextTear.tearId ? { ...current, _id: remoteId } : current
        )
        setLocalTears((current) =>
          current.map((tear) =>
            tear.tearId === nextTear.tearId ? { ...tear, _id: remoteId } : tear
          )
        )
      }

      setSaveMessage('已同步到公共泪库')
      setLibraryRefreshKey((current) => current + 1)
    } catch (error) {
      console.error('公共泪库同步失败:', error)
      setSaveMessage('已写入本机档案，公共泪库暂未同步')
    }
  }

  const generateTear = (rawText) => {
    const normalizedText = rawText.trim()
    const binary = textToBinary(normalizedText)
    const type = analyzeEmotion(normalizedText)
    const createdAt = Date.now()
    const tearId = generateTearId(normalizedText)
    const id =
      globalThis.crypto?.randomUUID?.() || createTearIdFallback(normalizedText)
    const intensity = Math.random()

    return {
      id,
      content: normalizedText,
      intensity,
      type,
      createdAt,
      text: normalizedText,
      binary,
      tearId,
      emotion: type,
      name: `Shard ${tearId.slice(-4)}`,
      timestamp: new Date(createdAt).toISOString(),
    }
  }

  const handleExtract = async (rawText) => {
    const normalizedText = rawText.trim()

    if (!normalizedText || isExtracting) {
      return
    }

    setMode('sequence')
    setStage('extracting')

    await wait(300)
    setStage('glitch')

    await wait(500)

    const nextTear = generateTear(normalizedText)

    setTearData(nextTear)
    setTearId(nextTear.tearId)
    setEmotion(nextTear.emotion)
    setSaveMessage('正在写入二级公域...')
    setGifStatus('')
    setLocalTears((current) => [
      nextTear,
      ...current.filter((item) => item.tearId !== nextTear.tearId),
    ])
    void saveTearToCloud(nextTear)

    setStage('compress')
    await wait(520)

    setStage('forming')
    await wait(700)

    setStage('dropping')
    await wait(900)

    setStage('sea')
    await wait(820)

    setStage('idle')
    setMode('transit')
  }

  const handleTransitionComplete = () => {
    setLibraryRefreshKey((current) => current + 1)
    setMode('archive')
  }

  const handleSaveGif = async () => {
    if (!tearData || isSavingGif) {
      return
    }

    setIsSavingGif(true)
    setGifStatus('正在生成 GIF 8%')

    try {
      const { exportTransitGif } = await import('./utils/exportTransitGif')
      const blob = await exportTransitGif({
        tearData,
        emotionColor: emotionColors[tearData.emotion] || activeColor,
        onProgress: (progress) => {
          setGifStatus(`正在生成 GIF ${Math.round(progress * 100)}%`)
        },
      })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${tearData.tearId}.gif`
      anchor.click()
      window.URL.revokeObjectURL(url)
      setGifStatus('GIF 已开始下载')
    } catch (error) {
      console.error('GIF 导出失败:', error)
      setGifStatus('GIF 导出失败，请重试')
    } finally {
      setIsSavingGif(false)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setInputText(transcript)
  }

  return (
    <div className="app-shell">
      <div className="atmosphere" />
      <div className="orbital-grid" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">NVN</div>
          <div>
            <p className="brand-kicker">Y3K Tear Protocol</p>
            <h1 className="novon-logo glitch-effect">NOVON</h1>
          </div>
        </div>

        <div className="topbar-controls">
          <button
            type="button"
            className={`mode-tab ${mode === 'forge' ? 'active' : ''}`}
            onClick={() => setMode('forge')}
          >
            Forge
          </button>
          <button
            type="button"
            className={`mode-tab ${mode !== 'forge' ? 'active' : ''}`}
            onClick={() => setMode('archive')}
          >
            Archive
          </button>
        </div>
      </header>

      {mode === 'forge' ? (
        <main className="composer-shell">
          <section className="hero-panel panel-sheen">
            <p className="section-kicker">Emotional Compression Engine</p>
            <h2>把情绪压缩成一个可被检索、可被围观的未来泪水样本。</h2>
            <p className="hero-copy">
              这一层负责生成。下一层会把编号后的泪水推入一个更深的公域视框，
              和别人的情绪一起悬浮、排序、被点赞、被回看。
            </p>

            <div className="hero-meta">
              <div className="meta-panel">
                <span>Current Emotion</span>
                <strong>{activeEmotion}</strong>
              </div>
              <div className="meta-panel">
                <span>Archive ID</span>
                <strong>{tearId || '等待生成'}</strong>
              </div>
            </div>
          </section>

          <section className="visualization-panel panel-sheen">
            <div className="tear-stage">
              <TearDrop binaryString={activeBinary} emotionColor={activeColor} />
              <div className="stage-caption">
                <span>Primary Vessel</span>
                <p>
                  {tearData
                    ? `${tearData.tearId} 已被封装，准备下潜至 Layer 02。`
                    : '输入情绪后，泪水会先在这里成形。'}
                </p>
              </div>
            </div>

            <div className="binary-readout">
              <span>Encoded Stream</span>
              <code>{activeBinary}</code>
            </div>
          </section>

          <section className="input-panel panel-sheen">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Write / Speak</p>
                <h3>生成一滴新的泪水样本</h3>
              </div>
              <div className="emotion-chip">{activeEmotion}</div>
            </div>

            <ExtractionInput
              value={inputText}
              onChange={setInputText}
              onSubmit={handleExtract}
              placeholder="把一段情绪、一个碎片、一个你不想明说的句子输入这里。"
              disabled={!inputText.trim() || isExtracting}
            />

            <div className="action-row action-row-voice">
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>

            <div className="status-grid">
              <div className="status-card">
                <span>Tear ID</span>
                <strong className="tear-id">{tearId || '尚未生成'}</strong>
              </div>
              <div className="status-card">
                <span>Sync State</span>
                <strong>{saveMessage || '等待生成'}</strong>
              </div>
            </div>
          </section>
        </main>
      ) : mode === 'sequence' ? (
        <ExtractionSequence
          stage={stage}
          text={inputText}
          tearData={tearData}
          emotionColor={activeColor}
        />
      ) : mode === 'transit' ? (
        <TearArchiveTransition
          tearData={tearData}
          emotionColor={activeColor}
          onComplete={handleTransitionComplete}
          onSaveGif={handleSaveGif}
          gifStatus={gifStatus}
          isSavingGif={isSavingGif}
        />
      ) : (
        <main className="archive-shell">
          <aside className="archive-sidebar panel-sheen">
            <p className="section-kicker">Layer 02 / public viewport</p>
            <h2>公共泪库</h2>
            <p className="archive-copy">
              每滴泪水在这里进入二级视框。你刚生成的编号会先被固定在顶部，
              然后和本机档案、远端公共泪库一起汇流。
            </p>

            {tearData ? (
              <div className="featured-tear panel-inset">
                <span>Latest Insertion</span>
                <strong className="tear-id">{tearData.tearId}</strong>
                <p>{tearData.text}</p>
                <small>{saveMessage}</small>
              </div>
            ) : null}

            <div className="archive-actions">
              {tearData ? (
                <button
                  type="button"
                  className="generate-btn"
                  onClick={handleSaveGif}
                  disabled={isSavingGif}
                >
                  {isSavingGif ? '正在编码 GIF' : '保存这颗泪水 GIF'}
                </button>
              ) : null}
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setMode('forge')}
              >
                返回生成器
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setInputText('')}
              >
                清空输入
              </button>
            </div>
          </aside>

          <section className="archive-panel panel-sheen">
            <TearLibrary
              featuredTear={tearData}
              localTears={localTears}
              onBack={() => setMode('forge')}
              refreshKey={libraryRefreshKey}
            />
          </section>
        </main>
      )}
    </div>
  )
}

function App() {
  const [entered, setEntered] = useState(false)

  return (
    <>
      {!entered && <Gate onEnter={() => setEntered(true)} />}
      {entered && <MainApp />}
    </>
  )
}

export default App
