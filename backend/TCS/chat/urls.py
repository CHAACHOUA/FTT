from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.conversation_list, name='conversation-list'),
    path('conversations/<int:conversation_id>/', views.conversation_detail, name='conversation-detail'),
    path('conversations/create/', views.conversation_create, name='conversation-create'),
    path('conversations/<int:conversation_id>/status/', views.conversation_update_status, name='conversation-update-status'),
    path('conversations/<int:conversation_id>/mark-all-read/', views.conversation_mark_all_read, name='conversation-mark-all-read'),
    
    # Messages
    path('conversations/<int:conversation_id>/messages/', views.message_list, name='message-list'),
    path('messages/', views.message_create, name='message-create'),
    path('messages/<int:message_id>/read/', views.message_mark_read, name='message-mark-read'),
]
