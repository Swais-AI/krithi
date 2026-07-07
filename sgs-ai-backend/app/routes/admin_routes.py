from fastapi import APIRouter
from pydantic import BaseModel
from typing import Union, List, Optional
from app.controllers.admin_controller import (
    translate_admin_text,
    format_voice_transcription
)

router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin AI"]
)

# ==========================================
# Pydantic Schemas (For Auto-Documentation)
# ==========================================

class TranslateRequest(BaseModel):
    # Accepts either a single string or a list of strings
    text: Union[str, List[str]] 
    targetLanguage: str
    userInfo: Optional[dict] = {}

class VoiceFormatRequest(BaseModel):
    rawTranscription: str
    userInfo: Optional[dict] = {}

# ==========================================
# Routes
# ==========================================

@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """Translate text to the target language"""
    try:
        result = await translate_admin_text(
            text=request.text,
            target_language=request.targetLanguage,
            user_info=request.userInfo
        )
        return result
    except Exception as e:
        return {"error": str(e), "status": "failed"}

@router.post("/voice/format")
async def format_voice(request: VoiceFormatRequest):
    """Format voice transcription"""
    try:
        result = await format_voice_transcription(
            raw_text=request.rawTranscription,
            user_info=request.userInfo
        )
        return result
    except Exception as e:
        return {"error": str(e), "status": "failed"}
