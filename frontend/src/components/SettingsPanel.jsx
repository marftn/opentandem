import React, { useState, useRef } from 'react';
import SettingsToggle from './SettingsToggle.jsx';
import { SettingsIcon } from './icons.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { checkKokoroHealth, checkSttHealth } from '../services/api.js';
import styles from './SettingsPanel.module.css';

export default function SettingsPanel({ audioSettings, setAudioSettings, correctionSettings, setCorrectionSettings, teacherFeedbackInEnglish, setTeacherFeedbackInEnglish }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [loadingSTT, setLoadingSTT] = useState(false);
  const panelRef = useRef(null);

  useClickOutside(panelRef, () => setIsOpen(false));

  const handleToggleTTS = async (val) => {
    if (val) {
      setLoadingTTS(true);
      setErrorMsg('');
      const isHealthy = await checkKokoroHealth();
      setLoadingTTS(false);
      if (!isHealthy) {
        setErrorMsg('Text-to-Speech service is currently unavailable.');
        setAudioSettings(prev => ({ ...prev, generateAudio: false }));
        return;
      }
    }
    setAudioSettings(prev => ({ ...prev, generateAudio: val }));
  };

  const handleToggleSTT = async (val) => {
    if (val) {
      setLoadingSTT(true);
      setErrorMsg('');
      const isHealthy = await checkSttHealth();
      setLoadingSTT(false);
      if (!isHealthy) {
        setErrorMsg('Speech-to-Text service is currently unavailable.');
        setAudioSettings(prev => ({ ...prev, enableSTT: false }));
        return;
      }
    }
    setAudioSettings(prev => ({ ...prev, enableSTT: val }));
  };

  return (
    <div ref={panelRef} className={styles.container}>
      <button
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnOpen : ''}`}
        onClick={() => setIsOpen(v => !v)}
      >
        <SettingsIcon />
        Settings
      </button>

      {isOpen && (
        <div className={`glass-panel animate-fade-in ${styles.panel}`}>
          <h3 className={styles.sectionTitle}>Audio Preferences</h3>
          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
          <SettingsToggle label="Speech to Text (Mic)" enabled={audioSettings.enableSTT}    onChange={handleToggleSTT} isLoading={loadingSTT} />
          <SettingsToggle label="Generate Audio (TTS)" enabled={audioSettings.generateAudio} onChange={handleToggleTTS} isLoading={loadingTTS} />
          <SettingsToggle label="Auto-Play Audio"       enabled={audioSettings.autoPlayAudio} onChange={(val) => setAudioSettings(prev => ({ ...prev, autoPlayAudio: val }))} />

          <h3 className={styles.sectionTitle}>Correction Preferences</h3>
          <SettingsToggle label="Correct Punctuation" enabled={correctionSettings?.punctuation} onChange={(val) => setCorrectionSettings(prev => ({ ...prev, punctuation: val }))} />
          <SettingsToggle label="Correct Accents"     enabled={correctionSettings?.accents}     onChange={(val) => setCorrectionSettings(prev => ({ ...prev, accents: val }))} />
          <SettingsToggle label="Correct Casing"      enabled={correctionSettings?.casing}      onChange={(val) => setCorrectionSettings(prev => ({ ...prev, casing: val }))} />

          <h3 className={styles.sectionTitle}>Teacher Preferences</h3>
          <SettingsToggle label="Feedback in English" enabled={teacherFeedbackInEnglish} onChange={setTeacherFeedbackInEnglish} />
        </div>
      )}
    </div>
  );
}
