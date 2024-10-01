from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status, permissions, authentication, generics
from django.http import Http404
from django.http import JsonResponse
from django.conf import settings
import logging

from .web3 import get_tournament_data, add_tournament_data
from .authentication import CustomJWTAuthentication 

from django.contrib.auth.models import User
from .models import UserProfile
from .models import Friend
from .models import MatchHistory
from .models import Tournament
from .serializers import UserSerializer
from .serializers import UserProfileSerializer
from .serializers import FriendSerializer
from .serializers import MatchHistorySerializer
from .serializers import TournamentSerializer


logger = logging.getLogger(__name__)


class UserListAPIView(generics.ListAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		CustomJWTAuthentication,
		authentication.TokenAuthentication,
	]
	permission_classes = [permissions.IsAdminUser]


class UserCreateAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


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
	

class FriendListCreateAPIView(generics.ListCreateAPIView): # TODO: add authorization
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
		
		serializer = self.get_serializer(instance, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)

		if serializer.instance.status == 'rejected':
			serializer.instance.delete()
			return Response({'detail': 'Friend request rejected and deleted.'}, status=status.HTTP_200_OK)

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

	def create(self, request, *args, **kwargs): # TODO: change it for a frontend
		# user_ids = request.data.get('user_ids')
		winners_order = ['daniel', 'olaf', 'jackob', 'semolina']

		if winners_order is not None:
			# user_ids = [int(id) for id in user_ids.split(',')]
			# print(user_ids)
			if len(winners_order) != 4:
				return Response({"error": "Must provide exactly 4 user nicknames"}, status=400)

			try:
				tx_hash = add_tournament_data(request.data.get('tournament_id'), winners_order, settings.METAMASK_PRIVATE_KEY)

				# Use the serializer to validate the data and create the new object
				serializer = self.get_serializer(data=request.data)
				serializer.is_valid(raise_exception=True)
				self.perform_create(serializer)

				tournament = serializer.instance
				tournament.blockchain_tx_hash = tx_hash
				tournament.save()

				headers = self.get_success_headers(serializer.data)
				return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
			except Exception as e:
				return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

		return super().create(request, *args, **kwargs)


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
				samesite='Strict',
				secure=True
			)
		if refresh_token:
			response.set_cookie(
				'refresh_token',
				refresh_token,
				httponly=True,
				samesite='Strict',
				expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
				secure=True
			)

		response.data = {'detail': 'Success'}
		return response


class CustomTokenRefreshView(TokenRefreshView):
	def post(self, request, *args, **kwargs):
		refresh_token = request.COOKIES.get('refresh_token')
		# logger.debug(f"Refresh Token from Cookie: {refresh_token}")
		if not refresh_token:
			return JsonResponse({'detail': 'Refresh token not found'}, status=400)
		
		request_data = request.data.copy()
		request_data['refresh'] = refresh_token

		response = super().post(request, data=request_data, *args, **kwargs)
		access_token = response.data.get('access')
		# logger.debug(f"New Access Token: {access_token}")
		if access_token:
			response.set_cookie(
				'access_token',
				access_token,
				httponly=True,
				samesite='Strict',
				secure=True
			)
		response.data = {'detail': 'Success'}
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