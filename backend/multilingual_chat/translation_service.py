import requests
from .language_service import detect_language


def translate_text(text, target_language="en"):

    if not text:
        return text

    source_language = detect_language(text)
    if source_language == target_language:
        return text

    url = "https://api.mymemory.translated.net/get"
    params = {
        "q": text,
        "langpair": f"{source_language}|{target_language}"
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        translated_text = data.get("responseData", {}).get("translatedText")
        return translated_text or text
    except Exception:
        return text


def translate_to_english(text):
    return translate_text(text, "en")
