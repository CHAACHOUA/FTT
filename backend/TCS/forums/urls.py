from django.urls import path
from forums.views.forum_views import get_forum_candidates,forum_candidates ,forum_list, forum_detail , get_candidate_search_view, update_forum, forum_kpis
from forums.views.registration_views import register_to_forum, register_recruiter_to_forum_view
from forums.views.forum_views import organizer_my_forums,recruiter_my_forums,my_forums


urlpatterns = [
    #  Lecture des forums
    path('', forum_list, name='forum-list'),
    
    # URLs spécifiques avec forum_id (doivent être avant les URLs génériques)
    path('<int:forum_id>/kpis/', forum_kpis, name='forum-kpis'),
    path('<int:forum_id>/update/', update_forum, name='update-forum'),
    path('<int:forum_id>/register/', register_to_forum, name='register-to-forum'),
    path('<int:forum_id>/register-recruiter/', register_recruiter_to_forum_view, name='register-recruiter-to-forum'),
    path('<int:forum_id>/candidates/', forum_candidates, name="forum-candidates"),
    path('<int:forum_id>/organizer/candidates/', get_forum_candidates,name="get-forum-candidates"),
    
    # URLs avec des préfixes spécifiques
    path('candidate/', my_forums, name='my-forums'),
    path('candidate/<int:forum_id>/search/', get_candidate_search_view, name='candidate-search-forum'),
    path('recruiter/my-forums/', recruiter_my_forums, name='recruiter-my-forums'),
    path('organizer/my-forums/',organizer_my_forums, name='organizer-my-forums'),
    
    # URL générique pour le détail du forum (doit être en dernier)
    path('<int:pk>/', forum_detail, name='forum-detail'),
]
