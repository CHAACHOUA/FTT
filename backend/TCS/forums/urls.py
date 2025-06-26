from django.urls import path
from forums.views.forum_views import forum_candidates ,forum_list, forum_detail , get_candidate_search_view
from forums.views.registration_views import register_to_forum, my_forums
from forums.views.registration_views import recruiter_my_forums


urlpatterns = [
    #  Lecture des forums
    path('', forum_list, name='forum-list'),
    path('<int:pk>/', forum_detail, name='forum-detail'),

    #  Inscriptions du candidat
    path('<int:forum_id>/register/', register_to_forum, name='register-to-forum'),
    path('candidate/', my_forums, name='my-forums'),
    path('candidate/<int:forum_id>/search/', get_candidate_search_view, name='candidate-search-forum'),
    path('<int:forum_id>/candidates/', forum_candidates, name="forum-candidates"),
    # Recruiters
    path('recruiter/my-forums/', recruiter_my_forums, name='recruiter-my-forums'),

]
