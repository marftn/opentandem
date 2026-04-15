import React from 'react';

export default function AudioPlayerButton({ onPlay, isReady }) {
  return (
    <button 
      onClick={onPlay}
      disabled={!isReady}
      title={isReady ? "Play Audio" : "Generating Audio..."}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        color: isReady ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-glass)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-pill)',
        opacity: isReady ? 1 : 0.5,
      }}
    >
      {isReady ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Replay
        </>
      ) : (
        <>
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          Generating...
        </>
      )}
    </button>
  );
}
