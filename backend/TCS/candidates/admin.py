from django.contrib import admin

from .models import Candidate,Experience,Education,Skill,Language,CandidateLanguage

# Register your models here.
admin.site.register(Candidate)
admin.site.register(Experience)
admin.site.register(Education)
admin.site.register(Skill)
admin.site.register(Language)
admin.site.register(CandidateLanguage)


