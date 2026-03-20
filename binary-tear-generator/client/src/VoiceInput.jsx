import { useState } from 'react'

const COPY = {
  en: {
    unsupported:
      'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
    listening: 'LISTENING...',
    idle: 'SPEAK YOUR EMOTION',
    failed: 'Recognition failed:',
  },
  zh: {
    unsupported: '当前浏览器不支持语音识别，请使用 Chrome 或 Edge。',
    listening: '正在聆听...',
    idle: '说出你的情绪',
    failed: '识别失败：',
  },
}

function VoiceInput({ language = 'en', onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const copy = COPY[language]

  const startListening = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      setError(copy.unsupported)
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      setError(`${copy.failed} ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <div className="voice-input">
      <button
        type="button"
        className="voice-button"
        onClick={startListening}
        disabled={isListening}
      >
        {isListening ? copy.listening : copy.idle}
      </button>
      {error ? <p className="voice-error">{error}</p> : null}
    </div>
  )
}

export default VoiceInput
