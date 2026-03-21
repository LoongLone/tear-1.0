import { useEffect, useMemo, useState } from 'react'
import Gate from './components/Gate'
import ExtractionInput from './components/ExtractionInput'
import ExtractionSequence from './components/ExtractionSequence'
import TearArchiveTransition from './components/TearArchiveTransition'
import TearLibrary from './components/TearLibrary'
import EmotionMap from './components/EmotionMap'
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
const LOCAL_SIGNATURE_KEY = 'novon.residual.signature'
const LOCAL_VISIT_COUNT_KEY = 'novon.visit.count'
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const COPY = {
  en: {
    appKicker: 'TEARS:// Emotional Extraction Interface',
    forgeTitle: 'This is not a place to speak.',
    forgeBody:
      'This chamber extracts, fractures, and deposits emotional residue into a shared body. Once released, it will not return whole.',
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
    saveGif: 'Save event slice',
    saveStill: 'Save archive still',
    encoding: 'Encoding...',
    archiveKicker: 'Shared body / Layer 02',
    archiveTitle: 'The public sea is still moving.',
    watcherLines: [
      'This pattern has been seen before.',
      'You are not the only one.',
      'The archive recognizes this fracture.',
      'Residual signal detected in the public sea.',
      'A previous trace is still orbiting this chamber.',
      'The system has catalogued similar damage.',
    ],
    signatureLines: [
      'We still have your residue.',
      'A previous trace is still attached to this chamber.',
      'Your earlier fracture remains active.',
      'The archive remembers the shape of your last loss.',
    ],
    extractionDelay: [
      'Extraction in progress...',
      'Some parts cannot be recovered.',
      'The chamber is stripping language from the signal.',
      'Residual pattern is being isolated.',
    ],
    synced: 'Synced to the public sea.',
    remoteUnreachable: 'Stored locally. Remote sea unreachable.',
    writingLayer: 'Writing to secondary public layer...',
    gifStart: 'Encoding event slice 8%',
    gifDone: 'Event slice downloaded',
    gifFail: 'Event slice export failed',
    stillStart: 'Rendering archive still 8%',
    stillDone: 'Archive still downloaded',
    stillFail: 'Archive still export failed',
    mobileForgeHint: 'Touch the vessel. The altar will rise.',
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
    saveGif: '保存事件切片',
    saveStill: '保存档案静帧',
    encoding: '编码中...',
    archiveKicker: '共享身体 / 第二层',
    archiveTitle: '公共泪海仍在缓慢流动。',
    watcherLines: [
      '这种裂纹，已经被看见过。',
      '你不是唯一一个留下它的人。',
      '档案识别出了这道情绪断层。',
      '公共泪海检测到残余回声。',
      '有旧信号，仍在这具腔体里盘旋。',
      '系统曾经记录过类似的损伤。',
    ],
    signatureLines: [
      '我们仍然保留着你的残留物。',
      '你上一次留下的裂痕，还附着在这具腔体里。',
      '更早之前的那部分损失，仍处于激活状态。',
      '档案还记得你上一次失去的形状。',
    ],
    extractionDelay: [
      '正在进行抽取...',
      '有些部分将无法被取回。',
      '腔体正在把语言从你的信号里剥离出去。',
      '残留模式正在被隔离。',
    ],
    synced: '已写入公共泪海。',
    remoteUnreachable: '已保存到本地。远端泪海暂时不可达。',
    writingLayer: '正在写入第二公共层...',
    gifStart: '正在编码事件切片 8%',
    gifDone: '事件切片已保存',
    gifFail: '事件切片导出失败',
    stillStart: '正在渲染档案静帧 8%',
    stillDone: '档案静帧已保存',
    stillFail: '档案静帧导出失败',
    mobileForgeHint: '触碰容器，底部祭坛会升起。',
  },
}

