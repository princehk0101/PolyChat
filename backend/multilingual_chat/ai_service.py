# import google.generativeai as genai
# from django.conf import settings

# genai.configure(api_key=settings.GEMINI_API_KEY)

# model = genai.GenerativeModel("gemini-1.5-flash")


# def analyze_message(message):

#     prompt = f"""
#     Analyze the tone and intent of this message.

#     Message: {message}

#     Return format:

#     tone: neutral | polite | angry | urgent
#     intent: question | request | instruction | message
#     sentiment: positive | neutral | negative
#     """

#     tone = "neutral"
#     intent = "message"
#     sentiment = "neutral"

#     try:

#         response = model.generate_content(prompt)

#         text = response.text.lower()

#         if "question" in text:
#             intent = "question"

#         if "request" in text:
#             intent = "request"

#         if "urgent" in text:
#             tone = "urgent"

#         if "angry" in text:
#             tone = "angry"

#         if "positive" in text:
#             sentiment = "positive"

#         if "negative" in text:
#             sentiment = "negative"

#     except Exception:
#         pass

#     return tone, intent, sentiment


# # ⭐ Smart reply function
# def smart_reply(message):

#     prompt = f"""
#     Suggest 3 short chat replies for this message:

#     {message}
#     """

#     try:

#         response = model.generate_content(prompt)

#         replies = response.text.split("\n")

#         return replies[:3]

#     except Exception:

#         return []