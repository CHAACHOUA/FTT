"""
URL configuration for TCS project.

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
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/choices/', views.get_choices, name='get_choices'),
    
    # JWT Token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    # App URLs
    path('api/users/',include('users.urls')),
    path('api/candidates/', include('candidates.urls')),
    path('api/forums/', include('forums.urls')),
    path('api/organizers/', include('organizers.urls')),
    path('api/companies/', include('company.urls')),
    path('api/recruiters/', include('recruiters.urls')),
    path('api/matching/', include('matching.urls')),
    path('api/virtual/', include('virtual.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/chat/', include('chat.urls'))

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
