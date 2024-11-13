from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework import status, permissions, authentication, generics, serializers

from django.http import JsonResponse, Http404, FileResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes, authentication_classes

from twilio.rest import Client

import logging, os, random, string, requests, re

from .authentication import CustomJWTAuthentication, user_two_factor_auth_data_create, send_email_code, send_sms_code
from .models import UserProfile, UserTwoFactorAuthData, Friend, MatchHistory, MatchHistory2v2, Tournament, CowboyMatchHistory
from .serializers import UserSerializer, UserProfileSerializer, FriendSerializer, MatchHistorySerializer, TournamentSerializer, CustomTokenRefreshSerializer, MatchHistory2v2Serializer, CowboyMatchHistorySerializer


logger = logging.getLogger(__name__)


class SetupTwoFactorView(APIView):
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		method = request.data.get('method')
		user_phone = request.data.get('user_phone')
		code = request.data.get('code')

		account_sid = settings.TWILIO_ACCOUNT_SID
		auth_token = settings.TWILIO_AUTH_TOKEN
		verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID

		try:
			# Generate 2FA data
			# two_factor_auth_data = user_two_factor_auth_data_create(user=user)

			two_factor_auth_data = user_two_factor_auth_data_create(user=user)

			if method == 'authenticator':
				if two_factor_auth_data.sms_enabled or two_factor_auth_data.email_enabled:
					return JsonResponse({"errors": ["Another 2FA method is already enabled"]}, status=400)
				elif two_factor_auth_data.app_enabled:
						return JsonResponse({"errors": ["This 2FA method is already enabled"]}, status=400)
				
				if not code:
					# Creates qr_code on first call

					qr_code = two_factor_auth_data.generate_qr_code(name=user.email)
					return JsonResponse({"otp_secret": two_factor_auth_data.otp_secret, "qr_code": qr_code})
				else:
					# Checks if code is correct so it can be written to DB

					otp = request.data.get('code')
					if not two_factor_auth_data.validate_otp(otp):
						return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

					two_factor_auth_data.app_enabled = True
					two_factor_auth_data.save()
					return JsonResponse({"success": "2FA setup successfully."})
				# return JsonResponse({"otp_secret": two_factor_auth_data.otp_secret, "qr_code": qr_code})
			elif method == 'sms':
				client = Client(account_sid, auth_token)

				if two_factor_auth_data.app_enabled or two_factor_auth_data.email_enabled:
					return JsonResponse({"errors": ["Another 2FA method is already enabled"]}, status=400)
				elif two_factor_auth_data.sms_enabled:
					return JsonResponse({"errors": ["This 2FA method is already enabled"]}, status=400)
				if not user_phone:
					return JsonResponse({"errors": ["Mobile number is required for SMS 2FA"]}, status=400)
				
				if not re.match(r'^\+[1-9]\d{1,14}$', user_phone):
					return JsonResponse({"errors": ["Invalid phone number format."]}, status=400)

				if not code :
					verification = client.verify.services(verify_service_sid).verifications.create(
						to=user_phone,
						channel='sms'
					)
					return JsonResponse({"success": "OTP sent successfully."})
				else:
					verification_check = client.verify.services(verify_service_sid).verification_checks.create(
						to=user_phone,
						code=code
					)

					if verification_check.status == 'approved':
						two_factor_auth_data.sms_enabled = True
						two_factor_auth_data.mobile_number = user_phone
						two_factor_auth_data.save()
						return JsonResponse({"success": "2FA setup successfully."})
					else:
						return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

			elif method == 'email':
				if two_factor_auth_data.app_enabled or two_factor_auth_data.sms_enabled:
					return JsonResponse({"errors": ["Another 2FA method is already enabled"]}, status=400)
				elif two_factor_auth_data.email_enabled:
					return JsonResponse({"errors": ["This 2FA method is already enabled"]}, status=400)

				if not code:
					send_email_code(user.email, two_factor_auth_data.otp_secret)
					return JsonResponse({"success": "OTP sent successfully."})
				else:

					if not two_factor_auth_data.validate_email_otp(code):
						return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

					two_factor_auth_data.email_enabled = True
					two_factor_auth_data.save()
					return Response({"success": "2FA setup successfully."}, status=status.HTTP_200_OK)

			else:
				return JsonResponse({"errors": ["Invalid method"]}, status=400)
		except ValidationError as exc:
			return JsonResponse({"errors": exc.messages}, status=400)
	

