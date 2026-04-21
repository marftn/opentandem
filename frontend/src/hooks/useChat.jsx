// src/hooks/useChat.jsx
import { useState, useCallback } from 'react';
import { sendChatMessage, generateSpeech } from '../services/api';

const SPEAKER_PROMPT = {
  role: 'system',
  content: `You are an expert language tutor holding a friendly conversation in Portuguese. 
Keep your responses relatively short, natural, and conversational to help the user practice.
Do not contain any technical information or correction for the user message, except if they explicitly asked for it in their message.
Do not use markdown formatting that would be hard to read or hear. Keep it simple.`
};

const TEACHER_PROMPT = {
  role: 'system',
  content: `You are a strict Portuguese language teacher. Your ONLY job is to review the user's message and correct any language errors. Provide potential improvements to make it sound more natural. If there are no errors and it sounds perfectly natural, reply ONLY with "OK".`
};

export function useChat(audioSettings = { autoPlayAudio: true, generateAudio: true }) {
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
      // 1. Fire Teacher call in background (non-streaming UI)
      sendChatMessage(
        [TEACHER_PROMPT, { role: 'user', content: content.trim() }],
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

      // 2. Fire Speaker call (streaming UI)
      const speakerMessages = [
        SPEAKER_PROMPT, 
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

    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, audioSettings]);

  const fetchAndPlayAudio = async (text, messageId) => {
    try {
      const audioUrl = await generateSpeech(text);
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
