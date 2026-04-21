import React, { useState, useRef, useEffect } from 'react';
import AudioPlayerButton from './AudioPlayerButton.jsx';

export default function MessageBubble({ message, isStreaming = false, onPlayAudio, hasAudio, showAudioBtn }) {
  const isUser = message.role === 'user';
  const [showCorrection, setShowCorrection] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowCorrection(false);
      }
    };
    if (showCorrection) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCorrection]);

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginBottom: '8px',
      position: 'relative',
      zIndex: showCorrection ? 100 : 1
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        flexDirection: 'row'
      }}>
        
        {/* Correction Button (Left of bubble) */}
        {isUser && message.id && (
          <div style={{ position: 'relative' }}>
            {message.isCorrecting ? (
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid var(--text-secondary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              </div>
            ) : message.correction ? (
              <button
                onClick={() => setShowCorrection(!showCorrection)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: message.correction.trim().toUpperCase() === 'OK' ? 'var(--success-color, #10b981)' : 'var(--error-color, #ef4444)',
                  transition: 'transform 0.2s',
                  transform: showCorrection ? 'scale(1.1)' : 'scale(1)'
                }}
                title="View Teacher Feedback"
              >
                {message.correction.trim().toUpperCase() === 'OK' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </button>
            ) : null}

            {/* Glassmorphism Popup */}
            {showCorrection && message.correction && message.correction.trim().toUpperCase() !== 'OK' && (
              <div ref={popupRef} className="glass-panel animate-fade-in" style={{
                position: 'absolute',
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginRight: '12px',
                width: '300px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', // opaque background for readability
                zIndex: 50,
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--error-color, #ef4444)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 22h20L12 2z"></path>
                    <path d="M12 16v-4"></path>
                    <path d="M12 20h.01"></path>
                  </svg>
                  <strong style={{ fontFamily: 'var(--font-heading)' }}>Teacher's Feedback</strong>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {message.correction}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{
          maxWidth: '75%',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: isUser ? 'var(--msg-user)' : 'var(--msg-ai)',
          color: isUser ? 'var(--text-inverse)' : 'var(--text-primary)',
          boxShadow: isUser ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
          border: isUser ? 'none' : '1px solid var(--border-glass)',
          borderBottomRightRadius: isUser ? '4px' : 'var(--radius-md)',
          borderBottomLeftRadius: isUser ? 'var(--radius-md)' : '4px',
          position: 'relative'
        }}>
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {message.content}
            {isStreaming && <span style={{ animation: 'pulse 1s infinite' }}>...</span>}
          </p>
        </div>

      </div>

      {!isUser && !isStreaming && showAudioBtn && onPlayAudio && (
        <div style={{ marginTop: '6px', marginLeft: '4px' }}>
          <AudioPlayerButton onPlay={onPlayAudio} isReady={hasAudio} />
        </div>
      )}
    </div>
  );
}