const SYSTEM_PATTERNS = {
  en: [
    { sourceType: 'residue', name: 'Residual Carrier', emotion: 'neutral', lines: ['The chamber retained what the sender could not hold.', 'A fragment remained after language was stripped away.', 'This residue entered the archive without resistance.', 'The system preserved a remainder no one reclaimed.'] },
    { sourceType: 'echo', name: 'Echo Body', emotion: 'sadness', lines: ['A delayed sorrow arrived long after its source was gone.', 'This signal kept repeating after the confession ended.', 'The archive is still hearing a voice that already collapsed.', 'A grief waveform returned without a body attached.'] },
    { sourceType: 'error', name: 'Fault Sample', emotion: 'anxiety', lines: ['A malformed emotion packet slipped into the sea.', 'The sentence failed, but the panic completed itself.', 'This entry was generated by a parsing fault in the chamber.', 'Something unstable was mistaken for a human signal.'] },
    { sourceType: 'surveillance', name: 'Observed Unit', emotion: 'fear', lines: ['The archive detected distress before the sender spoke.', 'Observation completed. A tear formed without consent.', 'This sample may have originated from passive monitoring.', 'A watched pattern condensed into an autonomous tear.'] },
    { sourceType: 'blank', name: 'Blank Vessel', emotion: 'void', lines: ['No language was present. The emptiness entered anyway.', 'This tear contains almost nothing, which is why it persists.', 'A blank interior was archived as a complete signal.', 'There was no confession here. Only pressure.'] },
    { sourceType: 'corruption', name: 'Corrupted Carrier', emotion: 'despair', lines: ['The signal darkened while descending through the chamber.', 'A tear crossed the threshold already contaminated.', 'Corruption spread before the archive could isolate it.', 'This sample should have been sealed, but it leaked inward.'] },
    { sourceType: 'degradation', name: 'Degraded String', emotion: 'void', lines: ['remain // remain // remain', 'this was not meant to stay', '0101 remain 01 void', '░░01░░void░░░'] },
  ],
  zh: [
    { sourceType: 'residue', name: '残留载体', emotion: 'neutral', lines: ['发送者没能留下的那部分，被腔体替他保留了。', '语言被剥离之后，还有碎片继续向下坠落。', '这份残留物进入档案时，没有任何抵抗。', '系统替某个人保存了一点无人回收的东西。'] },
    { sourceType: 'echo', name: '回声体', emotion: 'sadness', lines: ['源头已经消失了，悲伤却延迟抵达。', '那段表达已经结束，但回声还在继续。', '档案仍在听见一个已经崩塌的声音。', '有一道悲伤波形，脱离身体之后又回来了。'] },
    { sourceType: 'error', name: '故障样本', emotion: 'anxiety', lines: ['一段变形的情绪数据包滑进了泪海。', '句子失败了，但恐慌自己完成了生成。', '这条记录来自腔体解析时的一次偏差。', '系统把某种不稳定物误认成了人类信号。'] },
    { sourceType: 'surveillance', name: '被观测单元', emotion: 'fear', lines: ['发送者还没开口，档案已经先检测到痛感。', '观测已完成。一滴泪在未获同意前形成。', '这个样本可能来自一次被动监视。', '一道被注视过的模式，凝结成了独立泪滴。'] },
    { sourceType: 'blank', name: '空白容器', emotion: 'void', lines: ['这里本来没有语言，但空无本身进入了档案。', '这滴泪几乎没有内容，所以它更难消失。', '一个空的内部，被系统当成完整信号保存了。', '这里没有忏悔，只有压力。'] },
    { sourceType: 'corruption', name: '污染载体', emotion: 'despair', lines: ['信号在穿过腔体时变暗了。', '这滴泪越过阈值之前就已经被污染。', '扩散先发生了，隔离来得太晚。', '这个样本本该被封存，但它还是向内渗漏了。'] },
    { sourceType: 'degradation', name: '退化串', emotion: 'void', lines: ['保留 // 保留 // 保留', '这部分本来不该停留', '0101 残留 01 空无', '░░01░░空无░░░'] },
  ],
}

const EMOTION_SECTORS = [
  { nameEn: 'Tokyo', nameZh: '东京', lat: 35.68, lng: 139.69 },
  { nameEn: 'Berlin', nameZh: '柏林', lat: 52.52, lng: 13.4 },
  { nameEn: 'Los Angeles', nameZh: '洛杉矶', lat: 34.05, lng: -118.24 },
  { nameEn: 'São Paulo', nameZh: '圣保罗', lat: -23.55, lng: -46.63 },
  { nameEn: 'Reykjavík', nameZh: '雷克雅未克', lat: 64.14, lng: -21.9 },
  { nameEn: 'Seoul', nameZh: '首尔', lat: 37.56, lng: 126.98 },
  { nameEn: 'Warsaw', nameZh: '华沙', lat: 52.23, lng: 21.01 },
  { nameEn: 'Shanghai', nameZh: '上海', lat: 31.23, lng: 121.47 },
]

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

