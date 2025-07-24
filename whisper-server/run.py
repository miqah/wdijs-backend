from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel
import uvicorn
import tempfile

app = FastAPI()
model = WhisperModel("medium", compute_type="int8") 

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=True) as tmp:
            tmp.write(await file.read())
            tmp.flush()
            segments, _ = model.transcribe(tmp.name)
            text = "".join([segment.text for segment in segments])
        return JSONResponse({"text": text})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
@app.get("/")
async def ping():
    return {"status": "ok"}