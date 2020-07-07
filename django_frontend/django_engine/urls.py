from django.urls import re_path, path, include

urlpatterns = [
    path('api/', include('api_engine.urls')),
    path('', include('app.urls')),
]

urlpatterns += [
    # match all other pages
    re_path(r'^(?:.*)/?$', include('app.urls'))
]
