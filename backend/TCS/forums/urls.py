from django.urls import path
from . import views

urlpatterns = [
    path('', views.forum_list, name='forum-list'),
    path('<int:pk>/', views.forum_detail, name='forum-detail'),
    path('<int:forum_id>/register/', views.register_to_forum, name='register-to-forum'),
    path('candidate/', views.my_forums, name='my-forums')
]
