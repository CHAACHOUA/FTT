from django.urls import path

from company.views.profile_view import update_company_profile_view,get_company_profile_view

from company.views.forum_company_view import add_company_to_forum_view, approve_company_view, remove_company_from_forum_view

urlpatterns = [
    #profile
    path('profile/', get_company_profile_view, name='get_company_profile'),
    path('profile/update/', update_company_profile_view, name='update_company_profile'),
    
    #forum
    path('forum/', add_company_to_forum_view, name='add_company_to_forum'),
    path('forum/approve/', approve_company_view, name='approve_company'),
    path('forum/remove/', remove_company_from_forum_view, name='remove_company_from_forum'),
]