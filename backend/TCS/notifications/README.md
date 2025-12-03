# Système de Notifications

## Installation

1. L'application est déjà ajoutée dans `INSTALLED_APPS` dans `settings.py`
2. Les URLs sont déjà configurées dans `TCS/urls.py`
3. Créer la migration :
```bash
python manage.py makemigrations notifications
python manage.py migrate
```

## Utilisation

### Créer une notification

```python
from notifications.services.notification_service import NotificationService

# Notification simple
NotificationService.create_notification(
    user=user,
    notification_type='new_application',
    title='Nouvelle candidature',
    message='Vous avez reçu une nouvelle candidature.',
    priority='high',  # 'high', 'medium', 'low'
    related_object_type='application',
    related_object_id=application.id,
    action_url='/forums/1/applications/recruiter'
)

# Notification pour plusieurs utilisateurs
NotificationService.create_notification_for_users(
    users=[user1, user2, user3],
    notification_type='new_programme',
    title='Nouveau programme',
    message='Un nouvel événement a été ajouté au programme.',
    priority='medium'
)
```

### Récupérer les notifications

```python
from notifications.models import Notification

# Toutes les notifications d'un utilisateur
notifications = Notification.objects.filter(user=user)

# Notifications non lues
unread = Notification.objects.filter(user=user, is_read=False)

# Compter les non lues
count = NotificationService.get_unread_count(user)
```

### Marquer comme lu

```python
# Une notification
NotificationService.mark_as_read(notification_id, user)

# Toutes les notifications
NotificationService.mark_all_as_read(user)
```

## Intégration dans les vues

Voir `integration_example.py` pour des exemples d'intégration dans les actions existantes.

## Types de notifications disponibles

Voir `models.py` -> `TYPE_CHOICES` pour la liste complète des types.

## API Endpoints

- `GET /api/notifications/` - Liste des notifications
- `GET /api/notifications/unread-count/` - Nombre de notifications non lues
- `PATCH /api/notifications/<id>/mark-read/` - Marquer comme lu
- `POST /api/notifications/mark-all-read/` - Tout marquer comme lu
- `DELETE /api/notifications/<id>/delete/` - Supprimer une notification

