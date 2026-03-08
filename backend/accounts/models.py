from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    provider = models.CharField(
        max_length=50,
        default="email"
    )

    language = models.CharField(
        max_length=20,
        blank=True
    )

    full_name = models.CharField(
        max_length=120,
        blank=True
    )

    profile_pic = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.user.username
