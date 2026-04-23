from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from ..services.gemini_service import GeminiService

router = APIRouter(tags=["Analysis"])

# Initialize Gemini Service
gemini_service = GeminiService()

class Element(BaseModel):
    type: str
    text: str
    suggestion: str
    reason: str

class AnalyzeResponse(BaseModel):
    success: bool
    summary: str
    elements: List[Element]
    message: str

class ChatResponse(BaseModel):
    success: bool
    answer: str

@router.post("/process/analyze", response_model=AnalyzeResponse)
async def analyze_ui_image(file: UploadFile = File(...)):
    """Initial rapid analysis using Gemini Vision."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (PNG/JPG/WebP) allowed")

    contents = await file.read()

    try:
        data = gemini_service.analyze_ui(contents)
        
        return {
            "success": True,
            "summary": data.get("summary", "UI Analysis complete"),
            "elements": data.get("elements", []),
            "message": "Successfully analyzed image."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.post("/process/chat", response_model=ChatResponse)
async def chat_ui(
    file: UploadFile = File(...),
    history: str = Form("[]"),
    query: str = Form(...)
):
    """Conversational endpoint to chat about the UI."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    contents = await file.read()
    
    try:
        parsed_history = json.loads(history)
    except Exception:
        parsed_history = []

    try:
        answer = gemini_service.chat(contents, parsed_history, query)
        return {
            "success": True,
            "answer": answer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")