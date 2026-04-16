FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
# ffmpeg is needed for pydub to process audio
# git and build-essential are often required for nemo building dependencies
RUN apt-get update && apt-get install -y ffmpeg build-essential git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
