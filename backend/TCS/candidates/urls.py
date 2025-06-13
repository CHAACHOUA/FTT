from django.urls import path

from candidates.views.upload_views import upload_cv_view,  task_status
from candidates.views.profile_views import (
    complete_profile_view,
    get_candidate_profile_view
)
from candidates.views.language_views import get_languages_view

from candidates.views.public_profile import public_candidate_view,get_public_token


urlpatterns = [
    # Profil
    path('profile/', complete_profile_view, name='complete_candidate_profile'),
    path('profile/me/', get_candidate_profile_view, name='get_candidate_profile'),
    path('profile/public/<uuid:token>/', public_candidate_view, name='public-candidate-view'),
    path('public-token/', get_public_token, name='get-public-token'),

    #  CV
    path('upload-cv/', upload_cv_view, name='upload_cv'),
    path("task_status/<str:task_id>/", task_status),
    #  Langues
    path('languages/', get_languages_view, name='get_languages'),
]
