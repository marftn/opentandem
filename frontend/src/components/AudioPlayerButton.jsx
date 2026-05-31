import React from 'react';
import { PlayIcon, LoaderIcon } from './icons.jsx';
import styles from './AudioPlayerButton.module.css';

// Replay button for a message's TTS audio; shows a "Generating..." state until the audio is ready.
export default function AudioPlayerButton({ onPlay, isReady }) {
  return (
    <button
      className={`${styles.btn} ${isReady ? styles.btnReady : styles.btnPending}`}
      onClick={onPlay}
      disabled={!isReady}
      title={isReady ? 'Play Audio' : 'Generating Audio...'}
    >
      {isReady ? (
        <>
          <PlayIcon />
          Replay
        </>
      ) : (
        <>
          <LoaderIcon />
          Generating...
        </>
      )}
    </button>
  );
}
