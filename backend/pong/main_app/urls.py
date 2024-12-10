from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from .views import UserListAPIView, UserCreateAPIView, UserProfileDetailAPIView, FriendCreateAPIView, FriendDetailAPIView, MatchHistoryListCreateAPIView, TournamentListCreateAPIView, SetupTwoFactorView, ProtectedMediaView, AcceptedFriendsAPIView, PendingFriendRequestsAPIView, MatchHistory2v2ListCreateAPIView, UserTwoFactorAuthDataView, SendVerificationCode, CowboyMatchHistoryListCreateAPIView, UserDetailAPIView


urlpatterns = [
	path('users/register/', UserCreateAPIView.as_view(), name='user-register'),
	path('setup-2fa/', SetupTwoFactorView.as_view(), name="setup-2fa"),
	path('users/me/', UserDetailAPIView.as_view(), name='user-detail'),
	path('users-2fa/', UserTwoFactorAuthDataView.as_view(), name='user-2fa'),
	path('send-2fa/', SendVerificationCode.as_view(), name='send-verif'),
	path('profiles/me/', UserProfileDetailAPIView.as_view(), name='userprofile-detail'),
	path('friends/', FriendCreateAPIView.as_view(), name='friend-list-create'),
	path('friends/accepted/', AcceptedFriendsAPIView.as_view(), name='accepted-friends'),
    path('friends/pending/', PendingFriendRequestsAPIView.as_view(), name='pending-friend-requests'),
	path('friends/<int:pk>/', FriendDetailAPIView.as_view(), name='friend-detail'),
	path('matches/', MatchHistoryListCreateAPIView.as_view(), name='matchhistory-list-create'),
	path('matches/2v2/', MatchHistory2v2ListCreateAPIView.as_view(), name='matchhistory2v2-list-create'),
	path('matches/cowboy/', CowboyMatchHistoryListCreateAPIView.as_view(), name='cowboy_matchhistory-list-create'),
	path('tournaments/', TournamentListCreateAPIView.as_view(), name='tournament-list-create'),
    path('media/<path:path>', ProtectedMediaView.as_view(), name='protected_media'),
	path('', TemplateView.as_view(template_name='404.html'), name='404'),
]
