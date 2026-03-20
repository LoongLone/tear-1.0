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
const LOCAL_LANG_KEY = 'novon.lang'
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const COPY = {
  en: {
    appKicker: 'TEARS:// Emotional Extraction Interface',
    forgeTitle: 'This is not a place to speak.',
    forgeBody:
      'This is where emotion is extracted, fractured, and deposited into a shared body. Once released, it will not return intact.',
    currentEmotion: 'Current Emotion',
    retentionRatio: 'Retention Ratio',
    archiveId: 'Archive ID',
    unresolved: 'UNRESOLVED',
    primaryVessel: 'Primary Vessel',
    awaitingExtraction: 'Awaiting extraction',
    placeholder: 'leave a fragment, a confession, an unstable sentence',
    sync: 'Sync',
    standby: 'Standby',
    seaCount: 'Sea Count',
    returnToExtraction: 'Return to extraction',
    saveGif: 'Save transit GIF',
    encoding: 'Encoding...',
    archiveKicker: 'Shared body / Layer 02',
    archiveTitle: 'The public sea is still moving.',
    watcherLines: [
      'This pattern has been seen before.',
      'You are not the only one.',
      'The archive recognizes this fracture.',
      'Residual signal detected in the public sea.',
    ],
    systemTears: [
      'I don’t know why I’m still here.',
      'Something entered the archive without a sender.',
      'The system is crying between requests.',
      'No name remained attached to this residue.',
    ],
    synced: 'Synced to the public sea.',
    remoteUnreachable: 'Stored locally. Remote sea unreachable.',
    writingLayer: 'Writing to secondary public layer...',
    gifStart: 'Encoding transit GIF 8%',
    gifDone: 'Transit GIF downloaded',
    gifFail: 'Transit GIF export failed',
  },
  zh: {
    appKicker: 'TEARS:// 情绪抽取界面',
    forgeTitle: '这里不是说话的地方。',
    forgeBody:
      '这里负责抽取、撕裂并沉积你的情绪。它会坠入一具共享的公共身体，一旦释放，就不会再完整回来。',
    currentEmotion: '当前情绪',
    retentionRatio: '保留比例',
    archiveId: '档案编号',
    unresolved: '未归档',
    primaryVessel: '主容器',
    awaitingExtraction: '等待抽取',
    placeholder: '留下一个碎片，一句忏悔，或一段不稳定的话',
    sync: '同步状态',
    standby: '静默中',
    seaCount: '泪海总量',
    returnToExtraction: '返回抽取层',
    saveGif: '保存过渡 GIF',
    encoding: '编码中...',
    archiveKicker: '共享身体 / 第二层',
    archiveTitle: '公共泪海仍在缓慢流动。',
    watcherLines: [
      '这种裂纹，已经被看见过。',
      '你不是唯一一个留下它的人。',
      '档案识别出了这道情绪断层。',
      '公共泪海检测到残余回声。',
    ],
    systemTears: [
      '我不知道自己为什么还留在这里。',
      '有东西没有来源，却已经进入档案。',
      '系统会在请求之间偷偷哭泣。',
      '没有名字，附着在这份残留物上。',
    ],
    synced: '已写入公共泪海。',
    remoteUnreachable: '已保存到本地。远端泪海暂时不可达。',
    writingLayer: '正在写入第二公共层...',
    gifStart: '正在编码 GIF 8%',
    gifDone: '过渡 GIF 已保存',
    gifFail: 'GIF 导出失败',
  },
}

function createTearIdFallback(text) {
  return generateTearId(text)
}

