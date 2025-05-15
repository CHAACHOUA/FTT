from django.db import models

from candidates.models import Candidate


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
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ForumRegistration(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='registrations')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)  # ou Candidate si tu as un modèle dédié
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('forum', 'candidate')  # empêche l'inscription multiple

    def __str__(self):
        return f"{self.candidate} inscrit à {self.forum}"