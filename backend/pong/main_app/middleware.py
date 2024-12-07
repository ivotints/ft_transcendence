import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from django.utils import timezone
from django.conf import settings
from .models import UserProfile
from django.contrib.auth import get_user_model

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get('access_token')
        User = get_user_model()
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                if user_id is not None:
                    user = User.objects.get(id=user_id)
                    request.user = user
            except (ExpiredSignatureError, InvalidTokenError, User.DoesNotExist):
                request.user = None

        excluded_paths = ['/token/refresh/', '/token/verify/']
        if request.path not in excluded_paths and request.user and request.user.is_authenticated:
            try:
                user_profile = UserProfile.objects.get(user=request.user)
                user_profile.last_activity = timezone.now()
                if not user_profile.is_online:
                    user_profile.is_online = True
                user_profile.save()
            except UserProfile.DoesNotExist:
                pass

        response = self.get_response(request)
        return response
