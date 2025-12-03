from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.notification_list, name='list'),
    path('unread-count/', views.notification_unread_count, name='unread-count'),
    path('websocket-token/', views.websocket_token, name='websocket-token'),
    path('<int:notification_id>/mark-read/', views.notification_mark_read, name='mark-read'),
    path('mark-all-read/', views.notification_mark_all_read, name='mark-all-read'),
    path('<int:notification_id>/delete/', views.notification_delete, name='delete'),
]

