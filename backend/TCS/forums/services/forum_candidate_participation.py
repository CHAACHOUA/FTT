from forums.models import ForumRegistration

def get_candidates_for_forum(forum_id):
    """
    Retourne les instances de candidats inscrits à un forum donné.
    """
    registrations = ForumRegistration.objects.select_related('candidate', 'search').filter(
        forum_id=forum_id
    )

    return registrations  # On retourne les objets ForumRegistration
