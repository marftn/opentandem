FROM ghcr.io/astral-sh/uv:debian
WORKDIR /app

# Install system dependencies
# ffmpeg is needed for pydub to process audio
# git and build-essential are often required for nemo building dependencies
# python3-dev provides Python.h, needed to build native extensions like editdistance
RUN apt-get update && apt-get install -y ffmpeg build-essential git curl python3-dev && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev
COPY main.py .
RUN uv sync --frozen --no-dev
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
