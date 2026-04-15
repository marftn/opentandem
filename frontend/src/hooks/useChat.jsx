// src/hooks/useChat.jsx
import { useState, useCallback } from 'react';
import { sendChatMessage, generateSpeech } from '../services/api';

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are an expert language tutor holding a friendly conversation in Portuguese. 
Keep your responses relatively short, natural, and conversational to help the user practice.
Correct any major mistakes gracefully, but prioritize keeping the conversation flowing.
Do not use markdown formatting that would be hard to read or hear. Keep it simple.`
};

export function useChat() {
  const [messages, setMessages] = useState([SYSTEM_PROMPT]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [audioCache, setAudioCache] = useState({}); // Stores { messageId: audioUrl }

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content: content.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsLoading(true);
    setCurrentStreamingMessage('');

    try {
      // Create a temporary ID for the AI message to link audio later
      const messageId = Date.now().toString();

      const finalResponse = await sendChatMessage(
        newMessages,
        'gemma4:e2b',
        (chunk) => {
          setCurrentStreamingMessage(chunk);
        }
      );

      const aiMessage = { role: 'assistant', content: finalResponse, id: messageId };
      setMessages((prev) => [...prev, aiMessage]);
      setCurrentStreamingMessage('');
      
      // Auto-generate audio for the response
      fetchAndPlayAudio(finalResponse, messageId);

    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: Handle error state in UI
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const fetchAndPlayAudio = async (text, messageId) => {
    try {
      const audioUrl = await generateSpeech(text);
      setAudioCache((prev) => ({ ...prev, [messageId]: audioUrl }));
      
      // Auto-play as requested
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error("Auto-play failed:", e));
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
    messages: messages.filter(m => m.role !== 'system'), // hide system prompt from UI
    currentStreamingMessage,
    isLoading,
    sendMessage,
    playAudioForMessage,
    audioCache
  };
}
