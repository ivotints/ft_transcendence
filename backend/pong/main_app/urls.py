from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import UserListCreateAPIView, UserProfileListAPIView, FriendListCreateAPIView, MatchHistoryListCreateAPIView, TournamentListCreateAPIView


urlpatterns = [
	path("auth/", obtain_auth_token),
	# path("", views.home),
	path('users/', UserListCreateAPIView.as_view(), name='user-list-create'),
	path('profiles/', UserProfileListAPIView.as_view(), name='userprofile-list-create'),
	path('friends/', FriendListCreateAPIView.as_view(), name='friend-list-create'),
	path('matches/', MatchHistoryListCreateAPIView.as_view(), name='matchhistory-list-create'),
	path('tournaments/', TournamentListCreateAPIView.as_view(), name='tournament-list-create'),
]