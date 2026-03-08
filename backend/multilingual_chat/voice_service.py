import speech_recognition as sr
import tempfile


def speech_to_text(audio_file):

    recognizer = sr.Recognizer()

    with tempfile.NamedTemporaryFile(delete=True) as temp:

        for chunk in audio_file.chunks():
            temp.write(chunk)

        temp.flush()

        with sr.AudioFile(temp.name) as source:

            audio = recognizer.record(source)

            try:
                text = recognizer.recognize_google(audio)
                return text

            except Exception:
                return None