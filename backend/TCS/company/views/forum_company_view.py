from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from company.services.forum_company_service import add_company_to_forum_service, approve_company_service, remove_company_from_forum_service
from company.models import Company, ForumCompany
from forums.models import Forum

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_company_to_forum_view(request):
    try:
        name = request.data.get('name')
        forum_id = request.data.get('forum_id')
        
        if not name or not forum_id:
            return Response(
                {'error': 'name et forum_id sont requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = add_company_to_forum_service(request.user, name, forum_id)
        
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_company_view(request):
    try:
        print(f"DEBUG: approve_company_view called with data: {request.data}")
        company_id = request.data.get('company_id')
        forum_id = request.data.get('forum_id')
        approved = request.data.get('approved', True)
        print(f"DEBUG: company_id={company_id}, forum_id={forum_id}, approved={approved}")
        if not company_id or not forum_id:
            print("DEBUG: Missing required fields")
            return Response(
                {'error': 'company_id et forum_id sont requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        result = approve_company_service(request.user, company_id, forum_id, approved)
        print(f"DEBUG: Service result: {result}")
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"DEBUG: Exception in approve_company_view: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_company_from_forum_view(request):
    try:
        print(f"DEBUG: remove_company_from_forum_view called with data: {request.data}")
        company_id = request.data.get('company_id')
        forum_id = request.data.get('forum_id')
        
        print(f"DEBUG: company_id={company_id}, forum_id={forum_id}")
        
        if not company_id or not forum_id:
            print("DEBUG: Missing required fields")
            return Response(
                {'error': 'company_id et forum_id sont requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = remove_company_from_forum_service(request.user, company_id, forum_id)
        print(f"DEBUG: Service result: {result}")
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"DEBUG: Exception in remove_company_from_forum_view: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )