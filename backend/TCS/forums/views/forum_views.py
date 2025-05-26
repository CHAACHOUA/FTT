from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from forums.services.forum_services import get_all_forums, get_forum_detail


@api_view(['GET'])
def forum_list(request):
    return get_all_forums()


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def forum_detail(request, pk):
    return get_forum_detail(pk)
