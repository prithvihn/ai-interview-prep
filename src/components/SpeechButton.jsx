import React from 'react'

/**
 * Mic toggle button with recording animation.
 * Props:
 *  - isListening: boolean
 *  - onToggle: () => void
 *  - disabled: boolean
 */
export default function SpeechButton({ isListening, onToggle, disabled = false }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when recording */}
      {isListening && (
        <>
          <span className="absolute w-16 h-16 rounded-full bg-accent/20 recording-ring" />
          <span className="absolute w-16 h-16 rounded-full bg-accent/10 recording-ring" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 font-semibold
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 animate-pulse-green'
            : 'bg-accent hover:bg-accent-dim shadow-lg shadow-accent/20'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        {isListening ? <StopIcon /> : <MicIcon />}
      </button>
    </div>
  )
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}
