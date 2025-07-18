from django.urls import path
from recruiters.views.offers_view import toggle_favorite_offer_view
from recruiters.views.offers_view import get_favorite_offers_view,create_offer, update_offer, delete_offer,company_offers_list
from recruiters.views.profile_view import update_recruiter_profile_view,company_recruiters_view, recruiter_profile
from recruiters.views.meeting import forum_meeting_candidates_view

urlpatterns = [
    #profile
    path('profile/me/', recruiter_profile, name='recruiter_profile'),
    path('profile/', update_recruiter_profile_view, name='update_recruiter_profile'),
    #Recruiters of company
    path('company-recruiters/', company_recruiters_view, name='my-company-recruiters'),
    #offers
    path('favorites/toggle/<int:offer_id>/', toggle_favorite_offer_view, name='toggle-favorite-offer'),
    path('favorites/list/', get_favorite_offers_view, name='get-favorite-offers'),
    path('offers/create/', create_offer, name='create_offer'),
    path('offers/<int:offer_id>/update/', update_offer, name='update_offer'),
    path('offers/<int:offer_id>/delete/', delete_offer, name='delete_offer'),
    path('company-offers/', company_offers_list, name='company-offers'),

    #meeting
    path('meetings/candidates/', forum_meeting_candidates_view, name='forum-meeting-candidate'),

]