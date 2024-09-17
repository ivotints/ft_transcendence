from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import User
from .models import UserProfile
from .models import Friend
from .models import MatchHistory
from .models import Tournament
from .serializers import UserSerializer
from .serializers import UserProfileSerializer
from .serializers import FriendSerializer
from .serializers import MatchHistorySerializer
from .serializers import TournamentSerializer


class UserListCreateAPIView(generics.ListCreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

class UserProfileListAPIView(generics.ListAPIView):
	serializer_class = UserProfileSerializer
	queryset = UserProfile.objects.all()

	# def get_queryset(self):
	# 	return UserProfile.objects.filter(user=self.request.user.id)

class FriendListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = FriendSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		print(type(self.request.user))
		user = self.request.user
		return Friend.objects.filter(user=user) | Friend.objects.filter(friend=user)
	
	def perform_create(self, serializer):
		serializer.save(user=self.request.user)
	

class MatchHistoryListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = MatchHistorySerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		return MatchHistory.objects.filter(player1=user)
	
	def perform_create(self, serializer):
		serializer.save(player1=self.request.user) # not sure if needed

class TournamentListCreateAPIView(generics.ListCreateAPIView):
	queryset = Tournament.objects.all()
	serializer_class = TournamentSerializer