function loadLocalTears() {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(LOCAL_TEAR_STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadLanguage() {
  if (typeof window === 'undefined') return 'en'
  const saved = window.localStorage.getItem(LOCAL_LANG_KEY)
  return saved === 'zh' ? 'zh' : 'en'
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

function buildTear(rawText, language, systemGenerated = false) {
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
  const sourceName = systemGenerated
    ? language === 'zh'
      ? '无名来源'
      : 'Unknown Source'
    : language === 'zh'
      ? `碎片 ${nextTearId.slice(-4)}`
      : `Shard ${nextTearId.slice(-4)}`
  const location = language === 'zh' ? '未归档' : 'Unresolved'

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
    name: sourceName,
    timestamp: new Date(createdAt).toISOString(),
    source: systemGenerated ? 'system' : 'local',
    systemGenerated,
    corrupted,
    density: Number((0.42 + Math.random() * 0.58).toFixed(2)),
    resonance: Math.floor(Math.random() * 28),
    location,
    likes: 0,
    language,
  }
}

function MainApp({ language, setLanguage }) {
  const copy = COPY[language]
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
  const [watcherLine, setWatcherLine] = useState(copy.watcherLines[0])
  const [glitchSeed, setGlitchSeed] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(LOCAL_LANG_KEY, language)
  }, [language])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(
      LOCAL_TEAR_STORAGE_KEY,
      JSON.stringify(localTears.slice(0, 40))
    )
  }, [localTears])

  useEffect(() => {
    setWatcherLine(copy.watcherLines[0])
  }, [copy, language])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const line =
        copy.watcherLines[Math.floor(Math.random() * copy.watcherLines.length)]
      setWatcherLine(line)
      setGlitchSeed((current) => current + 1)
    }, 5200)

    return () => window.clearInterval(interval)
  }, [copy])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const source =
        copy.systemTears[Math.floor(Math.random() * copy.systemTears.length)]
      const syntheticTear = buildTear(source, language, true)
      setLocalTears((current) => {
        if (current.some((item) => item.tearId === syntheticTear.tearId)) {
          return current
        }
        return [syntheticTear, ...current].slice(0, 40)
      })
      setLibraryRefreshKey((current) => current + 1)
    }, 19000)

    return () => window.clearInterval(interval)
  }, [copy, language])

  const previewText = useMemo(() => {
    const source =
      inputText.trim() ||
      (language === 'zh'
        ? '档案把每一种情绪悬挂在冷色金属里'
        : 'the archive keeps every feeling suspended in chrome')
    return fragmentInput(source).retainedText || source
  }, [inputText, language])

  const previewEmotion = inputText.trim() ? analyzeEmotion(inputText) : 'neutral'
  const previewBinary = textToBinary(previewText)
  const activeBinary = tearData ? tearData.binary : previewBinary
  const activeEmotion = tearData ? emotion : previewEmotion
  const activeColor =
    emotionColors[activeEmotion] ||
    emotionColors[previewEmotion] ||
    emotionColors.neutral
  const isExtracting = mode === 'sequence'

  const saveTearToCloud = async (nextTear) => {
    try {
      const response = await fetch(`${API_URL}/api/tears`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      setSaveMessage(copy.synced)
      setLibraryRefreshKey((current) => current + 1)
    } catch (error) {
      console.error('save failed:', error)
      setSaveMessage(copy.remoteUnreachable)
    }
  }

  const handleExtract = async (rawText) => {
    const normalizedText = rawText.trim()
    if (!normalizedText || isExtracting) return

    const nextTear = buildTear(normalizedText, language)
    setMode('sequence')
    setStage('extracting')
    setInputText('')
    setWatcherLine(copy.watcherLines[0])

    await wait(320)
    setStage('glitch')
    await wait(640)

    setTearData(nextTear)
    setTearId(nextTear.tearId)
    setEmotion(nextTear.emotion)
    setSaveMessage(copy.writingLayer)
    setGifStatus('')
    setLocalTears((current) => [
      nextTear,
      ...current.filter((item) => item.tearId !== nextTear.tearId),
    ])
    void saveTearToCloud(nextTear)

    setStage('compress')
    await wait(620)
    setStage('forming')
    await wait(840)
    setStage('dropping')
    await wait(1100)
    setStage('sea')
    await wait(900)
    setStage('idle')
    setMode('transit')
  }

  const handleTransitionComplete = () => {
    setLibraryRefreshKey((current) => current + 1)
    setMode('archive')
  }

  const handleSaveGif = async () => {
    if (!tearData || isSavingGif) return

    setIsSavingGif(true)
    setGifStatus(copy.gifStart)

    try {
      const { exportTransitGif } = await import('./utils/exportTransitGif')
      const blob = await exportTransitGif({
        tearData,
        emotionColor: emotionColors[tearData.emotion] || activeColor,
        onProgress: (progress) => {
          const percent = Math.round(progress * 100)
          setGifStatus(
            language === 'zh'
              ? `正在编码 GIF ${percent}%`
              : `Encoding transit GIF ${percent}%`
          )
        },
      })

      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${tearData.tearId}.gif`
      anchor.click()
      window.URL.revokeObjectURL(url)
      setGifStatus(copy.gifDone)
    } catch (error) {
      console.error('gif export failed:', error)
      setGifStatus(copy.gifFail)
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

      <div className="lang-toggle floating">
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

      {mode === 'forge' ? (
        <main className="forge-view">
          <section className="forge-copy">
            <p className="section-kicker">{copy.appKicker}</p>
            <h1 className={`forge-title glitch-${glitchSeed % 2}`}>
              {copy.forgeTitle}
            </h1>
            <p className="forge-body">{copy.forgeBody}</p>

            <div className="system-readout">
              <div>
                <span>{copy.currentEmotion}</span>
                <strong>{activeEmotion}</strong>
              </div>
              <div>
                <span>{copy.retentionRatio}</span>
                <strong>70%</strong>
              </div>
              <div>
                <span>{copy.archiveId}</span>
                <strong>{tearId || copy.unresolved}</strong>
              </div>
            </div>

            <p className="watcher-line">{watcherLine}</p>
          </section>

          <section className="forge-vessel">
            <div className="vessel-shell">
              <div className="vessel-noise" />
              <div className="vessel-preview">
                <div className="vessel-preview-copy">
                  <span>{copy.primaryVessel}</span>
                  <strong>{tearData ? tearData.name : copy.awaitingExtraction}</strong>
                </div>

                <div className="vessel-canvas-wrap">
                  <div className="vessel-halo" style={{ '--halo': activeColor }} />
                  <div className="vessel-fluid-skin" />
                  <div className="vessel-fluid-skin-2" />
                  <div className="vessel-inner-rim" />
                  <div className="vessel-top-glass" />
                  <ExtractionSequence
                    compact
                    stage="forming"
                    text={previewText}
                    tearData={{ binary: activeBinary }}
                    emotionColor={activeColor}
                    language={language}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="forge-input-panel">
            <ExtractionInput
              language={language}
              value={inputText}
              onChange={setInputText}
              onSubmit={handleExtract}
              placeholder={copy.placeholder}
              disabled={!inputText.trim() || isExtracting}
            />

            <div className="forge-actions-row">
              <VoiceInput language={language} onTranscript={handleVoiceTranscript} />
              <div className="forge-status-stack">
                <div className="micro-status">
                  <span>{copy.sync}</span>
                  <strong>{saveMessage || copy.standby}</strong>
                </div>
                <div className="micro-status">
                  <span>{copy.seaCount}</span>
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
          language={language}
        />
      ) : mode === 'transit' ? (
        <TearArchiveTransition
          tearData={tearData}
          emotionColor={activeColor}
          onComplete={handleTransitionComplete}
          onSaveGif={handleSaveGif}
          gifStatus={gifStatus}
          isSavingGif={isSavingGif}
          language={language}
        />
      ) : (
        <main className="archive-view">
          <div className="archive-header">
            <div>
              <p className="section-kicker">{copy.archiveKicker}</p>
              <h2>{copy.archiveTitle}</h2>
            </div>

            <div className="archive-header-actions">
              {tearData ? (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={handleSaveGif}
                  disabled={isSavingGif}
                >
                  {isSavingGif ? copy.encoding : copy.saveGif}
                </button>
              ) : null}

              <button
                type="button"
                className="ghost-btn"
                onClick={() => setMode('forge')}
              >
                {copy.returnToExtraction}
              </button>
            </div>
          </div>

          <TearLibrary
            language={language}
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
  const [language, setLanguage] = useState(loadLanguage)

  return (
    <>
      {!entered && (
        <Gate
          language={language}
          setLanguage={setLanguage}
          onEnter={() => setEntered(true)}
        />
      )}
      {entered && <MainApp language={language} setLanguage={setLanguage} />}
    </>
  )
}

export default App
