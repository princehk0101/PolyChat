from django.contrib import admin
from .models import UserProfile


class UserProfileAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "provider",
        "created_at"
    )

    search_fields = (
        "user__username",
        "user__email"
    )


admin.site.register(UserProfile, UserProfileAdmin)