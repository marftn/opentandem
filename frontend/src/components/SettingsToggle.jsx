import React from 'react';
import styles from './SettingsToggle.module.css';

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
