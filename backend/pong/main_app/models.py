from django.db import models
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User

# Create your models here.

# class User(models.Model):
# 	email = models.EmailField(unique=True)
# 	password_hash = models.CharField(max_length=255)
# 	display_name = models.CharField(max_length=50, unique=True)
# 	avatar_url = models.URLField(blank=True, default="")
# 	created_at = models.DateTimeField(auto_now_add=True)
# 	updated_at = models.DateTimeField(auto_now=True)
# 	is_online = models.BooleanField(default=False)

# 	def save(self, *args, **kwargs):
# 		is_new = not self.pk # Checking if new object
# 		super().save(*args, **kwargs)
# 		if is_new:
# 			UserProfile.objects.create(user=self)

# 	def __str__(self):
# 		return self.display_name


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE) # , related_name="profile")
	avatar_url = models.URLField(blank=True, default="")
	is_online = models.BooleanField(default=False)
	# wins = models.IntegerField(default=0)
	# losses = models.IntegerField(default=0)
	match_history = models.ManyToManyField("MatchHistory", blank=True)

	def calculate_wins(self):
		return MatchHistory.objects.filter(winner=self.user).count()
	
	def calculate_losses(self):
		return MatchHistory.objects.filter(
			Q(player1=self.user) | Q(player2=self.user)
		).exclude(winner=self.user).count()

	def __str__(self):
		return f"{self.user.username}'s profile"


class Friend(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships")
	friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends")
	status = models.CharField(max_length=10, choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")])
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} -> {self.friend.username} ({self.status})"


class MatchHistory(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player1")
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player2")
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="won_matches") # TODO: make it calculated on the go
	match_date = models.DateTimeField(default=timezone.now)
	match_score = models.CharField(max_length=50)  # Store as string (e.g. "10-5")

	def calculate_winner(self):
		player1_score, player2_score = map(int, self.match_score.split('-')) #TODO: validate input in serializer
		if player1_score > player2_score:
			self.winner = self.player1
		elif player2_score > player1_score:
			self.winner = self.player2
		else:
			self.winner = None

	def save(self, *args, **kwargs):
		self.calculate_winner()
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Match {self.id}: {self.player1.username} vs {self.player2.username} on {self.match_date}"
	

	

class Tournament(models.Model):
	name = models.CharField(max_length=100)
	match_date = models.DateTimeField(default=timezone.now)
	blockchain_tx_hash = models.CharField(max_length=66, blank=True, null=True)
	
	def __str__(self):
		return self.name