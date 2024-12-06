from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.conf import settings
from .models import MatchHistory
from .models import UserProfile
from .models import Friend
from .models import Tournament
from .models import MatchHistory2v2
from .models import CowboyMatchHistory

import re

from .web3 import get_tournament_data, add_tournament_data


class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, required=False)
	old_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
	class Meta:
		model = User
		fields = [
			'id',
			'username',
			'email',
			'password',
			'old_password',
			'first_name',
			'last_name',
			'is_active',
		]

	def validate_username(self, value):
		if len(value) > 32:
			raise serializers.ValidationError({'username:': 'Username must be 32 characters or fewer'})
		
		# username_regex = r'^[a-zA-Z0-9@.+\-_]+$'
		# if not re.match(username_regex, value):
		# 	raise serializers.ValidationError("Your username contains invalid characters.")
		
		return value
	
	def validate_email(self, value):
		if len(value) > 32:
			raise serializers.ValidationError({'email:': 'Email must be 32 characters or fewer'})
		try:
			validate_email(value)
		except ValidationError:
			raise serializers.ValidationError({'email:': 'Invalid email address'})
		return value
	
	def validate_password(self, value):
		if len(value) < 8 or len(value) > 32:
			raise serializers.ValidationError({"password": "Password must be at least 8 characters long and no longer than 32"})
		if not any(char.isdigit() for char in value):
			raise serializers.ValidationError({"password": "Password must contain at least one digit"})
		if not any(char.isalpha() for char in value):
			raise serializers.ValidationError({"password": "Password must contain at least one letter"})
		return value

	def validate(self, data):
		user = self.instance
		request = self.context.get('request')
		if request and request.method == 'PATCH':
			if 'password' in data:
				if user and user.has_usable_password():
					if 'old_password' not in data or not data.get('old_password'):
						raise serializers.ValidationError({"old_password": "You need to validate old password"})
					old_password = data.get('old_password')
					if user and not user.check_password(old_password):
						raise serializers.ValidationError({"old_password": "Old password is incorrect"})
				else:
					pass
		
		if request and request.method == 'POST':
			if 'email' not in data or not data.get('email'):
				raise serializers.ValidationError({"email": "Email cannot be empty"})

		if 'email' in data:
			email = data.get('email')
			if email is None or email.strip() == "":
				raise serializers.ValidationError({"email": "Email cannot be empty"})
			try:
				validate_email(email)
			except ValidationError:
				raise serializers.ValidationError({"email": "Invalid email address"})
			if user and user.email == email:
				raise serializers.ValidationError({"email": "New email cannot be the same as the old email"})

		# if 'old_password' in data:
		# 	old_password = data.get('old_password')
		# 	if old_password is None:
		# 		raise serializers.ValidationError({"old_password": "You need to validate old password"})
		# 	if user and not user.check_password(old_password):
		# 		raise serializers.ValidationError({"old_password": "Old password is incorrect"})

		if 'password' in data:
			password = data.get('password')
			if password is None:
				raise serializers.ValidationError({"password": "Password cannot be empty"})
			if len(password) < 8:
				raise serializers.ValidationError({"password": "Password must be at least 8 characters long"})
			if not any(char.isdigit() for char in password):
				raise serializers.ValidationError({"password": "Password must contain at least one digit"})
			if not any(char.isalpha() for char in password):
				raise serializers.ValidationError({"password": "Password must contain at least one letter"})
			if user and user.check_password(password):
				raise serializers.ValidationError({"password": "New password cannot be the same as the old password"})

		return data

	def create(self, validate_data):
		password = validate_data.pop('password', None)
		if not password:
			raise serializers.ValidationError({'password': 'Password is required'})
		
		user = User(**validate_data)
		user.set_password(password)
		user.save()

		return user
	
	def update(self, instance, validated_data):
		password = validated_data.pop('password', None)

		for attr, value in validated_data.items():
			setattr(instance, attr, value)

		if password:
			instance.set_password(password)

		instance.save()
		return instance


class UserProfileSerializer(serializers.ModelSerializer):
	user = UserSerializer()
	wins = serializers.SerializerMethodField()
	losses = serializers.SerializerMethodField()
	cowboy_wins = serializers.SerializerMethodField()
	cowboy_losses = serializers.SerializerMethodField()
	avatar = serializers.ImageField(required=False)

	class Meta:
		model = UserProfile
		fields = [
			'user',
			# 'oauth',
			'wins',
			'losses',
			'cowboy_wins',
			'cowboy_losses',
			'match_history',
			'avatar',
			'is_online',
		]
		read_only_fields = ['is_online']

	def get_wins(self, obj):
		return obj.calculate_wins()
	
	def get_losses(self, obj):
		return obj.calculate_losses()
	
	def get_cowboy_wins(self, obj):
		return obj.calculate_cowboy_wins()
	
	def get_cowboy_losses(self, obj):
		return obj.calculate_cowboy_losses()
	
	def validate_avatar(self, value):
		max_size = 2 * 1024 * 1024
		valid_content_types = ['image/jpeg', 'image/png']

		if value.size > max_size:
			raise ValidationError("Avatar image size should not exceed 2 MB.")

		if value.content_type not in valid_content_types:
			raise ValidationError("Avatar image must be in JPEG or PNG format.")

		return value
	
	def update(self, instance, validated_data):
		user_data = validated_data.pop('user', None)
		avatar = validated_data.pop('avatar', None)

		super().update(instance, validated_data)

		if user_data:
			user = instance.user
			user_serializer = UserSerializer(instance=user, data=user_data, partial=True)
			if user_serializer.is_valid(raise_exception=True):
				user_serializer.save()

		if avatar:
			instance.avatar = avatar
			instance.save()

		return instance

