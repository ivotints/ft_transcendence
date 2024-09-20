from rest_framework import serializers

from django.contrib.auth.models import User
from .models import MatchHistory
from .models import UserProfile
from .models import Friend
from .models import Tournament


class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	class Meta:
		model = User
		fields = [
			'username',
            'email',
			'password',
            'first_name',
            'last_name',
            'is_active',
		]

	def create(self, validate_data):
		password = validate_data.pop('password')
		user = User(**validate_data)
		user.set_password(password)
		user.save()
		return user


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

	def validate_match_score(self, value):
		try:
			player1_score, player2_score = map(int, value.strip().split('-'))
			if player1_score < 0 or player2_score < 0:
				raise serializers.ValidationError("Scores must be non-negative integers.")
		except ValueError:
			raise serializers.ValidationError("Match score must be in the format 'int-int' (e.g., '10-5').")
		return value
	
	def validate(self, data):
		# Ensure player1 and player2 are not the same user
		if data['player1'] == data['player2']:
			raise serializers.ValidationError("A player cannot play against themselves.")
		return data

class FriendSerializer(serializers.ModelSerializer):
	class Meta:
		model = Friend
		fields = [
			'user',
			'friend',
			'status',
			'created_at'
		]

	def validate(self, data):
		user = self.context['request'].user
		friend = data['friend']
		if user == friend: # TODO: doesn't work
			raise serializers.ValidationError("You cannot send a friend request to yourself.")
		if Friend.objects.filter(user=user, friend=friend).exists() or Friend.objects.filter(user=friend, friend=user).exists():
			raise serializers.ValidationError("A friend request already exists between these users.")
		return data

class TournamentSerializer(serializers.ModelSerializer):
	class Meta:
		model = Tournament
		fields = [
			'name',
			'match_date',
			'blockchain_tx_hash',
		]