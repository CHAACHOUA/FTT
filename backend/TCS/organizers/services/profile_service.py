from rest_framework.response import Response
from rest_framework import status
from organizers.models import Organizer
from organizers.serializers import OrganizerSerializer
from django.core.exceptions import ObjectDoesNotExist


def get_organizer_profile(user):
    """Récupère le profil de l'organizer"""
    try:
        organizer = Organizer.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({"message": "Profil organizer introuvable."}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrganizerSerializer(organizer)
    return Response(serializer.data, status=status.HTTP_200_OK)


def update_organizer_profile(user, data, logo=None):
    """Met à jour le profil de l'organizer"""
    try:
        organizer = Organizer.objects.get(user=user)
    except Organizer.DoesNotExist:
        return {
            "status": status.HTTP_404_NOT_FOUND,
            "data": {"message": "Profil organizer introuvable."}
        }

    serializer = OrganizerSerializer(organizer, data=data, partial=True)
    if not serializer.is_valid():
        return {
            "status": status.HTTP_400_BAD_REQUEST,
            "data": {"errors": serializer.errors}
        }

    try:
        organizer = serializer.save()
        if logo:
            if organizer.logo:
                organizer.logo.delete(save=False)
            organizer.logo = logo
            organizer.save()

        return {
            "status": status.HTTP_200_OK,
            "data": OrganizerSerializer(organizer).data
        }
    except Exception as e:
        return {
            "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "data": {"message": f"Erreur serveur : {str(e)}"}
        } 