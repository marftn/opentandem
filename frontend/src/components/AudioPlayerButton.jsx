import React from 'react';
import { PlayIcon, LoaderIcon } from './icons.jsx';
import styles from './AudioPlayerButton.module.css';

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
