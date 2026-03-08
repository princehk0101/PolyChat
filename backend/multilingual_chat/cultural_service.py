import requests
from django.conf import settings
from .translation_service import translate_text, translate_to_english

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ur": "Urdu",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ar": "Arabic",
    "tr": "Turkish",
    "ko": "Korean",
    "ja": "Japanese",
    "zh": "Chinese",
}


def get_language_name(language_code):
    return LANGUAGE_NAMES.get(language_code, "English")


def translate_for_workspace(message, target_language="en"):
    if not message:
        return message
    return translate_text(message, target_language)


def analyze_and_translate(message, target_language="en"):
    translated = translate_for_workspace(message, target_language=target_language)
    tone = "neutral"
    intent = "question" if "?" in str(message) else "message"
    return translated, tone, intent


def generate_bot_reply(message, target_language="en"):
    user_message_for_ai = translate_to_english(message)

    if not settings.GROQ_API_KEY:
        return "AI assistant is unavailable because the Groq API key is missing."

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a helpful chat assistant for a multilingual workspace. "
                    "Always reply in concise, natural English so the app can translate your reply."
                ),
            },
            {
                "role": "user",
                "content": user_message_for_ai,
            },
        ],
        "temperature": 0.7,
        "max_tokens": 300,
    }

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if content:
            return content
    except Exception:
        pass

    return "AI assistant is temporarily unavailable. Translation is still active."
