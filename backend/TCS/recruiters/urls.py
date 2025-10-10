from django.urls import path
from recruiters.views.offers_view import toggle_favorite_offer_view
from recruiters.views.offers_view import get_favorite_offers_view,create_offer, update_offer, delete_offer,company_offers_list
from recruiters.views.profile_view import update_recruiter_profile_view,company_recruiters_view, recruiter_profile, company_approval_status_view
from recruiters.views.meeting import forum_meeting_candidates_view, add_meeting_candidate_view, remove_meeting_candidate_view, test_meeting_view, test_add_meeting_view
from recruiters.views.recruiter_management import get_company_recruiters, update_recruiter, delete_recruiter, get_current_user_info, test_endpoint

urlpatterns = [
    #profile
    path('profile/me/', recruiter_profile, name='recruiter_profile'),
    path('profile/', update_recruiter_profile_view, name='update_recruiter_profile'),
    path('company-profile/', company_approval_status_view, name='company_approval_status'),
    #Recruiters of company
    path('company-recruiters/', company_recruiters_view, name='my-company-recruiters'),
    # New recruiter management endpoints
    path('test/', test_endpoint, name='test-endpoint'),
    path('recruiters/company-recruiters/', get_company_recruiters, name='get-company-recruiters'),
    path('recruiters/current-info/', get_current_user_info, name='get-current-user-info'),
    path('recruiters/<int:recruiter_id>/update/', update_recruiter, name='update-recruiter'),
    path('recruiters/<int:recruiter_id>/delete/', delete_recruiter, name='delete-recruiter'),
    #offers
    path('favorites/toggle/<int:offer_id>/', toggle_favorite_offer_view, name='toggle-favorite-offer'),
    path('favorites/list/', get_favorite_offers_view, name='get-favorite-offers'),
    path('offers/create/', create_offer, name='create_offer'),
    path('offers/<int:offer_id>/update/', update_offer, name='update_offer'),
    path('offers/<int:offer_id>/delete/', delete_offer, name='delete_offer'),
    path('company-offers/', company_offers_list, name='company-offers'),

    #meeting - Routes spécifiques en premier pour éviter les conflits
    path('meetings/test/', test_meeting_view, name='test-meeting'),
    path('meetings/test-add/', test_add_meeting_view, name='test-add-meeting'),
    path('meetings/candidates/add/', add_meeting_candidate_view, name='add-meeting-candidate'),
    path('meetings/candidates/<str:candidate_public_token>/remove/', remove_meeting_candidate_view, name='remove-meeting-candidate'),
    path('meetings/candidates/', forum_meeting_candidates_view, name='forum-meeting-candidate'),
]