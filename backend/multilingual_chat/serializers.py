from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message

        fields = [
            "id",
            "room",
            "sender",
            "is_bot",
            "original_message",
            "translated_message",
            "language",
            "tone",
            "intent",
            "created_at"
        ]

        read_only_fields = ["sender", "is_bot"]

    def create(self, validated_data):

        validated_data["sender"] = self.context["request"].user

        return super().create(validated_data)
