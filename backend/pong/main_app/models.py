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
		wins_1v1 = MatchHistory.objects.filter(winner=self.user.get_username()).count()
		wins_2v2 = MatchHistory2v2.objects.filter(
			Q(winner1=self.user) | Q(winner2=self.user.get_username())
		).count()

		return wins_1v1 + wins_2v2
	
	def calculate_losses(self):
		losses_1v1 = MatchHistory.objects.filter(
			Q(player1=self.user) | Q(player2=self.user.get_username())
		).exclude(winner=self.user.get_username()).count()
		losses_2v2 = MatchHistory2v2.objects.filter(
			Q(player1=self.user) | Q(player2=self.user.get_username()) |
			Q(player3=self.user) | Q(player4=self.user.get_username())
		).exclude(Q(winner1=self.user.get_username()) | Q(winner2=self.user.get_username())
		).count()

		return losses_1v1 + losses_2v2

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
	status = models.CharField(max_length=10, choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")], default="pending")
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
		player1_score, player2_score = map(int, self.match_score.split('-'))
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
	

class MatchHistory2v2(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player1_2v2")
	player2 = models.CharField(max_length=100)
	player3 = models.CharField(max_length=100)
	player4 = models.CharField(max_length=100) # Since these are local matches
	winner1 = models.CharField(max_length=100, null=True, blank=True) 
	winner2 = models.CharField(max_length=100, null=True, blank=True) 
	match_date = models.DateTimeField(default=timezone.now)
	match_score = models.CharField(max_length=50)  # Store as string (e.g. "10-5")

	def calculate_winners(self):
		team1_score, team2_score = map(int, self.match_score.split('-'))
		if team1_score > team2_score:
			self.winner1 = self.player1.get_username()
			self.winner2 = self.player2
		elif team2_score > team1_score:
			self.winner1 = self.player3
			self.winner2 = self.player4
		else:
			self.winner1 = None
			self.winner2 = None

	def save(self, *args, **kwargs):
		self.calculate_winners()
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Match {self.id}: ({self.player1.username} and {self.player2}) vs ({self.player3} and {self.player4}) on {self.match_date}"
	

class Tournament(models.Model):
	owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournaments", default=1)
	tournament_id = models.IntegerField(unique=True, null=True, blank=True)
	match_date = models.DateTimeField(default=timezone.now)
	# participants = models.ManyToManyField(User, related_name='tournaments')
	blockchain_tx_hash = models.CharField(max_length=66, blank=True, null=True)
	
	def __str__(self):
		return self.name