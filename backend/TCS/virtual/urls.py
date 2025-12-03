from django.urls import path
from virtual.views.dashboard_views import get_virtual_dashboard_stats
from .views.virtual_forum_views import (
    get_virtual_forums,
    get_forums_by_phase,
    get_forum_phase_info,
    update_forum_phases,
    get_forum_permissions,
    get_virtual_forum_detail
)
from .views.agenda_views import (
    VirtualAgendaSlotListCreateView,
    VirtualAgendaSlotDetailView,
    create_multiple_slots,
    get_recruiter_slots,
    get_slots_for_offer,
    book_slot,
    cancel_slot,
    get_agenda_stats,
    get_forum_recruiters,
    force_refresh_agenda
)
from .views.questionnaire_views import (
    QuestionnaireListCreateView,
    QuestionnaireDetailView,
    QuestionListCreateView,
    QuestionDetailView,
    QuestionnaireResponseListCreateView,
    QuestionnaireResponseDetailView,
    get_questionnaire_for_offer,
    get_candidate_responses,
    submit_questionnaire_response,
    get_questionnaire_stats
)
from .views.application_views import (
    VirtualApplicationListCreateView,
    VirtualApplicationDetailView,
    get_candidate_applications,
    get_recruiter_applications,
    update_application_status,
    update_interview_status,
    get_application_stats,
    validate_application,
    reject_application
)
from .views.zoom_views import (
    create_zoom_meeting,
    get_zoom_meeting_info,
    delete_zoom_meeting,
    get_user_zoom_meetings
)

urlpatterns = [
    # Forums virtuels
    path('forums/', get_virtual_forums, name='virtual-forums'),
    path('forums/phase/<str:phase>/', get_forums_by_phase, name='forums-by-phase'),
    path('forums/<int:forum_id>/', get_virtual_forum_detail, name='virtual-forum-detail'),
    path('forums/<int:forum_id>/phase-info/', get_forum_phase_info, name='forum-phase-info'),
    path('forums/<int:forum_id>/phases/', update_forum_phases, name='update-forum-phases'),
    path('forums/<int:forum_id>/permissions/', get_forum_permissions, name='forum-permissions'),
    
    # Agenda virtuel
    path('forums/<int:forum_id>/agenda/', VirtualAgendaSlotListCreateView.as_view(), name='virtual-agenda-list'),
    path('forums/<int:forum_id>/agenda/<int:slot_id>/', VirtualAgendaSlotDetailView.as_view(), name='virtual-agenda-detail'),
    path('forums/<int:forum_id>/agenda/multiple/', create_multiple_slots, name='virtual-agenda-multiple'),
    path('forums/<int:forum_id>/agenda/recruiter/<int:recruiter_id>/', get_recruiter_slots, name='virtual-recruiter-slots'),
    path('forums/<int:forum_id>/offers/<int:offer_id>/slots/', get_slots_for_offer, name='virtual-offer-slots'),
    path('forums/<int:forum_id>/agenda/<int:slot_id>/book/', book_slot, name='virtual-book-slot'),
    path('forums/<int:forum_id>/agenda/<int:slot_id>/cancel/', cancel_slot, name='virtual-cancel-slot'),
    path('forums/<int:forum_id>/agenda/stats/', get_agenda_stats, name='virtual-agenda-stats'),
    path('forums/<int:forum_id>/agenda/refresh/', force_refresh_agenda, name='virtual-agenda-refresh'),
    path('forums/<int:forum_id>/recruiters/', get_forum_recruiters, name='virtual-forum-recruiters'),
    path('forums/<int:forum_id>/dashboard/stats/', get_virtual_dashboard_stats, name='virtual-dashboard-stats'),
    
    # Questionnaires
    path('questionnaires/', QuestionnaireListCreateView.as_view(), name='questionnaire-list'),
    path('questionnaires/<int:pk>/', QuestionnaireDetailView.as_view(), name='questionnaire-detail'),
    path('questionnaires/<int:questionnaire_id>/questions/', QuestionListCreateView.as_view(), name='question-list'),
    path('questionnaires/<int:questionnaire_id>/questions/<int:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    path('questionnaire-responses/', QuestionnaireResponseListCreateView.as_view(), name='questionnaire-response-list'),
    path('questionnaire-responses/<int:pk>/', QuestionnaireResponseDetailView.as_view(), name='questionnaire-response-detail'),
    path('offers/<int:offer_id>/questionnaire/', get_questionnaire_for_offer, name='offer-questionnaire'),
    path('offers/<int:offer_id>/responses/', get_candidate_responses, name='offer-responses'),
    path('questionnaires/<int:questionnaire_id>/submit/', submit_questionnaire_response, name='submit-questionnaire'),
    path('questionnaires/<int:questionnaire_id>/stats/', get_questionnaire_stats, name='questionnaire-stats'),
    
    # Candidatures virtuelles
    path('applications/', VirtualApplicationListCreateView.as_view(), name='virtual-application-list'),
    path('applications/<int:pk>/', VirtualApplicationDetailView.as_view(), name='virtual-application-detail'),
    path('forums/<int:forum_id>/applications/candidate/', get_candidate_applications, name='candidate-applications'),
    path('forums/<int:forum_id>/applications/recruiter/', get_recruiter_applications, name='recruiter-applications'),
    path('applications/<int:application_id>/status/', update_application_status, name='update-application-status'),
    path('applications/<int:application_id>/interview-status/', update_interview_status, name='update-interview-status'),
    path('applications/<int:application_id>/validate/', validate_application, name='validate-application'),
    path('applications/<int:application_id>/reject/', reject_application, name='reject-application'),
    path('forums/<int:forum_id>/applications/stats/', get_application_stats, name='application-stats'),
    
    # Réunions Zoom
    path('forums/<int:forum_id>/agenda/<int:slot_id>/zoom/', create_zoom_meeting, name='create-zoom-meeting'),
    path('forums/<int:forum_id>/agenda/<int:slot_id>/zoom/info/', get_zoom_meeting_info, name='get-zoom-meeting-info'),
    path('forums/<int:forum_id>/agenda/<int:slot_id>/zoom/delete/', delete_zoom_meeting, name='delete-zoom-meeting'),
    path('forums/<int:forum_id>/zoom/meetings/', get_user_zoom_meetings, name='get-user-zoom-meetings'),
]
