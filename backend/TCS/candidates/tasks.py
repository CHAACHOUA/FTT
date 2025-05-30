from celery import shared_task
import json
import os
from candidates.utils.cv_parser import read_pdf, parse_cv_with_chatgpt


@shared_task
def async_parse_cv(file_path):
    try:
        print(f"[CELERY] Traitement du fichier : {file_path}")

        if not os.path.exists(file_path):
            return {"error": f"Fichier introuvable : {file_path}"}

        with open(file_path, "rb") as f:
            cv_text = read_pdf(f)

        parsed_result = parse_cv_with_chatgpt(cv_text)
        try:
            return json.loads(parsed_result)
        except json.JSONDecodeError:
            return {
                "error": "Échec de parsing JSON. Résultat brut retourné.",
                "raw_result": parsed_result,
            }

    except Exception as e:
        return {"error": f"Erreur interne dans la tâche Celery : {str(e)}"}
