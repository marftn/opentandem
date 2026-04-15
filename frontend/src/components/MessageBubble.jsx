import React from 'react';
import AudioPlayerButton from './AudioPlayerButton.jsx';

export default function MessageBubble({ message, isStreaming = false, onPlayAudio, hasAudio }) {
  const isUser = message.role === 'user';
  
  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      width: '100%',
      marginBottom: '8px'
    }}>
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

      {!isUser && !isStreaming && onPlayAudio && (
        <div style={{ marginTop: '6px', marginLeft: '4px' }}>
          <AudioPlayerButton onPlay={onPlayAudio} isReady={hasAudio} />
        </div>
      )}
    </div>
  );
}
