from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser

from .models import Message, ChatRoom
from .serializers import MessageSerializer

from .language_service import detect_language
from .cultural_service import analyze_and_translate, generate_bot_reply, translate_for_workspace
from .voice_service import speech_to_text


def get_requested_language(request):
    profile = getattr(request.user, "userprofile", None)
    return request.data.get("target_language") or request.query_params.get("language") or getattr(profile, "language", None) or "en"


def serialize_sender(user):
    if not user:
        return None
    profile = getattr(user, "userprofile", None)
    return {
        "id": user.id,
        "username": user.username,
        "name": getattr(profile, "full_name", "") or user.username,
        "profile_pic": getattr(profile, "profile_pic", None),
    }


def build_message_payload(message, request_language):
    payload = MessageSerializer(message).data
    payload["sender"] = serialize_sender(message.sender)
    payload["display_text"] = translate_for_workspace(message.original_message, request_language)
    return payload


def serialize_room(room, current_user):
    queryset = room.participants.all() if room.room_type == "group" else room.participants.exclude(id=current_user.id)
    participants = [serialize_sender(user) for user in queryset]
    last_message = room.messages.order_by("-created_at").first()
    display_name = room.title
    if room.room_type == "group":
        display_name = room.title or "Untitled group"
    elif room.room_type == "ai":
        display_name = "AI Assistant"
    elif participants:
        display_name = participants[0]["name"] or participants[0]["username"]
    else:
        display_name = room.title or room.name

    return {
        "id": room.id,
        "name": room.name,
        "title": display_name,
        "room_type": room.room_type,
        "participants": participants,
        "target_user_id": participants[0]["id"] if room.room_type == "direct" and participants else None,
        "last_message": last_message.original_message if last_message else "",
        "last_message_at": last_message.created_at if last_message else room.created_at,
    }


class SendMessageView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        message_text = request.data.get("message")
        room_id = request.data.get("room")
        request_language = get_requested_language(request)

        if not message_text:
            return Response(
                {"error": "Message required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not room_id:
            room, _ = ChatRoom.objects.get_or_create(name=f"ai-{request.user.id}")
        else:
            try:
                room = ChatRoom.objects.get(id=room_id)

            except ChatRoom.DoesNotExist:

                return Response(
                    {"error": "Room not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        if room.room_type != "ai" and room.participants.exists() and not room.participants.filter(id=request.user.id).exists():
            return Response(
                {"error": "You are not allowed to send messages in this room"},
                status=status.HTTP_403_FORBIDDEN
            )

        language = detect_language(message_text)

        translated, tone, intent = analyze_and_translate(message_text, target_language=request_language)

        user_message = Message.objects.create(
            room=room,
            sender=request.user,
            original_message=message_text,
            translated_message=translated,
            language=language,
            tone=tone,
            intent=intent
        )

        if room.name == f"ai-{request.user.id}":
            bot_reply = generate_bot_reply(message_text, target_language=request_language)
            bot_language = detect_language(bot_reply)
            bot_message = Message.objects.create(
                room=room,
                sender=None,
                is_bot=True,
                original_message=bot_reply,
                translated_message=bot_reply,
                language=bot_language,
                tone="neutral",
                intent="message"
            )

            return Response(
                {
                    "user_message": build_message_payload(user_message, request_language),
                    "message": build_message_payload(bot_message, request_language),
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "user_message": build_message_payload(user_message, request_language),
                "message": None,
            },
            status=status.HTTP_201_CREATED
        )


class CreateRoomView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        target_user_id = request.data.get("target_user_id")
        participant_ids = request.data.get("participant_ids") or []
        group_name = (request.data.get("group_name") or "").strip()

        if group_name:
            normalized_ids = sorted({str(request.user.id), *[str(participant_id) for participant_id in participant_ids if str(participant_id)]})
            if len(normalized_ids) < 3:
                return Response(
                    {"error": "Select at least 2 users to create a group"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            room_name = f"group-{'-'.join(normalized_ids)}-{group_name.lower().replace(' ', '-')}"
            room, created = ChatRoom.objects.get_or_create(
                name=room_name,
                defaults={
                    "title": group_name,
                    "room_type": "group",
                },
            )
            room.title = group_name
            room.room_type = "group"
            room.save(update_fields=["title", "room_type"])
            room.participants.set(normalized_ids)

            return Response(
                {
                    **serialize_room(room, request.user),
                    "created": created,
                },
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )

        if not target_user_id:
            return Response(
                {"error": "Target user id required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if str(target_user_id) == "ai-assistant":
            room_name = f"ai-{request.user.id}"
            room_defaults = {"title": "AI Assistant", "room_type": "ai"}
        else:
            participant_ids = sorted([str(request.user.id), str(target_user_id)])
            room_name = f"dm-{'-'.join(participant_ids)}"
            room_defaults = {"room_type": "direct"}

        room, created = ChatRoom.objects.get_or_create(name=room_name, defaults=room_defaults)
        room.room_type = room_defaults["room_type"]
        if room.room_type == "ai":
            room.title = "AI Assistant"
            room.save(update_fields=["room_type", "title"])
        else:
            room.save(update_fields=["room_type"])
            room.participants.set(participant_ids)

        return Response(
            {
                **serialize_room(room, request.user),
                "created": created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class RoomListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = ChatRoom.objects.filter(participants=request.user).exclude(room_type="ai").distinct()
        return Response([serialize_room(room, request.user) for room in rooms])


class MessageHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        request_language = get_requested_language(request)

        try:
            room = ChatRoom.objects.get(id=room_id)

        except ChatRoom.DoesNotExist:

            return Response(
                    {"error": "Room not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        if room.room_type != "ai" and room.participants.exists() and not room.participants.filter(id=request.user.id).exists():
            return Response(
                {"error": "You are not allowed to view this room"},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = Message.objects.filter(
            room=room
        ).order_by("created_at")

        payload = [build_message_payload(message, request_language) for message in messages]

        return Response(payload)


class VoiceMessageView(APIView):

    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        audio_file = request.FILES.get("audio")
        room_id = request.data.get("room")

        if not audio_file:
            return Response(
                {"error": "Audio file required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not room_id:
            return Response(
                {"error": "Room id required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        text = speech_to_text(audio_file)

        if not text:
            return Response(
                {"error": "Could not recognize speech"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            room = ChatRoom.objects.get(id=room_id)

        except ChatRoom.DoesNotExist:

            return Response(
                {"error": "Room not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        language = detect_language(text)

        request_language = get_requested_language(request)
        translated, tone, intent = analyze_and_translate(text, target_language=request_language)

        message = Message.objects.create(
            room=room,
            sender=request.user,
            original_message=text,
            translated_message=translated,
            language=language,
            tone=tone,
            intent=intent
        )

        serializer = build_message_payload(message, request_language)

        return Response(serializer, status=status.HTTP_201_CREATED)
