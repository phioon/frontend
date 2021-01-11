from django.urls import path
from search_engine import views

urlpatterns = [
    path('', views.search_models_top),
    path('users/', views.SearchUserList.as_view()),
    path('strategies/', views.SearchStrategyList.as_view())
]
