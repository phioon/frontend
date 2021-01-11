from django.urls import re_path, path, include
from django_engine import views as engine_views
from app import views as views_app

urlpatterns = [
    path('api/app/', include('app.urls_api')),
    path('api/auth/', include('app.urls_api_auth')),
    path('api/market/', include('market.urls_api')),
    path('api/stripe/', include('app.urls_stripe')),
    path('api/search/', include('search_engine.urls_api')),

    path('auth/', include('app.urls_auth')),

    path('_ah/warmup/', engine_views.warmup, name='gae_warmup_request')
]

urlpatterns += [
    # match all other pages
    re_path(r'^(?:.*)/?$', views_app.frontend)
]
