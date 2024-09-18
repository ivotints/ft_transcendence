from rest_framework import serializers

from django.contrib.auth.models import User
from .models import MatchHistory
from .models import UserProfile
from .models import Friend
from .models import Tournament


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = [
			'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
		]

class UserProfileSerializer(serializers.ModelSerializer):
	wins = serializers.SerializerMethodField()
	losses = serializers.SerializerMethodField()

	class Meta:
		model = UserProfile
		fields = [
			'user',
			'wins',
			'losses',
			'match_history',
			'avatar_url',
			'is_online',
		]

	def get_wins(self, obj):
		return obj.calculate_wins()
	
	def get_losses(self, obj):
		return obj.calculate_losses()

class MatchHistorySerializer(serializers.ModelSerializer):
	class Meta:
		model = MatchHistory
		fields = [
			'player1',
			'player2',
			'winner',
			'match_date',
			'match_score'
		]
		read_only_fields = ['winner']

class FriendSerializer(serializers.ModelSerializer):
	class Meta:
		model = Friend
		fields = [
			'user',
			'friend',
			'status',
			'created_at'
		]

class TournamentSerializer(serializers.ModelSerializer):
	class Meta:
		model = Tournament
		fields = [
			'name',
			'match_date',
			'blockchain_tx_hash',
		]