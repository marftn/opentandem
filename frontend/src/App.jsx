import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';

function App() {
  const [audioSettings, setAudioSettings] = useState({
    autoPlayAudio: true,
    generateAudio: true,
    enableSTT: true
  });

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

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <SettingsPanel audioSettings={audioSettings} setAudioSettings={setAudioSettings} />
      <header style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ background: 'var(--msg-user)', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.5px' }}>
          Tandem Language Tutor
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Practice your Portuguese conversation</p>
      </header>
      
      <main style={{ flex: 1, width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
        <ChatInterface audioSettings={audioSettings} />
      </main>
    </div>
  );
}

export default App;
