from django.urls import path

from company.views.profile_view import update_company_profile_view,get_company_profile_view

urlpatterns = [
    #profile
    path('profile/', get_company_profile_view, name='get_company_profile'),
    path('profile/update/', update_company_profile_view, name='update_company_profile')
]