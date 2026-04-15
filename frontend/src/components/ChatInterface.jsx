import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat.jsx';
import MessageBubble from './MessageBubble.jsx';
import MessageInput from './MessageInput.jsx';

export default function ChatInterface() {
  const { messages, currentStreamingMessage, isLoading, sendMessage, playAudioForMessage, audioCache } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  return (
    <div className="glass-panel" style={{
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: 'var(--radius-lg)', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={msg.id || idx} 
            message={msg} 
            onPlayAudio={msg.id ? () => playAudioForMessage(msg.id) : null}
            hasAudio={!!audioCache[msg.id]}
          />
        ))}
        
        {currentStreamingMessage && (
          <MessageBubble 
            message={{ role: 'assistant', content: currentStreamingMessage }} 
            isStreaming={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '20px',
        borderTop: '1px solid var(--border-glass)',
        backgroundColor: 'rgba(20, 22, 33, 0.5)'
      }}>
        <MessageInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
