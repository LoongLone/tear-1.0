export const textToBinary = (text) => {
  return Array.from(new TextEncoder().encode(text))
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join('')
}

export const generateTearId = (text) => {
  const timestamp = Date.now().toString().slice(-6)
  const hash =
    text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000000

  return `NVO-${timestamp}-${hash.toString().padStart(6, '0')}`
}

export const analyzeEmotion = (text) => {
  const lowerText = text.toLowerCase()
  const emotionMap = {
    sad: ['sad', '难过', '悲伤', 'hurt', '痛苦', '孤独', 'alone', 'cry', '哭'],
    angry: ['angry', '生气', '愤怒', 'hate', '恨', 'mad', 'rage'],
    happy: ['happy', '开心', '快乐', 'joy', 'glad', 'smile', '笑'],
    anxious: ['anxious', '焦虑', 'nervous', '担心', 'worry', 'fear', '怕'],
  }

  for (const [emotion, keywords] of Object.entries(emotionMap)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return emotion
      }
    }
  }

  return 'neutral'
}

export const emotionColors = {
  sad: '#8faeff',
  sadness: '#8faeff',
  angry: '#ff8b9b',
  happy: '#ffd3a8',
  anxious: '#c3b9ff',
  anxiety: '#c3b9ff',
  fear: '#aeb7ff',
  neutral: '#bce8ff',
  void: '#9fb5c7',
  despair: '#7c5d89',
  corrupted: '#c86a8a',
}
