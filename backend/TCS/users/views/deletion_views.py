from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from users.services.deletion import delete_candidate_account_and_data


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_candidate_account(request):
    """
    Supprime le compte du candidat authentifié, anonymise les données et supprime les objets liés.
    """
    user = request.user
    reason = request.data.get("reason")
    return delete_candidate_account_and_data(user, reason)
