from openai import OpenAI
import PyPDF2
import json
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def read_pdf(file):
    """Lit un fichier PDF et retourne le texte extrait."""
    try:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Erreur de lecture du PDF : {str(e)}")

def parse_cv_with_chatgpt(cv_text):
    """Utilise GPT pour renvoyer un JSON avec is_cv + data (si applicable)."""

    prompt = f"""
    Tu es un assistant RH. Voici un texte extrait d’un document PDF :

    \"\"\"{cv_text}\"\"\"

    Ta tâche est de dire s'il s'agit d’un CV.
    Si ce n’est **pas** un CV, réponds uniquement :
    {{ "is_cv": false }}

    Si c’est un CV, analyse-le et retourne uniquement :
    {{
      "is_cv": true,
      "data": {{
        "first_name": "",
        "last_name": "",
        "title": "Madame | Monsieur | Autre",
        "email": "",
        "phone": "",
        "linkedin": "",
        "education_level": "",
        "preferred_contract_type": "",
        "experiences": [
          {{
            "job_title": "",
            "company": "",
            "description": "",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD"
          }}
        ],
        "educations": [
          {{
            "degree": "",
            "institution": "",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD"
          }}
        ],
        "skills": ["", "", ""],
        "languages": [
          {{
            "name": "",
            "level": "Beginner | Intermediate | Advanced | Fluent"
          }}
        ]
      }}
    }}

    ⚠️ Tu dois retourner un **JSON strictement valide**.
    Aucun commentaire, aucun mot ou texte autour. Juste le JSON.
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Tu es un assistant RH qui répond uniquement avec du JSON strictement valide."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()

def parse_uploaded_pdf(file):
    """Lit et parse un fichier PDF contenant un CV."""
    if not file.name.lower().endswith('.pdf') or file.content_type != 'application/pdf':
        return {
            "is_cv": False,
            "error": "⛔ Format invalide. Seuls les fichiers PDF sont acceptés."
        }

    try:
        cv_text = read_pdf(file)
        gpt_response = parse_cv_with_chatgpt(cv_text)

        # ✅ Conversion directe (aucun nettoyage)
        return json.loads(gpt_response)

    except json.JSONDecodeError:
        return {
            "is_cv": False,
            "error": "❌ Le JSON retourné n’est pas valide.",
            "raw": gpt_response
        }

    except Exception as e:
        return {
            "is_cv": False,
            "error": f"💥 Erreur interne : {str(e)}"
        }
