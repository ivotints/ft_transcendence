from django.shortcuts import render
from rest_framework import generics

from .models import MatchHistory
from .serializers import MatchHistorySerializer


class MatchHistoryListCreateAPIView(generics.ListCreateAPIView):
	serializer_class = MatchHistorySerializer

	def get_queryset(self):
		user = self.request.user
		return MatchHistory.objects.filter(player1=user)
	
	def perform_create(self, serializer):
		serializer.save(player1=self.request.user) # not sure if it is needed