from rest_framework import serializers

from .models import MatchHistory
from .models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = [
			'email',
			'display_name',
			'avatar_url',
			'is_online'
		]

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