class ConfirmTwoFactorAuthView(APIView):
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		user = request.user
		otp = request.data.get('otp')

		try:
			two_factor_auth_data = UserTwoFactorAuthData.objects.filter(user=user).first()

			if two_factor_auth_data is None:
				return Response({"error": "2FA is not set up for this user."}, status=status.HTTP_400_BAD_REQUEST)

			if not two_factor_auth_data.validate_otp(otp):
				return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

			# If OTP is valid, return success response
			return Response({"success": "2FA verified successfully."}, status=status.HTTP_200_OK)

		except ValidationError as exc:
			return Response({"error": exc.message}, status=status.HTTP_400_BAD_REQUEST)


class UserCreateAPIView(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [permissions.AllowAny]


class UserListAPIView(generics.ListAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [permissions.IsAdminUser]


class UserDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = [
        CustomJWTAuthentication,
    ]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileListAPIView(generics.ListAPIView):
	serializer_class = UserProfileSerializer
	queryset = UserProfile.objects.all()
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [permissions.IsAdminUser]
	
	
class UserProfileDetailAPIView(generics.RetrieveUpdateAPIView):
	serializer_class = UserProfileSerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_object(self):
		return UserProfile.objects.get(user=self.request.user)
	

class UserTwoFactorAuthDataView(APIView):
	def post(self, request):
		username = request.data.get('username')
		User = get_user_model()

		try:
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			return JsonResponse({"detail": "User not found"}, status=404)

		try:
			two_factor_auth_data = UserTwoFactorAuthData.objects.get(user=user)
			return JsonResponse({
				'app_enabled': two_factor_auth_data.app_enabled,
				'sms_enabled': two_factor_auth_data.sms_enabled,
				'email_enabled': two_factor_auth_data.email_enabled,
			})
		except UserTwoFactorAuthData.DoesNotExist:
			return JsonResponse({
				'app_enabled': False,
				'sms_enabled': False,
				'email_enabled': False,
			})
		

class SendVerificationCode(APIView):
	def post(self, request):
		username = request.data.get('username')
		method = request.data.get('method')
		User = get_user_model()
		account_sid = settings.TWILIO_ACCOUNT_SID
		auth_token = settings.TWILIO_AUTH_TOKEN
		verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID

		try:
			user = User.objects.get(username=username)
			two_factor_auth_data = user_two_factor_auth_data_create(user=user)
		except User.DoesNotExist:
			return JsonResponse({"detail": "User not found"}, status=404)

		try:
			if method == 'sms':
				client = Client(account_sid, auth_token)
				user_phone = two_factor_auth_data.mobile_number
				verification = client.verify.services(verify_service_sid).verifications.create(
					to=user_phone,
					channel='sms'
				)
				return JsonResponse({"success": "OTP sent successfully."})
			elif method == 'email':
				send_email_code(user.email, two_factor_auth_data.otp_secret)
				return JsonResponse({"success": "OTP sent successfully."})
		except Exception as e:
			return JsonResponse({"detail": str(e)}, status=500)



class FriendListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = FriendSerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return Friend.objects.filter(user=user) | Friend.objects.filter(friend=user)
	
	def perform_create(self, serializer):
		serializer.save(user=self.request.user)


class AcceptedFriendsAPIView(generics.ListAPIView):
	serializer_class = FriendSerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return Friend.objects.filter(
			(Q(user=user) | Q(friend=user)) & Q(status="accepted")
		)
	

class PendingFriendRequestsAPIView(generics.ListAPIView):
	serializer_class = FriendSerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return Friend.objects.filter(friend=user, status="pending")
	

class FriendDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = FriendSerializer
	authentication_classes = [CustomJWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get_object(self):
		"""Retrieve the friend request object with access control."""
		friend_id = self.kwargs.get('pk')
		try:
			friend = Friend.objects.get(pk=friend_id)
			# Ensure only involved users can access
			if self.request.user == friend.user or self.request.user == friend.friend:
				return friend
			else:
				raise PermissionDenied("You do not have permission to access this friend request.")
		except Friend.DoesNotExist:
			raise NotFound("Friend request not found.")

	def update(self, request, *args, **kwargs):
		"""Update friend request status; delete if rejected."""
		instance = self.get_object()
		if instance.friend != request.user:
			return Response({'detail': 'You do not have permission to update this friend request.'},
							status=status.HTTP_403_FORBIDDEN)

		serializer = self.get_serializer(instance, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)

		if serializer.instance.status == 'rejected':
			serializer.instance.delete()
			return Response({'detail': 'Friend request rejected and deleted.'}, status=status.HTTP_200_OK)

		return Response(serializer.data)

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		# Verify the user is part of the friendship before deleting
		if request.user != instance.user and request.user != instance.friend:
			return Response({'detail': 'You do not have permission to delete this friend request.'},
							status=status.HTTP_403_FORBIDDEN)

		self.perform_destroy(instance)
		return Response({'detail': 'Friend request deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class MatchHistoryListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = MatchHistorySerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return MatchHistory.objects.filter(player1=user) | MatchHistory.objects.filter(player2=user.username)
	
	def create(self, request, *args, **kwargs):
		try:
			return super().create(request, *args, **kwargs)
		except Exception as e:
			print('Caught exception in create:', str(e))
			return Response(
				{'detail': str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)

	def perform_create(self, serializer):
		player1 = serializer.validated_data.get('player1')
		if player1 != self.request.user:
			raise PermissionDenied("You can only create matches for yourself.")
		serializer.save()


class MatchHistory2v2ListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = MatchHistory2v2Serializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return MatchHistory2v2.objects.filter(player1=user) | MatchHistory2v2.objects.filter(player2=user.username) | MatchHistory2v2.objects.filter(player3=user.username) | MatchHistory2v2.objects.filter(player4=user.username)
	
	def create(self, request, *args, **kwargs):
		try:
			return super().create(request, *args, **kwargs)
		except Exception as e:
			print('Caught exception in create:', str(e))
			return Response(
				{'detail': str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)

	def perform_create(self, serializer):
		player1 = serializer.validated_data.get('player1')
		if player1 != self.request.user:
			raise PermissionDenied("You can only create matches for yourself.")
		serializer.save()


class CowboyMatchHistoryListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = CowboyMatchHistorySerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return CowboyMatchHistory.objects.filter(player1=user) | CowboyMatchHistory.objects.filter(player2=user.username)
	
	def create(self, request, *args, **kwargs):
		try:
			return super().create(request, *args, **kwargs)
		except Exception as e:
			print('Caught exception in create:', str(e))
			return Response(
				{'detail': str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)

	def perform_create(self, serializer):
		player1 = serializer.validated_data.get('player1')
		if player1 != self.request.user:
			raise PermissionDenied("You can only create matches for yourself.")
		serializer.save()


class TournamentListCreateAPIView(generics.ListCreateAPIView):
	queryset = Tournament.objects.all()
	serializer_class = TournamentSerializer
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return Tournament.objects.filter(owner=user)
	
	def perform_create(self, serializer):
		owner = serializer.validated_data.get('owner')
		if owner != self.request.user:
			raise PermissionDenied("You can only create tournaments for yourself.")
		serializer.save()


class CustomTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)

		try:
			serializer.is_valid(raise_exception=True)
		except TokenError as e:
			raise InvalidToken(e.args[0])

		username = request.data.get('username')
		otp = request.data.get('otp')
		User = get_user_model()
		account_sid = settings.TWILIO_ACCOUNT_SID
		auth_token = settings.TWILIO_AUTH_TOKEN
		verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID
		try:
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			return Response({"error": "User not found"}, status=400)

		try:
			two_factor_auth_data = UserTwoFactorAuthData.objects.get(user=user)
		except UserTwoFactorAuthData.DoesNotExist:
			# If the user does not have two-factor authentication data,
			pass
		else:
			if two_factor_auth_data.app_enabled or two_factor_auth_data.email_enabled or two_factor_auth_data.sms_enabled:
				method = request.data.get('method')
				if not otp:
					return Response({'detail': 'OTP required'}, status=401)
				
				if method == 'sms':
					client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
					verification_check = client.verify.services(settings.TWILIO_VERIFY_SERVICE_SID).verification_checks.create(
						to=two_factor_auth_data.mobile_number,
						code=otp
					)
					if verification_check.status != 'approved':
						return Response({"detail": "Invalid OTP code."}, status=401)
				elif method == 'app':
					if not two_factor_auth_data.validate_otp(otp):
						return Response({"detail": "Invalid OTP code."}, status=401)
				elif method == 'email':
					if not two_factor_auth_data.validate_email_otp(otp):
						return Response({"detail": "Invalid OTP code."}, status=401)
					

		response = super().post(request, *args, **kwargs)
		access_token = response.data.get('access')
		refresh_token = response.data.get('refresh')

		if access_token:
			response.set_cookie(
				'access_token',
				access_token,
				expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
				httponly=True,
				samesite='None',
				secure=True,
			)
		if refresh_token:
			response.set_cookie(
				'refresh_token',
				refresh_token,
				httponly=True,
				samesite='None',
				expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
				secure=True,
			)

		profile = UserProfile.objects.get(user=user)
		profile.is_online = True
		profile.save()

		response.data = {'detail': 'Success'}
		return response


class CustomTokenRefreshView(TokenRefreshView):
	serializer_class = CustomTokenRefreshSerializer

	def post(self, request, *args, **kwargs):
		refresh_token = request.COOKIES.get('refresh_token')
		if not refresh_token:
			return Response({'detail': 'Refresh token not found'}, status=400)

		serializer = self.get_serializer(data={'refresh': refresh_token})

		try:
			serializer.is_valid(raise_exception=True)
		except serializers.ValidationError as e:
			return Response({'detail': 'Invalid token'}, status=400)

		access_token = serializer.validated_data.get('access')

		response = Response({'detail': 'Success'})
		if access_token:
			response.set_cookie(
				'access_token',
				access_token,
				expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
				httponly=True,
				samesite='None',
				secure=True,
			)

		return response
	

class CustomTokenVerifyView(TokenVerifyView):
	def post(self, request, *args, **kwargs):
		access_token = request.COOKIES.get('access_token')
		if not access_token:
			return JsonResponse({'detail': 'Access token not found'}, status=400)
		request_data = request.data.copy()
		request_data['token'] = access_token
		return super().post(request, data=request_data ,*args, **kwargs)


class LogoutView(APIView):
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [permissions.IsAuthenticated]
	
	def post(self, request):
		response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
		response.delete_cookie('access_token')
		response.delete_cookie('refresh_token')
		return response
	

class ProtectedMediaView(APIView):
	authentication_classes = [
		CustomJWTAuthentication,
	]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, path, format=None):
		file_path = os.path.join(settings.MEDIA_ROOT, path)
		user = request.user
		profile = UserProfile.objects.get(user = user)
		if os.path.exists(file_path) and profile.avatar == path:
			return FileResponse(open(file_path, 'rb'))
		else:
			raise Http404
		

def generate_state():
	return ''.join(random.choices(string.ascii_letters + string.digits, k=32))


def oauth_redirect(request):
	client_id = settings.FT_CLIENT_ID
	redirect_uri = settings.FT_REDIRECT_URI
	state = generate_state()
	request.session['oauth_state'] = state

	authorization_url = (
		f"https://api.intra.42.fr/oauth/authorize"
		f"?client_id={client_id}"
		f"&redirect_uri={redirect_uri}"
		f"&response_type=code"
		f"&scope=public"
		f"&state={state}"
	)

	return redirect(authorization_url)


def oauth_callback(request):
	code = request.GET.get('code')
	state = request.GET.get('state')
	stored_state = request.session.pop('oauth_state', None)

	if state != stored_state:
		return JsonResponse({'error': 'Invalid state parameter'}, status=400)

	token_url = "https://api.intra.42.fr/oauth/token"
	data = {
		'grant_type': 'authorization_code',
		'client_id': settings.FT_CLIENT_ID,
		'client_secret': settings.FT_CLIENT_SECRET,
		'code': code,
		'redirect_uri': settings.FT_REDIRECT_URI,
	}

	response = requests.post(token_url, data=data)
	if response.status_code != 200:
		return JsonResponse({'error': 'Failed to obtain access token'}, status=response.status_code)

	token_data = response.json()
	access_token = token_data.get('access_token')

	headers = {
		'Authorization': f'Bearer {access_token}',
	}
	user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
	if user_info_response.status_code != 200:
		return JsonResponse({'error': 'Failed to fetch user info'}, status=user_info_response.status_code)

	user_info = user_info_response.json()
	username = user_info['login']
	email = user_info['email']

	User = get_user_model()
	user, created = User.objects.get_or_create(username=username, defaults={'email': email})
	if created:
		user.set_unusable_password()
		user.save()

	refresh = RefreshToken.for_user(user)
	access_token = str(refresh.access_token)
	refresh_token = str(refresh)

	response = redirect('https://localhost/')
	response.set_cookie(
		'access_token',
		access_token,
		httponly=True,
		samesite='None',
		secure=True,
		expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
	)
	response.set_cookie(
		'refresh_token',
		refresh_token,
		httponly=True,
		samesite='None',
		secure=True,
		expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
	)

	return response


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def check_login_status(request):
	return JsonResponse({'detail': 'User is authenticated'}, status=200)