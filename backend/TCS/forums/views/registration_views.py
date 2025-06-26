from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from forums.services.registration_services import register_candidate_to_forum
from forums.services.forum_by_roles import get_candidate_forum_lists
from forums.services.forum_by_roles import get_recruiter_forum_lists


#candidate

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_forums(request):
    return get_candidate_forum_lists(request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_to_forum(request, forum_id):
    return register_candidate_to_forum(request.user, forum_id, data=request.data)

#recruiter
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_my_forums(request):
    return get_recruiter_forum_lists(request.user)