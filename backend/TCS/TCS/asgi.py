"""
ASGI config for TCS project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from notifications.routing import websocket_urlpatterns as notifications_ws_patterns
from chat.routing import websocket_urlpatterns as chat_ws_patterns
from notifications.middleware import JWTAuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')

# Initialiser Django ASGI application pour HTTP
django_asgi_app = get_asgi_application()

# Combiner tous les patterns WebSocket
all_websocket_patterns = notifications_ws_patterns + chat_ws_patterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(all_websocket_patterns)
        )
    ),
})
