from django.urls import path
from .views import CreateRoomView, SendMessageView, MessageHistoryView, VoiceMessageView, RoomListView


urlpatterns = [

    path(
        "rooms/",
        CreateRoomView.as_view(),
        name="create_room"
    ),

    path(
        "rooms/list/",
        RoomListView.as_view(),
        name="list_rooms"
    ),

    path(
        "send/",
        SendMessageView.as_view(),
        name="send_message"
    ),

    path(
        "history/<int:room_id>/",
        MessageHistoryView.as_view(),
        name="chat_history"
    ),

    path(
        "voice/",
        VoiceMessageView.as_view(),
        name="voice_message"
    ),
]
