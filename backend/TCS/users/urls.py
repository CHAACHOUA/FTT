# users/urls.py

from django.urls import path
from .views import register_candidate, login_user, complete_candidate_profile

urlpatterns = [
    path('register-candidate/', register_candidate, name='register_candidate'),
    path('complete-profile/', complete_candidate_profile, name='complete_candidate_profile'),
    path('login/', login_user, name='login_user'),
]
