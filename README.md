# OpenTandem

A self-hosted language learning app that lets you practice conversation in Portuguese, Spanish, or Italian.
Every message you send gets a streamed AI response, silent background feedback from a grammar teacher, and
a naturalness hint.
And all this running locally on your own hardware!

## Features

- **Conversational AI** — streams responses in your target language via Ollama
- **Grammar teacher** — flags errors and explains corrections (respects your punctuation/accent/casing preferences)
- **Naturalness hints** — suggests more fluent phrasing when your sentence sounds awkward
- **Text-to-Speech** — generates audio for AI responses via Kokoro, with auto-play
- **Speech-to-Text** — record your message with the mic button, transcribed by NVIDIA Parakeet
- **English translation** — one-click translation of any AI message
- **Configurable** — toggle each feature on/off; choose whether feedback is given in English or the target language

## Services

| Service    | Role                             | Default port |
| ---------- | -------------------------------- | ------------ |
| `ollama`   | LLM inference (gemma4:e2b)       | 11434        |
| `kokoro`   | Text-to-Speech                   | 8880         |
| `stt`      | Speech-to-Text (NVIDIA Parakeet) | 8000         |
| `frontend` | React/Vite UI                    | 5173         |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with the Compose plugin
- ~8 GB RAM for the LLM container or Ollama on the host (see below)
- A GPU is not required (everything can run on CPU) but is recommended for better performance

## Quick start

### Linux

1. Copy the template env file and edit the paths:

   ```bash
   cp .env.tmpl .env
   # Set OLLAMA_DATA_PATH and HF_HOME_CACHE to writable directories on your machine
   ```

2. Start all services:

   ```bash
   docker compose up
   ```

   On first run, Docker will pull the Kokoro image and build the STT and frontend containers. The STT service also downloads
   the Parakeet model (~600 MB) from HuggingFace on first start.

3. Pull the LLM model (once the `ollama` container is running):

   ```bash
   docker exec -it ollama ollama pull gemma4:e2b
   ```

4. Open [http://localhost:5173](http://localhost:5173).

---

### macOS

On macOS it is recommended to run Ollama natively (better performance, no virtualization overhead) and use the compose
file for the remaining services.

1. Install and start [Ollama](https://ollama.com), then pull the model:

   ```bash
   ollama pull gemma4:e2b
   ```

2. Start the other services:

   ```bash
   docker compose up
   ```

3. Open [http://localhost:5173](http://localhost:5173).

---

### Running Ollama on the host (Linux)

If you prefer to run Ollama on your host machine instead of in a container, set `OLLAMA_REPLICAS=0` in the `.env` file and point
the URL at the host:

```env
OLLAMA_REPLICAS=0
OLLAMA_URL=http://host.docker.internal:11434
```

The `frontend` service is configured with `extra_hosts: host.docker.internal:host-gateway` so the proxy resolves correctly on Linux.

## Configuration

All options live in `.env` (copy from `.env.tmpl`):

| Variable           | Default               | Description                                               |
| ------------------ | --------------------- | --------------------------------------------------------- |
| `OLLAMA_DATA_PATH` | _(required)_          | Host path for Ollama model storage                        |
| `HF_HOME_CACHE`    | _(required)_          | Host path for HuggingFace model cache (STT)               |
| `OLLAMA_URL`       | `http://ollama:11434` | Ollama endpoint seen by the frontend container            |
| `HOST_IP`          | `127.0.0.1`           | IP the frontend binds on. Set to `0.0.0.0` for LAN access |
| `OLLAMA_REPLICAS`  | `1`                   | Set to `0` to disable the containerised Ollama            |
| `KOKORO_REPLICAS`  | `1`                   | Set to `0` to disable TTS                                 |
| `STT_REPLICAS`     | `1`                   | Set to `0` to disable STT                                 |

## Development (without Docker)

Requirements: Node 20+, Python 3.10+, a running Ollama instance.

**Frontend:**

```bash
cd frontend
npm install
OLLAMA_URL=http://localhost:11434 npm run dev
```

**STT service:**

```bash
cd stt
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## License

[AGPL-3.0](LICENSE)
