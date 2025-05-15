from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

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
