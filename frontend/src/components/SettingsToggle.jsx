import React from 'react';
import styles from './SettingsToggle.module.css';

// Labelled toggle switch; shows a loading state while an async operation is in progress.
export default function SettingsToggle({ label, enabled, onChange, isLoading }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <button
        className={`${styles.track} ${enabled ? styles.trackOn : styles.trackOff} ${isLoading ? styles.trackLoading : ''}`}
        onClick={() => !isLoading && onChange(!enabled)}
        disabled={isLoading}
        aria-pressed={enabled}
      >
        <div className={`${styles.thumb} ${enabled ? styles.thumbOn : styles.thumbOff}`} />
      </button>
    </div>
  );
}
