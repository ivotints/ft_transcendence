from django.apps import AppConfig
from django.contrib import admin


class MainAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "main_app"

    def ready(self):
        from .models import User, UserProfile, Friend, MatchHistory, Tournament

        admin.site.register(User)
        admin.site.register(UserProfile)
        admin.site.register(Friend)
        admin.site.register(MatchHistory)
        admin.site.register(Tournament)
