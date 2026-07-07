import os
import re
import time
from dotenv import load_dotenv
from google import genai

# ================================
# Load Environment Variables
# ================================
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL")

if not API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is missing in .env")

if not MODEL:
    raise ValueError("❌ GEMINI_MODEL is missing in .env")

# ================================
# Initialize Gemini
# ================================
client = genai.Client(api_key=API_KEY)

# ================================
# Clean AI Response
# ================================
def clean_ai_text(text: str = "") -> str:
    if not text:
        return ""

    text = re.sub(r"\$\$", "", text)
    text = re.sub(r"\$", "", text)
    text = re.sub(r"\\\(", "", text)
    text = re.sub(r"\\\)", "", text)
    text = re.sub(r"\\\[", "", text)
    text = re.sub(r"\\\]", "", text)
    text = re.sub(r"json", "", text, flags=re.IGNORECASE)
    text = text.replace("\r", "")

    return text.strip()

# ================================
# Generate Content
# ================================
def generate_content(prompt: str, max_retries: int = 5):
    """
    Generate content using Gemini with automatic retries.
    """

    if not prompt or not isinstance(prompt, str):
        raise ValueError("Prompt is missing or invalid.")

    delay = 2  # seconds

    for attempt in range(1, max_retries + 1):
        try:
            print("=" * 40)
            print("Gemini Request")
            print("Model:", MODEL)
            print("Prompt Length:", len(prompt))
            print("API Key Exists:", bool(API_KEY))
            print("=" * 40)

            response = client.models.generate_content(
                model=MODEL,
                contents=prompt
            )

            text = getattr(response, "text", "") or ""

            return {
                "text": clean_ai_text(text),
                "response": response
            }

        except Exception as err:

            status = getattr(err, "status", None)
            code = getattr(err, "code", None)

            print("=" * 40)
            print("Gemini API Error")
            print("Status:", status)
            print("Code:", code)
            print("Message:", str(err))
            print("=" * 40)

            error_code = status or code

            if error_code in [429, 500, 503] and attempt < max_retries:
                print(f"Retry {attempt}/{max_retries} after {delay}s")
                time.sleep(delay)
                delay *= 2
                continue

            raise

# ================================
# Example Usage
# ================================
if __name__ == "__main__":
    result = generate_content("Explain Artificial Intelligence in simple words.")

    print("\nAI Response:\n")
    print(result["text"])
