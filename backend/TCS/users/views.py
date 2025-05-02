
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CandidateLanguage, Language, Skill, Experience, Education, Candidate
from .serializers import CandidateRegisterSerializer


@api_view(['POST'])
def register_candidate(request):
    serializer = CandidateRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Candidate registered successfully.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "email": user.email
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_candidate_profile(request):
    try:
        candidate = request.user.candidate_profile
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)

    # 📌 Mise à jour des champs simples
    candidate.phone = request.data.get('phone', candidate.phone)
    candidate.linkedin = request.data.get('linkedin', candidate.linkedin)
    candidate.education_level = request.data.get('education_level', candidate.education_level)
    candidate.preferred_contract_type = request.data.get('preferred_contract_type', candidate.preferred_contract_type)
    candidate.save()

    # 🧹 Nettoyage des anciennes entrées
    candidate.educations.all().delete()
    candidate.experiences.all().delete()
    candidate.skills.all().delete()
    candidate.candidate_languages.all().delete()

    # 🎓 Formations
    educations = request.data.get('educations', [])
    for edu in educations:
        Education.objects.create(
            candidate=candidate,
            degree=edu['degree'],
            institution=edu['institution'],
            start_year=edu.get('start_year'),
            end_year=edu.get('end_year')
        )

    # 💼 Expériences
    experiences = request.data.get('experiences', [])
    for exp in experiences:
        Experience.objects.create(
            candidate=candidate,
            job_title=exp['job_title'],
            company=exp['company'],
            description=exp.get('description', ''),
            start_date=exp.get('start_date'),
            end_date=exp.get('end_date')
        )

    # 🧠 Compétences (simple list of strings)
    skills = request.data.get('skills', [])
    for skill_name in skills:
        Skill.objects.create(candidate=candidate, name=skill_name)

    # 🌐 Langues
    languages = request.data.get('languages', [])
    for lang in languages:
        lang_name = lang['name']
        level = lang['level']

        language_obj, _ = Language.objects.get_or_create(name=lang_name)

        CandidateLanguage.objects.create(
            candidate=candidate,
            language=language_obj,
            level=level
        )

    return Response({'message': 'Candidate profile completed and saved.'}, status=status.HTTP_200_OK)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if (email is None) or (password is None):
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, email=email, password=password)

    if not user:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role,
        'email': user.email
    }, status=status.HTTP_200_OK)