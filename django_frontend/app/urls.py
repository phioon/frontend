from django.urls import path, re_path
from . import views


urlpatterns = [
    path('auth/setpassword/<uidb64>/<token>/', views.frontend_uidb64_token, name='password_reset_confirm'),
    path('auth/confirmemail/<uidb64>/<token>/', views.frontend_uidb64_token, name='email_confirmation'),
    path('', views.frontend),
]

urlpatterns += [
    # match the root
    # re_path(r'^$', views.frontend),
    # match all other pages
    #re_path(r'^(?:.*)/?$', views.frontend),
]