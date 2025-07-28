from django.urls import path
from .views import profile_view

urlpatterns = [
    path('profile/', profile_view.organizer_profile_view, name='organizer-profile'),
    path('profile/update/', profile_view.update_organizer_profile_view, name='update-organizer-profile'),
]