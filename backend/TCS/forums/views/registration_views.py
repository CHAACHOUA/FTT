from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from forums.services.registration_services import register_candidate_to_forum, register_recruiter_to_forum







@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_to_forum(request, forum_id):
    return register_candidate_to_forum(request.user, forum_id, data=request.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_recruiter_to_forum_view(request, forum_id):
    return register_recruiter_to_forum(request.user, forum_id, data=request.data)

