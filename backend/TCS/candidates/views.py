from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import CandidateLanguage, Language, Skill, Experience, Education, Candidate
from .serializers import CandidateSerializer, LanguageSerializer
from .services.cv_parser import parse_uploaded_pdf
from users.utils import send_user_token


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_cv(request):
    #  Vérification que le compte est activé
    if not request.user.is_active:
        return Response({"error": "Your account is not activated. Please check your email for the activation link."}, status=status.HTTP_403_FORBIDDEN)

    file = request.FILES.get('cv')

    if not file:
        return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        candidate = request.user.candidate_profile
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)

    candidate.cv_file = file
    candidate.save()
    parsed_data = parse_uploaded_pdf(file)

    return Response(parsed_data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_candidate_profile(request):
    """
    Mise à jour complète et optimisée du profil du candidat.
    """
    if not request.user.is_active:
        return Response({"error": "Your account is not activated. Please check your email for the activation link."}, status=status.HTTP_403_FORBIDDEN)

    try:
        candidate = request.user.candidate_profile
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)



    # ➡️ Mise à jour des informations principales (les autres données)
    candidate.first_name = request.data.get('first_name', candidate.first_name)
    candidate.last_name = request.data.get('last_name', candidate.last_name)
    candidate.phone = request.data.get('phone', candidate.phone)
    candidate.title = request.data.get('title', candidate.title)
    candidate.linkedin = request.data.get('linkedin', candidate.linkedin)
    candidate.education_level = request.data.get('education_level', candidate.education_level)
    candidate.preferred_contract_type = request.data.get('preferred_contract_type', candidate.preferred_contract_type)
    candidate.save()

    # ✅ PATCH ciblé : Compétences
    skills = request.data.get('skills', [])
    existing_skills = set(candidate.skills.values_list('name', flat=True))

    # ➕ Ajouter les nouvelles compétences
    skill_names = {skill.get('name') if isinstance(skill, dict) else skill for skill in skills}
    for skill_name in skill_names:
        if skill_name not in existing_skills and skill_name.strip() != "":
            Skill.objects.create(candidate=candidate, name=skill_name)

    # ➖ Supprimer les compétences retirées
    candidate.skills.exclude(name__in=skill_names).delete()

    # ✅ PATCH ciblé : Éducation
    educations = request.data.get('educations', [])
    existing_educations = set(candidate.educations.values_list('degree', 'institution'))

    # ➕ Ajouter les nouvelles éducations
    education_keys = {(edu['degree'], edu['institution']) for edu in educations}
    for edu in educations:
        if (edu['degree'], edu['institution']) not in existing_educations:
            Education.objects.create(
                candidate=candidate,
                degree=edu['degree'],
                institution=edu['institution'],
                start_year=edu.get('start_year'),
                end_year=edu.get('end_year')
            )

    # ➖ Supprimer les éducations retirées
    candidate.educations.exclude(
        degree__in=[x[0] for x in education_keys],
        institution__in=[x[1] for x in education_keys]
    ).delete()

    # ✅ PATCH ciblé : Expériences
    experiences = request.data.get('experiences', [])
    existing_experiences = set(candidate.experiences.values_list('job_title', 'company'))

    # ➕ Ajouter les nouvelles expériences
    experience_keys = {(exp['job_title'], exp['company']) for exp in experiences}
    for exp in experiences:
        if (exp['job_title'], exp['company']) not in existing_experiences:
            Experience.objects.create(
                candidate=candidate,
                job_title=exp['job_title'],
                company=exp['company'],
                description=exp.get('description', ''),
                start_date=exp.get('start_date'),
                end_date=exp.get('end_date')
            )

    # ➖ Supprimer les expériences retirées
    candidate.experiences.exclude(
        job_title__in=[x[0] for x in experience_keys],
        company__in=[x[1] for x in experience_keys]
    ).delete()

    # ✅ PATCH ciblé : Langues
    languages = request.data.get('candidate_languages', [])
    existing_languages = set(candidate.candidate_languages.values_list('language__name', flat=True))

    # ➕ Ajouter les nouvelles langues
    language_names = {lang['language'] for lang in languages if lang['language']}
    for lang in languages:
        if lang['language'] not in existing_languages:
            language_obj = Language.objects.get(name=lang['language'])
            CandidateLanguage.objects.create(
                candidate=candidate,
                language=language_obj,
                level=lang['level']
            )

    # ➖ Supprimer les langues retirées
    candidate.candidate_languages.exclude(language__name__in=language_names).delete()
    new_email = request.data.get('email')
    if new_email and new_email != request.user.email:
        # Si le nouvel email est différent, envoyer un lien de validation
        send_user_token(request.user, "email_change", new_email)
        return Response({
            'message': 'Please verify your new email address. A validation link has been sent to your email.',
        }, status=status.HTTP_200_OK)

    # ➡️ Sérialisation et retour des données mises à jour
    serializer = CandidateSerializer(candidate)

    return Response({
        'message': 'Candidate profile completed and saved.',
        'profile': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_languages(request):
    if request.method=='GET':
        try:
            languages=Language.objects.all()
            serializer=LanguageSerializer(languages,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        except Language.DoesNotExist:
            return Response({"detail":"No language was found in the data base"},status=status.HTTP_404_NOT_FOUND)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_candidate_profile(request):
    try:
        candidate = request.user.candidate_profile
        serializer = CandidateSerializer(candidate)
        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Candidate.DoesNotExist:
        return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)