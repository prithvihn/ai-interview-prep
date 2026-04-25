import React, { useEffect, useRef } from 'react'

/**
 * Props:
 *  - transcript: string  (final text)
 *  - interimTranscript: string
 *  - isListening: boolean
 *  - placeholder: string
 */
export default function TranscriptPane({
  transcript = '',
  interimTranscript = '',
  isListening = false,
  placeholder = 'Your answer will appear here as you speak…',
}) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, interimTranscript])

  const isEmpty = !transcript && !interimTranscript

  return (
    <div className="relative bg-surface border border-border rounded-2xl p-5 min-h-[140px] max-h-80 overflow-y-auto">
      {/* Recording indicator */}
      {isListening && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 font-medium font-mono">REC</span>
        </div>
      )}

      {isEmpty ? (
        <p className="text-muted text-sm italic select-none">{placeholder}</p>
      ) : (
        <p className="text-sm text-gray-200 leading-relaxed">
          {transcript && <span>{transcript}</span>}
          {interimTranscript && (
            <span className="text-muted italic"> {interimTranscript}</span>
          )}
          {isListening && (
            <span className="ml-0.5 inline-block w-0.5 h-4 bg-accent align-middle animate-blink" />
          )}
        </p>
      )}

      <div ref={endRef} />
    </div>
  )
}
