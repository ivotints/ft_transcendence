"""
URL configuration for pong project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.http import HttpResponse
from main_app.views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomTokenVerifyView, check_login_status, oauth_redirect, oauth_callback

# def home(request):
# 	return HttpResponse("Home Page")

urlpatterns = [
    path("admin/", admin.site.urls),
	path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
	path("token/verify/", CustomTokenVerifyView.as_view(), name="token_verify"),
	path('oauth/redirect/', oauth_redirect, name='oauth_redirect'),
    path('oauth/callback/', oauth_callback, name='oauth_callback'),
    path('check-login/', check_login_status, name='check_login_status'),
	path("", include("main_app.urls")),
]