class MatchHistorySerializer(serializers.ModelSerializer):
	player1_username = serializers.SerializerMethodField()
	class Meta:
		model = MatchHistory
		fields = [
			'player1',
			'player2',
			'player1_username',
			'winner',
			'match_date',
			'match_score'
		]
		read_only_fields = ['winner']

	def get_player1_username(self, obj):
		return obj.player1.username
	
	def validate_player2(self, value):
		if len(value) > 32:
			raise serializers.ValidationError("Player2's username must be 32 characters or fewer.")

		username_regex = r'^[a-zA-Z0-9@.+\-_]+$'
		print(value)
		print(re.match(username_regex, value))
		if not re.match(username_regex, value):
			raise serializers.ValidationError("Player2's username contains invalid characters. This value may contain only letters, numbers, and @/./+/-/_ characters.")

		return value

	def validate_match_score(self, value):
		try:
			player1_score, player2_score = map(int, value.strip().split('-'))
			if player1_score < 0 or player2_score < 0:
				raise serializers.ValidationError("Invalid score. Score must be non-negative integers.")
			if player1_score > 5 or player2_score > 5 or (player1_score == player2_score):
				raise serializers.ValidationError("Invalid score. Maximum score is 5.")
			if player1_score != 5 and player2_score != 5:
				raise serializers.ValidationError("Invalid score. One score must be equal to 5.")
		except ValueError:
			raise serializers.ValidationError("Match score must be in the format 'int-int' (e.g., '5-4').")
		return value
	
	def create(self, validated_data):
		try:
			return super().create(validated_data)
		except Exception as e:
			raise serializers.ValidationError({'detail': str(e)})
	

class MatchHistory2v2Serializer(serializers.ModelSerializer):
	player1_username = serializers.SerializerMethodField()
	class Meta:
		model = MatchHistory2v2
		fields = [
			'player1',
			'player2',
			'player3',
			'player4',
			'player1_username',
			'winner1',
			'winner2',
			'match_date',
			'match_score'
		]
		read_only_fields = ['winner1', 'winner2']

	def get_player1_username(self, obj):
		return obj.player1.username

	def validate_match_score(self, value):
		try:
			team1_score, team2_score = map(int, value.strip().split('-'))
			if team1_score < 0 or team2_score < 0:
				raise serializers.ValidationError("Invalid score. Score must be non-negative integers.")
			if team1_score > 5 or team2_score > 5 or (team1_score == team2_score):
				raise serializers.ValidationError("Invalid score. Maximum score is 5.")
			if team1_score != 5 and team2_score != 5:
				raise serializers.ValidationError("Invalid score. One score must be equal to 5.")
		except ValueError:
			raise serializers.ValidationError("Match score must be in the format 'int-int' (e.g., '5-4').")
		return value
	
	def validate(self, data):
		player2 = data['player2']
		player3 = data['player3']
		player4 = data['player4']
		if len(player2) > 32 or len(player3) > 32 or len(player4) > 32:
			raise serializers.ValidationError("Player2's username must be 32 characters or fewer.")
		
		username_regex = r'^[a-zA-Z0-9@.+\-_]+$'
		if not re.match(username_regex, player2) or not re.match(username_regex, player3) or not re.match(username_regex, player4):
			raise serializers.ValidationError("Player's username contains invalid characters.")

		return data
	
	def create(self, validated_data):
		try:
			return super().create(validated_data)
		except Exception as e:
			raise serializers.ValidationError({'detail': str(e)})
	# def validate(self, data):
	# 	player1 = User.objects.get(user=data.get('player1'))
	# 	player1_username = player1.username
	# 	players = [player1_username, data.get('player2'), data.get('player3'), data.get('player4')]
	# 	if len(players) != len(set(players)):
	# 		raise serializers.ValidationError("All players must be unique.")
	# 	return data
	

