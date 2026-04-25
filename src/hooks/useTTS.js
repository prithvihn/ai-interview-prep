import { useState, useCallback, useRef } from 'react'

/**
 * Hook wrapping the Web Speech API SpeechSynthesis.
 * Provides speak / cancel / pause / resume controls.
 */
export function useTTS({ rate = 1, pitch = 1, volume = 1, lang = 'en-US' } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported] = useState('speechSynthesis' in window)
  const utteranceRef = useRef(null)

  const speak = useCallback(
    (text) => {
      if (!isSupported || !text) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume
      utterance.lang = lang

      // Pick a decent voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
      ) || voices.find((v) => v.lang.startsWith('en'))
      if (preferred) utterance.voice = preferred

      utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false) }
      utterance.onend = () => { setIsSpeaking(false); setIsPaused(false) }
      utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false) }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, rate, pitch, volume, lang]
  )

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [])

  return { speak, cancel, pause, resume, isSpeaking, isPaused, isSupported }
}
