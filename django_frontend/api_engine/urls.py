from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns
from api_engine import apiAuth, apiApp, apiMarket
from knox import views as knox_views
from rest_auth import views as rest_auth_views

# App
urlpatterns = [
    path('app/positions/', apiApp.PositionList.as_view()),
    path('app/positions/<int:pk>/', apiApp.PositionDetail.as_view()),
    path('app/wallets/', apiApp.WalletList.as_view()),
    path('app/wallets/<int:pk>/', apiApp.WalletDetail.as_view()),
    path('app/positionTypes/', apiApp.PositionTypeList.as_view()),
    path('app/subscriptions/', apiApp.SubscriptionList.as_view()),
    path('app/countries/', apiApp.CountryList.as_view()),
    path('app/currencies/', apiApp.CurrencyList.as_view()),

    path('app/initiator/<apiKey>', apiApp.app_init, name='App Initiator'),
]

# Auth
urlpatterns += [
    path('auth/usercustom/update/', apiAuth.UserCustomUpdateAPIView.as_view()),
    path('auth/user/register/', apiAuth.UserRegisterAPIView.as_view()),
    path('auth/user/update/', apiAuth.UserUpdateAPIView.as_view()),
    path('auth/user/retrieve/', apiAuth.UserRetrieveAPIView.as_view()),
    path('auth/user/login/', apiAuth.LoginAPIView.as_view()),
    path('auth/user/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('auth/user/logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path('auth/user/request/passwordreset/', apiAuth.RequestPasswordResetView.as_view(), name='rest_password_reset'),
    path('auth/user/request/emailconfirmation/', apiAuth.RequestEmailConfirmationView.as_view(), name='rest_confirm_email'),
    path('auth/user/checkToken/<uidb64>/<token>/', apiAuth.CheckToken),
    path('auth/user/confirm/passwordreset/', rest_auth_views.PasswordResetConfirmView.as_view()),
    path('auth/user/confirm/email/', apiAuth.ConfirmEmailView.as_view()),
]

# Market
urlpatterns += [
    path('market/technicalConditions/', apiMarket.TechnicalConditionList, name='Technical Conditions'),
    path('market/stockExchanges/', apiMarket.StockExchangeList, name='StockExchanges'),
    path('market/assets/', apiMarket.AssetList, name='Assets'),
    path('market/d/raw/', apiMarket.D_RawList, name='D_Raw data'),
    path('market/d/setups/', apiMarket.D_setupList, name='D_setups data'),
    path('market/d/setupSummary/', apiMarket.D_setupSummaryList, name='D_setupSummary data'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
