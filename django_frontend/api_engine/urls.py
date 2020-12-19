from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns
from api_engine import apiAuth, apiApp, apiMarket, apiStripe
from knox import views as knox_views
from rest_auth import views as rest_auth_views

# App
urlpatterns = [
    path('app/positions/', apiApp.PositionList.as_view()),
    path('app/positions/<int:pk>/', apiApp.PositionDetail.as_view()),
    path('app/wallets/', apiApp.WalletList.as_view()),
    path('app/wallets/<int:pk>/', apiApp.WalletDetail.as_view()),
    path('app/positionTypes/', apiApp.PositionTypeList.as_view()),
    path('app/mystrategies/', apiApp.MyStrategyList.as_view()),
    path('app/mystrategies/<int:pk>/', apiApp.MyStrategyDetail.as_view()),
    path('app/strategies/', apiApp.StrategyList.as_view()),
    path('app/strategies/<int:pk>/', apiApp.StrategyDetail.as_view()),
    path('app/strategies/<int:pk>/run/', apiApp.strategy_run),
    path('app/strategies/<int:pk>/rate/', apiApp.strategy_rate),
    path('app/strategies/<int:pk>/set-save/', apiApp.strategy_set_save),
    path('app/subscriptions/', apiApp.SubscriptionList.as_view()),
    path('app/countries/', apiApp.CountryList.as_view()),
    path('app/currencies/', apiApp.CurrencyList.as_view()),

    path('app/initiator/<apiKey>', apiApp.app_init, name='App Initiator'),

    # On demand
    path('app/task/runStockSplit/<symbol>/<split_date>/<int:split_into>/<apiKey>',
         apiApp.run_stock_split, name='Run adjustments on user positions when there is a Stock Split'),
]

# Auth
urlpatterns += [
    path('auth/user/check-availability/', apiAuth.checkUsernameAvailability, name='check_username_availability'),
    path('auth/user/register/', apiAuth.UserRegisterAPIView.as_view()),
    path('auth/user/update/', apiAuth.user_update, name='user_update'),
    path('auth/user/retrieve/', apiAuth.UserRetrieveAPIView.as_view()),
    path('auth/user/login/', apiAuth.LoginAPIView.as_view()),
    path('auth/user/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('auth/user/logout-all/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path('auth/user/change-password/', rest_auth_views.PasswordChangeView.as_view()),
    path('auth/user/request/password-reset/', apiAuth.RequestPasswordResetView.as_view(), name='rest_password_reset'),
    path('auth/user/request/email-confirmation/', apiAuth.RequestEmailConfirmationView.as_view(), name='rest_confirm_email'),
    path('auth/user/checkToken/<uidb64>/<token>/', apiAuth.CheckToken),
    path('auth/user/confirm/password-reset/', rest_auth_views.PasswordResetConfirmView.as_view()),
    path('auth/user/confirm/email/', apiAuth.ConfirmEmailView.as_view()),
]

# Market
urlpatterns += [
    path('market/technicalConditions/', apiMarket.TechnicalConditionList, name='technical_condition'),
    path('market/stockExchanges/', apiMarket.StockExchangeList, name='stock-exchange'),
    path('market/assets/', apiMarket.AssetList, name='asset'),
    path('market/indicators/', apiMarket.IndicatorList, name='indicators'),

    path('market/d/raw/', apiMarket.D_RawList, name='d-raw_data'),
    path('market/d/quote/latest/', apiMarket.D_QuoteLatestList, name='d-quote_latest_data'),
    path('market/d/sma/latest/', apiMarket.D_SmaLatestList, name='d-sma_latest_data'),
    path('market/d/ema/latest/', apiMarket.D_EmaLatestList, name='d-ema_latest_data'),
    path('market/d/phibo/latest/', apiMarket.D_PhiboLatestList, name='d-phibo_latest_data'),
    path('market/d/roc/latest/', apiMarket.D_RocLatestList, name='d-roc_latest_data'),

    path('market/d/setups/', apiMarket.D_setupList, name='d-setup'),
    path('market/d/setupSummary/', apiMarket.D_setupSummaryList, name='D-setup-summary'),
]

# Stripe
urlpatterns += [
    path('stripe/checkout/', apiStripe.create_checkout_session, name='create_checkout_session'),
    path('stripe/checkout/<session_id>/', apiStripe.get_checkout_session, name='get_checkout_session'),
    path('stripe/customer-portal/', apiStripe.create_customer_portal_session, name='create_customer_portal_session'),

    path('stripe/webhook-listener/', apiStripe.webhook_listener, name='webhook_listener'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
