import io
import logging
import threading
from queue import Queue

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

from pocket_tts.data.audio import stream_audio_chunks
from pocket_tts.default_parameters import get_default_voice_for_language
from pocket_tts.models.tts_model import TTSModel
from pocket_tts.utils.utils import _ORIGINS_OF_PREDEFINED_VOICES

logging.basicConfig(level=logging.INFO)

# Frontend language code -> pocket-tts model identifier.
LANGUAGES = {
    "pt": "portuguese_24l",
    "es": "spanish_24l",
    "it": "italian_24l",
    "fr": "french_24l",
}

app = FastAPI(title="OpenTandem TTS")

_models: dict[str, TTSModel] = {}
_load_lock = threading.Lock()


def get_model(lang: str) -> TTSModel:
    """Return the cached model for a language, loading it on first use."""
    if lang not in LANGUAGES:
        raise HTTPException(status_code=404, detail=f"Unsupported language: {lang}")

    # ponytail: one global lock serializes cold loads; fine for 3 languages, split per-lang if it matters.
    with _load_lock:
        if lang not in _models:
            logging.info("Loading TTS model for %s (%s)...", lang, LANGUAGES[lang])
            _models[lang] = TTSModel.load_model(language=LANGUAGES[lang])
            logging.info("Loaded %s.", lang)

    return _models[lang]


def stream_speech(model: TTSModel, text: str, model_state: dict):
    """Yield WAV bytes as the model generates them, mirroring pocket-tts's serve endpoint."""
    queue: Queue = Queue()

    class FileLikeToQueue(io.IOBase):
        def write(self, data):
            queue.put(data)

        def flush(self):
            pass

        def close(self):
            queue.put(None)

    def worker():
        chunks = model.generate_audio_stream(model_state=model_state, text_to_generate=text)
        stream_audio_chunks(FileLikeToQueue(), chunks, model.config.mimi.sample_rate)

    thread = threading.Thread(target=worker)
    thread.start()
    while True:
        data = queue.get()
        if data is None:
            break
        yield data
    thread.join()


@app.get("/health/{lang}")
def health(lang: str):
    if lang not in LANGUAGES:
        raise HTTPException(status_code=404, detail=f"Unsupported language: {lang}")

    return {"status": "ok"}


# POST cache forces the server to load a language model in cache. This is used when the
# user selects a language.
@app.post("/cache/{lang}")
def cache(
        lang: str,
):
    get_model(lang)

    return {"status": "ok"}

# GET so the browser's <audio> element can stream the response and start playing
# on the first bytes. ponytail: text rides in the query string (~ few-KB URL limit);
# fine for chat replies, switch to POST + MediaSource if you ever synth long documents.
@app.get("/tts/{lang}")
def text_to_speech(
    lang: str,
    text: str,
    voice_url: str | None = None,
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    model = get_model(lang)

    if voice_url is None:
        voice_url = get_default_voice_for_language(LANGUAGES[lang])
    elif not (
        voice_url.startswith(("http://", "https://", "hf://"))
        or voice_url in _ORIGINS_OF_PREDEFINED_VOICES
    ):
        raise HTTPException(
            status_code=400, detail="voice_url must be a built-in voice or start with http://, https://, hf://"
        )

    model_state = model._cached_get_state_for_audio_prompt(voice_url)

    return StreamingResponse(stream_speech(model, text, model_state), media_type="audio/wav")
