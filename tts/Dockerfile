FROM ghcr.io/astral-sh/uv:debian

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install pocket-tts (CPU torch) + server deps into a venv.
RUN uv pip install --system --break-system-packages \
    "pocket-tts @ git+https://github.com/kyutai-labs/pocket-tts.git" \
    "torch>=2.5.0" --index-strategy unsafe-best-match \
    --extra-index-url https://download.pytorch.org/whl/cpu \
 && uv pip install --system --break-system-packages "uvicorn[standard]"

COPY main.py .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
