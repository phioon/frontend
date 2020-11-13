from django.contrib.sites.shortcuts import get_current_site
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from django_engine import settings

from app import models as app_models
from . import utils

import stripe

stripe.api_key = settings.STRIPE_API_KEY


def get_stripe_langId(value):
    languages = {
        'ptBR': 'pt-BR',
        'enUS': 'en'
    }
    if value in languages:
        return languages[value]
    else:
        return None


def get_user(field_name, value):
    user = None
    try:
        if field_name == 'email':
            user = app_models.UserCustom.objects.get(user__email=value)
        elif field_name == 'stripe_customer_id':
            user = app_models.UserCustom.objects.get(stripe_customer_id=value)

    except app_models.UserCustom.DoesNotExist as e:
        pass

    return user


def update_stripe_customer(customer_id, data):
    payload = {}
    for attr, value in data.items():
        if attr == 'pref_langId':
            payload['preferred_locales'] = [get_stripe_langId(value), ]

    if payload:
        customer = stripe.Customer.modify(customer_id, **payload)
        return customer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_checkout_session(request):
    data = request.data

    protocol = 'https' if request.is_secure() else 'http'
    current_site = get_current_site(request)
    current_site = protocol + "://" + current_site.domain

    stripe_customer_id = request.user.userCustom.stripe_customer_id

    try:
        # See https://stripe.com/docs/api/checkout/sessions/create
        # for additional parameters to pass.
        # {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        # the actual Session ID is returned in the query parameter when your customer
        # is redirected to the success page.
        checkout_session = stripe.checkout.Session.create(
            success_url=current_site + "/app/order/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=current_site + "/app/user/subscription",
            payment_method_types=["card"],
            mode="subscription",
            customer=stripe_customer_id,
            customer_email=request.user.email if not stripe_customer_id else None,
            line_items=[
                {
                    "price": data['priceId'],
                    "quantity": 1
                }
            ],
        )
        return Response({'sessionId': checkout_session['id']})
    except Exception as e:
        return Response({'error': {'message': str(e)}}, status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_checkout_session(request, session_id):
    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        return Response(checkout_session)
    except Exception as e:
        return Response({'error': {'message': str(e)}}, status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_customer_portal_session(request):
    protocol = 'https' if request.is_secure() else 'http'
    current_site = get_current_site(request)
    current_site = protocol + "://" + current_site.domain

    stripe_customer_id = request.user.userCustom.stripe_customer_id

    try:
        portal_session = stripe.billing_portal.Session.create(
            return_url=current_site + "/app/user/subscription",
            customer=stripe_customer_id
        )

        return Response({'url': portal_session.url})
    except Exception as e:
        return Response({'error': {'message': str(e)}}, status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def webhook_listener(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    res_obj = {'status': status.HTTP_200_OK}

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_ENDPOINT_SECRET
        )
    except ValueError as e:
        # Invalid payload
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return Response(status=status.HTTP_400_BAD_REQUEST)

    # Customers
    if event.type == 'customer.created':
        # A new customer was created...
        # Fill up the field [stripe_customer_id]
        customer = event.data.object
        user = get_user('email', customer['email'])

        if user:
            user.stripe_customer_id = customer['id']
            user.save()

    elif event.type == 'customer.deleted':
        # A customer has been deleted...
        # Check if it is a user and set the field [stripe_customer_id] properly
        customer = event.data.object
        user = get_user('stripe_customer_id', customer['id'])

        if user:
            user.stripe_customer_id = None
            user.save()

    # Subscriptions
    elif event.type == 'customer.subscription.updated':
        # Used to provision services after the trial has ended.
        # The status of the invoice will show up as paid. Store the status in your
        # database to reference when a user accesses your service to avoid hitting rate limits.
        subscription = event.data.object
        user = get_user('stripe_customer_id', subscription['customer'])

        if user:
            # Keep Subscription's status always up to date.
            user.subscription_status = subscription['status']

            current_period_end = utils.convert_epoch_to_timestamp(subscription['current_period_end'])

            if subscription['status'] == 'active':
                # Subscription is active
                user.subscription_expires_on = None
                user.subscription_renews_on = current_period_end[:10]

                price_id = subscription['items']['data'][0]['price']['id']

                try:
                    # Try to retrieve SubscriptionPrice...
                    subscription_price = app_models.SubscriptionPrice.objects.get(pk=price_id)
                    user.subscription = subscription_price.subscription
                except app_models.SubscriptionPrice.DoesNotExist as e:
                    res_obj = {
                        'status': status.HTTP_400_BAD_REQUEST,
                        'message': e
                    }

            if subscription['cancel_at_period_end']:
                # It'll be canceled at the end of the current period
                user.subscription_expires_on = current_period_end[:10]
                user.subscription_renews_on = None

            user.save()

    elif event.type == 'customer.subscription.deleted':
        # Handle subscription cancelled automatically based
        # upon your subscription settings. Or if the user cancels it.
        subscription = event.data.object
        user = get_user('stripe_customer_id', subscription['customer'])

        if user:
            # Keep status always up to date.
            user.subscription_status = subscription['status']

            user.subscription = app_models.Subscription.objects.get(pk='basic')
            user.subscription_expires_on = None
            user.subscription_renews_on = None
            user.save()

    return Response(res_obj, status=res_obj['status'])
