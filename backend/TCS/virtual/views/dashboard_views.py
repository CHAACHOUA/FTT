from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from forums.models import Forum
from recruiters.models import Recruiter, Offer
from virtual.models import VirtualAgendaSlot


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_virtual_dashboard_stats(request, forum_id: int):
    """
    Retourne un objet agrégé pour la page VirtualDashboard du recruteur.

    Payload typique:
    {
      "offers": { "count": 3, "has_offers": true },
      "slots": { "total": 5, "available": 2, "booked": 2, "completed": 1, "has_slots": true },
      "company": { "status": "done" | "in_progress" | "not_started", "logo": true, "banner": false, "website": true, "description": true, "sectors": true }
    }
    """
    forum = get_object_or_404(Forum, id=forum_id)

    # Récupérer le recruteur courant
    recruiter = get_object_or_404(Recruiter, user=request.user)
    company = recruiter.company

    # 1) Offres de l'entreprise pour ce forum
    offers_qs = Offer.objects.filter(forum=forum, recruiter__company=company)
    offers_count = offers_qs.count()

    # 2) Créneaux du recruteur pour ce forum (on se limite au recruteur courant)
    slots_qs = VirtualAgendaSlot.objects.filter(forum=forum, recruiter=request.user)
    slots_total = slots_qs.count()
    slots_available = slots_qs.filter(status='available').count()
    slots_booked = slots_qs.filter(status='booked').count()
    slots_completed = slots_qs.filter(status='completed').count()
    slots_cancelled = slots_qs.filter(status='cancelled').count()

    # 3) Statut de complétion du profil entreprise
    logo = bool(getattr(company, 'logo', None))
    banner = bool(getattr(company, 'banner', None))
    website = bool(getattr(company, 'website', '') or '')
    description_text = (getattr(company, 'description', '') or '').strip()
    description_ok = len(description_text) >= 10
    sectors_list = getattr(company, 'sectors', []) or []
    sectors_ok = len([s for s in sectors_list if s]) > 0

    has_strong = website or description_ok or sectors_ok
    has_some = logo or banner or (len(description_text) > 0)
    if has_strong:
        company_status = 'done'
    elif has_some:
        company_status = 'in_progress'
    else:
        company_status = 'not_started'

    data = {
        'offers': {
            'count': offers_count,
            'has_offers': offers_count > 0,
        },
        'slots': {
            'total': slots_total,
            'available': slots_available,
            'booked': slots_booked,
            'completed': slots_completed,
            'cancelled': slots_cancelled,
            'has_slots': slots_total > 0 or slots_available > 0 or slots_booked > 0 or slots_completed > 0,
        },
        'company': {
            'status': company_status,
            'logo': logo,
            'banner': banner,
            'website': website,
            'description': description_ok,
            'sectors': sectors_ok,
        },
    }

    return Response(data)


