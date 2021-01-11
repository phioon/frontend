from django.urls import path

from rest_auth import views as rest_auth_views
from knox import views as knox_views
from . import views_auth

urlpatterns = [
    path('user/check-availability/', views_auth.checkUsernameAvailability, name='check_username_availability'),
    path('user/register/', views_auth.UserRegisterAPIView.as_view()),
    path('user/update/', views_auth.user_update, name='user_update'),
    path('user/retrieve/', views_auth.UserRetrieveAPIView.as_view()),
    path('user/login/', views_auth.LoginAPIView.as_view()),
    path('user/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('user/logout-all/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path('user/change-password/', rest_auth_views.PasswordChangeView.as_view()),
    path('user/request/password-reset/', views_auth.RequestPasswordResetView.as_view(), name='rest_password_reset'),
    path('user/request/email-confirmation/', views_auth.RequestEmailConfirmationView.as_view(), name='rest_confirm_email'),
    path('user/check-token/<uidb64>/<token>/', views_auth.check_token),
    path('user/confirm/password-reset/', rest_auth_views.PasswordResetConfirmView.as_view()),
    path('user/confirm/email/', views_auth.ConfirmEmailView.as_view())
]

