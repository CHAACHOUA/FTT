from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Forum, ForumRegistration, CandidateSearch, Speaker, Programme

# Register your models here.

@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'position']
    search_fields = ['first_name', 'last_name', 'position']
    list_filter = ['position']


class ProgrammeInline(admin.TabularInline):
    model = Programme
    extra = 1
    fields = ['title', 'description', 'photo', 'start_date', 'end_date', 'start_time', 'end_time', 'location', 'speakers']


@admin.register(Forum)
class ForumAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'start_date', 'end_date', 'organizer']
    list_filter = ['type', 'start_date', 'organizer']
    search_fields = ['name', 'description']
    inlines = [ProgrammeInline]
    date_hierarchy = 'start_date'


@admin.register(Programme)
class ProgrammeAdmin(admin.ModelAdmin):
    list_display = ['title', 'forum', 'start_date', 'end_date', 'location']
    list_filter = ['forum', 'start_date', 'end_date']
    search_fields = ['title', 'description', 'location']
    filter_horizontal = ['speakers']
    date_hierarchy = 'start_date'
    readonly_fields = ['photo_preview']
    
    def photo_preview(self, obj):
        if obj.photo:
            return mark_safe(f'<img src="{obj.photo.url}" style="max-height: 100px; max-width: 100px;" />')
        return "Aucune photo"
    photo_preview.short_description = 'Aperçu de la photo'


@admin.register(ForumRegistration)
class ForumRegistrationAdmin(admin.ModelAdmin):
    list_display = ['forum', 'candidate', 'registered_at']
    list_filter = ['forum', 'registered_at']
    search_fields = ['forum__name', 'candidate__user__email']


@admin.register(CandidateSearch)
class CandidateSearchAdmin(admin.ModelAdmin):
    list_display = ['contract_type', 'region', 'experience', 'rqth']
    list_filter = ['region', 'experience', 'rqth']
