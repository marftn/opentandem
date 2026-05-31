import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, accentColor, icon, children }) {
  const dialogRef = useRef(null);
  useClickOutside(dialogRef, onClose, isOpen);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div ref={dialogRef} className={`glass-panel animate-fade-in ${styles.dialog}`}>
        <header className={styles.header} style={{ color: accentColor }}>
          <div className={styles.title}>
            {icon}
            <strong>{title}</strong>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <CloseIcon />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
