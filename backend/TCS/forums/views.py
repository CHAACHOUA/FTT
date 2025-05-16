from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from django.shortcuts import get_object_or_404

from .models import Forum, ForumRegistration
from .serializers import ForumSerializer, ForumRegistrationSerializer, ForumDetailSerializer
from candidates.models import Candidate


@api_view(['GET'])
def forum_list(request):
    try:
        forums = Forum.objects.all().order_by('-date')
        serializer = ForumSerializer(forums, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": f"Erreur lors de la récupération des forums: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_forums(request):
    """
    Récupère les forums où le candidat est inscrit et ceux où il n'est pas inscrit.
    Utilise ForumSerializer pour le formatage des données.
    """

    try:
        candidate = get_object_or_404(Candidate, user=request.user)

        if not candidate:
            return Response({"detail": "Le profil candidat n'existe pas pour cet utilisateur."},
                            status=status.HTTP_404_NOT_FOUND)

        registered_forums = Forum.objects.filter(registrations__candidate=candidate).order_by('-date')
        unregistered_forums = Forum.objects.exclude(registrations__candidate=candidate).order_by('-date')

        data = {
            "registered": ForumSerializer(registered_forums, many=True).data,
            "unregistered": ForumSerializer(unregistered_forums, many=True).data,
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        # 🚨 Gestion d'erreur
        print(f"Erreur lors de la récupération des forums: {str(e)}")
        return Response(
            {"detail": f"Erreur lors de la récupération des forums: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def forum_detail(request, pk):
    try:
        forum = get_object_or_404(Forum, pk=pk)
        serializer = ForumDetailSerializer(forum)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Forum.DoesNotExist:
        return Response(
            {"detail": "Forum non trouvé."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Erreur dans forum_detail : {e}")  # 🔍 Affiche l'erreur dans la console
        return Response(
            {"detail": f"Erreur serveur : {str(e)}"},  # 👈 retourne le détail de l’erreur
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# 📌 Inscrire un candidat à un forum (requiert une authentification)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_to_forum(request, forum_id):
    try:
        # Récupération du forum et du candidat
        forum = get_object_or_404(Forum, id=forum_id)
        candidate = get_object_or_404(Candidate, user=request.user)

        # Vérification si le candidat est déjà inscrit
        existing_registration = ForumRegistration.objects.filter(forum=forum, candidate=candidate).exists()
        if existing_registration:
            return Response({"detail": "Vous êtes déjà inscrit à ce forum."}, status=status.HTTP_400_BAD_REQUEST)

        # Création de l'inscription
        registration = ForumRegistration.objects.create(forum=forum, candidate=candidate)
        serializer = ForumRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except IntegrityError:
        return Response({"detail": "Erreur d'intégrité lors de l'inscription. Peut-être une inscription en double."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"detail": f"Erreur lors de l'inscription au forum: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
