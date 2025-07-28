from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from users.services.deletion import delete_candidate_account_and_data, delete_recruiter_account_and_data, delete_organizer_account_and_data
from rest_framework.response import Response


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_account(request):
    """
    Supprime le compte de l'utilisateur authentifié en fonction de son rôle.
    """
    user = request.user
    reason = request.data.get("reason")

    if user.role == 'candidate':
        return delete_candidate_account_and_data(user, reason)
    elif user.role == 'recruiter':
        return delete_recruiter_account_and_data(user, reason)
    elif user.role == 'organizer':
        return delete_organizer_account_and_data(user, reason)
    else:
        return Response({"error": "Rôle non supporté pour la suppression de compte."}, status=400)

