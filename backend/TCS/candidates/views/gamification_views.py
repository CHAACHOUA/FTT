from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Candidate, CandidateForumProgress
from forums.models import Forum
from company.models import ForumCompany


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def forum_progress(request, forum_id):
    """
    GET: Récupère la progression d'un candidat dans un forum
    POST: Met à jour la progression d'un candidat dans un forum
    """
    try:
        # Récupérer le candidat connecté
        candidate = get_object_or_404(Candidate, user=request.user)
        forum = get_object_or_404(Forum, id=forum_id)
        
        if request.method == 'GET':
            # Récupérer ou créer la progression
            progress, created = CandidateForumProgress.objects.get_or_create(
                candidate=candidate,
                forum=forum,
                defaults={
                    'visited_companies': [],
                    'company_notes': {}
                }
            )
            
            # Calculer le pourcentage de progression
            total_companies = ForumCompany.objects.filter(forum=forum, approved=True).count()
            progress_percentage = 0
            if total_companies > 0:
                progress_percentage = round((len(progress.visited_companies) / total_companies) * 100)
            
            return Response({
                'visited_companies': progress.visited_companies,
                'company_notes': progress.company_notes,
                'progress_percentage': progress_percentage,
                'total_companies': total_companies,
                'visited_count': len(progress.visited_companies)
            })
            
        elif request.method == 'POST':
            # Mettre à jour la progression
            data = request.data
            visited_companies = data.get('visited_companies', [])
            company_notes = data.get('company_notes', {})
            
            progress, created = CandidateForumProgress.objects.get_or_create(
                candidate=candidate,
                forum=forum,
                defaults={
                    'visited_companies': visited_companies,
                    'company_notes': company_notes
                }
            )
            
            if not created:
                progress.visited_companies = visited_companies
                progress.company_notes = company_notes
                progress.save()
            
            # Calculer le pourcentage de progression
            total_companies = ForumCompany.objects.filter(forum=forum, approved=True).count()
            progress_percentage = 0
            if total_companies > 0:
                progress_percentage = round((len(progress.visited_companies) / total_companies) * 100)
            
            return Response({
                'visited_companies': progress.visited_companies,
                'company_notes': progress.company_notes,
                'progress_percentage': progress_percentage,
                'total_companies': total_companies,
                'visited_count': len(progress.visited_companies)
            })
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_company_visited(request, forum_id, company_id):
    """
    Toggle le statut de visite d'une entreprise
    """
    try:
        candidate = get_object_or_404(Candidate, user=request.user)
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Récupérer ou créer la progression
        progress, created = CandidateForumProgress.objects.get_or_create(
            candidate=candidate,
            forum=forum,
            defaults={
                'visited_companies': [],
                'company_notes': {}
            }
        )
        
        # Toggle le statut de visite
        if company_id in progress.visited_companies:
            progress.visited_companies.remove(company_id)
        else:
            progress.visited_companies.append(company_id)
        
        progress.save()
        
        # Calculer le pourcentage de progression
        total_companies = ForumCompany.objects.filter(forum=forum, approved=True).count()
        progress_percentage = 0
        if total_companies > 0:
            progress_percentage = round((len(progress.visited_companies) / total_companies) * 100)
        
        return Response({
            'visited_companies': progress.visited_companies,
            'progress_percentage': progress_percentage,
            'total_companies': total_companies,
            'visited_count': len(progress.visited_companies),
            'is_visited': company_id in progress.visited_companies
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_company_note(request, forum_id, company_id):
    """
    Sauvegarde une note pour une entreprise
    """
    try:
        candidate = get_object_or_404(Candidate, user=request.user)
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Récupérer ou créer la progression
        progress, created = CandidateForumProgress.objects.get_or_create(
            candidate=candidate,
            forum=forum,
            defaults={
                'visited_companies': [],
                'company_notes': {}
            }
        )
        
        # Mettre à jour la note
        note = request.data.get('note', '')
        if note.strip():
            progress.company_notes[str(company_id)] = note.strip()
        else:
            # Supprimer la note si elle est vide
            progress.company_notes.pop(str(company_id), None)
        
        progress.save()
        
        return Response({
            'company_notes': progress.company_notes,
            'note': progress.company_notes.get(str(company_id), '')
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
