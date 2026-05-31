import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../services/api.js';
import { LANGUAGES } from '../constants/languages.js';
import { MicIcon, StopIcon, SendIcon } from './icons.jsx';
import styles from './MessageInput.module.css';

// Auto-resizing text input with an optional microphone button for voice recording and transcription.
export default function MessageInput({ onSend, isLoading, enableSTT = true, selectedLanguage = 'pt' }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Sends the current text and resets the input.
  const submitText = () => {
    if (text.trim() && !isLoading && !isTranscribing) {
      onSend(text);
      setText('');
      // Defer focus so the React re-render completes first
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitText();
    }
  };

  // Starts or stops microphone recording; on stop, transcribes the audio and sends the transcript.
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const transcript = await transcribeAudio(audioBlob);
          if (transcript) onSend(transcript);
        } catch (err) {
          console.error('Transcription failed', err);
        } finally {
          setIsTranscribing(false);
          stream.getTracks().forEach(t => t.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const isBusy = isLoading || isRecording || isTranscribing;
  const langName = LANGUAGES[selectedLanguage]?.name ?? 'Portuguese';
  const placeholder = isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : `Type a message in ${langName}...`;
  const canSend = !!text.trim() && !isBusy;

  return (
    <form onSubmit={(e) => { e.preventDefault(); submitText(); }} className={styles.form}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isRecording || isTranscribing}
        rows={1}
      />

      {enableSTT && (
        <button
          type="button"
          className={`${styles.actionBtn} ${isRecording ? styles.micBtnRecording : styles.micBtn}`}
          onClick={toggleRecording}
          disabled={isLoading || isTranscribing}
          title={isRecording ? 'Stop recording' : 'Record audio'}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </button>
      )}

      <button
        type="submit"
        className={`${styles.actionBtn} ${canSend ? styles.sendBtnActive : styles.sendBtn}`}
        disabled={!canSend}
      >
        <SendIcon />
      </button>
    </form>
  );
}
