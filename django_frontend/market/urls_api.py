from django.urls import path
from . import views

# Models
urlpatterns = [
    path('technical_conditions/', views.TechnicalConditionList, name='technical-conditions'),
    path('stock_exchanges/', views.StockExchangeList, name='stock-exchange'),
    path('assets/', views.AssetList, name='asset'),
    path('indicators/', views.IndicatorList, name='indicators'),
]

# Daily
urlpatterns += [
    path('d/raw/', views.D_RawList, name='d-raw_data'),
    path('d/quote/latest/', views.D_QuoteLatestList, name='d-quote_latest_data'),
    path('d/sma/latest/', views.D_SmaLatestList, name='d-sma_latest_data'),
    path('d/ema/latest/', views.D_EmaLatestList, name='d-ema_latest_data'),
    path('d/phibo/latest/', views.D_PhiboLatestList, name='d-phibo_latest_data'),
    path('d/roc/latest/', views.D_RocLatestList, name='d-roc_latest_data'),

    path('d/setups/', views.D_setupList, name='d-setup'),
    path('d/setup_stats/', views.D_setupStatsList, name='D-setup-stats'),
]
