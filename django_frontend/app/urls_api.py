from django.urls import path
from . import views

urlpatterns = [
    path('positions/', views.PositionList.as_view()),
    path('positions/<int:pk>/', views.PositionDetail.as_view()),
    path('wallets/', views.WalletList.as_view()),
    path('wallets/<int:pk>/', views.WalletDetail.as_view()),
    path('positionTypes/', views.PositionTypeList.as_view()),
    path('mystrategies/', views.MyStrategyList.as_view()),
    path('mystrategies/<int:pk>/', views.MyStrategyDetail.as_view()),
    path('strategies/saved/', views.SavedSrategyList.as_view()),
    path('strategies/', views.StrategyList.as_view()),
    path('strategies/<uuid>/', views.strategy_retrieve),
    path('strategies/<uuid>/reviews/', views.StrategyReviewList.as_view()),
    path('strategies/<uuid>/rate/', views.strategy_rate),
    path('strategies/<uuid>/run/', views.strategy_run),
    path('strategies/<uuid>/save/', views.strategy_save),
    path('strategies/<uuid>/unsave/', views.strategy_unsave),
    path('subscriptions/', views.SubscriptionList.as_view()),
    path('countries/', views.CountryList.as_view()),
    path('currencies/', views.CurrencyList.as_view()),
]

# Users Interaction
urlpatterns += [
    path('user/<username>/profile/', views.user_profile_retrieve),
    path('user/<username>/followers/', views.UserFollowerList.as_view()),
    path('user/<username>/following/', views.UserFollowingList.as_view()),
    path('user/<username>/follow/', views.user_follow),
    path('user/<username>/unfollow/', views.user_unfollow),
]

# On Demand
urlpatterns += [
    path('initiator/<apiKey>', views.app_init, name='App Initiator'),
    path('task/runStockSplit/<symbol>/<split_date>/<int:split_into>/<apiKey>',
         views.run_stock_split, name='Run adjustments on user positions when there is a Stock Split'),
]