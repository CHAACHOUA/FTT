from rest_framework.response import Response
from rest_framework import status
from candidates.models import Candidate
from candidates.tasks import async_parse_cv
import tempfile
from celery.result import AsyncResult
from rest_framework.decorators import api_view


@api_view(['POST'])
def upload_cv_view(request):
    """
    Gère l'upload d'un fichier CV (PDF) et lance une tâche Celery pour le parsing via OpenAI.
    """
    if not request.user.is_authenticated:
        return Response({"error": "Non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)

    file = request.FILES.get('cv')
    if not file:
        return Response({"error": "Aucun fichier fourni."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        candidate = request.user.candidate_profile
    except Candidate.DoesNotExist:
        return Response({"error": "Profil candidat introuvable."}, status=status.HTTP_404_NOT_FOUND)

    # Sauvegarde du fichier CV dans le modèle
    candidate.cv_file = file
    candidate.save()

    # Enregistrement temporaire du fichier pour le parsing async
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        for chunk in file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    # Lancer la tâche asynchrone
    task = async_parse_cv.delay(tmp_path)
    print(">>> Task ID lancé :", task.id)

    return Response({
        "message": "CV reçu. L'analyse est en cours.",
        "task_id": task.id
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
def task_status(request, task_id):
    """
    Retourne l'état de la tâche de parsing (SUCCESS, PENDING, FAILURE) et le résultat si disponible.
    """
    result = AsyncResult(task_id)
    return Response({
        "state": result.state,
        "result": result.result if result.ready() else None
    })
