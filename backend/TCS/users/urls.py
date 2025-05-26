from django.urls import path
from users.views.auth_views import (
    register_candidate,
    login_candidate,
    activate_account,
)
from users.views.email_views import validate_email_change
from users.views.password_views import (
    request_password_reset,
    reset_password,
    change_password,
)
from users.views.deletion_views import delete_candidate_account

urlpatterns = [
    # 🔐 Authentification
    path('auth/signup/candidate/', register_candidate, name='register_candidate'),
    path('auth/login/candidate/', login_candidate, name='login_candidate'),
    path('auth/activate-account/<str:token>/', activate_account, name='activate_account'),

    # 📧 Email
    path('auth/validate-email-change/<str:token_str>/', validate_email_change, name='validate_email_change'),

    # 🔁 Mot de passe
    path('auth/request-password-reset/', request_password_reset, name='request_password_reset'),
    path('auth/reset-password/<str:token>/', reset_password, name='reset_password'),
    path('auth/change-password/', change_password, name='change_password'),

    # ❌ Suppression de compte
    path('auth/delete-account/', delete_candidate_account, name='delete_candidate_account'),
]
