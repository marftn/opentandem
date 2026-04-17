import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../services/api';

export default function MessageInput({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading && !isTranscribing) {
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

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setIsTranscribing(true);
          try {
            const transcript = await transcribeAudio(audioBlob);
            if (transcript) {
              onSend(transcript);
            }
          } catch (error) {
            console.error("Transcription failed", error);
          } finally {
            setIsTranscribing(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    }
  };

  const isInputDisabled = isLoading || isRecording || isTranscribing;

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
        placeholder={isRecording ? "Recording..." : isTranscribing ? "Transcribing..." : "Type a message in Portuguese..."}
        disabled={isInputDisabled}
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
      
      {/* Mic Button */}
      <button 
        type="button" 
        onClick={toggleRecording}
        disabled={isLoading || isTranscribing}
        title={isRecording ? "Stop recording output to send" : "Record audio"}
        style={{
          background: isRecording ? 'var(--error-color, #ef4444)' : 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          borderRadius: 'var(--radius-pill)',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: (isLoading || isTranscribing) ? 0.5 : 1,
          marginBottom: '4px',
          transition: 'all 0.2s',
          cursor: (isLoading || isTranscribing) ? 'not-allowed' : 'pointer'
        }}
      >
        {isRecording ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        )}
      </button>

      {/* Send Button */}
      <button 
        type="submit" 
        disabled={!text.trim() || isInputDisabled}
        style={{
          background: text.trim() && !isInputDisabled ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          borderRadius: 'var(--radius-pill)',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: (text.trim() && !isInputDisabled) ? 1 : 0.5,
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
