import { useState, useRef, useCallback, useEffect } from 'react'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

/**
 * Hook wrapping the Web Speech API SpeechRecognition.
 * Returns controls and live transcript state.
 */
export function useSpeechRecognition({ lang = 'en-US', continuous = true } = {}) {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const [isSupported] = useState(!!SpeechRecognition)

  const recognitionRef = useRef(null)
  const finalRef = useRef('')

  useEffect(() => {
    if (!isSupported) return

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interim = ''
      let final = finalRef.current

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      finalRef.current = final
      setTranscript(final.trim())
      setInterimTranscript(interim)
    }

    recognition.onerror = (e) => {
      setError(e.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [isSupported, lang, continuous])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    finalRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    recognitionRef.current.start()
    setIsListening(true)
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    finalRef.current = ''
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    transcript,
    interimTranscript,
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : ''),
    isListening,
    isSupported,
    error,
    start,
    stop,
    reset,
  }
}
