from openai import OpenAI
import PyPDF2
import json
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def read_pdf(file):
    """Lit un fichier PDF et retourne tout le texte extrait."""
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def parse_cv_with_chatgpt(cv_text):
    """Envoie le texte du CV à ChatGPT et récupère uniquement le JSON parsé."""
    prompt = f"""
Tu es un assistant RH expert. Analyse le contenu du CV ci-dessous et retourne uniquement un JSON **valide**, sans aucun commentaire ni texte autour, avec les champs suivants :

{{
  "first_name": "",
  "last_name": "",
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

Voici le contenu du CV :
{cv_text}
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Tu es un assistant RH qui structure les CV en JSON exploitable directement par une base de données Django."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content.strip()

def parse_uploaded_pdf(file):
    cv_text = read_pdf(file)
    parsed_result = parse_cv_with_chatgpt(cv_text)

    try:
        return json.loads(parsed_result)
    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON correctly.", "raw_result": parsed_result}
