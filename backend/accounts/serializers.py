from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


# REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password"
        ]

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already registered"
            )

        return value

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user


# USER PROFILE SERIALIZER
class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = [
            "provider",
            "language",
            "created_at"
        ]


# CURRENT USER SERIALIZER
class CurrentUserSerializer(serializers.ModelSerializer):

    language = serializers.CharField(
        source="userprofile.language",
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "language"
        ]