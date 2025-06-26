from rest_framework.response import Response
from rest_framework import status
from recruiters.models import Recruiter
from recruiters.serializers import RecruiterSerializer
from django.core.exceptions import ObjectDoesNotExist



def get_recruiters_company(user):
    try:
        recruiter = Recruiter.objects.select_related('company').get(user=user)
    except Recruiter.DoesNotExist:
        return None

    company = recruiter.company
    # Récupérer tous les recruteurs de la même company
    recruiters = Recruiter.objects.filter(company=company)

    # Sérialisation avec RecruiterSerializer
    return RecruiterSerializer(recruiters, many=True).data
def get_recruiter_profile(user):
    try:
        recruiter = Recruiter.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({"message": "Profil recruteur introuvable."}, status=status.HTTP_404_NOT_FOUND)

    serializer = RecruiterSerializer(recruiter)
    return Response(serializer.data, status=status.HTTP_200_OK)


def update_recruiter_profile(user, data, profile_picture=None):
    try:
        recruiter = Recruiter.objects.get(user=user)
    except Recruiter.DoesNotExist:
        return {
            "status": status.HTTP_404_NOT_FOUND,
            "data": {"message": "Profil recruteur introuvable."}
        }

    serializer = RecruiterSerializer(recruiter, data=data, partial=True)
    if not serializer.is_valid():
        return {
            "status": status.HTTP_400_BAD_REQUEST,
            "data": {"errors": serializer.errors}
        }

    try:
        recruiter = serializer.save()
        if profile_picture:
            if recruiter.profile_picture:
                recruiter.profile_picture.delete(save=False)
            recruiter.profile_picture = profile_picture
            recruiter.save()

        return {
            "status": status.HTTP_200_OK,
            "data": RecruiterSerializer(recruiter).data
        }
    except Exception as e:
        return {
            "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "data": {"message": f"Erreur serveur : {str(e)}"}
        }
