import logging
import pyotp
import jwt

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import exceptions
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from .models import UserTwoFactorAuthData, UserProfile


logger = logging.getLogger(__name__)

class CustomJWTAuthentication(JWTAuthentication):
	def authenticate(self, request):
		header = self.get_header(request)
		if header is None:
			raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
			# logger.debug(f"Token from cookie: {raw_token[:10]}..." if raw_token else None)
		else:
			raw_token = self.get_raw_token(header)
			# logger.debug(f"Token from header: {raw_token[:10]}..." if raw_token else None)
		
		if raw_token is None:
			logger.warning("No token found in request")
			return None

		try:
			validated_token = self.get_validated_token(raw_token)
			logger.info(f"Token validated successfully. Expiry: {validated_token['exp']}")
		except InvalidToken as e:
			logger.error(f"Token validation failed: {str(e)}")
			print('we are here1')
			user = self.get_user_from_token(raw_token)
			if user:
				self.set_user_offline(user)
			raise

		if settings.SIMPLE_JWT.get('USE_CSRF_FOR_COOKIE_JWT', False):
			try:
				self.enforce_csrf(request)
			except exceptions.PermissionDenied as e:
				logger.error(f"CSRF check failed: {str(e)}")
				raise
			
		user = self.get_user(validated_token)
		if user is None:
			return None

		return (user, validated_token)
	

	def get_user_from_token(self, raw_token):
		user_model = get_user_model()
		try:
			# Decode the token without validation
			decoded_token = jwt.decode(raw_token, options={"verify_signature": False})
			user_id = decoded_token.get(settings.SIMPLE_JWT['USER_ID_CLAIM'])
			if user_id is None:
				return None
			return user_model.objects.get(**{settings.SIMPLE_JWT['USER_ID_FIELD']: user_id})
		except (jwt.DecodeError, jwt.ExpiredSignatureError):
			return None
		except user_model.DoesNotExist:
			return None
		

	def set_user_offline(self, user):
		profile = UserProfile.objects.get(user=user)
		profile.is_online = False
		profile.save()


def user_two_factor_auth_data_create(*, user) -> UserTwoFactorAuthData:
	if hasattr(user, 'two_factor_auth_data'):
		raise ValidationError('Can not have more than one 2FA related data.')
	
	two_factor_auth_data = UserTwoFactorAuthData.objects.create(
		user=user,
		otp_secret=pyotp.random_base32()
	)

	return two_factor_auth_data