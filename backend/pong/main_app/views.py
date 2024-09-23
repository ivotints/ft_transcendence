from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework import authentication
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import permissions
from rest_framework import status
from django.http import Http404
from django.http import JsonResponse
from django.conf import settings

from .web3 import get_tournament_data, add_tournament_data

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


class UserListAPIView(generics.ListAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		authentication.TokenAuthentication
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
		authentication.TokenAuthentication
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return UserProfile.objects.filter(user=self.request.user)
	
	
class UserProfileDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    authentication_classes = [
        authentication.SessionAuthentication,
        authentication.TokenAuthentication
    ]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserProfile.objects.get(user=self.request.user)
	

class FriendListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = FriendSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		authentication.TokenAuthentication
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
		authentication.TokenAuthentication
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
		authentication.TokenAuthentication
	]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return MatchHistory.objects.filter(player1=user) | MatchHistory.objects.filter(player2=user)
	
	def perform_create(self, serializer):
		serializer.save() # not sure if needed


class TournamentListCreateAPIView(generics.ListCreateAPIView):
	queryset = Tournament.objects.all()
	serializer_class = TournamentSerializer
	authentication_classes = [
		authentication.SessionAuthentication,
		authentication.TokenAuthentication
	]
	permission_classes = [IsAuthenticated]

	def create(self, request, *args, **kwargs):
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



