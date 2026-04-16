import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
import nemo.collections.asr as nemo_asr
from pydub import AudioSegment

app = FastAPI()

print("Loading nvidia/parakeet-tdt-0.6b-v3 model...")
# To prevent downloading to tmp each run we let it use the default HF cache directory
asr_model = nemo_asr.models.ASRModel.from_pretrained(model_name="nvidia/parakeet-tdt-0.6b-v3")
# We assume CPU usage based on python image
print("Model loaded successfully.")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/stt")
async def transcribe(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Write incoming file to temp storage
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_in:
        temp_in.write(contents)
        temp_input_path = temp_in.name
    
    temp_wav_path = temp_input_path + "_converted.wav"
    
    try:
        # Convert to 16kHz, mono wav as required by Parakeet
        audio = AudioSegment.from_file(temp_input_path)
        audio = audio.set_channels(1)
        audio = audio.set_frame_rate(16000)
        audio.export(temp_wav_path, format="wav")
        
        # Transcribe
        transcriptions = asr_model.transcribe([temp_wav_path])
        
        text = ""
        # The transcribe function usually returns a list or a tuple depending on the model features.
        # Parakeet generally returns a tuple `(transcriptions, something_else)` or a list, where the first element contains texts
        if isinstance(transcriptions, tuple):
            result = transcriptions[0]
        else:
            result = transcriptions
            
        if isinstance(result, list) and len(result) > 0:
            text = result[0]
            
        # Unpack if nested or has a 'text' property
        if hasattr(text, 'text'):
            text = text.text
        elif isinstance(text, list):
            text = text[0] if text else ""
            
        if not isinstance(text, str):
            text = str(text)
            
        return {"transcript": text}
        
    except Exception as e:
        print(f"Error during transcription: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        if os.path.exists(temp_wav_path):
            os.remove(temp_wav_path)
