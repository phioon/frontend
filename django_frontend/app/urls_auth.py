from django.urls import path
from app import views_auth

urlpatterns = [
    path('setpassword/<uidb64>/<token>/', views_auth.frontend_uidb64_token, name='password_reset_confirm'),
    path('confirmemail/<uidb64>/<token>/', views_auth.frontend_uidb64_token, name='email_confirmation'),
]
