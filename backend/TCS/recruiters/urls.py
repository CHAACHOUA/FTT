from django.urls import path

from recruiters.views.offers_view import toggle_favorite_offer_view

from recruiters.views.offers_view import get_favorite_offers_view

urlpatterns = [
    path('favorites/toggle/<int:offer_id>/', toggle_favorite_offer_view, name='toggle-favorite-offer'),
    path('favorites/list/', get_favorite_offers_view, name='get-favorite-offers'),

]