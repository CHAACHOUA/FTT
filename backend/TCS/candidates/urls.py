from django.urls import path
from .views import upload_cv, complete_candidate_profile, get_candidate_profile, get_languages

urlpatterns = [
    path('complete-profile/', complete_candidate_profile, name='complete_candidate_profile'),
    path('upload-cv/', upload_cv, name='upload_cv'),
    path('profile/', get_candidate_profile, name='get_candidate_profile'),
    path('languages/', get_languages, name='get_languages'),

]
