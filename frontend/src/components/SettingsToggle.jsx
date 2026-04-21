import React from 'react';

export default function SettingsToggle({ label, enabled, onChange, isLoading }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '8px 0',
      color: 'var(--text-secondary)',
      fontSize: '0.9rem'
    }}>
      <span>{label}</span>
      <button 
        onClick={() => !isLoading && onChange(!enabled)}
        disabled={isLoading}
        style={{
          width: '40px',
          height: '24px',
          borderRadius: '12px',
          background: enabled ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
          position: 'relative',
          transition: 'background var(--transition-normal)',
          border: '1px solid ' + (enabled ? 'var(--accent-primary)' : 'var(--border-glass)'),
          opacity: isLoading ? 0.5 : 1,
          cursor: isLoading ? 'wait' : 'pointer'
        }}
        aria-pressed={enabled}
      >
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#ffffff',
          position: 'absolute',
          top: '2px',
          left: enabled ? '18px' : '2px',
          transition: 'left var(--transition-fast)',
          boxShadow: 'var(--shadow-sm)'
        }} />
      </button>
    </div>
  );
}
