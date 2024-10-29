from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status, permissions, authentication, generics, serializers
from rest_framework.views import APIView

from django import forms
from django.http import JsonResponse, Http404, FileResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.generic import TemplateView, FormView
from django.core.exceptions import ValidationError
from django.views.generic import TemplateView
from django.db.models import Q
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes, authentication_classes

from datetime import datetime

import logging
import os
import random
import string
import requests

from .web3 import get_tournament_data, add_tournament_data
from .authentication import CustomJWTAuthentication, user_two_factor_auth_data_create

from django.contrib.auth.models import User
from .models import UserProfile
from .models import UserTwoFactorAuthData
from .models import Friend
from .models import MatchHistory
from .models import MatchHistory2v2
from .models import Tournament
from .serializers import UserSerializer
from .serializers import UserProfileSerializer
from .serializers import FriendSerializer
from .serializers import MatchHistorySerializer
from .serializers import TournamentSerializer
from .serializers import CustomTokenRefreshSerializer
from .serializers import MatchHistory2v2Serializer


logger = logging.getLogger(__name__)


class TwoFactorSetupTemplateView(TemplateView):
	template_name = "setup_2fa.html"

class TwoFactorConfirmTemplateView(TemplateView):
	template_name = "confirm_2fa.html"


class SetupTwoFactorView(APIView):
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		try:
			# Generate 2FA data
			two_factor_auth_data = user_two_factor_auth_data_create(user=user)
			otp_secret = two_factor_auth_data.otp_secret
			qr_code = two_factor_auth_data.generate_qr_code(name=user.email)

			return JsonResponse({
				"otp_secret": otp_secret,
				"qr_code": qr_code
			})
		except ValidationError as exc:
			return JsonResponse({
				"errors": exc.messages
			}, status=400)
	

class ConfirmTwoFactorAuthView(APIView):
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		user = request.user
		otp = request.data.get('otp')  # Get OTP from request body

		try:
			# Fetch the 2FA data for the authenticated user
			two_factor_auth_data = UserTwoFactorAuthData.objects.filter(user=user).first()

			if two_factor_auth_data is None:
				return Response({"error": "2FA is not set up for this user."}, status=status.HTTP_400_BAD_REQUEST)

			# Validate the provided OTP
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
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [permissions.IsAdminUser]


class UserProfileListAPIView(generics.ListAPIView):
	serializer_class = UserProfileSerializer
	queryset = UserProfile.objects.all()
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [permissions.IsAdminUser]
	
	
class UserProfileDetailAPIView(generics.RetrieveUpdateAPIView):
	serializer_class = UserProfileSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_object(self):
		return UserProfile.objects.get(user=self.request.user)
	

class FriendListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = FriendSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
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
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
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
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return Friend.objects.filter(friend=user, status="pending")
	

class FriendDetailAPIView(generics.RetrieveUpdateAPIView):
	serializer_class = FriendSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_object(self):
		friend_id = self.kwargs.get('pk')
		try:
			friend = Friend.objects.get(pk=friend_id)
			if self.request.user == friend.user or self.request.user == friend.friend:
				return friend
			else:
				raise PermissionDenied("You do not have permission to access this friend request.")
		except:
			raise Http404("Friend request not found.")
		
		
	def update(self, request, *args, **kwargs):
		instance = self.get_object()
		
		# Only the recipient can accept or reject the friend request
		if instance.friend != request.user:
			return Response({'detail': 'You do not have permission to update this friend request.'},
							status=status.HTTP_403_FORBIDDEN)
		
		print("Request data: ", request.data)
		
		serializer = self.get_serializer(instance, data=request.data, partial=True)
		try:
			serializer.is_valid(raise_exception=True)
		except ValidationError as e:
			print("Serializer errors: ", serializer.errors)
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		
		self.perform_update(serializer)

		if serializer.instance.status == 'rejected':
			serializer.instance.delete()
			return Response({'detail': 'Friend request rejected and deleted.'}, status=status.HTTP_200_OK)

		print("Updated instance data: ", serializer.data)  # Log the updated instance data
		return Response(serializer.data)


class MatchHistoryListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = MatchHistorySerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return MatchHistory.objects.filter(player1=user) | MatchHistory.objects.filter(player2=user.username)
	
	def perform_create(self, serializer):
		player1 = serializer.validated_data.get('player1')
		if player1 != self.request.user:
			raise PermissionDenied("You can only create matches for yourself.")
		serializer.save()


class MatchHistory2v2ListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = MatchHistory2v2Serializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return MatchHistory2v2.objects.filter(player1=user) | MatchHistory2v2.objects.filter(player2=user.username) | MatchHistory2v2.objects.filter(player3=user.username) | MatchHistory2v2.objects.filter(player4=user.username)
	
	def perform_create(self, serializer):
		player1 = serializer.validated_data.get('player1')
		if player1 != self.request.user:
			raise PermissionDenied("You can only create matches for yourself.")
		serializer.save()

	
class MatchHistoryDetailAPIView(generics.RetrieveUpdateAPIView):
	serializer_class = MatchHistorySerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_object(self):
		return MatchHistory.objects.get(user=self.request.user, id=self.kwargs['pk'])


