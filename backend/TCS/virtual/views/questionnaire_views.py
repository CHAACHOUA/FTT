from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model

from ..models import Questionnaire, Question, QuestionnaireResponse, QuestionAnswer
from ..serializers import (
    QuestionnaireSerializer, QuestionnaireCreateSerializer,
    QuestionSerializer, QuestionnaireResponseSerializer,
    QuestionnaireResponseCreateSerializer, QuestionAnswerSerializer
)
from recruiters.models import Offer
from forums.models import Forum

User = get_user_model()


class QuestionnaireListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des questionnaires
    """
    serializer_class = QuestionnaireSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les questionnaires selon le contexte"""
        # Filtrer par forum si spécifié
        forum_id = self.request.query_params.get('forum_id')
        if forum_id:
            return Questionnaire.objects.filter(
                offer__forum_id=forum_id
            ).select_related('offer', 'offer__forum')
        
        # Filtrer par offre si spécifié
        offer_id = self.request.query_params.get('offer_id')
        if offer_id:
            return Questionnaire.objects.filter(offer_id=offer_id)
        
        # Par défaut, retourner tous les questionnaires de l'utilisateur
        try:
            recruiter = self.request.user.recruiter_profile
            return Questionnaire.objects.filter(
                offer__recruiter=recruiter
            ).select_related('offer', 'offer__forum')
        except:
            return Questionnaire.objects.none()

    def get_serializer_class(self):
        """Retourne le bon serializer selon la méthode"""
        if self.request.method == 'POST':
            return QuestionnaireCreateSerializer
        return QuestionnaireSerializer

    def perform_create(self, serializer):
        """Créer le questionnaire avec validation"""
        print(f"[QUESTIONNAIRE CREATE] Début de la création du questionnaire")
        print(f"[QUESTIONNAIRE CREATE] Données reçues: {serializer.validated_data}")
        print(f"[QUESTIONNAIRE CREATE] Utilisateur: {self.request.user}")
        
        # Vérifier que l'utilisateur est le recruteur de l'offre
        offer = serializer.validated_data['offer']
        print(f"[QUESTIONNAIRE CREATE] Offre: {offer}")
        print(f"[QUESTIONNAIRE CREATE] Offre ID: {offer.id}")
        print(f"[QUESTIONNAIRE CREATE] Recruteur de l'offre: {offer.recruiter}")
        print(f"[QUESTIONNAIRE CREATE] Forum: {offer.forum}")
        print(f"[QUESTIONNAIRE CREATE] Forum type: {offer.forum.type}")
        print(f"[QUESTIONNAIRE CREATE] Forum is_virtual: {offer.forum.is_virtual}")

        
        # Vérifier que l'offre appartient à un forum virtuel
        if not (offer.forum.type == 'virtuel' or offer.forum.is_virtual):
            print(f"[QUESTIONNAIRE CREATE] ERREUR: Forum non virtuel")
            raise permissions.PermissionDenied("Le questionnaire n'est disponible que pour les forums virtuels")
        
        print(f"[QUESTIONNAIRE CREATE] Sauvegarde du questionnaire...")
        questionnaire = serializer.save()
        print(f"[QUESTIONNAIRE CREATE] Questionnaire créé avec succès: {questionnaire.id}")
        print(f"[QUESTIONNAIRE CREATE] Questions associées: {questionnaire.questions.count()}")


class QuestionnaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un questionnaire
    """
    serializer_class = QuestionnaireSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les questionnaires de l'utilisateur"""
        # Récupérer le profil recruteur de l'utilisateur
        try:
            recruiter = self.request.user.recruiter_profile
            return Questionnaire.objects.filter(
                offer__recruiter=recruiter
            ).select_related('offer', 'offer__forum')
        except:
            return Questionnaire.objects.none()

    def get_serializer_class(self):
        """Retourne le bon serializer selon la méthode"""
        if self.request.method in ['PUT', 'PATCH']:
            return QuestionnaireCreateSerializer
        return QuestionnaireSerializer

    def perform_update(self, serializer):
        """Mettre à jour le questionnaire avec validation"""
        print(f"[QUESTIONNAIRE UPDATE] Début de la mise à jour du questionnaire")
        questionnaire = self.get_object()
        print(f"[QUESTIONNAIRE UPDATE] Questionnaire existant: {questionnaire}")
        print(f"[QUESTIONNAIRE UPDATE] Questionnaire ID: {questionnaire.id}")
        print(f"[QUESTIONNAIRE UPDATE] Données reçues: {serializer.validated_data}")
        print(f"[QUESTIONNAIRE UPDATE] Utilisateur: {self.request.user}")
        print(f"[QUESTIONNAIRE UPDATE] Recruteur de l'offre: {questionnaire.offer.recruiter}")
        
        # Vérifier que l'utilisateur est le recruteur de l'offre
        try:
            user_recruiter = self.request.user.recruiter_profile
            if questionnaire.offer.recruiter != user_recruiter:
                print(f"[QUESTIONNAIRE UPDATE] ERREUR: Utilisateur non autorisé")
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Vous n'êtes pas le recruteur de cette offre")
        except:
            print(f"[QUESTIONNAIRE UPDATE] ERREUR: Pas de profil recruteur")
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas de profil recruteur")
        
        print(f"[QUESTIONNAIRE UPDATE] Sauvegarde du questionnaire...")
        updated_questionnaire = serializer.save()
        print(f"[QUESTIONNAIRE UPDATE] Questionnaire mis à jour avec succès: {updated_questionnaire.id}")
        print(f"[QUESTIONNAIRE UPDATE] Questions associées: {updated_questionnaire.questions.count()}")


class QuestionListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des questions
    """
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les questions d'un questionnaire"""
        questionnaire_id = self.kwargs['questionnaire_id']
        questionnaire = get_object_or_404(
            Questionnaire.objects.filter(offer__recruiter=self.request.user),
            id=questionnaire_id
        )
        return questionnaire.questions.all().order_by('order')

    def perform_create(self, serializer):
        """Créer une question avec validation"""
        questionnaire_id = self.kwargs['questionnaire_id']
        questionnaire = get_object_or_404(
            Questionnaire.objects.filter(offer__recruiter=self.request.user),
            id=questionnaire_id
        )
        
        # Définir l'ordre si non spécifié
        if not serializer.validated_data.get('order'):
            max_order = questionnaire.questions.aggregate(
                max_order=models.Max('order')
            )['max_order'] or 0
            serializer.validated_data['order'] = max_order + 1
        
        serializer.save(questionnaire=questionnaire)


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une question
    """
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les questions de l'utilisateur"""
        try:
            recruiter = self.request.user.recruiter_profile
            questionnaire_id = self.kwargs['questionnaire_id']
            return Question.objects.filter(
                questionnaire_id=questionnaire_id,
                questionnaire__offer__recruiter=recruiter
            )
        except:
            return Question.objects.none()


class QuestionnaireResponseListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des réponses aux questionnaires
    """
    serializer_class = QuestionnaireResponseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les réponses selon le contexte"""
        # Filtrer par questionnaire si spécifié
        questionnaire_id = self.request.query_params.get('questionnaire_id')
        if questionnaire_id:
            return QuestionnaireResponse.objects.filter(
                questionnaire_id=questionnaire_id
            ).select_related('candidate', 'questionnaire', 'offer')
        
        # Filtrer par offre si spécifié
        offer_id = self.request.query_params.get('offer_id')
        if offer_id:
            return QuestionnaireResponse.objects.filter(
                offer_id=offer_id
            ).select_related('candidate', 'questionnaire', 'offer')
        
        # Par défaut, retourner les réponses de l'utilisateur
        return QuestionnaireResponse.objects.filter(
            candidate=self.request.user
        ).select_related('candidate', 'questionnaire', 'offer')

    def get_serializer_class(self):
        """Retourne le bon serializer selon la méthode"""
        if self.request.method == 'POST':
            return QuestionnaireResponseCreateSerializer
        return QuestionnaireResponseSerializer

    def perform_create(self, serializer):
        """Créer la réponse avec validation"""
        # Vérifier que l'utilisateur est un candidat
        if not hasattr(self.request.user, 'candidate_profile'):
            raise permissions.PermissionDenied("Seuls les candidats peuvent répondre aux questionnaires")
        
        # Vérifier que le questionnaire est actif
        questionnaire = serializer.validated_data['questionnaire']
        if not questionnaire.is_active:
            raise permissions.PermissionDenied("Ce questionnaire n'est plus actif")
        
        # Vérifier qu'il n'y a pas déjà une réponse
        existing_response = QuestionnaireResponse.objects.filter(
            questionnaire=questionnaire,
            candidate=self.request.user
        ).first()
        
        if existing_response:
            raise permissions.PermissionDenied("Vous avez déjà répondu à ce questionnaire")
        
        serializer.save(candidate=self.request.user)


class QuestionnaireResponseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une réponse
    """
    serializer_class = QuestionnaireResponseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les réponses de l'utilisateur"""
        return QuestionnaireResponse.objects.filter(
            candidate=self.request.user
        ).select_related('candidate', 'questionnaire', 'offer')

    def get_serializer_class(self):
        """Retourne le bon serializer selon la méthode"""
        if self.request.method in ['PUT', 'PATCH']:
            return QuestionnaireResponseCreateSerializer
        return QuestionnaireResponseSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_questionnaire_for_offer(request, offer_id):
    """
    Récupérer le questionnaire d'une offre spécifique
    """
    try:
        print(f"🔍 [API] get_questionnaire_for_offer - offer_id: {offer_id}")
        print(f"🔍 [API] User: {request.user}")
        print(f"🔍 [API] User type: {type(request.user)}")
        
        offer = get_object_or_404(Offer, id=offer_id)
        print(f"🔍 [API] Offer found: {offer.title}")
        print(f"🔍 [API] Offer recruiter: {offer.recruiter}")
        print(f"🔍 [API] Offer company: {offer.company}")
        
        # Vérifier que l'utilisateur a accès à cette offre
        if hasattr(request.user, 'candidate_profile'):
            # Candidat : vérifier que l'offre est dans un forum auquel il participe
            candidate_profile = request.user.candidate_profile
            if not offer.forum.registrations.filter(candidate=candidate_profile).exists():
                print(f"🔍 [API] Candidate {candidate_profile.user.id} not registered in forum {offer.forum.id}")
                return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            print(f"🔍 [API] Candidate {candidate_profile.user.id} is registered in forum {offer.forum.id}")
        elif hasattr(request.user, 'recruiter_profile'):
            # Recruteur : vérifier qu'il est le recruteur de l'offre ou de la même entreprise
            if offer.recruiter != request.user.recruiter_profile and offer.company != request.user.recruiter_profile.company:
                return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': 'Type d\'utilisateur non reconnu'}, status=status.HTTP_403_FORBIDDEN)
        
        # Récupérer le questionnaire
        try:
            print(f"🔍 [API] Looking for questionnaire for offer: {offer.id}")
            questionnaire = Questionnaire.objects.get(offer=offer)
            print(f"🔍 [API] Questionnaire found: {questionnaire.id}")
            print(f"🔍 [API] Questionnaire title: {questionnaire.title}")
            print(f"🔍 [API] Questions count: {questionnaire.questions.count()}")
            
            serializer = QuestionnaireSerializer(questionnaire)
            print(f"🔍 [API] Serialized data: {serializer.data}")
            return Response(serializer.data)
        except Questionnaire.DoesNotExist:
            print(f"🔍 [API] No questionnaire found for offer: {offer.id}")
            return Response({'message': 'Aucun questionnaire pour cette offre'}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        print(f"❌ [API] Error in get_questionnaire_for_offer: {str(e)}")
        print(f"❌ [API] Error type: {type(e)}")
        import traceback
        print(f"❌ [API] Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_candidate_responses(request, offer_id):
    """
    Récupérer les réponses des candidats pour une offre (recruteur seulement)
    """
    try:
        offer = get_object_or_404(Offer, id=offer_id)
        
        # Vérifier que l'utilisateur est le recruteur de l'offre
        if offer.recruiter != request.user:
            return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        # Récupérer les réponses
        responses = QuestionnaireResponse.objects.filter(
            offer=offer
        ).select_related('candidate', 'questionnaire').prefetch_related('answers')
        
        serializer = QuestionnaireResponseSerializer(responses, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_questionnaire_response(request, questionnaire_id):
    """
    Soumettre une réponse complète à un questionnaire
    """
    try:
        questionnaire = get_object_or_404(Questionnaire, id=questionnaire_id)
        
        # Vérifier que l'utilisateur est un candidat
        if not hasattr(request.user, 'candidate_profile'):
            return Response({'error': 'Seuls les candidats peuvent répondre aux questionnaires'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier que le questionnaire est actif
        if not questionnaire.is_active:
            return Response({'error': 'Ce questionnaire n\'est plus actif'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier qu'il n'y a pas déjà une réponse
        existing_response = QuestionnaireResponse.objects.filter(
            questionnaire=questionnaire,
            candidate=request.user
        ).first()
        
        if existing_response:
            return Response({'error': 'Vous avez déjà répondu à ce questionnaire'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Créer la réponse
        response_data = {
            'questionnaire': questionnaire.id,
            'candidate': request.user.id,
            'offer': questionnaire.offer.id,
            'answers': request.data.get('answers', [])
        }
        
        serializer = QuestionnaireResponseCreateSerializer(data=response_data)
        if serializer.is_valid():
            response = serializer.save()
            
            # Marquer comme complété
            response.is_completed = True
            response.submitted_at = timezone.now()
            response.save()
            
            return Response(QuestionnaireResponseSerializer(response).data, 
                          status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_questionnaire_stats(request, questionnaire_id):
    """
    Récupérer les statistiques d'un questionnaire (recruteur seulement)
    """
    try:
        questionnaire = get_object_or_404(Questionnaire, id=questionnaire_id)
        
        # Vérifier que l'utilisateur est le recruteur
        if questionnaire.offer.recruiter != request.user:
            return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        # Calculer les statistiques
        total_responses = QuestionnaireResponse.objects.filter(questionnaire=questionnaire).count()
        completed_responses = QuestionnaireResponse.objects.filter(
            questionnaire=questionnaire, 
            is_completed=True
        ).count()
        
        # Statistiques par question
        questions_stats = []
        for question in questionnaire.questions.all():
            answers = QuestionAnswer.objects.filter(
                response__questionnaire=questionnaire,
                question=question
            )
            
            question_stats = {
                'question_id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'total_answers': answers.count(),
                'completion_rate': (answers.count() / total_responses * 100) if total_responses > 0 else 0
            }
            
            # Statistiques spécifiques selon le type de question
            if question.is_choice_question:
                # Compter les choix
                choice_counts = {}
                for answer in answers:
                    if answer.answer_choices:
                        for choice in answer.answer_choices:
                            choice_counts[choice] = choice_counts.get(choice, 0) + 1
                question_stats['choice_distribution'] = choice_counts
            
            questions_stats.append(question_stats)
        
        stats = {
            'questionnaire_id': questionnaire.id,
            'questionnaire_title': questionnaire.title,
            'total_responses': total_responses,
            'completed_responses': completed_responses,
            'completion_rate': (completed_responses / total_responses * 100) if total_responses > 0 else 0,
            'questions_stats': questions_stats
        }
        
        return Response(stats)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
