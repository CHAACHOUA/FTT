from django.urls import path

from candidates.views.upload_views import upload_cv_view,  task_status
from candidates.views.profile_views import (
    complete_profile_view,
    get_candidate_profile_view
)
from candidates.views.language_views import get_languages_view

from candidates.views.public_profile import public_candidate_view,get_public_token
from candidates.views.gamification_views import forum_progress, toggle_company_visited, save_company_note
from candidates.views.favorites_views import toggle_favorite_offer_view, get_favorite_offers_view


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
    
    # Gamification
    path('forum/<int:forum_id>/progress/', forum_progress, name='forum_progress'),
    path('forum/<int:forum_id>/company/<int:company_id>/toggle-visited/', toggle_company_visited, name='toggle_company_visited'),
    path('forum/<int:forum_id>/company/<int:company_id>/note/', save_company_note, name='save_company_note'),
    
    # Favoris
    path('favorites/toggle/<int:offer_id>/', toggle_favorite_offer_view, name='toggle-favorite-offer'),
    path('favorites/<int:offer_id>/', toggle_favorite_offer_view, name='toggle-favorite-offer-direct'),
    path('favorites/list/', get_favorite_offers_view, name='get-favorite-offers'),
]
