import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';

function App() {
  const [audioSettings, setAudioSettings] = useState({
    autoPlayAudio: true,
    generateAudio: true,
    enableSTT: true
  });
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  useEffect(() => {
    import('./services/api').then(({ checkKokoroHealth, checkSttHealth }) => {
      checkKokoroHealth().then(isHealthy => {
        if (!isHealthy) setAudioSettings(prev => ({ ...prev, generateAudio: false }));
      });
      checkSttHealth().then(isHealthy => {
        if (!isHealthy) setAudioSettings(prev => ({ ...prev, enableSTT: false }));
      });
    });
  }, []);

  if (!selectedLanguage) {
    return (
      <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ background: 'var(--msg-user)', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.5px', fontSize: '3rem' }}>
            Tandem Language Tutor
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '10px' }}>Select a language to practice</p>
        </header>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={() => setSelectedLanguage('pt')}
            style={{ 
              padding: '24px 48px', 
              fontSize: '1.5rem', 
              background: 'rgba(30, 32, 43, 0.6)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: 'var(--radius-lg)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '3rem' }}>🇵🇹</span>
            Portuguese
          </button>
          <button 
            onClick={() => setSelectedLanguage('es')}
            style={{ 
              padding: '24px 48px', 
              fontSize: '1.5rem', 
              background: 'rgba(30, 32, 43, 0.6)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: 'var(--radius-lg)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '3rem' }}>🇪🇸</span>
            Spanish
          </button>
          <button 
            onClick={() => setSelectedLanguage('it')}
            style={{ 
              padding: '24px 48px', 
              fontSize: '1.5rem', 
              background: 'rgba(30, 32, 43, 0.6)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: 'var(--radius-lg)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '3rem' }}>🇮🇹</span>
            Italian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <SettingsPanel audioSettings={audioSettings} setAudioSettings={setAudioSettings} />
      <header style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ background: 'var(--msg-user)', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.5px' }}>
          Tandem Language Tutor
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Practice your {selectedLanguage === 'pt' ? 'Portuguese' : selectedLanguage === 'es' ? 'Spanish' : 'Italian'} conversation</p>
      </header>
      
      <main style={{ flex: 1, width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
        <ChatInterface audioSettings={audioSettings} selectedLanguage={selectedLanguage} />
      </main>
    </div>
  );
}

export default App;
