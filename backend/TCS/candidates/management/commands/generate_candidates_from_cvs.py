import os
import json
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from users.models import User
from candidates.models import Candidate, Experience, Education, Skill, Language, CandidateLanguage
from candidates.utils.cv_parser import parse_uploaded_pdf


class Command(BaseCommand):
    help = 'Génère des candidats fictifs à partir des CVs dans le dossier cv_candidates'

    def add_arguments(self, parser):
        parser.add_argument(
            '--cv-folder',
            type=str,
            default='cv_candidates',
            help='Dossier contenant les CVs (par défaut: cv_candidates)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='Digitalio123456',
            help='Mot de passe pour tous les candidats (par défaut: Digitalio123456)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mode test - ne crée pas vraiment les candidats'
        )

    def handle(self, *args, **options):
        cv_folder = options['cv_folder']
        password = options['password']
        dry_run = options['dry_run']

        # Vérifier que le dossier existe
        if not os.path.exists(cv_folder):
            self.stdout.write(
                self.style.ERROR(f'Le dossier {cv_folder} n\'existe pas!')
            )
            return

        # Lister tous les fichiers PDF dans le dossier
        pdf_files = [f for f in os.listdir(cv_folder) if f.lower().endswith('.pdf')]
        
        if not pdf_files:
            self.stdout.write(
                self.style.WARNING(f'Aucun fichier PDF trouvé dans {cv_folder}')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f'📁 {len(pdf_files)} CVs trouvés dans {cv_folder}')
        )

        if dry_run:
            self.stdout.write(
                self.style.WARNING('🧪 MODE TEST - Aucun candidat ne sera créé')
            )

        success_count = 0
        error_count = 0

        for i, pdf_file in enumerate(pdf_files, 1):
            try:
                self.stdout.write(f'\n📄 Traitement du CV {i}/{len(pdf_files)}: {pdf_file}')
                
                # Générer l'email du candidat
                email = f'candidat{i}@gmail.com'
                
                # Vérifier si le candidat existe déjà
                if User.objects.filter(email=email).exists():
                    self.stdout.write(
                        self.style.WARNING(f'⚠️  Le candidat {email} existe déjà, passage au suivant')
                    )
                    continue

                if dry_run:
                    self.stdout.write(f'🧪 [TEST] Créerait le candidat: {email}')
                    continue

                # Chemin complet du fichier CV
                cv_path = os.path.join(cv_folder, pdf_file)
                
                # Parser le CV d'abord
                self.stdout.write('🤖 Parsing du CV...')
                with open(cv_path, 'rb') as cv_file:
                    # Vérifier que c'est un PDF
                    if not pdf_file.lower().endswith('.pdf'):
                        self.stdout.write(
                            self.style.ERROR(f'❌ Le fichier {pdf_file} n\'est pas un PDF')
                        )
                        error_count += 1
                        continue
                    
                    # Parser directement avec read_pdf et parse_cv_with_chatgpt
                    from candidates.utils.cv_parser import read_pdf, parse_cv_with_chatgpt
                    import json
                    
                    try:
                        cv_text = read_pdf(cv_file)
                        gpt_response = parse_cv_with_chatgpt(cv_text)
                        parsed_data = json.loads(gpt_response)
                    except json.JSONDecodeError:
                        parsed_data = {
                            "is_cv": False,
                            "error": "❌ Le JSON retourné n'est pas valide."
                        }
                    except Exception as e:
                        parsed_data = {
                            "is_cv": False,
                            "error": f"💥 Erreur de parsing : {str(e)}"
                        }
                    
                    if not parsed_data.get('is_cv', False):
                        self.stdout.write(
                            self.style.ERROR(f'❌ Le fichier {pdf_file} n\'est pas un CV valide')
                        )
                        error_count += 1
                        continue

                    cv_data = parsed_data.get('data', {})
                    
                    # Créer l'utilisateur
                    self.stdout.write(f'👤 Création du compte: {email}')
                    user = User.objects.create_user(
                        email=email,
                        password=password,
                        role='candidate',
                        is_active=True  # Activer directement le compte
                    )
                    
                    # Créer le profil candidat
                    candidate = Candidate.objects.create(
                        user=user,
                        first_name=cv_data.get('first_name', ''),
                        last_name=cv_data.get('last_name', ''),
                        title=cv_data.get('title', ''),
                        phone=cv_data.get('phone', ''),
                        bio=f"Profil généré automatiquement à partir du CV {pdf_file}"
                    )
                    
                    # Enregistrer le CV dans le profil du candidat
                    with open(cv_path, 'rb') as cv_file_for_save:
                        candidate.cv_file.save(
                            pdf_file,
                            File(cv_file_for_save),
                            save=True
                        )
                    
                    # Créer les expériences
                    for exp_data in cv_data.get('experiences', []):
                        # Nettoyer les dates
                        start_date = self._clean_date(exp_data.get('start_date'))
                        end_date = self._clean_date(exp_data.get('end_date'))
                        
                        Experience.objects.create(
                            candidate=candidate,
                            job_title=exp_data.get('job_title', ''),
                            company=exp_data.get('company', ''),
                            description=exp_data.get('description', ''),
                            start_date=start_date,
                            end_date=end_date
                        )
                    
                    # Créer les formations
                    for edu_data in cv_data.get('educations', []):
                        # Nettoyer les dates
                        start_date = self._clean_date(edu_data.get('start_date'))
                        end_date = self._clean_date(edu_data.get('end_date'))
                        
                        Education.objects.create(
                            candidate=candidate,
                            degree=edu_data.get('degree', ''),
                            institution=edu_data.get('institution', ''),
                            start_date=start_date,
                            end_date=end_date
                        )
                    
                    # Créer les compétences
                    for skill_name in cv_data.get('skills', []):
                        if skill_name.strip():  # Ignorer les compétences vides
                            Skill.objects.create(
                                candidate=candidate,
                                name=skill_name.strip()
                            )
                    
                    # Créer les langues
                    for lang_data in cv_data.get('languages', []):
                        lang_name = lang_data.get('name', '').strip()
                        lang_level = lang_data.get('level', '')
                        
                        if lang_name:
                            # Créer ou récupérer la langue
                            language, created = Language.objects.get_or_create(
                                name=lang_name
                            )
                            
                            # Associer la langue au candidat
                            CandidateLanguage.objects.create(
                                candidate=candidate,
                                language=language,
                                level=lang_level
                            )
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Candidat {email} créé avec succès!')
                    )
                    success_count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Erreur lors du traitement de {pdf_file}: {str(e)}')
                )
                error_count += 1

        # Résumé final
        self.stdout.write('\n' + '='*50)
        self.stdout.write('📊 RÉSUMÉ:')
        self.stdout.write(f'✅ Candidats créés avec succès: {success_count}')
        self.stdout.write(f'❌ Erreurs: {error_count}')
        self.stdout.write(f'📁 Total de CVs traités: {len(pdf_files)}')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('🧪 Mode test - Aucun candidat réel n\'a été créé')
            )

    def _clean_date(self, date_str):
        """Nettoie une date et retourne None si elle n'est pas valide"""
        if not date_str or not isinstance(date_str, str):
            return None
        
        # Nettoyer la chaîne
        date_str = date_str.strip()
        
        # Si c'est vide ou contient des valeurs non valides
        if not date_str or date_str.lower() in ['', 'non spécifié', 'non specifie', 'n/a', 'na', 'null', 'none']:
            return None
        
        # Vérifier si c'est déjà au format YYYY-MM-DD
        if len(date_str) == 10 and date_str.count('-') == 2:
            try:
                from datetime import datetime
                datetime.strptime(date_str, '%Y-%m-%d')
                return date_str
            except ValueError:
                pass
        
        # Essayer de convertir d'autres formats
        try:
            from datetime import datetime
            
            # Formats possibles
            formats = [
                '%Y-%m-%d',
                '%d/%m/%Y',
                '%m/%d/%Y',
                '%Y/%m/%d',
                '%d-%m-%Y',
                '%m-%d-%Y',
                '%Y',
                '%m/%Y',
                '%Y-%m'
            ]
            
            for fmt in formats:
                try:
                    parsed_date = datetime.strptime(date_str, fmt)
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    continue
                    
        except Exception:
            pass
        
        # Si on ne peut pas parser, retourner None
        return None
