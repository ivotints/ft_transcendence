from rest_framework import serializers

from .models import MatchHistory
from .models import User
from .models import UserProfile
from .models import Friend
from .models import Tournament


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = [
			'email',
			'display_name',
			'avatar_url',
			'is_online'
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
			'match_history'
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