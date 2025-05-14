import os
import openai
import fitz

# ⚙️ Configuration OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# 📄 Extraire le texte depuis le PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        text += page.get_text()
    return text

# 🤖 Envoyer le texte à l'API ChatGPT
def parse_cv_with_chatgpt(cv_text):
    prompt = f"""
Tu es un assistant intelligent qui lit un CV en texte brut et retourne un JSON bien structuré contenant :
- nom
- prénom
- email
- numéro de téléphone
- linkedin
- github
- compétences (liste)
- expériences (liste d’objets avec entreprise, poste, dates, description)
- diplômes (liste d’objets avec diplôme, établissement, date)

Voici le CV :
\"\"\"{cv_text}\"\"\"

Retourne uniquement du JSON. Pas de commentaire, pas d’explication.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",  # ou "gpt-3.5-turbo" si tu préfères
        messages=[
            {"role": "system", "content": "Tu es un assistant de parsing de CV."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=1500
    )

    return response['choices'][0]['message']['content']

# 🚀 Fonction principale
def process_cv(pdf_path):
    cv_text = extract_text_from_pdf(pdf_path)
    json_result = parse_cv_with_chatgpt(cv_text)
    return json_result

# Exemple d'utilisation
if __name__ == "__main__":
    chemin = "exemple_cv.pdf"
    resultat_json = process_cv(chemin)
    print(resultat_json)
