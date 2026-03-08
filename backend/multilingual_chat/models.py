from django.db import models
from django.contrib.auth.models import User


class ChatRoom(models.Model):
    ROOM_TYPE_CHOICES = [
        ("ai", "AI"),
        ("direct", "Direct"),
        ("group", "Group"),
    ]

    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default="direct")
    participants = models.ManyToManyField(User, related_name="chat_rooms", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Message(models.Model):

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="messages"
        ,
        null=True,
        blank=True
    )

    is_bot = models.BooleanField(default=False)

    original_message = models.TextField()

    translated_message = models.TextField(
        blank=True,
        null=True
    )

    language = models.CharField(max_length=20)

    tone = models.CharField(
        max_length=50,
        blank=True
    )

    intent = models.CharField(
        max_length=50,
        blank=True
    )

    sentiment_score = models.FloatField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sender_label = "AI Assistant" if self.is_bot else self.sender
        return f"{sender_label} : {self.original_message[:20]}"
