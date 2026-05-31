import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AudioPlayerButton from './AudioPlayerButton.jsx';
import Modal from './Modal.jsx';
import { CheckCircleIcon, AlertCircleIcon, AlertTriangleIcon, LightbulbIcon, TranslateIcon } from './icons.jsx';
import styles from './MessageBubble.module.css';

// Shows a spinner while the teacher is evaluating, a checkmark when correct, or an error button with a modal trigger.
function CorrectionStatus({ message, isActive, onToggle }) {
  if (message.isCorrecting) {
    return (
      <div className={styles.correctionSpinner}>
        <span className="spinner" />
      </div>
    );
  }
  if (!message.correction) return null;

  const isOk = message.correction.trim().toUpperCase() === 'OK';
  if (isOk) {
    return (
      <span className={`${styles.feedbackBtn} ${styles.successColor}`}>
        <CheckCircleIcon size={24} />
      </span>
    );
  }
  return (
    <button
      className={`${styles.feedbackBtn} ${styles.errorColor} ${isActive ? styles.feedbackBtnActive : ''}`}
      onClick={onToggle}
      title="View Teacher Feedback"
    >
      <AlertCircleIcon size={24} />
    </button>
  );
}

// Renders a single chat bubble with optional correction status, naturalness hint, translation, and audio replay.
export default function MessageBubble({ message, isStreaming = false, onPlayAudio, hasAudio, showAudioBtn, translation, onTranslate }) {
  const isUser = message.role === 'user';
  const [showCorrection, setShowCorrection] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const hasHint = !message.isHinting && message.hint && message.hint.trim().toUpperCase() !== 'OK';
  const hasCorrectionError = message.correction && message.correction.trim().toUpperCase() !== 'OK';

  return (
    <div className={`animate-fade-in ${styles.wrapper}`}>
      <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAi}`}>

        {isUser && hasHint && (
          <button
            className={`${styles.feedbackBtn} ${styles.warningColor} ${showHint ? styles.feedbackBtnActive : ''}`}
            onClick={() => setShowHint(true)}
            title="View Suggestion"
          >
            <LightbulbIcon size={24} />
          </button>
        )}

        {!isUser && !isStreaming && onTranslate && (
          <button
            className={`${styles.feedbackBtn} ${styles.accentColor} ${showTranslation ? styles.feedbackBtnActive : ''}`}
            onClick={() => { onTranslate(); setShowTranslation(v => !v); }}
            title="Translate to English"
          >
            <TranslateIcon size={24} />
          </button>
        )}

        {isUser && message.id && (
          <CorrectionStatus
            message={message}
            isActive={showCorrection}
            onToggle={() => setShowCorrection(v => !v)}
          />
        )}

        <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}>
          <p className={styles.bubbleText}>
            {message.content}
            {isStreaming && <span className={styles.streamingCursor}>...</span>}
          </p>
        </div>
      </div>

      {showTranslation && (
        <div className={`${styles.translationRow} ${isUser ? styles.translationRowUser : styles.translationRowAi}`}>
          <div className={`${styles.translationBubble} ${isUser ? styles.translationBubbleUser : styles.translationBubbleAi}`}>
            <div className={styles.translationLabel}>
              <TranslateIcon size={12} />
              English
            </div>
            {translation ? (
              <ReactMarkdown>{translation}</ReactMarkdown>
            ) : (
              <div className={styles.translating}>
                <span className="spinner spinner--sm" />
                Translating...
              </div>
            )}
          </div>
        </div>
      )}

      {!isUser && !isStreaming && showAudioBtn && onPlayAudio && (
        <div className={styles.audioRow}>
          <AudioPlayerButton onPlay={onPlayAudio} isReady={hasAudio} />
        </div>
      )}

      <Modal
        isOpen={showCorrection && hasCorrectionError}
        onClose={() => setShowCorrection(false)}
        title="Teacher's Feedback"
        accentColor="var(--color-error)"
        icon={<AlertTriangleIcon size={20} />}
      >
        <ReactMarkdown>{message.correction}</ReactMarkdown>
      </Modal>

      <Modal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        title="Suggestion"
        accentColor="var(--color-warning)"
        icon={<LightbulbIcon size={20} />}
      >
        <ReactMarkdown>{message.hint}</ReactMarkdown>
      </Modal>
    </div>
  );
}
