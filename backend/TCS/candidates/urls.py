from django.urls import path

from candidates.views.upload_views import upload_cv_view
from candidates.views.profile_views import (
    complete_profile_view,
    get_candidate_profile_view
)
from candidates.views.language_views import get_languages_view

urlpatterns = [
    # Profil
    path('profile/', complete_profile_view, name='complete_candidate_profile'),
    path('profile/me/', get_candidate_profile_view, name='get_candidate_profile'),

    #  CV
    path('upload-cv/', upload_cv_view, name='upload_cv'),

    #  Langues
    path('languages/', get_languages_view, name='get_languages'),
]
