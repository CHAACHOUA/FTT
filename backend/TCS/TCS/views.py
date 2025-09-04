from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .constants import get_sector_choices, get_contract_choices, get_forum_type_choices

@api_view(['GET'])
@permission_classes([AllowAny])
def get_choices(request):
    """
    API endpoint to get standardized dropdown choices
    """
    return Response({
        'sectors': get_sector_choices(),
        'contracts': get_contract_choices(),
        'forum_types': get_forum_type_choices(),
    }) 