from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'type', 'title', 'is_read', 'priority', 'created_at']
    list_filter = ['is_read', 'priority', 'type', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('user', 'type', 'title', 'message', 'priority')
        }),
        ('État', {
            'fields': ('is_read', 'read_at', 'created_at')
        }),
        ('Liens', {
            'fields': ('related_object_type', 'related_object_id', 'action_url')
        }),
    )

