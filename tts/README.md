# TTS

Text-to-speech server using [pocket-tts](https://github.com/kyutai-labs/pocket-tts). Streams WAV audio as it's generated.

Supported languages: `pt` (Portuguese), `es` (Spanish), `it` (Italian).

## Run

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
# or
docker build -t opentandem-tts . && docker run -p 8000:8000 opentandem-tts
```

Models load lazily on first request per language.

## Endpoints

- `GET /health/{lang}`: returns `{"status": "ok"}` when the model for a specific language is healthy.
- `GET /tts/{lang}?text=...&voice_url=...`: streams `audio/wav`.
  `voice_url` is optional (defaults to the language's built-in voice); if set it
  must be a built-in voice name or start with `http://`, `https://`, `hf://`.

## Example

```bash
curl "http://localhost:8000/tts/es?text=Hola%20mundo" -o out.wav
```
