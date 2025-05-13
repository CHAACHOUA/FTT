# users/urls.py

from django.urls import path
from .views import register_candidate, login_candidate, activate_account, validate_email_change, request_password_reset, \
    reset_password, change_password, delete_candidate_account

urlpatterns = [

    path('auth/activate-account/<str:token>/', activate_account, name='activate-account'),
    path('auth/delete-account/', delete_candidate_account, name='delete-candidate-account'),
    path('auth/validate-email-change/<str:token_str>/', validate_email_change, name='validate_email_change'),
    path('auth/request-password-reset/', request_password_reset, name='request-password-reset'),
    path('auth/reset-password/<str:token>/', reset_password, name='reset-password'),
    path('auth/change-password/', change_password, name='change-password'),
    path('auth/signup/candidate', register_candidate, name='register_candidate'),
    path('auth/login/candidate', login_candidate, name='login_candidate'),
]
