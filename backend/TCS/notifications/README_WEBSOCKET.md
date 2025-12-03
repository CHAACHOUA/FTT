# Configuration WebSocket pour les Notifications

## Installation

1. Installer les dépendances :
```bash
pip install channels channels-redis daphne
```

2. Redis doit être en cours d'exécution :
```bash
# Si vous utilisez Docker
docker-compose up redis

# Ou installer Redis localement
```

3. Créer les migrations :
```bash
python manage.py makemigrations notifications
python manage.py migrate
```

## Démarrer le serveur

Au lieu d'utiliser `python manage.py runserver`, utilisez **Daphne** pour supporter WebSocket :

```bash
daphne -b 0.0.0.0 -p 8000 TCS.asgi:application
```

Ou avec `runserver` (Django 3.0+ supporte ASGI) :
```bash
python manage.py runserver
```

## Configuration

### Backend

- **ASGI** configuré dans `TCS/asgi.py`
- **Channels** configuré dans `TCS/settings.py`
- **Consumer WebSocket** dans `notifications/consumers.py`
- **Middleware JWT** pour l'authentification WebSocket dans `notifications/middleware.py`

### Frontend

- **Hook WebSocket** : `hooks/useWebSocket.js`
- **Hook Notifications** : `hooks/useNotificationWebSocket.js`
- **Composant** : `components/notifications/NotificationIcon.jsx`

## Fonctionnement

1. L'utilisateur se connecte → Le frontend récupère un token WebSocket via `/api/notifications/websocket-token/`
2. Connexion WebSocket → Le frontend se connecte à `ws://localhost:8000/ws/notifications/?token=...`
3. Authentification → Le middleware vérifie le token JWT
4. Groupe utilisateur → Chaque utilisateur a son propre groupe `notifications_{user_id}`
5. Notifications en temps réel → Quand une notification est créée, elle est envoyée via WebSocket

## Test

1. Démarrer le serveur avec Daphne
2. Se connecter à l'application
3. Ouvrir la console du navigateur → Vous devriez voir "✅ WebSocket connecté"
4. Créer une notification (ex: valider une candidature)
5. La notification apparaît instantanément dans l'icône

