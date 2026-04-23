// src/hooks/useChat.jsx
import { useState, useCallback } from 'react';
import { sendChatMessage, generateSpeech } from '../services/api';

const getSpeakerPrompt = (langName) => ({
  role: 'system',
  content: `You are an expert language tutor holding a friendly conversation in ${langName}. 
Keep your responses relatively short, natural, and conversational to help the user practice.
Do not contain any technical information or correction for the user message, except if they explicitly asked for it in their message.
Do not use markdown formatting that would be hard to read or hear. Keep it simple.`
});

const getTeacherPrompt = (langName) => ({
  role: 'system',
  content: `You are a strict ${langName} language teacher. Your ONLY job is to review the user's message and correct any language errors. Provide potential improvements to make it sound more natural. If there are no errors and it sounds perfectly natural, reply ONLY with "OK".`
});

export function useChat(audioSettings = { autoPlayAudio: true, generateAudio: true }, selectedLanguage = 'pt') {
  const langName = selectedLanguage === 'es' ? 'Spanish' : selectedLanguage === 'it' ? 'Italian' : 'Portuguese';
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [audioCache, setAudioCache] = useState({}); // Stores { messageId: audioUrl }

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessageId = Date.now().toString() + '-user';
    const userMessage = { 
      role: 'user', 
      content: content.trim(), 
      id: userMessageId, 
      isCorrecting: true, 
      correction: null 
    };
    
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsLoading(true);
    setCurrentStreamingMessage('');

    try {
      // 1. Fire Speaker call (streaming UI)
      const speakerMessages = [
        getSpeakerPrompt(langName), 
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];
      
      const messageId = Date.now().toString();

      const finalResponse = await sendChatMessage(
        speakerMessages,
        'gemma4:e2b',
        (chunk) => {
          setCurrentStreamingMessage(chunk);
        }
      );

      const aiMessage = { role: 'assistant', content: finalResponse, id: messageId };
      setMessages((prev) => [...prev, aiMessage]);
      setCurrentStreamingMessage('');
      
      // Auto-generate audio for the response
      if (audioSettings.generateAudio) {
        fetchAndPlayAudio(finalResponse, messageId);
      }

      // 2. Fire Teacher call in background (non-streaming UI) AFTER speaker completes
      sendChatMessage(
        [getTeacherPrompt(langName), { role: 'user', content: content.trim() }],
        'gemma4:e2b',
        null
      )
        .then(correctionResponse => {
          setMessages(prev => prev.map(m => 
            m.id === userMessageId ? { ...m, isCorrecting: false, correction: correctionResponse.trim() } : m
          ));
        })
        .catch(err => {
          console.error("Teacher correction failed", err);
          setMessages(prev => prev.map(m => 
            m.id === userMessageId ? { ...m, isCorrecting: false, correction: null } : m
          ));
        });

    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, audioSettings, selectedLanguage, langName]);

  const fetchAndPlayAudio = async (text, messageId) => {
    try {
      const voice = selectedLanguage === 'es' ? 'ef_dora' : selectedLanguage === 'it' ? 'if_sara' : 'pf_dora';
      const langCode = selectedLanguage === 'es' ? 'e' : selectedLanguage === 'it' ? 'i' : 'p';
      const audioUrl = await generateSpeech(text, voice, langCode);
      setAudioCache((prev) => ({ ...prev, [messageId]: audioUrl }));
      
      if (audioSettings.autoPlayAudio) {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Auto-play failed:", e));
      }
    } catch (err) {
      console.error("Failed to generate/play audio:", err);
    }
  };

  const playAudioForMessage = useCallback((messageId) => {
    const url = audioCache[messageId];
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  }, [audioCache]);

  return {
    messages,
    currentStreamingMessage,
    isLoading,
    sendMessage,
    playAudioForMessage,
    audioCache
  };
}
