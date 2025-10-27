"""
Utilitaires pour la gestion des fuseaux horaires dans l'agenda
"""
import pytz
from datetime import datetime, time
from django.utils import timezone
from django.conf import settings


def get_user_timezone(user):
    """
    Récupère le fuseau horaire de l'utilisateur
    """
    if hasattr(user, 'timezone') and user.timezone:
        try:
            return pytz.timezone(user.timezone)
        except pytz.exceptions.UnknownTimeZoneError:
            pass
    
    # Fuseau horaire par défaut
    return pytz.timezone(getattr(settings, 'TIME_ZONE', 'Europe/Paris'))


def convert_time_to_user_timezone(time_obj, user, date=None):
    """
    Convertit une heure vers le fuseau horaire de l'utilisateur
    
    Args:
        time_obj: Objet time ou datetime
        user: Utilisateur dont on veut le fuseau horaire
        date: Date optionnelle pour créer un datetime complet
    
    Returns:
        time: Heure convertie dans le fuseau horaire de l'utilisateur
    """
    user_tz = get_user_timezone(user)
    
    # Si c'est un objet time, on a besoin d'une date
    if isinstance(time_obj, time) and date:
        # Créer un datetime avec la date et l'heure
        dt = datetime.combine(date, time_obj)
        # Assumer que c'est en UTC (ou fuseau horaire du serveur)
        dt = timezone.make_aware(dt)
    elif isinstance(time_obj, datetime):
        dt = time_obj
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt)
    else:
        return time_obj
    
    # Convertir vers le fuseau horaire de l'utilisateur
    user_dt = dt.astimezone(user_tz)
    return user_dt.time()


def convert_time_from_user_timezone(time_obj, user, date=None):
    """
    Convertit une heure depuis le fuseau horaire de l'utilisateur vers UTC
    
    Args:
        time_obj: Objet time ou datetime dans le fuseau horaire de l'utilisateur
        user: Utilisateur source
        date: Date optionnelle
    
    Returns:
        time: Heure convertie en UTC
    """
    user_tz = get_user_timezone(user)
    
    # Si c'est un objet time, on a besoin d'une date
    if isinstance(time_obj, time) and date:
        # Créer un datetime avec la date et l'heure dans le fuseau horaire de l'utilisateur
        dt = datetime.combine(date, time_obj)
        dt = user_tz.localize(dt)
    elif isinstance(time_obj, datetime):
        if timezone.is_naive(time_obj):
            dt = user_tz.localize(time_obj)
        else:
            dt = time_obj
    else:
        return time_obj
    
    # Convertir vers UTC
    utc_dt = dt.astimezone(pytz.UTC)
    return utc_dt.time()


def format_time_for_user(time_obj, user, date=None):
    """
    Formate une heure pour l'affichage dans le fuseau horaire de l'utilisateur
    
    Args:
        time_obj: Objet time ou datetime
        user: Utilisateur
        date: Date optionnelle
    
    Returns:
        str: Heure formatée dans le fuseau horaire de l'utilisateur
    """
    user_tz = get_user_timezone(user)
    
    if isinstance(time_obj, time) and date:
        dt = datetime.combine(date, time_obj)
        dt = timezone.make_aware(dt)
    elif isinstance(time_obj, datetime):
        dt = time_obj
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt)
    else:
        return str(time_obj)
    
    # Convertir vers le fuseau horaire de l'utilisateur
    user_dt = dt.astimezone(user_tz)
    return user_dt.strftime('%H:%M')


def get_available_timezones():
    """
    Retourne une liste des fuseaux horaires disponibles
    """
    return [
        ('Europe/Paris', 'Europe/Paris (UTC+1/+2)'),
        ('Europe/London', 'Europe/London (UTC+0/+1)'),
        ('Europe/Berlin', 'Europe/Berlin (UTC+1/+2)'),
        ('Europe/Rome', 'Europe/Rome (UTC+1/+2)'),
        ('Europe/Madrid', 'Europe/Madrid (UTC+1/+2)'),
        ('America/New_York', 'America/New_York (UTC-5/-4)'),
        ('America/Los_Angeles', 'America/Los_Angeles (UTC-8/-7)'),
        ('America/Chicago', 'America/Chicago (UTC-6/-5)'),
        ('Asia/Tokyo', 'Asia/Tokyo (UTC+9)'),
        ('Asia/Shanghai', 'Asia/Shanghai (UTC+8)'),
        ('Asia/Dubai', 'Asia/Dubai (UTC+4)'),
        ('Australia/Sydney', 'Australia/Sydney (UTC+10/+11)'),
        ('UTC', 'UTC (UTC+0)'),
    ]


def is_timezone_valid(timezone_str):
    """
    Vérifie si un fuseau horaire est valide
    
    Args:
        timezone_str: Chaîne du fuseau horaire
    
    Returns:
        bool: True si valide, False sinon
    """
    try:
        pytz.timezone(timezone_str)
        return True
    except pytz.exceptions.UnknownTimeZoneError:
        return False
