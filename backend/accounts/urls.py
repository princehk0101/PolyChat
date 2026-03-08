from django.urls import path

from .views import register_user
from .views import login_user
from .views import google_login
from .views import logout_user
from .views import current_user
from .views import list_users
from .views import set_language
from .views import language_choices


urlpatterns = [

    path("register/", register_user, name="register_user"),

    path("login/", login_user, name="login_user"),

    path("google/", google_login, name="google_login"),

    path("logout/", logout_user, name="logout_user"),

    path("me/", current_user, name="current_user"),

    path("users/", list_users, name="list_users"),

    path("set-language/", set_language, name="set_language"),

    path("languages/", language_choices, name="language_choices"),
]
