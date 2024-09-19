from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework import authentication
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import permissions
from rest_framework import status
from django.http import Http404


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