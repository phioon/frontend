from django.urls import path
from . import views

# Models
urlpatterns = [
    path('technical_conditions/', views.technical_condition_list, name='technical-conditions'),
    path('stock_exchanges/', views.stock_exchange_list, name='stock-exchange'),
    path('assets/', views.asset_list, name='asset'),
    path('indicators/', views.indicator_list, name='indicators'),
]

# Intervals
urlpatterns += [
    path('<interval>/raw/', views.raw_list, name='raw_data'),
    path('<interval>/quote/latest/', views.quote_latest_list, name='quote_latest_data'),
    path('<interval>/sma/latest/', views.sma_latest_list, name='sma_latest_data'),
    path('<interval>/ema/latest/', views.ema_latest_list, name='ema_latest_data'),
    path('<interval>/phibo/latest/', views.phibo_latest_list, name='phibo_latest_data'),
    path('<interval>/roc/latest/', views.roc_latest_list, name='roc_latest_data'),

    path('<interval>/setups/', views.setup_list, name='setup'),
    path('<interval>/setup_stats/', views.setup_stats_list, name='setup-stats'),
]