class TournamentListCreateAPIView(generics.ListCreateAPIView):
	queryset = Tournament.objects.all()
	serializer_class = TournamentSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return Tournament.objects.filter(participants=user)
	
	# def list(self, request, *args, **kwargs):
	# 	queryset = self.get_queryset()
	# 	serializer = self.get_serializer(queryset, many=True)
	# 	tournaments = serializer.data

	# 	for tournament in tournaments:
	# 		tournament_id = tournament['id']
	# 		try:
	# 			blockchain_data = get_tournament_data(1000)
	# 			tournament['blockchain_data'] = blockchain_data
	# 		except Exception as e:
	# 			tournament['blockchain_data'] = {'error': str(e)}

	# 	return Response(tournaments)

	# def create(self, request, *args, **kwargs): # TODO: change it for a frontend
	# 	# winners_order = request.data.get('winners_order')
	# 	winners_order = ["player1", "player2", "player3", "player4"]

	# 	if winners_order is not None:
	# 		# user_ids = [int(id) for id in user_ids.split(',')]
	# 		# print(user_ids)
	# 		if len(winners_order) != 4:
	# 			return Response({"error": "Must provide exactly 4 user nicknames"}, status=400)

	# 		try:
	# 			serializer = self.get_serializer(data=request.data)
	# 			serializer.is_valid(raise_exception=True)
	# 			self.perform_create(serializer)

	# 			tournament = serializer.instance

	# 			tournament_id = tournament.id + 60000 # TODO
				
	# 			tx_hash = add_tournament_data(tournament_id, winners_order, settings.METAMASK_PRIVATE_KEY)

	# 			tournament.blockchain_tx_hash = tx_hash
	# 			tournament.save()

	# 			headers = self.get_success_headers(serializer.data)
	# 			return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
	# 		except Exception as e:
	# 			return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

	# 	return super().create(request, *args, **kwargs)


class TournamentDetailAPIView(generics.RetrieveUpdateAPIView):
	queryset = Tournament.objects.all()
	serializer_class = TournamentSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [IsAuthenticated]

	def update(self, request, *args, **kwargs): # TODO: validation of unique players
		winners_order = request.data.get('winners_order')
		if winners_order is not None:
			if len(winners_order) != 4:
				return Response({"error": "Must provide exactly 4 user nicknames"}, status=400)

			tournament = self.get_object()
			tournament_id = tournament.id

			if tournament.blockchain_tx_hash is not None: # simple prevention of overriding, adding admin of tournament is a solution as well
				return Response({"error": "Tournament results have already been posted"}, status=400)
			
			try:
				tx_hash = add_tournament_data(tournament_id, winners_order, settings.METAMASK_PRIVATE_KEY)

				# Update tournament to the database with the transaction hash
				serializer = self.get_serializer(tournament, data=request.data, partial=True)
				serializer.is_valid(raise_exception=True)
				serializer.save(blockchain_tx_hash=tx_hash)
			except Exception as e:
				return Response({"error": str(e)}, status=400)
		return super().update(request, *args, **kwargs)


class CustomTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)

		try:
			serializer.is_valid(raise_exception=True)
		except TokenError as e:
			raise InvalidToken(e.args[0])

		# user = serializer.validated_data['user']
		username = request.data.get('username')
		User = get_user_model()
		try:
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			return Response({"error": "User not found"}, status=400)

		# Check if the user has two-factor authentication enabled
		try:
			two_factor_auth_data = UserTwoFactorAuthData.objects.get(user=user)
		except UserTwoFactorAuthData.DoesNotExist:
			# If the user does not have two-factor authentication data,
			# they have not enabled two-factor authentication
			pass
		else:
			# If the user has two-factor authentication data, they need to provide an OTP
			otp_provided = request.data.get('otp')

			if not two_factor_auth_data.validate_otp(otp_provided):
				return Response({'detail': 'Invalid OTP'}, status=401)


		response = super().post(request, *args, **kwargs)
		access_token = response.data.get('access')
		refresh_token = response.data.get('refresh')

		# logger.debug(f"Generated Access Token: {access_token}")
		# logger.debug(f"Generated Refresh Token: {refresh_token}")

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
		# logger.debug(f"Access Token from Cookie: {access_token}")
		if not access_token:
			return JsonResponse({'detail': 'Access token not found'}, status=400)
		request_data = request.data.copy()
		request_data['token'] = access_token
		return super().post(request, data=request_data ,*args, **kwargs)
	

class ProtectedMediaView(APIView):
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, path, format=None):
		file_path = os.path.join(settings.MEDIA_ROOT, path)
		if os.path.exists(file_path):
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

	# Fetch user info from 42 API
	headers = {
		'Authorization': f'Bearer {access_token}',
	}
	user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
	if user_info_response.status_code != 200:
		return JsonResponse({'error': 'Failed to fetch user info'}, status=user_info_response.status_code)

	user_info = user_info_response.json()
	username = user_info['login']
	email = user_info['email']

	# Authenticate or create the user
	User = get_user_model()
	user, created = User.objects.get_or_create(username=username, defaults={'email': email})

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
@authentication_classes([
	authentication.SessionAuthentication,
	CustomJWTAuthentication,
	authentication.TokenAuthentication,
])
@permission_classes([IsAuthenticated])
def check_login_status(request):
	return JsonResponse({'detail': 'User is authenticated'}, status=200)