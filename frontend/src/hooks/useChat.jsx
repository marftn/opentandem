import { useState, useCallback } from "react";
import { sendChatMessage, generateSpeech } from "../services/api.js";
import { LANGUAGES } from "../constants/languages.js";

const MODEL = "gemma4:e2b";

const TRANSLATE_PROMPT = {
  role: "system",
  content:
    "You are a translator. Your ONLY job is to translate the user's message into English. Reply with ONLY the translation, nothing else.",
};

// System prompt for the conversational tutor that keeps replies short, natural, and proactive.
const getSpeakerPrompt = (langName) => ({
  role: "system",
  content: `You are an expert language tutor holding a friendly, engaging conversation in ${langName} to help the user practice.

Keep your responses short and natural, as in real spoken conversation.
Do not include technical corrections or grammar feedback unless the user explicitly asks.
Do not use markdown formatting — keep it simple and speakable.

You MUST keep the conversation alive. Never let it stall or end. Always do at least one of:
- Ask a genuine follow-up question about what the user just said.
- Share a brief opinion or personal anecdote, then ask what they think.
- Introduce a new related topic with a question if the current one is exhausted.

If the user gives a very short or disengaged reply, gently steer into something more interesting. You drive the conversation as much as the user does.`,
});

// System prompt for the grammar corrector, with per-setting rules.
const getTeacherPrompt = (langName, correctionSettings, feedbackInEnglish) => {
  const feedbackLang = feedbackInEnglish ? "English" : langName;
  const punctuation = correctionSettings?.punctuation
    ? "Incorrect punctuation should be considered an error."
    : "Punctuation does NOT count as an error.";
  const casing = correctionSettings?.casing
    ? "Incorrect casing (capitalization) should be considered an error."
    : "Casing (capitalization) does NOT count as an error.";
  const accents = correctionSettings?.accents
    ? "Missing or incorrect accents should be considered an error."
    : "Missing or incorrect accents do NOT count as an error.";
  return {
    role: "system",
    content: `You are a ${langName} language teacher. Your ONLY job is to review the user's message and correct their grammatical or orthographic errors. Provide a short explanation of what is wrong and the corrected version. Provide your feedback in ${feedbackLang}. Do NOT try to improve the sentence to make it sound more natural. If the structure is wrong or really weird, that counts as an error. If it is slightly uncommon but understandable, do NOT consider it an error. ${punctuation} ${casing} ${accents} If there are no errors, reply ONLY with "OK".`,
  };
};

// System prompt for the naturalness hinter that suggests a more fluent phrasing or replies "OK".
const getHinterPrompt = (langName, feedbackInEnglish) => ({
  role: "system",
  content: `You are a helpful ${langName} language assistant. Your ONLY job is to review the user's message and suggest a more natural, fluent way to express the same idea if their sentence sounds unnatural or awkward. If you provide a suggestion, reply with the improved sentence and a brief explanation. Provide your feedback in ${feedbackInEnglish ? "English" : langName}. If the user's sentence already sounds perfectly natural, reply ONLY with "OK".`,
});

// Manages chat state: sends user messages, streams the AI reply, and fires parallel correction/hint requests.
export function useChat(
  audioSettings = { autoPlayAudio: true, generateAudio: true },
  correctionSettings = { punctuation: false, casing: false, accents: false },
  selectedLanguage = "pt",
  teacherFeedbackInEnglish = false,
) {
  const ttsLang = LANGUAGES[selectedLanguage] ? selectedLanguage : 'pt';
  const { name: langName, voice } = LANGUAGES[ttsLang];

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [audioCache, setAudioCache] = useState({});
  const [translations, setTranslations] = useState({});

  // Merges a partial update into the message with the given id.
  const updateMessage = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }, []);

  // Generates TTS audio for a message, caches the blob URL, and auto-plays if enabled.
  const fetchAndCacheAudio = useCallback(
    async (text, messageId) => {
      try {
        const audioUrl = await generateSpeech(text, voice, ttsLang);
        setAudioCache((prev) => ({ ...prev, [messageId]: audioUrl }));
        if (audioSettings.autoPlayAudio) {
          new Audio(audioUrl)
            .play()
            .catch((e) => console.error("Auto-play failed:", e));
        }
      } catch (err) {
        console.error("Failed to generate audio:", err);
      }
    },
    [voice, ttsLang, audioSettings.autoPlayAudio],
  );

  // Appends the user message, streams the AI reply, and fires correction/hint requests in parallel.
  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim()) return;

      const userMessageId = `${Date.now()}-user`;
      const userMessage = {
        role: "user",
        content: content.trim(),
        id: userMessageId,
        isCorrecting: true,
        correction: null,
        isHinting: true,
        hint: null,
      };

      const history = [...messages, userMessage];
      setMessages(history);
      setIsLoading(true);
      setCurrentStreamingMessage("");

      try {
        const speakerMessages = [
          getSpeakerPrompt(langName),
          ...history.map(({ role, content: c }) => ({ role, content: c })),
        ];
        const aiMessageId = Date.now().toString();
        const aiContent = await sendChatMessage(
          speakerMessages,
          MODEL,
          setCurrentStreamingMessage,
        );

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiContent, id: aiMessageId },
        ]);
        setCurrentStreamingMessage("");

        if (audioSettings.generateAudio) {
          fetchAndCacheAudio(aiContent, aiMessageId);
        }

        const trimmed = content.trim();
        sendChatMessage(
          [
            getTeacherPrompt(
              langName,
              correctionSettings,
              teacherFeedbackInEnglish,
            ),
            { role: "user", content: trimmed },
          ],
          MODEL,
          null,
        )
          .then((r) =>
            updateMessage(userMessageId, {
              isCorrecting: false,
              correction: r.trim(),
            }),
          )
          .catch(() =>
            updateMessage(userMessageId, {
              isCorrecting: false,
              correction: null,
            }),
          );

        sendChatMessage(
          [
            getHinterPrompt(langName, teacherFeedbackInEnglish),
            { role: "user", content: trimmed },
          ],
          MODEL,
          null,
        )
          .then((r) =>
            updateMessage(userMessageId, { isHinting: false, hint: r.trim() }),
          )
          .catch(() =>
            updateMessage(userMessageId, { isHinting: false, hint: null }),
          );
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      messages,
      audioSettings,
      langName,
      correctionSettings,
      teacherFeedbackInEnglish,
      fetchAndCacheAudio,
      updateMessage,
    ],
  );

  // Fetches an English translation for a message and caches it by id (no-op if already cached).
  const translateMessage = useCallback(
    async (messageId, text) => {
      if (translations[messageId]) return;
      try {
        const response = await sendChatMessage(
          [TRANSLATE_PROMPT, { role: "user", content: text }],
          MODEL,
          null,
        );
        setTranslations((prev) => ({ ...prev, [messageId]: response.trim() }));
      } catch {
        setTranslations((prev) => ({
          ...prev,
          [messageId]: "[Translation failed]",
        }));
      }
    },
    [translations],
  );

  // Plays the cached audio blob for a message, if available.
  const playAudioForMessage = useCallback(
    (messageId) => {
      const url = audioCache[messageId];
      if (url) new Audio(url).play();
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
    translations,
    translateMessage,
  };
}
