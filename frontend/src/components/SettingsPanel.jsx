import React, { useState, useRef, useEffect } from 'react';
import SettingsToggle from './SettingsToggle.jsx';

export default function SettingsPanel({ audioSettings, setAudioSettings, correctionSettings, setCorrectionSettings, teacherFeedbackInEnglish, setTeacherFeedbackInEnglish }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [loadingSTT, setLoadingSTT] = useState(false);

  const handleToggleTTS = async (val) => {
    if (val) {
      setLoadingTTS(true);
      setErrorMsg('');
      const { checkKokoroHealth } = await import('../services/api');
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
      const { checkSttHealth } = await import('../services/api');
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

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={panelRef} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
          color: isOpen ? '#fff' : 'var(--text-secondary)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-pill)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-normal)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        Settings
      </button>

      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Audio Preferences</h3>
          
          {errorMsg && (
            <div style={{ padding: '8px', background: 'var(--error-color, rgba(239, 68, 68, 0.2))', color: '#ff8a8a', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '8px' }}>
              {errorMsg}
            </div>
          )}

          <SettingsToggle 
            label="Speech to Text (Mic)" 
            enabled={audioSettings.enableSTT} 
            onChange={handleToggleSTT}
            isLoading={loadingSTT}
          />
          
          <SettingsToggle 
            label="Generate Audio (TTS)" 
            enabled={audioSettings.generateAudio} 
            onChange={handleToggleTTS} 
            isLoading={loadingTTS}
          />
          
          <SettingsToggle 
            label="Auto-Play Audio" 
            enabled={audioSettings.autoPlayAudio} 
            onChange={(val) => setAudioSettings(prev => ({ ...prev, autoPlayAudio: val }))} 
          />
          <h3 style={{ fontSize: '1rem', marginTop: '16px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Correction Preferences</h3>
          
          <SettingsToggle 
            label="Correct Punctuation" 
            enabled={correctionSettings?.punctuation} 
            onChange={(val) => setCorrectionSettings(prev => ({ ...prev, punctuation: val }))} 
          />
          <SettingsToggle 
            label="Correct Accents" 
            enabled={correctionSettings?.accents} 
            onChange={(val) => setCorrectionSettings(prev => ({ ...prev, accents: val }))} 
          />
          <SettingsToggle 
            label="Correct Casing" 
            enabled={correctionSettings?.casing} 
            onChange={(val) => setCorrectionSettings(prev => ({ ...prev, casing: val }))} 
          />
          <h3 style={{ fontSize: '1rem', marginTop: '16px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Teacher Preferences</h3>
          <SettingsToggle 
            label="Feedback in English" 
            enabled={teacherFeedbackInEnglish} 
            onChange={setTeacherFeedbackInEnglish} 
          />
        </div>
      )}
    </div>
  );
}
