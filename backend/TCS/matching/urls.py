from django.urls import path

from matching.views.matching_view import start_matching

urlpatterns = [
    path('start/<int:offer_id>/', start_matching, name='start_matching'),
]
