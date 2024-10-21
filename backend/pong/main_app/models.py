from django.db import models
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.conf import settings

from typing import Optional

import pyotp
import qrcode
import qrcode.image.svg


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE) # , related_name="profile")
	avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
	is_online = models.BooleanField(default=False)
	# wins = models.IntegerField(default=0)
	# losses = models.IntegerField(default=0)
	match_history = models.ManyToManyField("MatchHistory", blank=True)

	def calculate_wins(self):
		return MatchHistory.objects.filter(winner=self.user.get_username()).count()
	
	def calculate_losses(self):
		return MatchHistory.objects.filter(
			Q(player1=self.user) | Q(player2=self.user.get_username())
		).exclude(winner=self.user.get_username()).count()

	def __str__(self):
		return f"{self.user.username}'s profile"
	

class UserTwoFactorAuthData(models.Model):
	user = models.OneToOneField(
		User,
		related_name='two_factor_auth_data',
		on_delete=models.CASCADE
	)

	otp_secret = models.CharField(max_length=255)

	def generate_qr_code(self, name: Optional[str] = None) -> str:
		totp = pyotp.TOTP(self.otp_secret)
		qr_uri = totp.provisioning_uri(
			name=name,
			issuer_name='PingPong'
		)

		image_factory = qrcode.image.svg.SvgPathImage
		qr_code_image = qrcode.make(
			qr_uri,
			image_factory=image_factory
		)
		
		#The result is going to be an HTML <svg> tag
		return qr_code_image.to_string().decode('utf_8')
	
	def validate_otp(self, otp: str) -> bool:
		totp = pyotp.TOTP(self.otp_secret)

		return totp.verify(otp)


class Friend(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships")
	friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends")
	status = models.CharField(max_length=10, choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")])
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} -> {self.friend.username} ({self.status})"


class MatchHistory(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player1")
	player2 = models.CharField(max_length=100) # Since these are local matches
	winner = models.CharField(max_length=100, null=True, blank=True) 
	match_date = models.DateTimeField(default=timezone.now)
	match_score = models.CharField(max_length=50)  # Store as string (e.g. "10-5")

	def calculate_winner(self):
		player1_score, player2_score = map(int, self.match_score.split('-')) #TODO: validate input in serializer
		if player1_score > player2_score:
			self.winner = self.player1.get_username()
		elif player2_score > player1_score:
			self.winner = self.player2
		else:
			self.winner = None

	def save(self, *args, **kwargs):
		self.calculate_winner()
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Match {self.id}: {self.player1.username} vs {self.player2} on {self.match_date}"
	

class Tournament(models.Model):
	name = models.CharField(max_length=100)
	tournament_id = models.IntegerField(unique=True, null=True, blank=True)
	match_date = models.DateTimeField(default=timezone.now)
	winners_order = ArrayField(models.CharField(max_length=100), blank=True, default=list)
	participants = models.ManyToManyField(User, related_name='tournaments')
	blockchain_tx_hash = models.CharField(max_length=66, blank=True, null=True)
	
	def __str__(self):
		return self.name