from django.db import models

from candidates.models import Candidate

from organizers.models import Organizer


# Create your models here.
class Forum(models.Model):
    FORUM_TYPE_CHOICES = [
        ('hybride', 'Hybride'),
        ('presentiel', 'Présentiel'),
        ('distance', 'À distance'),
    ]

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=FORUM_TYPE_CHOICES)
    photo = models.ImageField(upload_to='forum_photos/')
    description = models.TextField(blank=True)
    start_date = models.DateField(default='2025-07-22')
    end_date = models.DateField(default='2025-07-22')
    start_time = models.TimeField(default='09:00')
    end_time = models.TimeField(default='17:00')
    created_at = models.DateTimeField(auto_now_add=True)
    organizer = models.ForeignKey(Organizer, on_delete=models.CASCADE, related_name='forums') 

    def __str__(self):
        return self.name




class ForumRegistration(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='registrations')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    search = models.OneToOneField(
        'CandidateSearch',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='registration_reverse'
    )

    class Meta:
        unique_together = ('forum', 'candidate')

    def __str__(self):
        return f"{self.candidate} inscrit à {self.forum}"

class CandidateSearch(models.Model):
    contract_type = models.JSONField(default=list)
    sector = models.JSONField(default=list)
    experience = models.PositiveIntegerField(null=True, blank=True)
    region = models.CharField(max_length=100)
    rqth = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.contract_type}, {self.region}"