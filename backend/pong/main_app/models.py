from django.db import models
from django.utils import timezone

# Create your models here.

class User(models.Model):
	email = models.EmailField(unique=True)
	password_hash = models.CharField(max_length=255)
	display_name = models.CharField(max_length=50, unique=True)
	avatar_url = models.URLField(blank=True, default="")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	is_online = models.BooleanField(default=False)

	def __str__(self):
		return self.display_name


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
	wins = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)
	match_history = models.ForeignKey("MatchHistory", on_delete=models.SET_NULL, null=True, blank=True)

	def __str__(self):
		return f"{self.user.display_name}'s profile"


class Friend(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships")
	friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends")
	status = models.CharField(max_length=10, choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")])
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.display_name} -> {self.friend.display_name} ({self.status})"


class MatchHistory(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player1")
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player2")
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="won_matches")
    match_date = models.DateTimeField(default=timezone.now)
    match_score = models.CharField(max_length=50)  # Store as string (e.g. "10-5")

    def __str__(self):
        return f"Match {self.id}: {self.player1.display_name} vs {self.player2.display_name} on {self.match_date}"
	

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    match_date = models.DateTimeField()
    blockchain_tx_hash = models.CharField(max_length=66, blank=True, null=True)  # Ethereum transaction reference