from django.urls import path
from . import views_stripe as views

urlpatterns = [
    path('checkout/', views.create_checkout_session, name='create_checkout_session'),
    path('checkout/<session_id>/', views.get_checkout_session, name='get_checkout_session'),
    path('customer-portal/', views.create_customer_portal_session, name='create_customer_portal_session'),

    path('webhook-listener/', views.webhook_listener, name='webhook_listener'),
]
