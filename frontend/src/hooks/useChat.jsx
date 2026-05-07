// src/hooks/useChat.jsx
import { useState, useCallback } from "react";
import { sendChatMessage, generateSpeech } from "../services/api";

const getSpeakerPrompt = (langName) => ({
  role: "system",
  content: `You are an expert language tutor holding a friendly conversation in ${langName}.
Keep your responses relatively short, natural, and conversational to help the user practice.
Do not contain any technical information or correction for the user message, except if they explicitly asked for it in their message.
Do not use markdown formatting that would be hard to read or hear. Keep it simple.`,
});

const getTeacherPrompt = (langName) => ({
  role: "system",
  content: `You are a ${langName} language teacher. Your ONLY job is to review the user's message and correct their grammatical or orthographic errors. Provide a very short explanation. Do NOT try to improve the sentence to make it sound more natural. If the structure is wrong or really weird, that counts as an error. If it is slightly uncommon but understandable, do NOT consider it an error. If there are no errors, reply ONLY with "OK".`,
});

const getHinterPrompt = (langName) => ({
  role: "system",
  content: `You are a helpful ${langName} language assistant. Your ONLY job is to review the user's message and suggest a more natural, fluent way to express the same idea if their sentence sounds unnatural or awkward. If you provide a suggestion, reply with the improved sentence and a brief explanation. If the user's sentence already sounds perfectly natural, reply ONLY with "OK".`,
});

export function useChat(
  audioSettings = { autoPlayAudio: true, generateAudio: true },
  selectedLanguage = "pt",
) {
  const langName =
    selectedLanguage === "es"
      ? "Spanish"
      : selectedLanguage === "it"
        ? "Italian"
        : "Portuguese";
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [audioCache, setAudioCache] = useState({}); // Stores { messageId: audioUrl }

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim()) return;

      const userMessageId = Date.now().toString() + "-user";
      const userMessage = {
        role: "user",
        content: content.trim(),
        id: userMessageId,
        isCorrecting: true,
        correction: null,
        isHinting: true,
        hint: null,
      };

      const newMessages = [...messages, userMessage];

      setMessages(newMessages);
      setIsLoading(true);
      setCurrentStreamingMessage("");

      try {
        // 1. Fire Speaker call (streaming UI)
        const speakerMessages = [
          getSpeakerPrompt(langName),
          ...newMessages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const messageId = Date.now().toString();

        const finalResponse = await sendChatMessage(
          speakerMessages,
          "gemma4:e2b",
          (chunk) => {
            setCurrentStreamingMessage(chunk);
          },
        );

        const aiMessage = {
          role: "assistant",
          content: finalResponse,
          id: messageId,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setCurrentStreamingMessage("");

        // Auto-generate audio for the response
        if (audioSettings.generateAudio) {
          fetchAndPlayAudio(finalResponse, messageId);
        }

        // 2. Fire Teacher call in background (non-streaming UI) AFTER speaker completes
        sendChatMessage(
          [
            getTeacherPrompt(langName),
            { role: "user", content: content.trim() },
          ],
          "gemma4:e2b",
          null,
        )
          .then((correctionResponse) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === userMessageId
                  ? {
                    ...m,
                    isCorrecting: false,
                    correction: correctionResponse.trim(),
                  }
                  : m,
              ),
            );
          })
          .catch((err) => {
            console.error("Teacher correction failed", err);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === userMessageId
                  ? { ...m, isCorrecting: false, correction: null }
                  : m,
              ),
            );
          });

        // 3. Fire Hinter call in background
        sendChatMessage(
          [
            getHinterPrompt(langName),
            { role: "user", content: content.trim() },
          ],
          "gemma4:e2b",
          null,
        )
          .then((hintResponse) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === userMessageId
                  ? { ...m, isHinting: false, hint: hintResponse.trim() }
                  : m,
              ),
            );
          })
          .catch((err) => {
            console.error("Hinter suggestion failed", err);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === userMessageId
                  ? { ...m, isHinting: false, hint: null }
                  : m,
              ),
            );
          });
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, audioSettings, selectedLanguage, langName],
  );

  const fetchAndPlayAudio = async (text, messageId) => {
    try {
      const voice =
        selectedLanguage === "es"
          ? "ef_dora"
          : selectedLanguage === "it"
            ? "if_sara"
            : "pf_dora";
      const langCode =
        selectedLanguage === "es" ? "e" : selectedLanguage === "it" ? "i" : "p";
      const audioUrl = await generateSpeech(text, voice, langCode);
      setAudioCache((prev) => ({ ...prev, [messageId]: audioUrl }));

      if (audioSettings.autoPlayAudio) {
        const audio = new Audio(audioUrl);
        audio.play().catch((e) => console.error("Auto-play failed:", e));
      }
    } catch (err) {
      console.error("Failed to generate/play audio:", err);
    }
  };

  const playAudioForMessage = useCallback(
    (messageId) => {
      const url = audioCache[messageId];
      if (url) {
        const audio = new Audio(url);
        audio.play();
      }
    },
    [audioCache],
  );

  return {
    messages,
    currentStreamingMessage,
    isLoading,
    sendMessage,
    playAudioForMessage,
    audioCache,
  };
}
