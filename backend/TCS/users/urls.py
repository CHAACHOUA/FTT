from django.urls import path
from users.views.auth_views import (
    register_candidate,
    login_user,
    activate_account,
    resend_activation,
    invite_recruiter,
    complete_recruiter_setup
)
from users.views.email_views import validate_email_change
from users.views.password_views import (
    request_password_reset,
    reset_password,
    change_password,
)
from users.views.deletion_views import delete_user_account


urlpatterns = [
    # 🔐 Authentification
    path('auth/signup/candidate/', register_candidate, name='register_candidate'),
    path('auth/login/user/', login_user, name='login_candidate'),
    path('auth/activate-account/<str:token>/', activate_account, name='activate_account'),

    # 📧 Email
    path('auth/validate-email-change/<str:token_str>/', validate_email_change, name='validate_email_change'),
    #resend activation account
    path('auth/resend-activation/', resend_activation, name='resend_activation'),

    # 👥 Invitation recruteur
    path('auth/invite-recruiter/', invite_recruiter, name='invite_recruiter'),
    path('auth/complete-recruiter-setup/<str:token>/', complete_recruiter_setup, name='complete_recruiter_setup'),

    # 🔁 Mot de passe
    path('auth/request-password-reset/', request_password_reset, name='request_password_reset'),
    path('auth/reset-password/<str:token>/', reset_password, name='reset_password'),
    path('auth/change-password/', change_password, name='change_password'),

    # ❌ Suppression de compte
    path('auth/delete-account/', delete_user_account, name='delete_user_account'),
]
