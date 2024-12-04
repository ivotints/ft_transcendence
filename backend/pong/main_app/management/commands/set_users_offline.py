from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from main_app.models import UserProfile

class Command(BaseCommand):
	help = 'Set users offline if they have been inactive for a specified period'

	def handle(self, *args, **kwargs):
		timeout = timedelta(minutes=5)
		now = timezone.now()
		inactive_users = UserProfile.objects.filter(last_activity__lt=now - timeout, is_online=True)
		inactive_count = inactive_users.count()
		inactive_users.update(is_online=False)
		self.stdout.write(f'Set {inactive_count} users offline')