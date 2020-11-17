from django.urls import re_path, path, include
from . import views

urlpatterns = [
    path('api/', include('api_engine.urls')),
    path('', include('app.urls')),
    path('_ah/warmup/', views.warmup, name='gae_warmup_request')
]

urlpatterns += [
    # match all other pages
    re_path(r'^(?:.*)/?$', include('app.urls'))
]
