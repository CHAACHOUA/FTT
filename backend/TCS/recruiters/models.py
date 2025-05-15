# recruiter/models.py
from django.db import models
from users.models import User
from company.models import Company

from forums.models import Forum


class Recruiter(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='recruiters')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to='recruiter_photos/', blank=True, null=True)  # 📸 Photo ajoutée

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company.name}"
class RecruiterForumParticipation(models.Model):
    recruiter = models.ForeignKey('Recruiter', on_delete=models.CASCADE, related_name='forum_participations')
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='recruiter_participations')
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('recruiter', 'forum')

    def __str__(self):
        return f"{self.recruiter} in {self.forum}"
