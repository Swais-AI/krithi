import re
import json
from fastapi import Request
from fastapi.responses import JSONResponse

from app.config.ai_config import generate_content
from app.config.db import pool
from app.config.languages import SUPPORTED_LANGUAGES

# ==========================================================
# Helper Function: Log AI Usage
# ==========================================================

async def log_ai_usage(user_info={}, feature_used=""):
    name = user_info.get("name", "System Admin")
    email = user_info.get("email", "admin@sgs.edu")
    role = user_info.get("role", "Admin")

    try:
        await pool.execute(
            """
            INSERT INTO ai_usage_logs
            (user_name, user_email, user_type, feature_used)
            VALUES ($1,$2,$3,$4)
            """,
            name, email, role, feature_used
        )
    except Exception as e:
        print("Error logging AI usage:", e)

# ==========================================================
# Translate Admin Text
# ==========================================================

async def translate_admin_text(text, target_language, user_info={}):
    """
    Translate text to target language using Gemini AI.
    Accepts either a single string or a list of strings.
    """
    try:
        # Log the translation request
        await log_ai_usage(user_info, "admin_text_translation")
        
        # Check if language is supported
        if target_language not in SUPPORTED_LANGUAGES:
            return {
                "error": f"Language '{target_language}' is not supported",
                "supported_languages": list(SUPPORTED_LANGUAGES.keys())
            }
        
        # Handle single string
        if isinstance(text, str):
            prompt = f"Translate the following text to {SUPPORTED_LANGUAGES[target_language]}. Only return the translated text, nothing else: {text}"
            result = generate_content(prompt)
            return {
                "original": text,
                "translated": result["text"],
                "target_language": target_language
            }
        
        # Handle list of strings
        elif isinstance(text, list):
            translated_list = []
            for item in text:
                prompt = f"Translate the following text to {SUPPORTED_LANGUAGES[target_language]}. Only return the translated text, nothing else: {item}"
                result = generate_content(prompt)
                translated_list.append(result["text"])
            
            return {
                "original": text,
                "translated": translated_list,
                "target_language": target_language
            }
        
        else:
            return {"error": "Invalid input type. Expected string or list of strings."}
            
    except Exception as e:
        print("Translation error:", str(e))
        return {"error": str(e), "status": "failed"}

# ==========================================================
# Format Voice Transcription
# ==========================================================

async def format_voice_transcription(raw_text, user_info={}):
    """
    Format and clean voice transcription using Gemini AI.
    """
    try:
        await log_ai_usage(user_info, "voice_transcription_formatting")
        
        prompt = f"""
        Format the following voice transcription into proper text with correct punctuation and grammar:
        Raw text: {raw_text}
        
        Rules:
        1. Fix grammar and punctuation
        2. Capitalize proper nouns
        3. Format as proper sentences
        4. Return ONLY the formatted text, nothing else
        """
        
        result = generate_content(prompt)
        
        return {
            "raw": raw_text,
            "formatted": result["text"]
        }
        
    except Exception as e:
        print("Voice formatting error:", str(e))
        return {"error": str(e), "status": "failed"}
