import React, { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px'
    }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message in Portuguese..."
        disabled={isLoading}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          resize: 'none',
          maxHeight: '120px',
          minHeight: '24px',
          padding: '8px 4px',
          outline: 'none',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.4'
        }}
        rows={1}
      />
      <button 
        type="submit" 
        disabled={!text.trim() || isLoading}
        style={{
          background: text.trim() && !isLoading ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          borderRadius: 'var(--radius-pill)',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: (text.trim() && !isLoading) ? 1 : 0.5,
          marginBottom: '4px'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  );
}
