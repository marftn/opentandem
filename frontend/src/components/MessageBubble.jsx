import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import AudioPlayerButton from './AudioPlayerButton.jsx';

export default function MessageBubble({ message, isStreaming = false, onPlayAudio, hasAudio, showAudioBtn, translation, onTranslate }) {
  const isUser = message.role === 'user';
  const [showCorrection, setShowCorrection] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const popupRef = useRef(null);
  const hintPopupRef = useRef(null);
  const translatePopupRef = useRef(null);

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

  // Close hint popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hintPopupRef.current && !hintPopupRef.current.contains(event.target)) {
        setShowHint(false);
      }
    };
    if (showHint) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHint]);

  // Close translation popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translatePopupRef.current && !translatePopupRef.current.contains(event.target)) {
        setShowTranslation(false);
      }
    };
    if (showTranslation) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTranslation]);

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
        {/* Hint Button (Left of Teacher button) */}
        {isUser && message.id && !message.isHinting && message.hint && message.hint.trim().toUpperCase() !== 'OK' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowHint(!showHint)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning-color, #eab308)',
                transition: 'transform 0.2s',
                transform: showHint ? 'scale(1.1)' : 'scale(1)'
              }}
              title="View Suggestion"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"></path>
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
              </svg>
            </button>

            {/* Glassmorphism Popup Modal for Hint */}
            {showHint && createPortal(
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px'
              }}>
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)'
                  }}
                  onClick={() => setShowHint(false)}
                />
                <div ref={hintPopupRef} className="glass-panel animate-fade-in" style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '450px',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg, 16px)',
                  background: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  zIndex: 10000
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-color, #eab308)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"></path>
                        <path d="M9 18h6"></path>
                        <path d="M10 22h4"></path>
                      </svg>
                      <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Suggestion</strong>
                    </div>
                    <button 
                      onClick={() => setShowHint(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      title="Close"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div style={{ lineHeight: '1.6', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    <ReactMarkdown>{message.hint}</ReactMarkdown>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

        {/* Translate Button (Left of AI bubble) */}
        {!isUser && !isStreaming && onTranslate && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                onTranslate();
                setShowTranslation(!showTranslation);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                transition: 'transform 0.2s',
                transform: showTranslation ? 'scale(1.1)' : 'scale(1)'
              }}
              title="Translate to English"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l6 6"></path>
                <path d="M4 14l6-6 2-3"></path>
                <path d="M2 5h12"></path>
                <path d="M7 2h1"></path>
                <path d="M17 16l4-4"></path>
                <path d="M16 21l5-5"></path>
                <path d="M22 10.5l-5 5"></path>
              </svg>
            </button>

            {showTranslation && createPortal(
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px'
              }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)'
                  }}
                  onClick={() => setShowTranslation(false)}
                />
                <div ref={translatePopupRef} className="glass-panel animate-fade-in" style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '450px',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg, 16px)',
                  background: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  zIndex: 10000
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 8l6 6"></path>
                        <path d="M4 14l6-6 2-3"></path>
                        <path d="M2 5h12"></path>
                        <path d="M7 2h1"></path>
                        <path d="M17 16l4-4"></path>
                        <path d="M16 21l5-5"></path>
                        <path d="M22 10.5l-5 5"></path>
                      </svg>
                      <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>English Translation</strong>
                    </div>
                    <button
                      onClick={() => setShowTranslation(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      title="Close"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div style={{ lineHeight: '1.6', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {translation ? (
                      <ReactMarkdown>{translation}</ReactMarkdown>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '16px', height: '16px', border: '2px solid var(--text-secondary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                        Translating...
                      </div>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

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

            {/* Glassmorphism Popup Modal */}
            {showCorrection && message.correction && message.correction.trim().toUpperCase() !== 'OK' && createPortal(
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px'
              }}>
                {/* Backdrop */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)'
                  }}
                  onClick={() => setShowCorrection(false)}
                />
                
                {/* Modal Content */}
                <div ref={popupRef} className="glass-panel animate-fade-in" style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '450px',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg, 16px)',
                  background: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  zIndex: 10000
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error-color, #ef4444)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 22h20L12 2z"></path>
                        <path d="M12 16v-4"></path>
                        <path d="M12 20h.01"></path>
                      </svg>
                      <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Teacher's Feedback</strong>
                    </div>
                    <button 
                      onClick={() => setShowCorrection(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      title="Close"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div style={{ lineHeight: '1.6', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    <ReactMarkdown>{message.correction}</ReactMarkdown>
                  </div>
                </div>
              </div>,
              document.body
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
