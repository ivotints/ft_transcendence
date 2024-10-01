import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from django.utils.translation import gettext_lazy as _

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