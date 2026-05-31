import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat.jsx';
import MessageBubble from './MessageBubble.jsx';
import MessageInput from './MessageInput.jsx';
import styles from './ChatInterface.module.css';

export default function ChatInterface({ audioSettings, correctionSettings, selectedLanguage, teacherFeedbackInEnglish }) {
  const { messages, currentStreamingMessage, isLoading, sendMessage, playAudioForMessage, audioCache, translations, translateMessage } = useChat(audioSettings, correctionSettings, selectedLanguage, teacherFeedbackInEnglish);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

  return (
    <div className={`glass-panel ${styles.container}`}>
      <div className={styles.messageList}>
        {messages.map((msg, idx) => {
          const hasAudio = !!audioCache[msg.id];
          return (
            <MessageBubble
              key={msg.id ?? idx}
              message={msg}
              onPlayAudio={msg.id ? () => playAudioForMessage(msg.id) : null}
              hasAudio={hasAudio}
              showAudioBtn={hasAudio || (audioSettings.generateAudio && !!msg.id)}
              translation={translations[msg.id]}
              onTranslate={msg.id && !msg.isCorrecting ? () => translateMessage(msg.id, msg.content) : null}
            />
          );
        })}

        {currentStreamingMessage && (
          <MessageBubble
            message={{ role: 'assistant', content: currentStreamingMessage }}
            isStreaming
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputBar}>
        <MessageInput onSend={sendMessage} isLoading={isLoading} enableSTT={audioSettings.enableSTT} selectedLanguage={selectedLanguage} />
      </div>
    </div>
  );
}