class CowboyMatchHistorySerializer(serializers.ModelSerializer):
	player1_username = serializers.SerializerMethodField()
	class Meta:
		model = CowboyMatchHistory
		fields = [
			'player1',
			'player2',
			'player1_username',
			'winner',
			'match_date',
			'match_score'
		]
		read_only_fields = ['winner']

	def get_player1_username(self, obj):
		return obj.player1.username

	def validate_match_score(self, value):
		try:
			player1_score, player2_score = map(int, value.strip().split('-'))
			if player1_score < 0 or player2_score < 0:
				raise serializers.ValidationError("Invalid score. Score must be non-negative integers.")
			if player1_score > 5 or player2_score > 5 or (player1_score == player2_score):
				raise serializers.ValidationError("Invalid score. Maximum score is 5.")
			if player1_score != 5 and player2_score != 5:
				raise serializers.ValidationError("Invalid score. One score must be equal to 5.")
		except ValueError:
			raise serializers.ValidationError("Match score must be in the format 'int-int' (e.g., '10-5').")
		return value
	
	def validate(self, data):
		player2 = data['player2']
		if len(player2) > 32:
			raise serializers.ValidationError("Player2's username must be 32 characters or fewer.")
		
		username_regex = r'^[a-zA-Z0-9@.+\-_]+$'
		if not re.match(username_regex, player2):
			raise serializers.ValidationError("Player2's username contains invalid characters.")

		return data
	
	def create(self, validated_data):
		try:
			return super().create(validated_data)
		except Exception as e:
			raise serializers.ValidationError({'detail': str(e)})


class IsOnlineField(serializers.Field):
    def get_attribute(self, instance):
        user = super().get_attribute(instance)
        return user

    def to_representation(self, user):
        if user is None:
            return False
        try:
            profile = UserProfile.objects.get(user=user)
            return profile.is_online
        except UserProfile.DoesNotExist:
            return False


class FriendSerializer(serializers.ModelSerializer):
	friend_username = serializers.CharField(write_only=True, required=False)
	friend_detail = UserSerializer(source='friend', read_only=True)
	user_detail = UserSerializer(source='user', read_only=True)
	is_friend_online = IsOnlineField(source='friend', read_only=True)
	is_user_online = IsOnlineField(source='user', read_only=True)

	class Meta:
		model = Friend
		fields = [
			'id',
			'user',
			'friend',
			'friend_username',
			'friend_detail',
			'is_friend_online',
			'user_detail',
			'is_user_online',
			'status',
			'is_activated',
			'created_at',
		]
		read_only_fields = ['id', 'user', 'user_detail', 'friend', 'friend_detail', 'created_at', 'is_activated']

	def validate(self, data):
		user = self.context['request'].user
		friend_username = data.get('friend_username')

		if self.context['request'].method == 'POST':
			if not friend_username:
				raise serializers.ValidationError("Friend username is required.")

			try:
				friend = User.objects.get(username=friend_username)
			except User.DoesNotExist:
				raise serializers.ValidationError("Friend with this username does not exist.")

			if user == friend:
				raise serializers.ValidationError("You cannot send a friend request to yourself.")

			if Friend.objects.filter(user=user, friend=friend).exists() or Friend.objects.filter(user=friend, friend=user).exists():
				raise serializers.ValidationError("A friend request already exists between these users.")

			data['friend_instance'] = friend

		return data
	
	def update(self, instance, validated_data):
		if self.context['request'].method == 'PATCH':
			new_status = validated_data.get('status', instance.status)
			print(new_status)
			if instance.status == 'pending' and new_status in ['accepted', 'rejected']:
				instance.set_activated()
			elif instance.is_activated:
				raise serializers.ValidationError("Status cannot be changed once it is set to accepted or rejected.")

			return super().update(instance, validated_data)

	def create(self, validated_data):
		user = self.context['request'].user
		friend = validated_data.pop('friend_instance')

		friend_request = Friend.objects.create(
			user=user,
			friend=friend,
			status='pending'
		)
		return friend_request


class TournamentSerializer(serializers.ModelSerializer):
    winners_order = serializers.ListField(child=serializers.CharField(), write_only=True)
    winners_order_display = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'owner',
            'tournament_id',
            'match_date',
            'winners_order',
            'winners_order_display',
            'blockchain_tx_hash',
        ]
        read_only_fields = ['blockchain_tx_hash', 'winners_order_display']

    def get_winners_order_display(self, obj):
        try:
            blockchain_data = get_tournament_data(obj.tournament_id)
            print("Blockchain data:", blockchain_data)
            return blockchain_data
        except Exception as e:
            return {'error': str(e)}

    def create(self, validated_data):
        winners_order = validated_data.pop('winners_order', None)
        try:
            tournament = Tournament.objects.create(**validated_data)

            if winners_order:
                tournament_id = tournament.id + 60055
                tournament.tournament_id = tournament_id
                tx_hash = add_tournament_data(tournament_id, winners_order, settings.METAMASK_PRIVATE_KEY)
                tournament.blockchain_tx_hash = tx_hash
                tournament.save()

            return tournament
        except Exception as e:
            raise serializers.ValidationError(f"Error creating tournament: {e}")
	

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
	def validate(self, attrs):
		request = self.context.get('request')
		refresh_token = request.COOKIES.get('refresh_token')

		if not refresh_token:
			raise serializers.ValidationError({'detail': 'Refresh token not found in cookies'})

		attrs['refresh'] = refresh_token
		return super().validate(attrs)