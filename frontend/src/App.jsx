import React, { useState, useEffect } from "react";
import ChatInterface from "./components/ChatInterface.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import { LANGUAGES } from "./constants/languages.js";
import { checkTtsHealth, checkSttHealth } from "./services/api.js";
import styles from "./App.module.css";

const DEFAULT_AUDIO_SETTINGS = {
  autoPlayAudio: true,
  generateAudio: true,
  enableSTT: true,
};
const DEFAULT_CORRECTION_SETTINGS = {
  punctuation: false,
  accents: false,
  casing: false,
};

export default function App() {
  const [audioSettings, setAudioSettings] = useState(DEFAULT_AUDIO_SETTINGS);
  const [correctionSettings, setCorrectionSettings] = useState(
    DEFAULT_CORRECTION_SETTINGS,
  );
  const [teacherFeedbackInEnglish, setTeacherFeedbackInEnglish] =
    useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  useEffect(() => {
    if (!selectedLanguage) return;
    checkTtsHealth(selectedLanguage).then((ok) => {
      if (!ok) setAudioSettings((prev) => ({ ...prev, generateAudio: false }));
    });
    checkSttHealth().then((ok) => {
      if (!ok) setAudioSettings((prev) => ({ ...prev, enableSTT: false }));
    });
  }, [selectedLanguage]);

  if (!selectedLanguage) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={`gradient-text ${styles.title}`}>
            Tandem Language Tutor
          </h1>
          <p className={styles.subtitle}>Select a language to practice</p>
        </header>
        <div className={styles.languageGrid}>
          {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
            <button
              key={code}
              className={styles.langBtn}
              onClick={() => setSelectedLanguage(code)}
            >
              <span className={styles.langFlag}>{flag}</span>
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatPage}>
      <SettingsPanel
        audioSettings={audioSettings}
        setAudioSettings={setAudioSettings}
        correctionSettings={correctionSettings}
        setCorrectionSettings={setCorrectionSettings}
        teacherFeedbackInEnglish={teacherFeedbackInEnglish}
        setTeacherFeedbackInEnglish={setTeacherFeedbackInEnglish}
        selectedLanguage={selectedLanguage}
      />
      <header className={styles.chatHeader}>
        <h1 className={`gradient-text ${styles.chatTitle}`}>
          Tandem Language Tutor
        </h1>
        <p className={styles.chatSubtitle}>
          Practice your {LANGUAGES[selectedLanguage].name} conversation
        </p>
      </header>
      <main className={styles.main}>
        <ChatInterface
          audioSettings={audioSettings}
          correctionSettings={correctionSettings}
          selectedLanguage={selectedLanguage}
          teacherFeedbackInEnglish={teacherFeedbackInEnglish}
        />
      </main>
    </div>
  );
}
