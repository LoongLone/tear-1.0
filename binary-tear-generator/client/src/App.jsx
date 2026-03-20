import { useEffect, useMemo, useState } from 'react'
import Gate from './components/Gate'
import ExtractionInput from './components/ExtractionInput'
import ExtractionSequence from './components/ExtractionSequence'
import TearArchiveTransition from './components/TearArchiveTransition'
import TearLibrary from './components/TearLibrary'
import VoiceInput from './VoiceInput'
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
const WATCHER_LINES = [
  'This pattern has been seen before.',
  'You are not the only one.',
  'The archive recognizes this fracture.',
  'Residual signal detected in the public sea.',
]
const SYSTEM_TEARS = [
  'I don’t know why I’m still here.',
  'Something entered the archive without a sender.',
  'The system is crying between requests.',
  'No name remained attached to this residue.',
]

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

function fragmentInput(text) {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (!normalized) {
    return { retainedText: '', lostText: '', fractureRatio: 0 }
  }

  const keepCount = Math.max(1, Math.floor(normalized.length * 0.7))
  const retainedText = normalized.slice(0, keepCount)
  const lostSource = normalized.slice(keepCount)
  const lostText = lostSource
    .split('')
    .map((char, index) => {
      if (char === ' ') return ' '
      return index % 3 === 0 ? '░' : index % 2 === 0 ? '0' : '1'
    })
    .join('')

  return {
    retainedText,
    lostText,
    fractureRatio: Number((1 - keepCount / normalized.length).toFixed(2)),
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
  const [watcherLine, setWatcherLine] = useState(WATCHER_LINES[0])
  const [glitchSeed, setGlitchSeed] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      LOCAL_TEAR_STORAGE_KEY,
      JSON.stringify(localTears.slice(0, 40))
    )
  }, [localTears])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const line = WATCHER_LINES[Math.floor(Math.random() * WATCHER_LINES.length)]
      setWatcherLine(line)
      setGlitchSeed((current) => current + 1)
    }, 5200)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const source = SYSTEM_TEARS[Math.floor(Math.random() * SYSTEM_TEARS.length)]
      const syntheticTear = generateTear(source, true)
      setLocalTears((current) => {
        if (current.some((item) => item.tearId === syntheticTear.tearId)) {
          return current
        }
        return [syntheticTear, ...current].slice(0, 40)
      })
      setLibraryRefreshKey((current) => current + 1)
    }, 19000)

    return () => window.clearInterval(interval)
  }, [])

  const previewText = useMemo(() => {
    const source = inputText.trim() || 'the archive keeps every feeling suspended in chrome'
    return fragmentInput(source).retainedText || source
  }, [inputText])

  const previewEmotion = inputText.trim() ? analyzeEmotion(inputText) : 'neutral'
  const previewBinary = textToBinary(previewText)
  const activeBinary = tearData ? tearData.binary : previewBinary
  const activeEmotion = tearData ? emotion : previewEmotion
  const activeColor = emotionColors[activeEmotion] || emotionColors.neutral
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

      setSaveMessage('Synced to the public sea.')
      setLibraryRefreshKey((current) => current + 1)
    } catch (error) {
      console.error('公共泪库同步失败:', error)
      setSaveMessage('Stored locally. Remote sea unreachable.')
    }
  }

  function generateTear(rawText, systemGenerated = false) {
    const normalizedText = rawText.trim()
    const { retainedText, lostText, fractureRatio } = fragmentInput(normalizedText)
    const encodedText = retainedText || normalizedText
    const binary = textToBinary(encodedText)
    const type = analyzeEmotion(encodedText)
    const createdAt = Date.now()
    const nextTearId = generateTearId(normalizedText)
    const id = globalThis.crypto?.randomUUID?.() || createTearIdFallback(normalizedText)
    const intensity = Number((0.35 + Math.random() * 0.65).toFixed(2))
    const corrupted = intensity > 0.88 || type === 'despair'

    return {
      id,
      _id: systemGenerated ? `system-${nextTearId}` : undefined,
      content: encodedText,
      intensity,
      type,
      createdAt,
      text: encodedText,
      fullText: normalizedText,
      lostText,
      fractureRatio,
      binary,
      tearId: nextTearId,
      emotion: corrupted ? 'corrupted' : type,
      name: systemGenerated ? 'Unknown Source' : `Shard ${nextTearId.slice(-4)}`,
      timestamp: new Date(createdAt).toISOString(),
      source: systemGenerated ? 'system' : 'local',
      systemGenerated,
      corrupted,
      density: Number((0.42 + Math.random() * 0.58).toFixed(2)),
      resonance: Math.floor(Math.random() * 28),
      location: 'Unresolved',
      likes: 0,
    }
  }

  const handleExtract = async (rawText) => {
    const normalizedText = rawText.trim()
    if (!normalizedText || isExtracting) {
      return
    }

    const nextTear = generateTear(normalizedText)
    setMode('sequence')
    setStage('extracting')
    setInputText('')
    setWatcherLine('This pattern has been seen before.')

    await wait(300)
    setStage('glitch')
    await wait(560)

    setTearData(nextTear)
    setTearId(nextTear.tearId)
    setEmotion(nextTear.emotion)
    setSaveMessage('Writing to secondary public layer...')
    setGifStatus('')
    setLocalTears((current) => [
      nextTear,
      ...current.filter((item) => item.tearId !== nextTear.tearId),
    ])
    void saveTearToCloud(nextTear)

    setStage('compress')
    await wait(540)
    setStage('forming')
    await wait(760)
    setStage('dropping')
    await wait(980)
    setStage('sea')
    await wait(780)
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
    setGifStatus('Encoding transit GIF 8%')

    try {
      const { exportTransitGif } = await import('./utils/exportTransitGif')
      const blob = await exportTransitGif({
        tearData,
        emotionColor: emotionColors[tearData.emotion] || activeColor,
        onProgress: (progress) => {
          setGifStatus(`Encoding transit GIF ${Math.round(progress * 100)}%`)
        },
      })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${tearData.tearId}.gif`
      anchor.click()
      window.URL.revokeObjectURL(url)
      setGifStatus('Transit GIF downloaded')
    } catch (error) {
      console.error('GIF 导出失败:', error)
      setGifStatus('Transit GIF export failed')
    } finally {
      setIsSavingGif(false)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setInputText(transcript)
  }

  return (
    <div className="app-shell">
      <div className="app-atmosphere" />
      <div className="app-grid" />
      <div className="app-vignette" />

      {mode === 'forge' ? (
        <main className="forge-view">
          <section className="forge-copy">
            <p className="section-kicker">TEARS:// Emotional Extraction Interface</p>
            <h1 className={`forge-title glitch-${glitchSeed % 2}`}>This is not a place to speak.</h1>
            <p className="forge-body">
              This is where emotion is extracted, fractured, and deposited into a
              shared body. Once released, it will not return intact.
            </p>

            <div className="system-readout">
              <div>
                <span>Current Emotion</span>
                <strong>{activeEmotion}</strong>
              </div>
              <div>
                <span>Retention Ratio</span>
                <strong>70%</strong>
              </div>
              <div>
                <span>Archive ID</span>
                <strong>{tearId || 'UNRESOLVED'}</strong>
              </div>
            </div>

            <p className="watcher-line">{watcherLine}</p>
          </section>

          <section className="forge-vessel">
            <div className="vessel-shell">
              <div className="vessel-noise" />
              <div className="vessel-preview">
                <div className="vessel-preview-copy">
                  <span>Primary Vessel</span>
                  <strong>{tearData ? tearData.name : 'Awaiting extraction'}</strong>
                </div>
                <div className="vessel-canvas-wrap">
                  <div className="vessel-halo" style={{ '--halo': activeColor }} />
                  <ExtractionSequence
                    compact
                    stage="forming"
                    text={previewText}
                    tearData={{ binary: activeBinary }}
                    emotionColor={activeColor}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="forge-input-panel">
            <ExtractionInput
              value={inputText}
              onChange={setInputText}
              onSubmit={handleExtract}
              placeholder="leave a fragment, a confession, an unstable sentence"
              disabled={!inputText.trim() || isExtracting}
            />

            <div className="forge-actions-row">
              <VoiceInput onTranscript={handleVoiceTranscript} />
              <div className="forge-status-stack">
                <div className="micro-status">
                  <span>Sync</span>
                  <strong>{saveMessage || 'Standby'}</strong>
                </div>
                <div className="micro-status">
                  <span>Sea Count</span>
                  <strong>{12482 + localTears.length}</strong>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : mode === 'sequence' ? (
        <ExtractionSequence
          stage={stage}
          text={tearData?.fullText || previewText}
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
        <main className="archive-view">
          <div className="archive-header">
            <div>
              <p className="section-kicker">Shared body / Layer 02</p>
              <h2>The public sea is still moving.</h2>
            </div>
            <div className="archive-header-actions">
              {tearData ? (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={handleSaveGif}
                  disabled={isSavingGif}
                >
                  {isSavingGif ? 'Encoding...' : 'Save transit GIF'}
                </button>
              ) : null}
              <button type="button" className="ghost-btn" onClick={() => setMode('forge')}>
                Return to extraction
              </button>
            </div>
          </div>

          <TearLibrary
            featuredTear={tearData}
            localTears={localTears}
            refreshKey={libraryRefreshKey}
          />
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
