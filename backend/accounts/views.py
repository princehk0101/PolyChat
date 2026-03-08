from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer
from .models import UserProfile

from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings


# REGISTER
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):

    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():

        user = serializer.save()

        UserProfile.objects.create(
            user=user,
            provider="email"
        )

        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# LOGIN
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    try:
        lookup = Q()
        if email:
            lookup |= Q(email=email)
        if username:
            lookup |= Q(username=username)

        if not lookup:
            return Response(
                {"error": "Email or username required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.get(lookup)

        if user.check_password(password):

            profile = UserProfile.objects.get(user=user)

            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "language": profile.language
            })

        return Response(
            {"error": "Invalid password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    except User.DoesNotExist:

        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# GOOGLE LOGIN
@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):

    token = request.data.get("token") or request.data.get("access_token")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        username = email.split("@")[0]

        user, created = User.objects.get_or_create(
            username=username,
            email=email
        )

        if created:
            UserProfile.objects.create(
                user=user,
                provider="google"
            )

        profile = UserProfile.objects.get(user=user)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "language": profile.language
        })

    except ValueError:

        return Response(
            {"error": "Invalid Google token"},
            status=status.HTTP_400_BAD_REQUEST
        )


# LANGUAGE OPTIONS
@api_view(["GET"])
@permission_classes([AllowAny])
def language_choices(request):

    languages = [
        {"code": "en", "name": "English"},
        {"code": "hi", "name": "Hindi"},
        {"code": "bn", "name": "Bengali"},
        {"code": "ta", "name": "Tamil"},
        {"code": "te", "name": "Telugu"},
        {"code": "mr", "name": "Marathi"},
        {"code": "gu", "name": "Gujarati"},
        {"code": "pa", "name": "Punjabi"},
        {"code": "ur", "name": "Urdu"},
        {"code": "es", "name": "Spanish"},
        {"code": "fr", "name": "French"},
        {"code": "de", "name": "German"},
        {"code": "it", "name": "Italian"},
        {"code": "pt", "name": "Portuguese"},
        {"code": "ru", "name": "Russian"},
        {"code": "ar", "name": "Arabic"},
        {"code": "tr", "name": "Turkish"},
        {"code": "ko", "name": "Korean"},
        {"code": "ja", "name": "Japanese"},
        {"code": "zh", "name": "Chinese"},
    ]

    return Response(languages)


# SET LANGUAGE
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_language(request):

    language = request.data.get("language")

    profile = UserProfile.objects.get(user=request.user)

    profile.language = language
    profile.save()

    return Response({
        "message": "Language saved",
        "language": language
    })


# CURRENT USER
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def current_user(request):

    profile = UserProfile.objects.get(user=request.user)

    if request.method == "PATCH":
        username = request.data.get("username")
        full_name = request.data.get("full_name")
        language = request.data.get("language")
        profile_pic = request.data.get("profile_pic")

        if username:
            existing_user = User.objects.filter(username=username).exclude(id=request.user.id).first()
            if existing_user:
                return Response(
                    {"username": ["Username already taken"]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.user.username = username
            request.user.save(update_fields=["username"])

        profile_fields = []

        if full_name is not None:
            profile.full_name = full_name
            profile_fields.append("full_name")

        if language is not None:
            profile.language = language
            profile_fields.append("language")

        if profile_pic is not None:
            profile.profile_pic = profile_pic
            profile_fields.append("profile_pic")

        if profile_fields:
            profile.save(update_fields=profile_fields)

    return Response({
        "id": request.user.id,
        "name": profile.full_name or request.user.username,
        "full_name": profile.full_name,
        "username": request.user.username,
        "email": request.user.email,
        "language": profile.language,
        "profile_pic": profile.profile_pic,
    })


# USERS LIST
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):

    users = User.objects.exclude(id=request.user.id).order_by("username")

    return Response([
        {
            "id": user.id,
            "name": getattr(user, "userprofile", None).full_name if hasattr(user, "userprofile") else user.username,
            "username": user.username,
            "email": user.email,
            "profile_pic": getattr(user, "userprofile", None).profile_pic if hasattr(user, "userprofile") else None,
        }
        for user in users
    ])


# LOGOUT
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):

    try:

        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({
                "message": "Logout successful"
            })

        token = RefreshToken(refresh_token)

        token.blacklist()

        return Response({
            "message": "Logout successful"
        })

    except Exception:

        return Response(
            {"error": "Invalid token"},
            status=status.HTTP_400_BAD_REQUEST
        )
