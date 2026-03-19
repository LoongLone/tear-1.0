import { useState } from 'react'

function VoiceInput({ onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')

  const startListening = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      setError('您的浏览器不支持语音识别，请使用 Chrome 或 Edge。')
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'zh-CN'
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
      setError(`识别失败: ${event.error}`)
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
        {isListening ? '正在聆听...' : '说出你的情绪'}
      </button>
      {error ? <p className="voice-error">{error}</p> : null}
    </div>
  )
}

export default VoiceInput