function loadResidualSignature() {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(LOCAL_SIGNATURE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function ensureResidualSignature(language) {
  if (typeof window === 'undefined') return null
  const existing = loadResidualSignature()
  if (existing?.id) return existing
  const id = globalThis.crypto?.randomUUID?.() || `sig-${Date.now()}`
  const signature = {
    id,
    createdAt: Date.now(),
    visitCount: 0,
    dominantEmotion: 'neutral',
    lastTearId: '',
    traceLine:
      language === 'zh'
        ? '系统尚未完全忘记你。'
        : 'The system has not fully forgotten you.',
  }
  window.localStorage.setItem(LOCAL_SIGNATURE_KEY, JSON.stringify(signature))
  return signature
}

function fragmentInput(text) {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (!normalized) return { retainedText: '', lostText: '', fractureRatio: 0 }
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

function sample(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function chooseSector(text) {
  const seed = Array.from(text).reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return EMOTION_SECTORS[seed % EMOTION_SECTORS.length]
}

function createSystemTearBlueprint(language, residualSignature) {
  const pool = SYSTEM_PATTERNS[language] || SYSTEM_PATTERNS.en
  const pattern = sample(pool)
  const line = sample(pattern.lines)
  const traceBias =
    residualSignature?.dominantEmotion &&
    Math.random() > 0.55 &&
    pool.find((item) => item.emotion === residualSignature.dominantEmotion)
  const resolvedPattern = traceBias || pattern
  const resolvedLine = traceBias ? sample(traceBias.lines) : line
  return {
    text: resolvedLine,
    sourceType: resolvedPattern.sourceType,
    emotionHint: resolvedPattern.emotion,
    displayName: resolvedPattern.name,
  }
}

function AppTopStrip({ language, setLanguage, residualSignature, watcherLine }) {
  return (
    <div className="mobile-top-strip">
      <div className="mobile-top-left">
        <span className="mobile-signature-chip">
          {residualSignature?.id?.slice(0, 8) || '--------'}
        </span>
      </div>

      <p className="mobile-watcher-line">{watcherLine}</p>

      <div className="mobile-top-right">
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
          中
        </button>
      </div>
    </div>
  )
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
  const [residualSignature, setResidualSignature] = useState(() =>
    ensureResidualSignature(loadLanguage())
  )
  const [visitCount] = useState(() => {
    if (typeof window === 'undefined') return 1
    const raw = Number(window.localStorage.getItem(LOCAL_VISIT_COUNT_KEY) || '0') + 1
    window.localStorage.setItem(LOCAL_VISIT_COUNT_KEY, String(raw))
    return raw
  })
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  )
  const [mobileInputOpen, setMobileInputOpen] = useState(false)
  const [residualMarks, setResidualMarks] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsMobile(window.innerWidth <= 640)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(LOCAL_LANG_KEY, language)
  }, [language])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      LOCAL_TEAR_STORAGE_KEY,
      JSON.stringify(localTears.slice(0, 48))
    )
  }, [localTears])

  useEffect(() => {
    const ensured = ensureResidualSignature(language)
    setResidualSignature(ensured)
  }, [language])

  useEffect(() => {
    const lines = residualSignature?.lastTearId
      ? [...copy.signatureLines, ...copy.watcherLines]
      : copy.watcherLines
    setWatcherLine(lines[0])
  }, [language, residualSignature, copy])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const lines = residualSignature?.lastTearId
        ? [...copy.signatureLines, ...copy.watcherLines]
        : copy.watcherLines
      const line = lines[Math.floor(Math.random() * lines.length)]
      setWatcherLine(line)
      setGlitchSeed((current) => current + 1)
    }, 5200)
    return () => window.clearInterval(interval)
  }, [copy, residualSignature])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const blueprint = createSystemTearBlueprint(language, residualSignature)
      const syntheticTear = generateTear(blueprint.text, true, blueprint)
      setLocalTears((current) => {
        if (current.some((item) => item.tearId === syntheticTear.tearId)) return current
        return [syntheticTear, ...current].slice(0, 48)
      })
      setLibraryRefreshKey((current) => current + 1)
    }, 18000)
    return () => window.clearInterval(interval)
    // generateTear is intentionally recreated with current language/signature state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, residualSignature])

  const previewText = useMemo(() => {
    const residualSource = residualSignature?.lastTearId
      ? localTears.find((item) => item.tearId === residualSignature.lastTearId)?.text
      : ''
    const source =
      inputText.trim() ||
      residualSource ||
      (language === 'zh'
        ? '档案把每一种情绪悬挂在冷色金属里'
        : 'the archive keeps every feeling suspended in chrome')
    return fragmentInput(source).retainedText || source
  }, [inputText, language, residualSignature, localTears])

  const previewEmotion = inputText.trim()
    ? analyzeEmotion(inputText)
    : residualSignature?.dominantEmotion || 'neutral'

  const previewBinary = textToBinary(previewText)
  const activeBinary = tearData ? tearData.binary : previewBinary
  const activeEmotion = tearData ? emotion : previewEmotion
  const activeColor =
    emotionColors[activeEmotion] ||
    emotionColors[previewEmotion] ||
    emotionColors.neutral
  const isExtracting = mode === 'sequence'

  const observationFeed = useMemo(() => {
    const recent = localTears.slice(0, 10)
    return recent.map((tear, index) => {
      const sector = chooseSector(tear.tearId || `${index}`)
      return {
        id: `${tear.tearId}-obs`,
        city: language === 'zh' ? sector.nameZh : sector.nameEn,
        emotion: tear.emotion,
      }
    })
  }, [localTears, language])

  const persistSignature = (nextSignature) => {
    setResidualSignature(nextSignature)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_SIGNATURE_KEY, JSON.stringify(nextSignature))
    }
  }

  const saveTearToCloud = async (nextTear) => {
    try {
      const response = await fetch(`${API_URL}/api/tears`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextTear),
      })
      if (!response.ok) throw new Error(`save failed with status ${response.status}`)
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

  function generateTear(rawText, systemGenerated = false, blueprint = null) {
    const normalizedText = rawText.trim()
    const { retainedText, lostText, fractureRatio } = fragmentInput(normalizedText)
    const encodedText = retainedText || normalizedText
    const binary = textToBinary(encodedText)
    const detectedType = analyzeEmotion(encodedText)
    const baseEmotion = blueprint?.emotionHint || detectedType
    const createdAt = Date.now()
    const nextTearId = generateTearId(normalizedText)
    const id = globalThis.crypto?.randomUUID?.() || createTearIdFallback(normalizedText)
    const intensityBase = systemGenerated ? 0.24 + Math.random() * 0.74 : 0.35 + Math.random() * 0.65
    const intensity = Number(intensityBase.toFixed(2))
    const corrupted =
      blueprint?.sourceType === 'corruption' ||
      intensity > 0.9 ||
      baseEmotion === 'despair'

    const resolvedEmotion = corrupted ? 'corrupted' : baseEmotion
    const sourceName = systemGenerated
      ? blueprint?.displayName || (language === 'zh' ? '无名来源' : 'Unknown Source')
      : `Shard ${nextTearId.slice(-4)}`
    const sector = chooseSector(nextTearId)

    return {
      id,
      _id: systemGenerated ? `system-${nextTearId}` : undefined,
      content: encodedText,
      intensity,
      type: detectedType,
      createdAt,
      text: encodedText,
      fullText: normalizedText,
      lostText,
      fractureRatio,
      binary,
      tearId: nextTearId,
      emotion: resolvedEmotion,
      name: sourceName,
      timestamp: new Date(createdAt).toISOString(),
      source: systemGenerated ? 'system' : 'local',
      sourceType: blueprint?.sourceType || (systemGenerated ? 'synthetic' : 'local'),
      systemGenerated,
      corrupted,
      density: Number((0.34 + Math.random() * 0.64).toFixed(2)),
      resonance: Math.floor(Math.random() * 28),
      location: language === 'zh' ? sector.nameZh : sector.nameEn,
      likes: 0,
      language,
      sector,
    }
  }

  const injectResidualMark = (tear) => {
    const sector = chooseSector(`${tear.tearId}-mark`)
    const mark = {
      id: `${tear.tearId}-mark`,
      tearId: tear.tearId,
      emotion: tear.emotion,
      intensity: tear.intensity || 0.5,
      sourceType: tear.sourceType || 'local',
      x: ((sector.lng + 180) / 360) * 100,
      y: ((90 - sector.lat) / 180) * 100,
      bornAt: Date.now(),
    }
    setResidualMarks((current) => [mark, ...current].slice(0, 12))
    setTimeout(() => {
      setResidualMarks((current) => current.filter((item) => item.id !== mark.id))
    }, 9000)
  }

  const handleExtract = async (rawText) => {
    const normalizedText = rawText.trim()
    if (!normalizedText || isExtracting) return

    const nextTear = generateTear(normalizedText)
    setMode('sequence')
    setStage('extracting')
    setInputText('')
    setMobileInputOpen(false)
    setWatcherLine(sample(copy.extractionDelay))
    setSaveMessage(copy.writingLayer)

    await wait(900 + Math.random() * 700)
    setWatcherLine(sample(copy.extractionDelay))
    setStage('glitch')

    await wait(900 + Math.random() * 900)
    setWatcherLine(sample(copy.extractionDelay))
    setStage('compress')

    await wait(700 + Math.random() * 600)
    setTearData(nextTear)
    setTearId(nextTear.tearId)
    setEmotion(nextTear.emotion)

    setLocalTears((current) => [
      nextTear,
      ...current.filter((item) => item.tearId !== nextTear.tearId),
    ])

    const nextSignature = {
      ...(residualSignature || ensureResidualSignature(language)),
      dominantEmotion: nextTear.emotion === 'corrupted' ? 'despair' : nextTear.emotion,
      lastTearId: nextTear.tearId,
      lastSeenAt: Date.now(),
      visitCount,
      traceLine: sample(copy.signatureLines),
    }
    persistSignature(nextSignature)
    void saveTearToCloud(nextTear)

    await wait(680)
    setStage('forming')
    await wait(940)
    setStage('dropping')
    await wait(1280)
    setStage('sea')
    await wait(980)
    setStage('idle')
    setMode('transit')
  }

  const handleTransitionComplete = () => {
    if (tearData) injectResidualMark(tearData)
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
        frameCount: 42,
        fps: 14,
        progressStart: 0.18,
        progressEnd: 0.96,
        onProgress: (progress) => {
          const percent = Math.round(progress * 100)
          setGifStatus(
            language === 'zh'
              ? `正在编码事件切片 ${percent}%`
              : `Encoding event slice ${percent}%`
          )
        },
      })

      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${tearData.tearId}-slice.gif`
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

  const handleSaveStill = async () => {
    if (!tearData || isSavingGif) return
    setIsSavingGif(true)
    setGifStatus(copy.stillStart)

    try {
      const { renderTransitStill } = await import('./utils/tearTransit')
      const blob = await renderTransitStill({
        tearData,
        emotionColor: emotionColors[tearData.emotion] || activeColor,
        progress: 0.88,
      })

      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${tearData.tearId}-still.png`
      anchor.click()
      window.URL.revokeObjectURL(url)
      setGifStatus(copy.stillDone)
    } catch (error) {
      console.error('still export failed:', error)
      setGifStatus(copy.stillFail)
    } finally {
      setIsSavingGif(false)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setInputText(transcript)
    if (isMobile) setMobileInputOpen(true)
  }

  return (
    <div className="app-shell">
      <div className="app-atmosphere" />
      <div className="app-grid" />
      <div className="app-vignette" />

      {isMobile ? (
        <AppTopStrip
          language={language}
          setLanguage={setLanguage}
          residualSignature={residualSignature}
          watcherLine={watcherLine}
        />
      ) : (
        <div className="lang-toggle floating">
          <button type="button" className={language === 'en' ? 'ghost-btn active' : 'ghost-btn'} onClick={() => setLanguage('en')}>EN</button>
          <button type="button" className={language === 'zh' ? 'ghost-btn active' : 'ghost-btn'} onClick={() => setLanguage('zh')}>中文</button>
        </div>
      )}

      {mode === 'forge' ? (
        <main className={`forge-view ${isMobile ? 'forge-view-mobile' : ''}`}>
          {isMobile ? (
            <>
              <section className="mobile-forge-stage">
                <div className="mobile-forge-copy">
                  <p className="section-kicker">{copy.appKicker}</p>
                  <h1 className={`forge-title glitch-${glitchSeed % 2}`}>{copy.forgeTitle}</h1>
                </div>

                <section className="forge-vessel mobile-forge-vessel" onClick={() => setMobileInputOpen(true)}>
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
                        <ExtractionSequence compact stage="forming" text={previewText} tearData={{ binary: activeBinary }} emotionColor={activeColor} language={language} />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mobile-forge-hint">{copy.mobileForgeHint}</div>
              </section>

              <section className={`mobile-input-altar ${mobileInputOpen ? 'is-open' : ''}`}>
                <div className="mobile-input-handle" onClick={() => setMobileInputOpen((v) => !v)} />
                <div className="mobile-input-header">
                  <div className="system-readout mobile-system-readout">
                    <div><span>{copy.currentEmotion}</span><strong>{activeEmotion}</strong></div>
                    <div><span>{copy.retentionRatio}</span><strong>70%</strong></div>
                    <div><span>{copy.archiveId}</span><strong>{tearId || copy.unresolved}</strong></div>
                  </div>
                </div>

                <div className="mobile-input-content">
                  <ExtractionInput
                    language={language}
                    value={inputText}
                    onChange={setInputText}
                    onSubmit={handleExtract}
                    placeholder={copy.placeholder}
                    disabled={!inputText.trim() || isExtracting}
                  />

                  <div className="forge-actions-row mobile-forge-actions">
                    <VoiceInput language={language} onTranscript={handleVoiceTranscript} />
                    <div className="forge-status-stack mobile-status-stack">
                      <div className="micro-status"><span>{copy.sync}</span><strong>{saveMessage || copy.standby}</strong></div>
                      <div className="micro-status"><span>{copy.seaCount}</span><strong>{12482 + localTears.length}</strong></div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="forge-copy">
                <p className="section-kicker">{copy.appKicker}</p>
                <h1 className={`forge-title glitch-${glitchSeed % 2}`}>{copy.forgeTitle}</h1>
                <p className="forge-body">{copy.forgeBody}</p>

                <div className="system-readout">
                  <div><span>{copy.currentEmotion}</span><strong>{activeEmotion}</strong></div>
                  <div><span>{copy.retentionRatio}</span><strong>70%</strong></div>
                  <div><span>{copy.archiveId}</span><strong>{tearId || copy.unresolved}</strong></div>
                </div>

                {residualSignature?.lastTearId ? (
                  <div className="residual-trace-panel">
                    <span className="residual-trace-label">{language === 'zh' ? '残留签名' : 'Residual Signature'}</span>
                    <strong>{residualSignature.id.slice(0, 8)}</strong>
                    <p>{residualSignature.traceLine}</p>
                  </div>
                ) : null}

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
                      <ExtractionSequence compact stage="forming" text={previewText} tearData={{ binary: activeBinary }} emotionColor={activeColor} language={language} />
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
                    <div className="micro-status"><span>{copy.sync}</span><strong>{saveMessage || copy.standby}</strong></div>
                    <div className="micro-status"><span>{copy.seaCount}</span><strong>{12482 + localTears.length}</strong></div>
                  </div>
                </div>
              </section>
            </>
          )}
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
          onSaveStill={handleSaveStill}
          gifStatus={gifStatus}
          isSavingGif={isSavingGif}
          language={language}
        />
      ) : (
        <main className={`archive-view ${isMobile ? 'archive-view-mobile' : ''}`}>
          <div className="archive-header">
            <div>
              <p className="section-kicker">{copy.archiveKicker}</p>
              <h2>{copy.archiveTitle}</h2>
            </div>

            <div className="archive-header-actions">
              {tearData ? (
                <>
                  <button type="button" className="ghost-btn" onClick={handleSaveGif} disabled={isSavingGif}>
                    {isSavingGif ? copy.encoding : copy.saveGif}
                  </button>
                  <button type="button" className="ghost-btn" onClick={handleSaveStill} disabled={isSavingGif}>
                    {isSavingGif ? copy.encoding : copy.saveStill}
                  </button>
                </>
              ) : null}
              <button type="button" className="ghost-btn" onClick={() => setMode('forge')}>
                {copy.returnToExtraction}
              </button>
            </div>
          </div>

          <EmotionMap language={language} observations={observationFeed} />

          <TearLibrary
            language={language}
            featuredTear={tearData}
            localTears={localTears}
            refreshKey={libraryRefreshKey}
            residualSignature={residualSignature}
            isMobile={isMobile}
            residualMarks={residualMarks}
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
