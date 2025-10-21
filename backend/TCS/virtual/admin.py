from django.contrib import admin
from .models import VirtualAgendaSlot

@admin.register(VirtualAgendaSlot)
class VirtualAgendaSlotAdmin(admin.ModelAdmin):
    list_display = [
        'recruiter', 'date', 'start_time', 'end_time', 
        'type', 'status', 'candidate', 'created_at'
    ]
    list_filter = [
        'status', 'type', 'date', 'forum', 'recruiter'
    ]
    search_fields = [
        'recruiter__email', 'recruiter__first_name', 'recruiter__last_name',
        'candidate__email', 'candidate__first_name', 'candidate__last_name',
        'description'
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-date', '-start_time']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('forum', 'recruiter', 'date', 'start_time', 'end_time')
        }),
        ('Détails du créneau', {
            'fields': ('type', 'duration', 'description', 'status')
        }),
        ('Réservation', {
            'fields': ('candidate', 'meeting_link', 'phone_number', 'notes'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'recruiter', 'candidate', 'forum'
        )