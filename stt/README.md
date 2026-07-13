# STT

Speech-to-text server using NVIDIA Parakeet (`parakeet-tdt-0.6b-v3`), running on CPU.

## Run

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
# or
docker build -t opentandem-stt . && docker run -p 8000:8000 opentandem-stt
```

The model downloads on first startup and is cached in the default HF cache dir.

## Endpoints

- `GET /health`: endpoint that returns `{"status": "ok"}` when the service is healthy.
- `POST /stt`: multipart upload, field `file` (any audio format ffmpeg reads).
  Audio is converted to 16 kHz mono WAV, then transcribed.
  Returns `{"transcript": "..."}`.

## Example

```bash
curl -F file=@sample.mp3 http://localhost:8000/stt
```
