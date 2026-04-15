import React from 'react';
import ChatInterface from './components/ChatInterface.jsx';

function App() {
  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ background: 'var(--msg-user)', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.5px' }}>
          Tandem Language Tutor
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Practice your Portuguese conversation</p>
      </header>
      
      <main style={{ flex: 1, width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
